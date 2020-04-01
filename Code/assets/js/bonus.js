//set dimensions and margins for chart area
var svgWidth = 1000;
var svgHeight = 750;

var margin = {
top: 20,
right: 20,
bottom: 80,
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
var chosenYAxis = "healthcare";

// updates x-scale var on click on x axis label
function xScale(info, chosenXAxis){
    //make scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(info, d=>d[chosenXAxis]) *0.8, d3.max(info, d=>d[chosenXAxis]) *1.2])
        .range([0,width]);

    return xLinearScale;
}

//updates y-scale var on click on y axis label
function yScale(info, chosenYAxis){
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(info, d => d[chosenYAxis])])
        .range([height, 0]);
    
    return yLinearScale;
}

//updates x axis based on click
function renderXAxes(newXScale, xAxis){
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

//updates y axis based on click
function renderYAxes(newYScale, yAxis){
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;
}

//updates circles and their transitions
function renderCircle(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

//updates circlesGroup with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup){


    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            if (chosenXAxis ==="poverty" && chosenYAxis==="healthcare"){
            return (`${d.state} <br> In Poverty: ${d[chosenXAxis]}% <br> Lacks Healthcare: ${d[chosenYAxis]}%`);
            }
            else if(chosenXAxis === "income" && chosenYAxis==="healthcare") {
                return(`${d.state} <br> Income (Median): $${d[chosenXAxis]} <br> Lacks Healthcare: ${d[chosenYAxis]}%`)
            }
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data){
        toolTip.show(data);
    })
        .on("mouseout", function(data){
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
    var yLinearScale = yScale(info, chosenYAxis);

    // create initial axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(info)
        .enter()
        .append("circle")
        .attr("cx", d=> xLinearScale(d[chosenXAxis]))
        .attr("cy", d=> yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("fill", "teal")
        .attr("opacity", ".5")

    // create group for multiple x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height+5})`);
    
    var inPovertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 25)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 55)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");

    
    // create group for y-labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate (-90)");

    var healthLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 13)
        .attr("x", 0 - height *.7)
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("y", 0-margin.left)
        .attr("x", 0-height *.7)
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");


    //update toolTip function
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function(){
            //get selection value
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis){
                chosenXAxis = value;

                //call functions that were defined at beginning of code
                xLinearScale = xScale(info, chosenXAxis);

                xAxis = renderXAxes(xLinearScale, xAxis);

                circlesGroup = renderCircle(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis);

                circlesGroup =  updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                //change classes to be bold text
                if (chosenXAxis === "age"){
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    inPovertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "income"){
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    inPovertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                else if (chosenXAxis === "poverty"){
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    inPovertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        })
    // y labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function(){
            // get value of selection
            var yValue = d3.select(this).attr("value");
            if (yValue !==chosenYAxis){
                //replaces chosenYAxis with value
                chosenYAxis = yValue;

                //call functions that were defined at beginning of code
                yLinearScale = yScale(info, chosenYAxis);

                yAxis = renderYAxes(newYScale, yAxis);

                circlesGroup = renderCircle(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis);

                circlesGroup =  updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            }
            if(chosenYAxis==="healthcare"){
                healthLabel
                    .classed("active", true)
                    .classed("inactive", false)
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true)
            }

            else if (chosenYAxis === "smokes"){
                healthLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        })
}).catch(function(error){
    console.log(error);
});
