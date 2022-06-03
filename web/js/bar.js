function  barPlot(
    svg_element_id='bar',
    width=800,
    height=550,
    species_code=undefined,
    season_name='breeding',
    region_type='country',
    data_type='abundance_mean',
    currentMonth=0,
    margin = {top: 30, right: 30, bottom: 130, left: 60},
    sorting=0
) {

    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;
    var svg = d3.select("#"+svg_element_id)
        .append("svg")
        .attr('id','barSvg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr('id','bar')
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var y = d3.scaleLinear().nice()
        .range([height, 0]);
    var yAxis = svg.append("g")
        .attr("class", "myYaxis")

    var x = d3.scaleBand()
        .range([ 0, width ])
        .padding(0.2);
    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")


    var country_code=undefined;
    d3.queue()
        .defer(d3.csv,"https://com-480-data-visualization.github.io/datavis-project-2022-_rmrf/data/data_bar")
        .await((error,df)=> {

            const seasons=Array.from(new Set(df.map(d=>d.season_name)));
            function filter_data() {
                if (region_type == 'country') {
                    return (df || []).filter(d => d.species_code == species_code && d.region_type == region_type && d.season_name == season_name);
                } else {
                    return (df || []).filter(d => d.species_code == species_code && d.region_type == region_type && d.season_name == season_name && d.country_code == country_code);
                }
            }

            function update() {
                var data = filter_data();
                if(sorting=='ascending'){
                    data.sort(function(a, b) {
                        return a[data_type] - b[data_type];
                    });
                }
                else if(sorting=='descending'){
                    data.sort(function(a, b) {
                        return b[data_type] - a[data_type];
                    });
                }

                x.domain(data.map(function (d) {
                    return d['region_name']
                }))
                xAxis.call(d3.axisBottom(x)).attr('id', 'xaxis').selectAll('text').attr("transform", function (d) {
                    return "rotate(20)" + "translate("+(this.getComputedTextLength()*0.5)+","+0+")";
                });
                y.domain([0, d3.max(data, function (d) {
                    return +d[data_type];
                })]);
                yAxis.transition().duration(1000).call(d3.axisLeft(y)).attr('id', 'yaxis');

                var u = svg.selectAll("rect")
                    .data(data)
                u.enter()
                    .append("rect")
                    .merge(u)
                    .transition()
                    .duration(1000)
                    .attr("x", function (d) {
                        return x(d['region_name']);
                    })
                    .attr("y", function (d) {
                        return y(d[data_type]);
                    })
                    .attr("width", x.bandwidth())
                    .attr("height", function (d) {
                        return height - y(d[data_type]);
                    })
                    .attr("fill", "#c4b06d");
                u.exit()
                    .remove();

                setEvent();
            }



            function zoom(svg) {
                const extent = [[0, margin.top], [width + margin.left, height + margin.bottom]];;

                svg.call(d3.zoom()
                    .scaleExtent([1, 4])
                    .translateExtent(extent)
                    .on("zoom", zoomed));

                function zoomed() {
                    x.range([0, width].map(d =>d3.event.transform.applyX(d)));
                    svg.selectAll("rect")
                        .attr("x", d => x(d['region_name']))
                        .attr("width", x.bandwidth());
                    xAxis.transition().duration(500).call(d3.axisBottom(x)).selectAll('text').attr("transform", function () {
                        return "rotate(20)" + "translate("+(this.getComputedTextLength()*0.5)+","+0+")";
                    });
                }
            }

            function setEvent(){
                svg.selectAll("rect")
                    .on('click',function (d){
                        d3.event.stopPropagation();
                        if(region_type=='country'){
                            region_type='state';
                            country_code=d.country_code;
                            update();
                        }
                    });
                d3.select("#barSvg").on('click',function (d){
                    if(region_type=='state'){
                        region_type='country';
                        country_code=undefined;
                        update();
                    }
                }).call(zoom);
            }




            d3.select("#bar_birds")
                .selectAll('myOptions')
                .data(Array.from(new Set(df.map(d=>d.common_name))).sort((a,b)=>a.localeCompare(b)))
                .enter()
                .append('option')
                .text(function (d) { return d; }) // text showed in the menu
                .attr("value", function (d) { return d; });

            d3.select("#bar_birds")
                .on("change", function(d) {
                    let name=d3.select(this).property("value");
                    species_code=df.filter(d=>d.common_name==name)[0].species_code;

                    update();
                });

            d3.select("#bar_seasons")
                .selectAll('myOptions')
                .data(seasons)
                .enter()
                .append('option')
                .text(function (d) { return d; }) // text showed in the menu
                .attr("value", function (d) { return d; });

            d3.select("#bar_seasons")
                .on("change", function(d) {
                    season_name=d3.select(this).property("value");
                    update();
                });

            d3.select("#bar_data_type")
                .selectAll('myOptions')
                .data(['abundance_mean','total_pop_percent','range_percent_occupied','range_total_percent'])
                .enter()
                .append('option')
                .text(function (d) { return d; }) // text showed in the menu
                .attr("value", function (d) { return d; });

            d3.select("#bar_data_type")
                .on("change", function(d) {
                    data_type=d3.select(this).property("value");
                    update();
                });


            d3.select("#bar_sort")
                .selectAll('myOptions')
                .data(['none','ascending','descending'])
                .enter()
                .append('option')
                .text(function (d) { return d; }) // text showed in the menu
                .attr("value", function (d) { return d; });

            d3.select("#bar_sort")
                .on("change", function(d) {
                    sorting=d3.select(this).property("value");
                    update();
                });

            species_code=df[0].species_code;
            update();
        })





}


