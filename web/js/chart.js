var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width,
    height;
var df;
var x,y,xAxis,yAxis;
var species_code='bbwduc';
var region_type='country';
var season_name='breeding';
var country_code=undefined;
var key='abundance_mean';
d3.csv("http://localhost:8000/PycharmProjects/datavis-project-2022-_rmrf/data/data.csv", function(data) {
    df=data;
    init();
})
function init(){
    width = 800 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;
    var svg = d3.select("#bar_plot")
        .append("svg")
        .attr('id','chartSvg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr('id','bar')
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    x = d3.scaleBand()
        .range([ 0, width ])
        .padding(0.2);
    xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")

    y = d3.scaleLinear()
        .range([height, 0]);
    yAxis = svg.append("g")
        .attr("class", "myYaxis")

    update();

}

function filter_data(){
    if( region_type == 'country'){
        return (df||[]).filter(d=>d.species_code==species_code && d.region_type==region_type && d.season_name==season_name);
    }
    else {
        return (df||[]).filter(d=>d.species_code==species_code && d.region_type==region_type && d.season_name==season_name && d.country_code==country_code);
    }
}


function update() {
    var data=filter_data(country_code);
    x.domain(data.map(function (d){return d['region_name']}))
    xAxis.call(d3.axisBottom(x)).attr('id','xaxis');
    y.domain( [0, d3.max(data, function(d){ return +d[key]; })] );
    yAxis.transition().duration(1000).call(d3.axisLeft(y)).attr('id','yaxis');
    var u = d3.select("#bar_plot svg #bar").selectAll("rect")
        .data(data)
    u.enter()
        .append("rect")
        .merge(u)
        .transition()
        .duration(1000)
        .attr("x", function(d) { return x(d['region_name']); })
        .attr("y", function(d) { return y(d[key]); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d[key]); })
        .attr("fill", "#69b3a2");
    u.exit()
        .remove();
    setEvent();
}

function setEvent(){
    d3.select("#bar_plot svg").selectAll("rect")
        .on('click',function (d){
            d3.event.stopPropagation();
            console.log(d)
            if(region_type=='country'){
                console.log('inside');
                region_type='state';
                country_code=d.country_code;
                update();
            }
        });
    d3.select("#bar_plot svg").on('click',function (d){
        if(region_type=='state'){
            region_type='country';
            country_code=undefined;
            update();
        }
    }).call(zoom);


}

function zoom(svg) {
    const extent = [[0, margin.top], [width + margin.left, height + margin.bottom]];;

    svg.call(d3.zoom()
        .scaleExtent([1, 4])
        .translateExtent(extent)
        .on("zoom", zoomed));

    function zoomed() {
        x.range([0, width].map(d =>d3.event.transform.applyX(d)));
        svg.selectAll("rect").attr("x", d => x(d['region_name'])).attr("width", x.bandwidth());
        xAxis.call(d3.axisBottom(x)).attr('id','xaxis');

    }
}