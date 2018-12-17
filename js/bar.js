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
let barKey = (d)=>d.state;
//Sets up scales, axes, graph demensions, and labels
function makeBarChart() {

	width = 900;
	height = 250;


	barchart = d3.select('#barchart')
		.attr('width', width)
		.attr('height', height);

	bar_xScale = d3.scaleBand()
		.range([leftMargin, width - rightMargin]);

	bar_yScale = d3.scaleLinear()
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

function updateBarChart(dataset, color) {

	let bars = barchart.selectAll('rect').data(dataset, key);
	// ((graph width - rightMargin) / length of  dataset) - padding
	let barWidth = ((width - rightMargin) / dataset.length) - 8;

	//update axis domains
	bar_xScale.domain(dataset.map( d => d.state));
	bar_yScale.domain([0, d3.max(dataset, (d) => d.count)]);
	
	bar_xAxisGroup.call(bar_xAxis);
	bar_yAxisGroup.call(bar_yAxis);

	bars
		.enter()
		.append('rect')
		.attr('x', function(d) { return bar_xScale(d.state); })
		.attr('y', height - bottomMargin)
		.attr('width', barWidth)
		.attr('height', 0)
		.attr('value', (d) => d.count)
		.attr('transform', `translate(${5},0)`)
		.merge(bars)
		.transition("bars")
		.duration(1000)
		.attr('height', (d) => (height - bottomMargin) - bar_yScale(d.count))
		.attr('y', (d) => bar_yScale(d.count))
		.attr('fill', `${color}`);

	// change opacity when bars leave
	bars
		.exit()
		.transition("bars")
		.duration(1000)
		.style('opacity', 0)
		.remove();

	// after that, always update the axis
	bar_yAxisGroup.transition("axis")
		.duration(1000)
		.call(bar_yAxis);
}

function getStateCount(dataset, name, year) {
	let stateCount = [];
	let subset = getNamesDataset(dataset);
	
	//console.log(subset);

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
	//console.log(stateCount);
	return stateCount;
}

function showBarChart(dataset, name, year, color){
	
	let stateCount = getStateCount(dataset, name, year);
	
	updateBarChart(stateCount, color);
}