function  piePlot(
    svg_element_id='pie',
    width=800,
    height=800,
    continent=undefined,
    country=undefined,
    region=undefined,
    margin = {top: 30, right: 30, bottom: 70, left: 60},
    innerRadius = 200
) {

    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    var svg = d3.select("#"+svg_element_id)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");


    var x = d3.scaleBand()
        .range([0, 2 * Math.PI]);

    d3.queue()
        .defer(d3.json,"http://localhost:8000/PycharmProjects/datavis-project-2022-_rmrf/data/data_pie.json")
        .await((error,df)=> {
            continent=df[0].name;
            country=df[0].children[0].name;
            region=df[0].children[0].children[0].name;
            console.log(continent,country,region);

            function filter_data() {
                return df.filter(d=>d.name==continent)[0].children.filter(d=>d.name==country)[0].children.filter(d=>d.name==region)[0].children.map(d=>d.name);
            }


            function update() {
                let data = filter_data();
                x.domain(data);

                svg.selectAll("g").remove();
                let u = svg.selectAll("g")
                    .data(data)

                u.enter()
                    .append("g")
                    .attr("text-anchor", function (d) {
                        return (x(d) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start";
                    })
                    .attr("transform", function (d) {
                        return "rotate(" + ((x(d) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (innerRadius) + ",0)";
                    })
                    .append("text")
                    .text(function (d) {
                        return (d)
                    })
                    .attr("transform", function (d) {
                        return (x(d) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)";
                    })
                    .style("font-size", "11px")
                    .attr("alignment-baseline", "middle")


            }

            function update_country(){
                let countries=df.filter(d=>d.name==continent)[0].children.map(d=>d.name);
                let appending=d3.select("#pie_country")
                    .selectAll('option')
                    .data(countries);

                appending.exit().remove();
                appending.enter()
                    .append('option')
                    .merge(appending)
                    .text(function (d) { return d; })
                    .attr("value", function (d) { return d; });
                appending.exit().remove();
                d3.select("#pie_country")
                    .on("change", function(d) {
                        country=d3.select(this).property("value");
                        update_region();
                    });
                country=countries[0];
                update_region();

            }

            function update_region(){
                let regions=df.filter(d=>d.name==continent)[0].children.filter(d=>d.name==country)[0].children.filter(d=>d.children.length>0).map(d=>d.name);
                let appending= d3.select("#pie_region")
                    .selectAll('option')
                    .data(regions);

                appending.exit().remove();
                appending.enter()
                    .append('option')
                    .merge(appending)
                    .text(function (d) { return d; })
                    .attr("value", function (d) { return d; });

                d3.select("#pie_region")
                    .on("change", function(d) {
                        region=d3.select(this).property("value");
                        update();
                    });
                region=regions[0];
                update();
            }

            function update_continent(){
                let continents=df.filter(d=>d.children.length>0).map(d=>d.name);
                d3.select("#pie_continent")
                    .selectAll('option')
                    .data(continents)
                    .enter()
                    .append('option')
                    .text(function (d) { return d; }) // text showed in the menu
                    .attr("value", function (d) { return d; });

                d3.select("#pie_continent")
                    .on("change", function(d) {
                        continent=d3.select(this).property("value");
                        update_country();
                    });
                continent=continents[0];
                update_country();
            }

            update_continent();
        })
}


function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        // `DOMContentLoaded` already fired
        action();
    }
}

whenDocumentLoaded(() => {
    plot_object = piePlot('pie');
    // plot object is global, you can inspect it in the dev-console
});
