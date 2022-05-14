var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
    .scale(70)
    .center([0,20])
    .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
    .domain([0.01, 0.03, 0.1, 0.3, 1])
    .range(d3.schemeBlues[7]);

// Load external data and boot
d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .defer(d3.csv, "http://localhost:8000/PycharmProjects/datavis-project-2022-_rmrf/data/data.csv", function(d) {
        if (d.species_code=='grerhe1'){
            data.set(d.country_code, +d.abundance_mean);
        }
    }).await(ready);

function ready(error, topo) {
    console.log(topo);
    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // set the color of each country
        .attr("fill", function (d) {
            d.total = data.get(d.id) || 0;
            return colorScale(d.total);
        });
}
