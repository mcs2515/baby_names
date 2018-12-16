function rowConverter(row) {
	return {
		name: row.Name,
		year: parseInt(row.Year),
		gender: row.Gender,
		state: row.State,
		count: parseInt(row.Count),
	};
}

let xScale, yScale;
let xAxis, yAxis;
let xAxisGroup, yAxisGroup;

let chart;
let w, h;
let leftMargin, rightMargin, bottomMargin;
let tooltip;
let current_colors = [];
let colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'];

let names = [];
let namesArray = [];
let key = (d) => d.name;

let selectedName;
let selectedYear;
let original_dataset;

window.onload = function () {

	// set variables
	let search = document.querySelector('#search');

	//get the csv and call appropriate functions
	d3.csv('dataset/StateNames.csv', rowConverter)
		.then((d) => {

			original_dataset = d;
			//console.log(dataset);
			autocomplete(d);
			makeChart(d);
			searchBtn(d);
			deleteNameTag(d);
		});
}

//Sets up scales, axes, graph demensions, and labels
function makeChart(dataset) {

	w = 900;
	h = 450;

	leftMargin = 70;
	rightMargin = 20;
	bottomMargin = 50;

	color = d3.scaleOrdinal(d3.schemeCategory10);

	tooltip = d3.select("body").append("div")
		.attr('id', 'tooltip').style("opacity", 0);

	//SCALES
	//years on x-axis
	xScale = d3.scaleTime()
		// adding 1 more year to the max & min so last rect doesn't go off x-axis
		.domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)])
		.range([leftMargin, w - rightMargin]);

	//count on y-axis
	yScale = d3.scaleLinear()
		.domain([d3.min(dataset, d => d.count), d3.max(dataset, d => d.count)])
		.range([h - bottomMargin, 20]);


	//CREATE CHART
	chart = d3.select('#chart')
		.attr('width', w)
		.attr('height', h);

	// CHART LABELS
	chart.append("text")
		.attr("class", "labels")
		.attr("transform", "rotate(-90)")
		.attr("x", -h / 2)
		.attr("y", 20)
		.style("text-anchor", "middle")
		.text("Count");

	chart.append("text")
		.attr("class", "labels")
		.attr("x", h)
		.attr("y", w / 2)
		.style("text-anchor", "middle")
		.text("Years");


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
}

function updateChart(dataset) {

	//console.log(dataset);

	//update the Y domain
	let yDomain = updateYDomain(dataset);
	yScale.domain([yDomain[0], yDomain[1]]);

	//update y-axis grid line position
	let y_grid = chart.selectAll('.y-grid').data(dataset);
	updateYGrid(y_grid);


	//update the tag colors
	let tags = d3.selectAll('.tag')
		.attr("class", (d,i) => "tag " +  current_colors[i]);
	
	/* LINE CHART CODE */
	// build a D3 line generator
	let lines = chart.selectAll('.line').data(dataset, key);
	let line = d3.line()
		.x(d => xScale(d.year))
		.y(d => yScale(d.count));

	// draw the line using a path
	//draw line
	lines
		.enter()
		.append('path')
		.attr('class', 'line')
		.attr("stroke-width", 5)
		.style('fill', 'none')
		.style('opacity', 0)
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.style('stroke', (d, i) => current_colors[i])
		.transition("move")
		.duration(800)
		.style('opacity', 1)
		.attr('d', d => line(d.info));

	//updates lines to new postions
	lines
		.transition("move")
		.duration(800)
		.attr('d', d => line(d.info));

	//remove lines
	lines
		.exit()
		.transition("remove")
		.duration(200)
		.style('opacity', 0)
		.remove();


	/* POINTS CODE */
	//create a group for the points
	var dots = chart.selectAll(".dots").data(dataset, key)
		.enter()
		.append("g")
		.attr("class", "dots")
		.style('opacity', 0)
		.style('fill', (d, i) => current_colors[i]);

	//create points based on the dot group's dataset info
	var points = dots.selectAll('.circle').data(d => d.info);

	points
		.enter()
		.append('circle')
		.attr('class', 'circle')
		.attr('r', 5)
		.attr('cx', d => xScale(d.year))
		.attr('cy', d => yScale(d.count));


	//reasign dots and points variables
	//get current group of dots
	var dots = chart.selectAll(".dots").data(dataset, key);
	//get current points
	var points = dots.selectAll('.circle').data(d => d.info);


	//changes opacity of dots
	dots
		.on("mousemove", d => selectedName = d.name)
		.transition("opacity")
		.duration(800)
		.style('opacity', 1);

	//remove group of dots
	dots
		.exit()
		.transition("remove")
		.duration(100)
		.style('opacity', 0)
		.remove();

	//update points to new positions
	points
		.on("click", d => {
			selectedYear = d.year;
			//function found in bar.js
			showBarChart(original_dataset, selectedName, selectedYear);
		})
		.transition("move")
		.duration(800)
		.attr('cx', d => xScale(d.year))
		.attr('cy', d => yScale(d.count));

	//remove points
	points
		.merge(points)
		.exit()
		.remove();

	updateAxis();
}



