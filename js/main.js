function rowConverter(row) {
	return {
		name: row.Name,
		year: parseInt(row.Year),
		gender: row.Gender,
		state: row.State,
		count: parseInt(row.Count),
	}
}

let xScale, yScale;
let xAxis, yAxis;
let xAxisGroup, yAxisGroup;

let chart;
let w, h;
let leftMargin, rightMargin, bottomMargin;
let tooltip;

window.onload = function () {

	// set variables
	tooltip = d3.select("body").append("div").attr('id', 'tooltip').style("opacity", 0);

	//get the csv and call appropriate functions
	d3.csv('../dataset/StateNames.csv', rowConverter)
		.then((d) => {

			autocomplete(d);
			makeChart(d);

			//updateChart(d)
		});
}

//Sets up scales, axes, graph demensions, and labels
function makeChart(dataset) {

	w = 900;
	h = 450;

	leftMargin = 70;
	rightMargin = 20;
	bottomMargin = 50;

	chart = d3.select('#chart')
		.attr('width', w)
		.attr('height', h);

	//years on x-axis
	xScale = d3.scaleTime()
		// adding 1 more year to the max & min so last rect doesn't go off x-axis
		.domain([d3.min(dataset, d => d.year),d3.max(dataset, d => d.year)])
		.range([leftMargin, w - rightMargin]);

	//count on y-axis
	yScale = d3.scaleLinear()
		.domain([d3.min(dataset, d => d.count),d3.max(dataset, d => d.count)])
		.range([h - bottomMargin, 20]);


	// AXES
	xAxis = d3.axisBottom(xScale);
	xAxis.tickFormat(d3.format('d')).ticks(dataset.length);
	
	yAxis = d3.axisLeft(yScale);
	
	xAxisGroup = chart.append('g')
		.attr('class', 'axis-bottom')
		.attr('transform', `translate(0, ${h - bottomMargin})`)
		.call(xAxis);

	yAxisGroup = chart.append('g')
		.attr('class', 'axis-left')
		.attr('transform', `translate(70,0)`)
		.call(yAxis);

	// LABELS
	chart.append("text")
		.attr("class", "labels")
		.attr("transform", "rotate(-90)")
		.attr("x", -(h - bottomMargin) / 2)
		.attr("y", 20)
		.style("text-anchor", "middle")
		.text("Count");

	chart.append("text")
		.attr("class", "labels")
		.attr("x", h)
		.attr("y", (w / 2))
		.style("text-anchor", "middle")
		.text("Years");
}

// gridlines in y axis function
function createHorizontalLines() {
	return d3.axisLeft(yScale);
}

function updateChart(dataset) {


	let y_grid = chart.selectAll('.y-grid').data(dataset, key);


	//update y-axis grid line position
	y_grid
		.enter()
		.data(dataset, key)
		.append("g")
		.attr("class", "y-grid")
		.style("stroke-dasharray", ("3,3"))
		.attr('transform', `translate(${leftMargin},0)`)
		.style('opacity', 0)
		.merge(y_grid)
		.transition("grid")
		.duration(2000)
		.call(
			d3.axisLeft(yScale)
			.tickSize(-w)
			.tickFormat("")
		)
		.style('opacity', 1);

	y_grid
		.exit()
		.transition("grid")
		.duration(1000)
		.style('opacity', 0)
		.remove();


	// after that, always update xAxis scale, xAxisGroup with xAxis (call), 
	// and same for yAxis scale and yAxisGroup
	//xAxis.scale(xScale);
	xAxisGroup.transition("axis")
		.duration(1000)
		.call(xAxis);

	//yAxis.scale(yScale);
	yAxisGroup.transition("axis")
		.duration(1000)
		.call(yAxis);

	// remove the x-axis so that it redraws ontop of everything
	xAxisGroup.remove();
	chart.node().appendChild(xAxisGroup.node());
}

function autocomplete(dataset) {
	//poplate array with non repeating names
	let names = d3.map(dataset, function (d) {
		return d.name;
	}).keys();

	//use the autocomplete library on the name field
	//https://xdsoft.net/jqplugins/autocomplete/
	$(function () {
		$("#nameField").autocomplete({
			source: [names]
		});
	});
}