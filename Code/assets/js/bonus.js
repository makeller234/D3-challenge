// //working bonus code (minus the commented out code blocks)....putting it here to play around with it in bonus.js
//set dimensions and margins for chart area
var svgWidth = 850;
var svgHeight = 450;

var margin = {
top: 20,
right: 20,
bottom: 85,
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

// initial param
var chosenXAxis = "poverty";


// updates x-scale var on click on x axis label
function xScale(info, chosenXAxis){
    //make scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(info, d=>d[chosenXAxis]) *0.8, d3.max(info, d=>d[chosenXAxis]) *1.2])
        .range([0,width]);

    return xLinearScale;
}


//updates x axis based on click
function renderXAxes(newXScale, xAxis){
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}


function renderCircle(circlesGroup, newXScale, chosenXAxis) {

        circlesGroup.transition()
          .duration(1000)
          .attr("cx", d => newXScale(d[chosenXAxis]));
      
        return circlesGroup;
      }



//updates circlesGroup with new tooltip
function updateToolTip(chosenXAxis, circlesGroup){


    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            if (chosenXAxis ==="poverty"){
            return (`${d.state} <br> In Poverty: ${d[chosenXAxis]}% <br> Smokes (%): ${d.smokes}%`);
            }
            else if(chosenXAxis === "income") {
                return(`${d.state} <br> Income (Median): $${d[chosenXAxis]} <br> Smokes (%): ${d.smokes}%`)
            }
            else if (chosenXAxis ==="age"){
                return(`${d.state} <br> Age (Median): ${d[chosenXAxis]} <br> Smokes (%): ${d.smokes}%`)
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
        data.income = +data.income;
        data.age = +data.age;
        data.smokes = +data.smokes;

    });

    // xLinearScale function
    var xLinearScale = xScale(info, chosenXAxis);

    //create y scale function doing this instead of above line of code since there is only one axis at play
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(info, d => d.smokes)])
        .range([height, 0]);

    // create initial axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);


    // append y axis  don't need to set it equal toa variable unless there is going to be more than one.
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles and state abbreviations

    var circlesGroup = chartGroup.selectAll("circle")
        .data(info)
        .enter()
        .append("circle")
        .attr("cx", d=> xLinearScale(d[chosenXAxis]))
        .attr("cy", d=> yLinearScale(d.smokes))
        .attr("r", 12)
        .attr("fill", "#EDECE8")
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

    
    // create group for y-label
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate (-90)");
    
    ylabelsGroup.append("text")
        .attr("y", 0-margin.left)
        .attr("x", 0-height/2)
        .attr("dy", "1em")
        .classed("active", true)
        .text("Smokes (%)")


    //update toolTip function
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    //get the selection for the correlation paragraph to be displayed based on user input
    var output = d3.select(".output");

    // add correlation paragraph for the data that is displayed when the page loads initially
    output.text("It seems like there is a weak, positive correlation between the percentage of those in the United States who \
        are in poverty versus the percentage of those who smoke.  Showing that there might be some evidence to show that those who are in poverty \
        have also might be smokers. Without further analysis, it is hard to tell if there is actually a meaningful correlation between the two groups. \
        Especially since the increase in the percentage of those who smoke doesn't seem to get that much higher as the percentage of those in poverty \
        increases.");

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

                circlesGroup = renderCircle(circlesGroup, xLinearScale, chosenXAxis);

                circlesGroup =  updateToolTip(chosenXAxis, circlesGroup);

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
                    // correlation paragraph, first hide previous paragraph if there is one and display the new one based on user input
                    output.html("");
                    output.text("There doesn't seem to be a correlation between median age and percentage of those in the United State who smoke \
                    Using the median age draws the data to the middle of the graph, so it's hard to see if there is any correlation here. \
                    The main median age seems to be about 38-40 and that has a range of about 12% to 26% of that age group who smoke.");
                    
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

                    // correlation paragraph, first hide previous paragraph if there is one and display the new one based on user input
                    output.html("");
                    output.text("It seems like there is a weak, positive correlation between the percentage of those in the United States who \
                    are in poverty versus the percentage of those who smoke.  Showing that there might be some evidence to show that those who \
                    are in poverty have also might be smokers. Without further analysis, it is hard to tell if there is actually a meaningful \
                    correlation between the two groups. Especially since the increase in the percentage of those who smoke doesn't seem to get \
                    that much higher as the percentage of those in poverty increases.");
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
                    // correlation paragraph, first hide previous paragraph if there is one and display the new one based on user input
                    output.html("");
                    output.text("It seems like there is a weak, negative correlation between the percentage of those in the United States who \
                    have a low median incomes and those who smoke.  Showing that there might be some evidence that those with lower incomes \
                    tend to be smokers.  Without further analysis, it is hard to say definitively if there is a meaningful relationship between \
                    the two groups.");
                }
            }
        })


}).catch(function(error){
    console.log(error);
});
