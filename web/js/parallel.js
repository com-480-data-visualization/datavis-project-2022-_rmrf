function parallelPlot(
    svg_element_id='parallel',
    width = 1150 ,
    height = 650 ,
    margin = {top: 50, right: 110, bottom: 20, left: 120},
    name=[],
){
    width=width- margin.left - margin.right;
    height=height- margin.top - margin.bottom;
    var types = {
        "Number": {
            key: "Number",
            coerce: function(d) { return +d; },
            extent: d3.extent,
            within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
            defaultScale: d3.scaleLinear().range([height-10, 0])
        },
        "String": {
            key: "String",
            coerce: String,
            extent: function (data) { return data.sort(); },
            within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
            defaultScale: d3.scalePoint().range([0, height])
        },
    };

    var dimensions = [
        {
            key: "common_name",
            description: "Common Name",
            type: types["String"],
            axis: d3.axisLeft()
                .tickFormat(function(d,i) {
                    return d;
                })
        },
        {
            key: "country",
            description: "country",
            type: types["String"]
        },
        {
            key: "season_name",
            description: "season_name",
            type: types["String"]
        },
        {
            key: "abundance_mean",
            type: types["Number"],
            description: "abundance_mean",
            scale: d3.scaleLinear().range([height, 0])
        },
        {
            key: "total_pop_percent",
            type: types["Number"],
            description: "total_pop_percent",
            scale: d3.scaleLinear().range([height, 0])
        },
        {
            key: "range_percent_occupied",
            description: "range_percent_occupied",
            type: types["Number"],
            scale: d3.scaleLinear().range([height, 0])
        },
        {
            key: "range_total_percent",
            description: "range_total_percent",
            type: types["Number"],
            scale: d3.scaleLinear().range([height, 0])
            ,
        }
    ];

    var xscale = d3.scalePoint()
        .domain(d3.range(dimensions.length))
        .range([0, width]);

    var yAxis = d3.axisLeft();

    var container = d3.select("#"+svg_element_id).append('div')
        .style("width", width + margin.left + margin.right + "px")
        .style("height", height + margin.top + margin.bottom + "px");

    var svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var canvas = container.append("canvas")
        .attr("width", width)
        .attr("height", height)
        .style("width", width + "px")
        .style("height", height + "px")
        .style("margin-top", (margin.top) + "px")
        .style("margin-left", (margin.left) + "px");

    var ctx = canvas.node().getContext("2d");
    ctx.globalCompositeOperation = 'lighten';
    ctx.lineWidth = 1;



    var axes = svg.selectAll(".axis")
        .data(dimensions)
        .enter().append("g")
        .attr("class", function(d) {
            return "axis " + d.key; })
        .attr("transform", function(d,i) { return "translate(" + xscale(i) + ")"; });

    d3.csv("https://com-480-data-visualization.github.io/datavis-project-2022-_rmrf/data/data_map", function(error, df) {
        if (error) throw error;
        let selected_birds=[];

        function update(){
            let data=df.filter(d=> selected_birds.includes(d.common_name));
            data.forEach(function(d) {
                dimensions.forEach(function(p) {
                    d[p.key] = p.type.coerce(d[p.key]);
                });
            });


            dimensions.forEach(function(dim) {
                dim.domain = dim.type.extent(data.map(function(d) { return d[dim.key]; }));
                if (!("scale" in dim)) {
                    dim.scale = dim.type.defaultScale.copy();
                }
                dim.scale.domain(dim.domain);
            });

            var render = renderQueue(draw).rate(50);

            ctx.clearRect(0,0,width,height);
            ctx.globalAlpha = 0.3;
            render(data);

            axes.selectAll('g').remove()

            axes.append("g")
                .each(function(d) {
                    var renderAxis = yAxis.scale(d.scale);
                    d3.select(this).call(renderAxis);
                })
                .append("text")
                .attr("class", "title")
                .attr("text-anchor", "start")
                .text(function(d) { return d.description; });

            axes.append("g")
                .attr("class", "brush")
                .each(function(d) {
                    d3.select(this).call(d.brush = d3.brushY()
                        .extent([[-10,0], [10,height]])
                        .on("start", brushstart)
                        .on("brush", brush)
                        .on("end", brush)
                    )
                })
                .selectAll("rect")
                .attr("x", -8)
                .attr("width", 16);


            function draw(d) {
                ctx.strokeStyle = "#e58d60";
                ctx.beginPath();
                var coords = dimensions.map(function(p,i) {
                    return [xscale(i),p.scale(d[p.key])];
                });
                coords.forEach(function(p,i) {
                    if (p === null) {
                        if (i > 0) {
                            var prev = coords[i-1];
                            if (prev !== null) {
                                ctx.moveTo(prev[0],prev[1]);
                                ctx.lineTo(prev[0]+6,prev[1]);
                            }
                        }
                        if (i < coords.length-1) {
                            var next = coords[i+1];
                            if (next !== null) {
                                ctx.moveTo(next[0]-6,next[1]);
                            }
                        }
                        return;
                    }
                    if (i == 0) {
                        ctx.moveTo(p[0],p[1]);
                        return;
                    }
                    ctx.lineTo(p[0],p[1]);
                });
                ctx.stroke();
            }

            function brushstart() {
                d3.event.sourceEvent.stopPropagation();
            }


            function brush() {
                render.invalidate();
                var actives = [];
                svg.selectAll(".axis .brush")
                    .filter(function(d) {
                        return d3.brushSelection(this);
                    })
                    .each(function(d) {
                        actives.push({
                            dimension: d,
                            extent: d3.brushSelection(this)
                        });
                    });

                var selected = data.filter(function(d) {
                    if (actives.every(function(active) {
                        var dim = active.dimension;
                        return dim.type.within(d[dim.key], active.extent, dim);
                    })) {
                        return true;
                    }
                });

                ctx.clearRect(0,0,width,height);
                ctx.globalAlpha = 0.3;
                render(selected);
            }

        }

        function update_selected_birds(){
            d3.select('#selected_birds').selectAll('option').remove();
            d3.select('#selected_birds').selectAll('option')
                .data(selected_birds)
                .enter()
                .append('option')
                .text(function (d) { return d; })
                .attr("value", function (d) { return d; });

            update();
        }

        let a=Array.from(new Set(df.map(d=>d.common_name)));

        d3.select('#all_birds').selectAll('option')
            .data(a.sort((a,b)=>a.localeCompare(b)))
            .enter()
            .append('option')
            .text(function (d) { return d; })
            .attr("value", function (d) { return d; });

        d3.select('#all_birds')
            .on("change",function() {
            name=d3.select(this).property("value");
            if(selected_birds.includes(name)){
                return;
            };
            selected_birds.push(name);
            selected_birds=selected_birds.sort((a,b)=>a.localeCompare(b));
            update_selected_birds();
        })

        d3.select('#all_birds').property("value",'none');

        d3.select('#reset_selection')
            .on('click',function (){
                selected_birds=[];
                d3.select('#all_birds').property("value",'none');
                update_selected_birds();
            })

    });




}


