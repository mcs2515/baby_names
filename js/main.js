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
let filterdata;
let w, h;
let leftMargin, rightMargin, bottomMargin;
let tooltip;
let color;

let namesArray = [];

window.onload = function () {

	// set variables
	let search = document.querySelector('#search');

	//get the csv and call appropriate functions
	d3.csv('../dataset/StateNames.csv', rowConverter)
		.then((d) => {

			dataset = d;
			//console.log(dataset);
			autocomplete(dataset);
			btnFunction();
			makeChart(dataset);

			search.addEventListener('click', function () {

				let value = document.querySelector('#nameField').value
				value = value.charAt(0).toUpperCase() + value.slice(1); //titlecase
				createBtns(value);
				
				let subset = getNamesDataset();
				filterdata = filterByYear(subset);
				updateChart(filterdata);
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

	color = d3.scaleOrdinal(d3.schemeCategory10);
	
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

function updateChart(dataset) {

	console.log(dataset);

	var coordinates = [];
	let max = 0;
	let min = 0;
	
	for(var i = 0; i < dataset.length; i++){
		let values = d3.extent(dataset[i].info, d => d.count);
		
		if(values[0] < min){
			min = values[0];
		}
		if(values[1] > max){
			max = values[1];
		}
		

		for(var k = 0; k<dataset[i].info.length; k++){
			let data = {
				year: dataset[i].info[k].year,
				count: dataset[i].info[k].count
			};
			
			coordinates.push(data);
		}
	}
	
	let lines = chart.selectAll('.line').data(dataset);
	let points = chart.selectAll('.circle').data(coordinates);
	let y_grid = chart.selectAll('.y-grid').data(dataset);
	
	
	
	
	//console.log(`${min},${max}`);
	yScale.domain([min, max]);


	//update y-axis grid line position
	y_grid
		.enter()
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
		.style('opacity', 0)
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.style('stroke', (d,i) => {return color(i);})
		.transition("history")
		.duration(1000)
		.style('opacity', 1)
		.attr('d', d => line(d.info));
	
	//updates old lines
	lines
		.transition("history")
		.duration(1000)
		.attr('d', d => line(d.info));
	
	//remove lines
	lines
		.exit()
		.transition("bars")
		.duration(200)
		.style('opacity', 0)
		.remove();

	points
		.enter()
		.append('circle')
		.attr('class', 'circle')
		.attr('r', 6)
		.style('fill', (d,i) => {return color(i);})
		.style('opacity', 0)
		.merge(points)
		.transition("history")
		.duration(1000)
		.attr('cx', d => xScale(d.year))
		.attr('cy', d => yScale(d.count))
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

// gridlines in y axis function
function createHorizontalLines() {
	return d3.axisLeft(yScale);
}

function getNamesDataset() {
	let subset = [];

	for (let k = 0; k < namesArray.length; k++) {

		let nameobj = {
			name: namesArray[k],
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
	
	for(let t = 0; t < dataset.length; t++){
		let years = d3.map(dataset[t].info, function (d) {
			return d.year;
		}).keys();


		let nameobj = {
			name: dataset[t].name,
			info: []
		}

		for(let i = 0; i < years.length; i++) {
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

function createBtns(value){
	if(namesArray.length < 5){
		$('#names').append(`<div id='${value}'><a href="#" class="item">X</a> ${value} </div>`);
		namesArray.push(value);
		//console.log(namesArray);
	}
}

function btnFunction(){
	//removes the name from away and its corresponding button
	$(document).on('click', '.item', function (e) {
		let name = $(this).parent().prop("id");

		var i = namesArray.indexOf(name);
		if (i != -1) {
			namesArray.splice(i, 1);
		}
		$(this).parent().remove();
		
		
		let subset = getNamesDataset();
		filterdata = filterByYear(subset);
		updateChart(filterdata);
		//console.log(namesArray);
	});
}