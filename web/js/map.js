function  mapPlot(
    svg_element_id='map',
    width=1000,
    height=600,
    species_code='bbwduc',
    season_name='breeding',
    data_type='abundance_mean',
    currentMonth=0,
    playing=false,
) {
    var svg=d3.select('#'+svg_element_id)
        .append('svg')
        .attr('width',width)
        .attr('height',height);

    var map_container = svg.append('g');

    const projection=d3.geoMercator()
        .translate([width/2,height/2])
        .scale((width - 1) / 2 / Math.PI);

    const path=d3.geoPath().projection(projection);

    var colorScale = d3.scaleLog().clamp(true)
        .range([d3.schemeBlues[6][0], d3.schemeBlues[6][5]]);


    svg.append("g")
        .attr("id", "colorbar")
        .attr("transform", "translate(" + (width-30) + ', ' +10 + ")");

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, 0])
        .direction('e');

    svg.call(tip);

    function zoomed() {
        d3.selectAll('#mapPath')
            .attr('transform', d3.event.transform);
    }

    zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [width, height]])
        .on('zoom', zoomed);

    svg.call(zoom);


    d3.queue()
        .defer(d3.csv,"https://com-480-data-visualization.github.io/datavis-project-2022-_rmrf/data/data_map")
        .defer(d3.json,"https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
        .await((error,data,world)=>{
            console.log(data)
            const data_map=d3.map();
            const seasons=[];
            const seasons_map=d3.map();
            data.forEach(d=>{
                data_map.set(d.country_code+'_'+d.species_code+'_'+d.season_name+'_abundance_mean', +d.abundance_mean);
                data_map.set(d.country_code+'_'+d.species_code+'_'+d.season_name+'_total_pop_percent', +d.total_pop_percent);
                data_map.set(d.country_code+'_'+d.species_code+'_'+d.season_name+'_range_percent_occupied', +d.range_percent_occupied);
                data_map.set(d.country_code+'_'+d.species_code+'_'+d.season_name+'_range_total_percent', +d.range_total_percent);

                if(!seasons.includes(d.season_name)) {
                    seasons.push(d.season_name);
                }
                if(d.season_name!='year_round'){
                    for(let i=parseInt(d.start_dt.split('-')[1]);i<parseInt(d.end_dt.split('-')[1])+parseInt(d.end_dt.split('-')[2])/15;i++){
                        seasons_map.set(d.species_code+'_'+i,d.season_name);
                    }
                }
            });

            tip.html(function(d) {
                return (d.properties.name+"<br/>"+d.total)

            });

            function get_color_domain(x){
                let dom=d3.map();
                var temp=x.filter(d=>d.species_code==species_code ).map(d=>d.abundance_mean);
                dom.set('abundance_mean',[parseFloat(d3.min(temp))+1e-2,parseFloat(d3.max(temp))]);
                temp=x.filter(d=>d.species_code==species_code).map(d=>d.total_pop_percent);
                dom.set('total_pop_percent',[parseFloat(d3.min(temp))+1e-2,parseFloat(d3.max(temp))]);
                temp=x.filter(d=>d.species_code==species_code).map(d=>d.range_percent_occupied);
                dom.set('range_percent_occupied',[parseFloat(d3.min(temp))+1e-2,parseFloat(d3.max(temp))]);
                temp=x.filter(d=>d.species_code==species_code).map(d=>d.range_total_percent);
                dom.set('range_total_percent',[parseFloat(d3.min(temp))+1e-2,parseFloat(d3.max(temp))]);
                console.log(dom);
                return dom;
            }


            var domains=get_color_domain(data);


            function update_color(){
                colorScale.domain(domains.get(data_type));
                makeColorbar(svg, colorScale, data_type , [20, height - 2*30]);
            }


            update_color();
            map_container
                .selectAll("path")
                .data(world.features)
                .enter()
                .append("path")
                .attr('id','mapPath')
                .attr("d", path)
                .attr("fill", function (d) {
                    d.total = data_map.get(d.id + "_" + species_code + '_' + season_name + '_' + data_type) || 0;
                    return colorScale(d.total);
                }).on("mouseover", function (d) {
                tip.show(d)
                d3.select(this)
                    .attr("fill", "orange");
            }).on("mouseout", function (d) {
                tip.hide(d)
                d3.select(this)
                    .attr("fill", colorScale(d.total));
            });

            function update(){
                map_container.selectAll("#mapPath")
                    .transition()  //select all the countries and prepare for a transition to new values
                    .duration(500)
                    .attr("fill", function (d) {
                        d.total = data_map.get(d.id + "_" + species_code + '_' + season_name + '_' + data_type) || 0;
                        return colorScale(d.total);
                    });
            }


            var timer;  // create timer object
            d3.select('#play')
                .on('click', function() {
                    if(playing == false) {  // if the map is currently playing
                        timer = setInterval(function(){   // set a JS interval
                            if(currentMonth < 12) {
                                currentMonth +=1;  // increment the current attribute counter
                            } else {
                                currentMonth = 1;  // or reset it to zero
                            }
                            console.log(currentMonth);
                            season_name=seasons_map.get(species_code+'_'+currentMonth) || 'year_round';
                            update();

                        }, 1000);

                        d3.select(this).html('stop');  // change the button label to stop
                        playing = true;   // change the status of the animation
                    } else {    // else if is currently playing
                        clearInterval(timer);   // stop the animation by clearing the interval
                        d3.select(this).html('play');   // change the button label to play
                        playing = false;   // change the status again
                    }
                });

            d3.select("#map_birds")
                .selectAll('myOptions')
                .data(Array.from(new Set(data.map(d=>d.common_name))).sort((a,b)=>a.localeCompare(b)))
                .enter()
                .append('option')
                .text(function (d) { return d; }) // text showed in the menu
                .attr("value", function (d) { return d; });

            d3.select("#map_birds")
                .on("change", function(d) {
                    let name=d3.select(this).property("value");
                    console.log(data.filter(d=>d.common_name==name)[0].species_code)
                    species_code=data.filter(d=>d.common_name==name)[0].species_code;
                    domains=get_color_domain(data);
                    update();
                    update_color();
                });

            d3.select("#map_seasons")
                .selectAll('myOptions')
                .data(seasons)
                .enter()
                .append('option')
                .text(function (d) { return d; }) // text showed in the menu
                .attr("value", function (d) { return d; });

            d3.select("#map_seasons")
                .on("change", function(d) {
                    season_name=d3.select(this).property("value");
                    currentMonth=[1,2,3,4,5,6,7,8,9,10,11,12].map(d=>[d,seasons_map.get(species_code+'_'+d)||'year_round'])
                        .filter(d=>d[1]==season_name).map(d=>d[0])[0]||0;
                    update();
                    clearInterval(timer);
                    d3.select('#play').html('play');
                    playing = false;
                });

            d3.select("#map_data_type")
                .selectAll('myOptions')
                .data(['abundance_mean','total_pop_percent','range_percent_occupied','range_total_percent'])
                .enter()
                .append('option')
                .text(function (d) { return d; })
                .attr("value", function (d) { return d; });

            d3.select("#map_data_type")
                .on("change", function(d) {
                    data_type=d3.select(this).property("value");
                    update();
                    update_color();
                });

            d3.select("#map_month")
                .selectAll('myOptions')
                .data([1,2,3,4,5,6,7,8,9,10,11,12])
                .enter()
                .append('option')
                .text(function (d) { return d; })
                .attr("value", function (d) { return d; });

            d3.select("#map_month")
                .on("change", function(d) {
                    currentMonth=d3.select(this).property("value");
                    season_name=seasons_map.get(species_code+'_'+currentMonth) || 'year_round';
                    update();
                    clearInterval(timer);
                    d3.select('#play').html('play');
                    playing = false;
                });

        })

}

