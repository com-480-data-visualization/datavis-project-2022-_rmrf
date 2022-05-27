var margin = {top: 100, right: 0, bottom: 0, left: 0},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    innerRadius = 200,
    outerRadius = Math.min(width, height) / 2;   // the outerRadius goes from the middle of the SVG area to the border

// append the svg object
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");

d3.csv("http://localhost:8000/PycharmProjects/datavis-project-2022-_rmrf/data/data.csv", function(data) {
    df=data.filter(d => d.species_code=='grerhe1' && d.region_type=='state')
    pie(df,key='total_pop_percent')

})

function pie(data, key){

    console.log(data)
    // X scale: common for 2 data series
    var x = d3.scaleBand()
        .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0)                  // This does nothing
        .domain(data.map(function(d) { return d.region_name; })); // The domain of the X axis is the list of states.

    // Y scale outer variable
    var y = d3.scaleRadial()
        .range([innerRadius, outerRadius])   // Domain will be define later.
        .domain([0, 1]); // Domain of Y is from 0 to the max seen in the data

    // Second barplot Scales
    var ybis = d3.scaleRadial()
        .range([innerRadius, 5])   // Domain will be defined later.
        .domain([0, 1]);

    // Add the bars
    svg.append("g")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("fill", "#69b3a2")
        .attr("class", "yo")
        .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius(innerRadius)
            .outerRadius(function(d) { return y(d[key]); })
            .startAngle(function(d) { return x(d.region_name); })
            .endAngle(function(d) { return x(d.region_name) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius))

    // Add the labels
    svg.append('g')
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("text-anchor", function(d) { return (x(d.region_name) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
        .attr("transform", function(d) { return "rotate(" + ((x(d.region_name) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d[key])+10) + ",0)"; })
        .append("text")
        .text(function(d){return(d.region_name)})
        .attr("transform", function(d) { return (x(d.region_name) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
        .style("font-size", "11px")
        .attr("alignment-baseline", "middle")


    // Add the second series
    svg.append("g")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("fill", "red")
        .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius( function(d) { return ybis(0) })
            .outerRadius( function(d) { return ybis(d[key]); })
            .startAngle(function(d) { return x(d.region_name); })
            .endAngle(function(d) { return x(d.region_name) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius))
}