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
let dataset;
let w, h;
let leftMargin, rightMargin, bottomMargin;
let tooltip;

window.onload = function () {

	// set variables
	let search = document.querySelector('#search');

	//get the csv and call appropriate functions
	d3.csv('../dataset/StateNames.csv', rowConverter)
		.then((d) => {

			dataset = d;
			console.log(dataset);
			autocomplete(dataset);
			makeChart(dataset);

			search.addEventListener('click', function () {
				let value = document.querySelector('#nameField').value;
				let subset = getNameData(value);
				let yearFilter = filterByYear(subset);
				updateChart(yearFilter);
			})
		});
}

//Sets up scales, axes, graph demensions, and labels
function makeChart(dataset) {

	w = 900;
	h = 450;

	leftMargin = 70;
	rightMargin = 20;
	bottomMargin = 50;

	tooltip = d3.select("body").append("div")
		.attr('id', 'tooltip').style("opacity", 0);

	chart = d3.select('#chart')
		.attr('width', w)
		.attr('height', h);

	//years on x-axis
	xScale = d3.scaleTime()
		// adding 1 more year to the max & min so last rect doesn't go off x-axis
		.domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)])
		.range([leftMargin, w - rightMargin]);

	//count on y-axis
	yScale = d3.scaleLinear()
		.domain([d3.min(dataset, d => d.count), d3.max(dataset, d => d.count)])
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

function getNameData(name) {
	let subset = [];

	for (let i = 0; i < dataset.length; i++) {
		if (dataset[i].name == name) {
			let datum = {
				year: dataset[i].year,
				count: dataset[i].count,
				gender: dataset[i].gender,
				state: dataset[i].state,
			};
			subset.push(datum);
		}
	}

	//console.log(subset);
	return subset;
}

function filterByYear(dataset) {
	let subset = [];
	let years = d3.map(dataset, function (d) {
		return d.year;
	}).keys();

	for (let i = 0; i < years.length; i++) {
		let total = 0;
		for (let k = 0; k < dataset.length; k++) {
			if (years[i] == dataset[k].year) {
				total += dataset[k].count;
			}
		}

		let datum = {
			year: parseInt(years[i]),
			count: parseInt(total),
			gender: dataset[i].gender,
		};
		subset.push(datum);
	}

	//console.log(subset);
	return subset;
}

function updateChart(dataset) {

	console.log(dataset);

	let lines = chart.selectAll('.line').data(dataset);
	let points = chart.selectAll('.circle').data(dataset);
	let y_grid = chart.selectAll('.y-grid').data(dataset);
	// adding 1 more year to the max & min so last rect doesn't go off x-axis
	xScale.domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)]);
	yScale.domain([d3.min(dataset, d => d.count), d3.max(dataset, d => d.count)]);


	//update y-axis grid line position
	y_grid
		.enter()
		.data(dataset)
		.append("g")
		.attr("class", "y-grid")
		.style("stroke-dasharray", ("3,3"))
		.attr('transform', `translate(${leftMargin},0)`)
		.style('opacity', 0)
		.merge(y_grid)
		.transition("grid")
		.duration(1000)
		.call(
			d3.axisLeft(yScale)
			.tickSize(-w)
			.tickFormat("")
		)
		.transition("grid")
		.duration(1000)
		.style('opacity', 1);

	y_grid
		.exit()
		.transition("grid")
		.duration(1000)
		.style('opacity', 0)
		.remove();

	/* LINE CHART CODE */
	// build a D3 line generator 
	let line = d3.line()
		.x(d => xScale(d.year))
		.y(d => yScale(d.count));

	// draw the line using a path
	//draw line
	lines
		.enter()
		.append('path')
		.attr('class', 'line')
		.style('stroke', 'red') //d9c8ca
		.attr("stroke-width", 5)
		.style('fill', 'none')
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.merge(lines)
		.transition("history")
		.duration(1000)
		.attr('d', d => line(dataset));

	points
		.enter()
		.append('circle')
		.attr('class', 'circle')
		.attr('r', 6)
		.style('fill', 'black')
		.style('opacity', 0)
		.merge(points)
		.transition("history")
		.duration(1000)
		.attr('cx', d => xScale(d.year))
		.attr('cy', d => yScale(d.count))
		.transition("opacity")
		.duration(500)
		.style('opacity', 1);


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

		//adding additional keypress for 'enter' btn
		$("#nameField").keyup(function (event) {
			if (event.keyCode === 13) {
				$("#search").click();
			}
		});
	});
}