function makeColorbar(svg, color_scale,title, colorbar_size, scaleClass=d3.scaleLog) {

    const value_to_svg = scaleClass()
        .domain(color_scale.domain())
        .range([colorbar_size[1], 0]);

    const range01_to_color = d3.scaleLinear()
        .domain([0, 1])
        .range(color_scale.range())
        .interpolate(color_scale.interpolate());

    // Axis numbers
    const colorbar_axis = d3.axisLeft(value_to_svg)
        .tickFormat(d3.format(".2f"))

    const colorbar_g = svg.select("#colorbar")
        .call(colorbar_axis);


    // Create the gradient
    function range01(steps) {
        return Array.from(Array(steps), (elem, index) => index / (steps-1));
    }

    const svg_defs = svg.append("defs");

    const gradient = svg_defs.append('linearGradient')
        .attr('id', 'colorbar-gradient')
        .attr('x1', '0%') // bottom
        .attr('y1', '100%')
        .attr('x2', '0%') // to top
        .attr('y2', '0%')
        .attr('spreadMethod', 'pad');

    gradient.selectAll('stop')
        .data(range01(10))
        .enter()
        .append('stop')
        .attr('offset', d => Math.round(100*d) + '%')
        .attr('stop-color', d => range01_to_color(d))
        .attr('stop-opacity', 1);

    // create the colorful rect
    colorbar_g.append('rect')
        .attr('id', 'colorbar-area')
        .attr('width', colorbar_size[0])
        .attr('height', colorbar_size[1])
        .style('fill', 'url(#colorbar-gradient)')
        .style('stroke', 'black')
        .style('stroke-width', '1px')
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
    plot_object = mapPlot('map');
    // plot object is global, you can inspect it in the dev-console
});
