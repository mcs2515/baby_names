let bar_xScale, bar_yScale, colorScale;
let bar_xAxis, bar_yAxis;
let bar_xAxisGroup, bar_yAxisGroup;
let barchart;
let width, height;

let barWidth;
let states = [
	'AL',
	'AK',
	'AZ',
	'AR',
	'CA',
	'CO',
	'CT',
	'DE',
	'FL',
	'GA',
	'HI',
	'ID',
	'IL',
	'IN',
	'IA',
	'KS',
	'KY',
	'LA',
	'ME',
	'MD',
	'MA',
	'MI',
	'MN',
	'MS',
	'MO',
	'MT',
	'NE',
	'NV',
	'NH',
	'NJ',
	'NM',
	'NY',
	'NC',
	'ND',
	'OH',
	'OK',
	'OR',
	'PA',
	'RI',
	'SC',
	'SD',
	'TN',
	'TX',
	'UT',
	'VT',
	'VA',
	'WA',
	'WV',
	'WI',
	'WY'
]

//Sets up scales, axes, graph demensions, and labels
function makeBarChart(dataset) {

	console.log(dataset);

	width = 900;
	height = 250;


	barchart = d3.select('#barchart')
		.attr('width', width)
		.attr('height', height);

	bar_xScale = d3.scaleBand()
		.domain(states)
		.range([leftMargin, width - rightMargin]);

	bar_yScale = d3.scaleLinear()
		.domain([0, d3.max(dataset, (d) => d.count)])
		.range([height - bottomMargin, 20]);

	// AXES
	bar_xAxis = d3.axisBottom(bar_xScale);

	bar_yAxis = d3.axisLeft(bar_yScale);
	//yAxis.tickFormat(d3.format(".2s"));

	bar_xAxisGroup = barchart.append('g')
		.attr('class', 'axis-bottom')
		.attr('transform', `translate(0, ${height - bottomMargin})`)
		.call(bar_xAxis);

	bar_yAxisGroup = barchart.append('g')
		.attr('class', 'axis-left')
		.attr('transform', `translate(70,0)`)
		.call(bar_yAxis);

	// LABELS
	barchart.append("text")
		.attr("class", "labels")
		.attr("transform", "rotate(-90)")
		.attr("x", -height / 2)
		.attr("y", 20)
		.style("text-anchor", "middle")
		.text("Count");

	barchart.append("text")
		.attr("class", "labels")
		.attr("x", width/2)
		.attr("y", height-10)
		.style("text-anchor", "middle")
		.text("States");
}

function updateBarChart(dataset) {

	let bars = barchart.selectAll('rect').data(dataset, key);

	// ((graph width - rightMargin) / length of  dataset) - padding
	//barWidth = ((w - rightMargin) / dataset.length) - 8;
	barWidth = 30;

	//get lengh of number to get 10^(numlength-1)
	numpow = Math.pow(10, d3.max(dataset, (d) => d.totalprod).toString().length - 1);

	// adding 1 more year to the max & min so last rect doesn't go off x-axis
	xScale.domain([Number(d3.min(dataset, (d) => d.year)) - 1, Number(d3.max(dataset, (d) => d.year)) + 1]);
	yScale.domain([0, Math.ceil(d3.max(dataset, (d) => d.totalprod) / numpow) * numpow]);
	colorScale.domain([0, d3.max(dataset, (d) => d.pesticides)]);


	// select rects, rebind with key, use transitions for newly added rects and removed rects
	bars
		.enter()
		.append('rect')
		.attr('x', (d) => xScale(d.year))
		.attr('y', h - bottomMargin)
		.attr('width', barWidth)
		.attr('height', 0)
		.attr('transform', `translate(${-barWidth/2},0)`)
		.attr('value', (d) => d.totalprod)
		.on('mouseover', function (d) {

			d3.select(this)
				.transition("fill")
				.duration(250)
				.style('fill', '#2f5c33')
				.style('cursor', 'pointer');

			tooltip
				.style('left', (d3.event.pageX) + "px")
				.style('top', (d3.event.pageY) + "px")
				.text("Pesticides: " + Math.ceil(d.pesticides).toLocaleString() + " (kg)")
				.transition("tooltip")
				.duration(200)
				.style("opacity", .8);
		})
		.on('mouseout', function (d) {
			d3.select(this)
				.transition("fill")
				.duration(250)
				.style('fill', (d) => colorScale(d.pesticides));

			tooltip
				.transition("tooltip")
				.duration(500)
				.style("opacity", 0);
		})
		.merge(bars)
		.transition("bars")
		.duration(1500)
		.attr('height', (d) => h - bottomMargin - yScale(d.totalprod))
		.attr('y', (d) => yScale(d.totalprod))
		.attr('fill', (d) => colorScale(d.pesticides));

	// change opacity when bars leave
	bars
		.exit()
		.transition("bars")
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
}

function getStateCount(dataset, name, year) {
	let stateCount = [];
	let subset = getNamesDataset(dataset);

	for (var i = 0; i < subset.length; i++) {

		if (subset[i].name == name) {
			let total = 0;

			for (var k = 0; k < states.length; k++) {

				let state = states[k];

				for (var m = 0; m < subset[i].info.length; m++) {
					if (subset[i].info[m].state == state &&
						subset[i].info[m].year == year) {
						
							let obj = {
								state: state,
								count: subset[i].info[m].count,
								year: year,
							}
						
							stateCount.push(obj);
					}
				}
			}
		}
	}
	console.log(stateCount);
	return stateCount;
}

function showBarChart(dataset, name, year){
	
	let stateCount = getStateCount(dataset, name, year);
	
	makeBarChart(stateCount);
}