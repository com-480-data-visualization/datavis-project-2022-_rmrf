var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
var df;
// Parse the Data
d3.csv("http://localhost:8000/PycharmProjects/datavis-project-2022-_rmrf/data/data.csv", function(data) {
    df=data.filter(d => d.species_code=='grerhe1')
    charPlot(df,key='total_pop_percent')

})

var x,y;

function charPlot(data,key) {

    data.sort(function(b, a) {
        return a[key] - b[key];
    });

    x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(function(d) { return d.country; }))
        .padding(0.2);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

// Add Y axis
     y = d3.scaleLinear()
        .domain([0, 1])
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

// Bars
    svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.country); })
        .attr("y", function(d) { return y(d[key]); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d[key]); })
        .attr("fill", "#69b3a2")

    svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", function(d) { return y(d[key]); })
        .attr("height", function(d) { return height - y(d[key]); })
        .delay(function(d,i){console.log(i) ; return(i*100)})
}

function update(data,key) {

    var u = svg.selectAll("rect")
        .data(data)
    u.enter()
        .append("rect")
        .merge(u)
        .transition()
        .duration(1000)
        .attr("x", function(d) { return x(d.country); })
        .attr("y", function(d) { return y(d[key]); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d[key]); })
        .attr("fill", "#69b3a2")
}