var width, height, projection, path, zoom,data, currentAttribute = 0, playing = false;
var legendQuantize,colorScale;
var topo;
var species_code='bbwduc';
var season_name='year_round';
var region_type='country';
var data_type='abundance_mean';
var seasons=[];
var tooltip;

function zoomed() {
    d3.selectAll('#mapPath')
        .attr('transform', d3.event.transform);
}

function init() {
    setMap();
    //bind();
    animateMap()
}

function bind(){
    d3.selectAll(".m")
        .on("click", function() {
            data_type = this.getAttribute("value");
            drawMap();
        });
}

function setMap() {

    width = 800, height = 500;  // map width and height, matches

    data=d3.map();
    projection = d3.geoMercator()
        .translate([width / 2, height / 2])
        .scale((width - 1) / 2 / Math.PI);
    path = d3.geoPath().projection(projection);

    colorScale = d3.scaleThreshold()
        .domain([0.01, 0.03,0.06,0.1,0.3, 0.6, 1])
        .range(d3.schemeBlues[7]);

    legendQuantize = d3.legendColor()
        .title("Value")
        .classPrefix("colorLegend_")
        .labelFormat(d3.format(".2f"))
        .shape("rect")
        .shapePadding(10)
        .scale(colorScale);

    var svg = d3.select("#map_plot")
        .append('svg')
        .attr('id','mapSvg')
        .attr('width', width)
        .attr('height', height);
    svg.append('g').attr('id','map');

    zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [width, height]])
        .on('zoom', zoomed);

    svg.call(zoom);
    console.log('here')
    svg.append("g")
        .attr("class", "legendQuantize")
        .attr("transform", "translate(680,20)");
    svg.select(".legendQuantize")
        .call(legendQuantize);

    loadData();  // let's load our data next

}

function loadData() {
    d3.queue()
        .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        .defer(d3.csv, "http://localhost:8000/PycharmProjects/datavis-project-2022-_rmrf/data/data.csv", function (d){
            processData(d);
        })
        .await(saveData);
}

function saveData(error,d){
    topo=d;
    drawMap()
}
function processData(d) {
    if(d.region_type==region_type){
        data.set(d.country_code+'_'+d.species_code+'_'+d.season_name+'_abundance_mean', +d.abundance_mean);
        data.set(d.country_code+'_'+d.species_code+'_'+d.season_name+'_total_pop_percent', +d.total_pop_percent);
        data.set(d.country_code+'_'+d.species_code+'_'+d.season_name+'_range_percent_occupied', +d.range_percent_occupied);
        data.set(d.country_code+'_'+d.species_code+'_'+d.season_name+'_range_total_percent', +d.range_total_percent);
        }
    if(!seasons.includes(d.season_name)) {
        seasons.push(d.season_name)
    }

}


function drawMap() {
    d3.select('#mapSvg')
        .select("#map")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        .attr('id','mapPath')
        .attr("d", d3.geoPath()
            .projection(projection)
        ).attr("fill", function (d) {
            d.total = data.get(d.id + "_" + species_code + '_' + season_name + '_' + data_type) || 0;
            return colorScale(d.total);
        }).on("mouseover", function (d) {
            d3.select(this)
                .attr("fill", "orange");
        }).on("mouseout", function (d) {
            d3.select(this)
                .attr("fill", colorScale(d.total));
        });

}

function updateMap(){
    d3.select('#mapSvg').selectAll("#mapPath")
        .transition()  //select all the countries and prepare for a transition to new values
        .duration(500)
        .attr("fill", function (d) {
            d.total = data.get(d.id + "_" + species_code + '_' + season_name + '_' + data_type) || 0;
            return colorScale(d.total);
    })
}

function animateMap() {
    var timer;  // create timer object
    d3.select('#play')
        .on('click', function() {
            if(playing == false) {  // if the map is currently playing
                timer = setInterval(function(){   // set a JS interval
                    if(currentAttribute < seasons.length-1) {
                        currentAttribute +=1;  // increment the current attribute counter
                    } else {
                        currentAttribute = 0;  // or reset it to zero
                    }
                    season_name=seasons[currentAttribute]
                    updateMap();
                }, 1000);

                d3.select(this).html('stop');  // change the button label to stop
                playing = true;   // change the status of the animation
            } else {    // else if is currently playing
                clearInterval(timer);   // stop the animation by clearing the interval
                d3.select(this).html('play');   // change the button label to play
                playing = false;   // change the status again
            }
        });
}

window.onload=init();