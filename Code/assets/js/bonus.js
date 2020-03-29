//set dimensions and margins for chart area
var svgWidth = 850;
var svgHeight = 550;

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

// initial params

var chosenXAxis = "poverty";

// updates x-scale var on click on axis label
function xScale(info, chosenXAxis){
    //make scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(info, d=>d[chosenXAxis]) *0.8, d3.max(info, d=>d[chosenXAxis]) *1.2])
        .range([0,width]);

    return xLinearScale;
}

//updates x axis based on click
function renderAxes(newXScale, xAxis){
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

//updates circles and their transitions
function renderCircle(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
  }

//updates circlesGroup with new tooltip
function updateToolTip(chosenXAxis, circlesGroup){

    var label;

    if (chosenXAxis === "poverty") {
        povLabel = "In poverty: ";
        agesLabel = "Age (Median): ";
    } 
    else{
        povLabel = "In poverty: ";
        agesLabel = "Age (Median): ";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state} <br> ${agesLabel} ${d.age} <br>${povLabel} ${d[chosenXAxis]}%`);
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data){
        toolTip.show(data);
    })
        .on("mouseout", function(data, index){
            toolTip.hide(data);
        });
    return circlesGroup;
}

//retrieve the info and execute functions
d3.csv("./assets/data/data.csv").then(function(info, err){
    if(err) throw err;

    //parse
    info.forEach(function(data){
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;

    });

    // xLinearScale function
    var xLinearScale = xScale(info, chosenXAxis);

    // create y scale
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(info, d => d.healthcare)])
        .range([height, 0]);

    // create initial axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(info)
        .enter()
        .append("circle")
        .attr("cx", d=> xLinearScale(d[chosenXAxis]))
        .attr("cy", d=> yLinearScale(d.healthcare))
        .attr("r", 15)
        .attr("fill", "teal")
        .attr("opacity", ".5")

    // create group for multiple x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height+20})`);
    
    var inPovertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    // append y axis
    chartGroup.append("text")
        .attr("transform", "rotate (-90)")
        .attr("y", 0 - margin.left + 5)
        .attr("x", 0 - height *.7)
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Lacks Healthcare (%)");


    //update toolTip function
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function(){
            //get selection value
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis){
                chosenXAxis = value;

                //call functions that were defined at beginning of code
                xLinearScale = xScale(info, chosenXAxis);

                xAxis = renderAxes(xLinearScale, xAxis);

                circlesGroup = renderCircle(circlesGroup, xLinearScale, chosenXAxis);

                circlesGroup =  updateToolTip(chosenXAxis, circlesGroup);

                if (chosenXAxis === "age"){
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    inPovertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else{
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    inPovertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        })
}).catch(function(error){
    console.log(error);
});
