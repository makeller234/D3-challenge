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
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    })

    //create scale functions
    var xLinearScale = d3.scaleLinear()
        .domain([0, d3.max(info, d => d.poverty)])
        .range(([0, width]));
    
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(info, d => d.healthcare)])
        .range([height,0]);

    // create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

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
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 10)
        .attr("fill",  "blue")
        .text(function(d){
            return d.abbr;
        });

    // circlesGroup.append("text")
    //     //.attr("dx", 12)
    //     .attr("font-size", "15px")
    //     .attr("font-color", "red")
    //     .text(function(d){
    //         return d.abbr;
    //     });

    // initialize tool tip & create tool tip in the chart
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`In Poverty: ${d.poverty}% <br>Lacks Healthcare: ${d.healthcare}%`);
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
        .text("Lacks Healthcare (%)");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2.3}, ${height + margin.top + 20})`)
      .attr("class", "axisText")
      .text("In Poverty (%)");



}).catch(function(error){
    console.log(error)
});
