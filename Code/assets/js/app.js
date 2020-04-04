//set dimensions and margins for chart area
var svgWidth = 850;
var svgHeight = 400
;

var margin = {
top: 20,
right: 20,
bottom: 60,
left: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// read in data    
d3.csv("./assets/data/data.csv").then(function(info){

    //convert the read-in data to numbers
    info.forEach(function(data){
        data.smokes = +data.smokes;
        data.poverty = +data.poverty;
    })

    //create scale functions
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(info, d => d.poverty-2), d3.max(info, d => d.poverty)])
        .range(([0, width]));
    
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(info, d => d.smokes)])
        .range([height,0]);

    // create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // add state abbreviation where the circle markers will be placed, adding these first, otherwise the hoover tooltip doesn't work as 
    // the cursor picks up the text and not the circle. And adding them before the groups for the axes since doing this step afterwards doesn't 
    // load all the state names.
    chartGroup.selectAll("text")
        .data(info)
        .enter()
        .append("text")
        .text(function(d){
            return d.abbr;
        })
        .attr("x", d => xLinearScale(d.poverty-.15))
        .attr("y", d => yLinearScale(d.smokes-.3))
        .attr("font-size", "11px");

    // append the axes to the chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    chartGroup.append("g")
        .call(leftAxis);

    // create the circles for the graph markers
    var circlesGroup = chartGroup.selectAll("circle")
        .data(info)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.smokes))
        .attr("r", 10)
        .attr("fill",  "#EDECE8")
        .attr("opacity", "0.4");



    // initialize tool tip & create tool tip in the chart
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state} <br> In Poverty: ${d.poverty}% <br>Smokes: ${d.smokes}%`);
      });
    
    chartGroup.call(toolTip);

    // create listeners to display/hide tool tip
    circlesGroup.on("mouseover", function(data){
        toolTip.show(data, this);
    });

    circlesGroup.on("mouseout", function(data){
        toolTip.hide(data);
    });

    //axes labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 5)
        .attr("x", 0 - height *.7)
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Smokes (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2.3}, ${height + margin.top + 20})`)
      .attr("class", "axisText")
      .text("In Poverty (%)");

    // add observational paragraph (only doing it this way to get the different paragraphs to show up with the bonus otherwise
    // I would have just put it in the index file)

    var output = d3.select(".output");
    output.text("It seems like there is a weak, positive correlation between the percentage of those in the United States who \
    are in poverty versus the percentage of those who smoke.  Showing that there might be some evidence to show that those who are in poverty \
    have also might be smokers. Without further analysis, it is hard to tell if there is actually a meaningful correlation between the two groups. \
    Especially since the increase in the percentage of those who smoke doesn't seem to get that much higher as the percentage of those in poverty \
    increases.");



}).catch(function(error){
    console.log(error)
});