// gridlines in y axis function
function createHorizontalLines() {
	return d3.axisLeft(yScale);
}

//adds new name to the namesArray
//if its length < 5, reurns true is successful
function addName(name) {
	if (namesArray.length < 5) {
		//add the new name to the array
		namesArray.push(name);
		return true;
	}

	return false;
}

function getNamesDataset(dataset) {
	let subset = [];

	for (let k = 0; k < namesArray.length; k++) {

		let c = colors[k];

		let nameobj = {
			name: namesArray[k],
			color: c,
			info: []
		}

		for (let i = 0; i < dataset.length; i++) {
			if (dataset[i].name == namesArray[k]) {
				let datum = {
					year: dataset[i].year,
					count: dataset[i].count,
					gender: dataset[i].gender,
					state: dataset[i].state,
				};

				nameobj.info.push(datum);
			}
		}

		subset.push(nameobj);
	}
	//console.log(subset);
	return subset;
}

function filterByYear(dataset) {

	let subset = [];

	for (let t = 0; t < dataset.length; t++) {
		let years = d3.map(dataset[t].info, function (d) {
			return d.year;
		}).keys();

		let c = dataset[t].color;
		var i = current_colors.indexOf(c);

		if (i == -1) {
			current_colors.push(c);
		}

		let nameobj = {
			name: dataset[t].name,
			color: c,
			info: []
		}

		for (let i = 0; i < years.length; i++) {
			let total = 0;

			for (let k = 0; k < dataset[t].info.length; k++) {
				if (years[i] == dataset[t].info[k].year) {

					total += dataset[t].info[k].count;
				}
			}

			let datum = {
				year: parseInt(years[i]),
				count: parseInt(total),
			};

			nameobj.info.push(datum);
		}

		subset.push(nameobj);
	}

	//console.log(subset);
	return subset;
}


//text field will try to autocomplete user input
function autocomplete(dataset) {
	//populate array with non repeating names
	names = d3.map(dataset, function (d) {
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


function createNameTag(dataset) {
	//get the last index value in the subset dataset
	let lastValue = dataset.length - 1;

	//create a name tag
	$('#tags').append(`<div class="tag" 
		id='${dataset[lastValue].name}'><a href="#" class="item">X</a> 
		${dataset[lastValue].name} </div>`);
}


//adds text field value to names array
//and creates a tag if successful
function searchBtn(dataset) {
	search.addEventListener('click', function () {
		let string = document.querySelector('#nameField').value
		string = string.charAt(0).toUpperCase() + string.slice(1); //titlecase

		//if the string = a name in the dataset
		for (let i = 0; i < names.length; i++) {
			if (names[i] == string) {
				//try to add the name
				let success = addName(string);

				//create tag if successful
				if (success) {
					updateDataset(dataset, true);
				}
			}
		}
	});
}


//removes the name from array 
//and its corresponding button
function deleteNameTag(dataset) {

	$(document).on('click', '.item', function (e) {

		//get the tag's parent div id name
		let name = $(this).parent().prop("id");
		//find index of the name in the namesArray
		var i = namesArray.indexOf(name);

		//if index found, remove the name from the namesArray
		//and its corresponding div
		if (i != -1) {
			namesArray.splice(i, 1);
			$(this).parent().remove();
		}

		//get the tag's parent's second class name (a color)
		let c = $(this).parent().prop("class").split(' ')[1];
		var i = current_colors.indexOf(c);

		//if index found, remove the name from the current_colors array
		if (i != -1) {
			current_colors.splice(i, 1)
		}

		updateDataset(dataset, false);
	});
}


//is called whenever adding or deleting a name tag
function updateDataset(dataset, adding) {
	let subset = getNamesDataset(dataset);

	//create new tag if adding
	if (adding) {
		createNameTag(subset);
	}

	let filtered = filterByYear(subset);
	
	updateChart(filtered);
}


function updateYDomain(dataset) {
	let domain = [0, 0];

	for (var i = 0; i < dataset.length; i++) {
		let values = d3.extent(dataset[i].info, d => d.count);

		//x
		if (values[0] < domain[0]) {
			domain[0] = values[0];
		}
		//y
		if (values[1] > domain[1]) {
			domain[1] = values[1];
		}
	}

	return domain;
}


function updateYGrid(y_grid) {
	y_grid
		.enter()
		.append("g")
		.attr("class", "y-grid")
		.style("stroke-dasharray", ("3,3"))
		.attr('transform', `translate(${leftMargin},0)`)
		.style('opacity', 0)
		.merge(y_grid)
		.transition("grid")
		.duration(800)
		.call(
			d3.axisLeft(yScale)
			.tickSize(-w)
			.tickFormat("")
		)
		.style('opacity', 1);

	y_grid
		.exit()
		.transition("remove")
		.duration(800)
		.style('opacity', 0)
		.remove();
}


function updateAxis() {
	// after that, always update yAxis scale
	yAxisGroup.transition("axis")
		.duration(800)
		.call(yAxis);

	// remove the x-axis so that it redraws ontop of everything
	xAxisGroup.remove();
	chart.node().appendChild(xAxisGroup.node());
}