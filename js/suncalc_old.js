lat_field = $('#latitude').change(updateScreen);
lon_field = $('#longitude').change(updateScreen);
elev_field = $('#elevation').change(updateScreen);
year_field = $('#year').change(updateScreen);
loc_field = $('#locality').change(updateScreen);
header_title = $('#city-year');
repartition_field = $('#repartitionChoice').change(chooseRepartition).change(updateScreen);

let days = [];
let events = [], events_thread = [], days_event_index = [];
let sum_durations = [], max_durations = [], min_durations = [], max_duration_days = [], min_duration_days = [];

let day = dayOfYear(new Date());
let year = parseInt(year_field.val());
let year_days = isLeap(year) ? 366 : 365;

let table_width = year_days + 11;
let table_height = 240 + 8;

const font_color = "#404048";
const grid_color = "#606070";
const font_family = "Rubik";
const separator = ":";
const separators = {
	"minute": "m",
	"hour": "h",
	"day": "d",
	"week": "w"
};
const eventTypes = [
	"reserved",
	"nadir",
	"night",
	"nightEnd",
	"nauticalDusk",
	"nauticalDawn",
	"dusk",
	"dawn",
	"sunset",
	"sunrise",
	"sunsetStart",
	"sunriseEnd",
	"goldenHour",
	"goldenHourEnd",
	"solarNoon"
];
const periodTypes = [
	"reserved",
	"night",
	"astroMorn",
	"astroEven",
	"nautiMorn",
	"nautiEven",
	"civilMorn",
	"civilEven",
	"sunrise",
	"sunset",
	"goldMorn",
	"goldEven",
	"day"
];
const sun_display_param = [
	// circle: height and color, time: height and color, special: height, color and text
	[], // reserved
	[50, "#060F1D", 22, font_color], // nadir
	[46, "#0A192F", 22, font_color, 36, font_color, "\u221218\u00B0"], // night
	[46, "#0A192F", 22, font_color, 36, font_color, "\u221218\u00B0"], // night end
	[40, "#182C4A", 22, font_color, 33, font_color, "\u221212\u00B0"], // nautical dusk
	[40, "#182C4A", 22, font_color, 33, font_color, "\u221212\u00B0"], // nautical dawn
	[34, "#3B5A76", 22, font_color, 30, font_color, "\u22126\u00B0"], // dusk
	[34, "#3B5A76", 22, font_color, 30, font_color, "\u22126\u00B0"], // dawn
	[28, "#7199BE", 22, font_color], // sunset end
	[28, "#7199BE", 22, font_color], // sunrise start
	[22, "#E36627", 31, font_color], // sunset start
	[22, "#E36627", 31, font_color], // sunrise end
	[12, "#E4A531", 31, font_color], // golden hour start
	[12, "#E4A531", 31, font_color], // golden hour end
	[06, "#F5D142", 31, font_color], // solar noon
];

const repartition_simple = [
	[1, 5, "#0A192F", "night", "Night"],
	[6, 7, "#7199BE", "twilight", "Twilight"],
	[8, 12, "#F4FCFF", "day", "Day"]
];
const repartition_full = [
	[1, 1, "#0A192F", "night", "Night"],
	[2, 3, "#182C4A", "astronomical twilight", "Astronomical twilight"],
	[4, 5, "#3B5A76", "nautical twilight", "Nautical twilight"],
	[6, 7, "#7199BE", "civil twilight", "Civil twilight"],
	[8, 12, "#F4FCFF", "day", "Day"]
];
const repartition_photo = [
	[1, 5, "#0A192F", "night", "Night"],
	[6, 7, "#7199BE", "twilight", "Twilight"],
	[8, 11, "#F0B045", "golden hour", "Golden hour"],
	[12, 12, "#F4FCFF", "day", "Day"]
];
const repartition_geek = [
	[1, 1, "#0A192F", "night", "Night"],
	[2, 3, "#182C4A", "astronomical twilight", "Astronomical twilight"],
	[4, 5, "#3B5A76", "nautical twilight", "Nautical twilight"],
	[6, 7, "#7199BE", "civil twilight", "Civil twilight"],
	[8, 9, "#A04531", "sunrise & sunset", "Sunrise & Sunset"],
	[10, 11, "#F0B045", "golden hour", "Golden hour"],
	[12, 12, "#F4FCFF", "day", "Day"]
];
const repartitions = {
	'simple': repartition_simple,
	'full': repartition_full,
	'photo': repartition_photo,
	'geek': repartition_geek
};
let repartition = repartitions[repartition_field.val()];


var figure = $('#figure').click(function (e) {
	day = parseInt(coordX(e.offsetX)) + 1;
	displayPlot(day);
});

function displayPlot(day) {
	let date = dayToDate(day, year);

	$("#curDate").text(date[1] + " " + monthName(date[0]) + " " + year);
	$("#dateDesc").text("The " + day + " day of the year");

	displaySunPath($('#sunPath'), eventsLine, days_event_index[day], sun_display_param);
	displaySunBar($('#sunBar'), durationsLine, daysDurationIndex[day], repartition);
	displaySunPeriods($('#sunPeriods'), periods[day], durationsLine, daysDurationIndex[day], repartition);
};

function chooseRepartition() {
	repartition = repartitions[repartition_field.val()];
};



function displaySunPath(figure, eventsLine, start, param) {
	let content = '';
	let position = 0;
	content += '<polyline points="-20,25 280,25" stroke="#808080" stroke-width="1"></polyline>'; // drawing the horizon
	for (let i = start + 1; eventsLine[i][1] > 0; i++) {
		content += '<circle cx="' + position + '" cy="' + param[eventsLine[i][1]][0] + '" r="3" stroke="' + param[eventsLine[i][1]][1] + '" fill="none"></circle>'; // drawing the circle
		content += '<text x="' + position + '" y="' + param[eventsLine[i][1]][2] + '" fill="' + param[eventsLine[i][1]][3] + '" font-family="' + font_family + '" font-size="5" text-anchor="middle">' + toTime(fractHours(eventsLine[i][0]), separator) + '</text>'; // writing the text
		if (param[eventsLine[i][1]][4] !== undefined)
			content += '<text x="' + position + '" y="' + param[eventsLine[i][1]][4] + '" fill="' + param[eventsLine[i][1]][5] + '" font-family="' + font_family + '" font-size="5" text-anchor="middle">' + param[eventsLine[i][1]][6] + '</text>'; // writing the special text
		position += 20;
	}
	figure.html(content);
};

function displaySunBar(figure, eventsLine, start, repartition) {
	let content = '';
	let position = 0;
	let curPeriod = searchInterval(-eventsLine[start][1] - 1, repartition);
	for (let i = start + 1; eventsLine[i - 1][1] > 0 || i == start + 1; i++) {
		if (searchInterval(eventsLine[i][1] - 1, repartition) !== curPeriod || eventsLine[i][1] < 0) {
			let fin = fractHours(eventsLine[i][0]) != 0 ? fractHours(eventsLine[i][0]) * 10 : 240;
			content += '<line x1="' + position + '" x2="' + fin + '" y1="0" y2="0" stroke="' + repartition[curPeriod][2] + '" stroke-width="6"></line>'; // drawing the bar
			position = fin;
			curPeriod = searchInterval(eventsLine[i][1] - 1, repartition);
		}
	}
	for (let i = 0; i <= 24; i++) {
		content += '<line x1="' + i * 10 + '" x2="' + i * 10 + '" y1="3" y2="-3" stroke="' + grid_color + '" stroke-width="0.2"></line>';
		content += '<text x="' + i * 10 + '" y="-4" fill="' + font_color + '" font-family="' + font_family + '" font-size="3" text-anchor="middle">' + i + '</text>';
	}
	figure.html(content);
};

function displaySunPeriods(container, periods, eventsLine, start, repartition) {
	let row = $('<div>').attr('class', 'row mt-2');
	let cols = [];

	for (let i = 0; i < repartition.length; i++) {
		cols.push($('<div>').attr('id', 'periods-' + i).attr('class', 'col'));
		cols[i].append('<div style="border: solid 2px #202020; background: ' + repartition[i][2] + '; width: 14px; height: 14px; float: left; margin: 3px;"></div>');
		cols[i].append('<div><div><strong>' + repartition[i][4] + '</strong></div>');
	}

	let position = 0;
	let curPeriod = searchInterval(-eventsLine[start][1] - 1, repartition);

	for (let i = start + 1; eventsLine[i - 1][1] > 0 || i == start + 1; i++) {
		if (searchInterval(eventsLine[i][1] - 1, repartition) !== curPeriod || eventsLine[i][1] < 0) {
			let fin = fractHours(eventsLine[i][0]) != 0 ? fractHours(eventsLine[i][0]) : 24;
			cols[curPeriod].append('<div>' + toTime(position, separator) + '\u2014' + toTime(fin, separator) + '</div>');
			position = fin;
			curPeriod = searchInterval(eventsLine[i][1] - 1, repartition);
		}
	}

	for (let i = 0; i < repartition.length; i++) {
		cols[i].append('Total: ' + (periods[i] > 0 ? toInterval(periods[i]) : '—') + '</div>');
		row.append(cols[i]);
	}

	container.html("").append(row);
};

function searchInterval(number, intervals) {
	for (let i = 0; i < intervals.length; i++) {
		//console.log(number, intervals[i][0], intervals[i][1])
		if (number >= intervals[i][0] && number <= intervals[i][1])
			return i;
	}
	return -1;
};
//let wdt = $('#worldMapImage').width();
//console.log(wdt);
//let hdt = $('#worldMapImage').height();
//console.log(hdt);
//$('#worldMap').append('<svg width="100%" height="100%" viewBox="0 0 ' + wdt + ' ' + hdt + '"><circle cx="90" cy="0" r="3" fill="rebeccapurple" /><line x1="90" x2="90" y1="-90" y2="90" stroke="rebeccapurple" /><line x1="-90" x2="90" y1="0" y2="0" stroke="rebeccapurple" /></svg> ');

function adaptFigure(figure, width, height) {
	figure.attr('height', figure.width() / width * height);
};

//$(window).resize(adaptFigure(figure, 376, 248));
$(document).ready(function () { adaptFigure(figure, table_width, table_height); updateScreen(); });
$(window).resize(function () { adaptFigure(figure, table_width, table_height); });

function updateScreen() {
	updateValues();
	displayTimes($('#times'));
	displayDiagram();
	drawGrid();
	displayPlot(day);
};

// Updates the values for the astro things
function updateValues() {
	latitude = lat_field.val();
	longitude = lon_field.val();
	//https://api.open-meteo.com/v1/elevation?latitude=52.52&longitude=13.41
	elevation = elev_field.val();
	year = year_field.val();
	locality = loc_field.val();
	year_days = isLeap(year) ? 366 : 365;
	days = [...Array(year_days).keys()];

	header_title.text(locality + ' ' + year);

	[eventsLine, days_event_index] = getEventsLine(lat_field.val(), lon_field.val(), elev_field.val(), year_field.val());
	[durationsLine, daysDurationIndex] = getEventsLine(lat_field.val(), lon_field.val(), elev_field.val(), year_field.val(), [...Array(12).keys()].map(i => i + 2));
	[periodsLine, daysPeriodIndex] = getEventsLine(lat_field.val(), lon_field.val(), elev_field.val(), year_field.val(), [...Array(12).keys()].map(i => i + 2));
	events = getEvents(eventsLine, days_event_index).slice(0, year_days + 2);;
	durations = getDurations(durationsLine, daysDurationIndex).slice(0, year_days + 2);;
	periods = getPeriods(durations, repartition).slice(0, year_days + 2);
	console.log(events);
	console.log(eventsLine, days_event_index);
	console.log(periods);
	periods = periods.slice(0, year_days + 1);

	sum_durations = periods.reduce((a, b) => a.map((x, i) => x + b[i]));
	max_durations = periods.reduce((a, b) => a.map((m, i) => m < b[i] ? b[i] : m));
	min_durations = periods.reduce((a, b) => a.map((m, i) => m > b[i] ? b[i] : m));
	console.log(min_durations);

	max_duration_days = getDaysWithPeriodValue(periods, max_durations, [1, year_days], 0.000001);
	min_duration_days = getDaysWithPeriodValue(periods, min_durations, [1, year_days], 0.000001);
};

// Draw path in the element
function displayDiagram() {
	figure.html("");
	drawSectors([[[0, 0], [0, 24], [year_days, 24], [year_days, 0]]], "#F4FCFF");
	for (let i = repartition.length - 1; i >= 0; i--) {
		drawSectors(traceSector([], days, events.map(x => x[repartition[i][1] + 1]).map(x => -1 == x ? NaN : x), events.map(x => x[repartition[i][1] + 2]).map(x => -1 == x ? NaN : x), 0, 24, 0), repartition[i][2]);
	}
};

// Draws the grid with months and hours
function drawGrid() {
	// Vertical grid for months
	let pos = 0;
	for (let i = 0; i <= 12; i++) {
		figure.html(figure.html() + '<line x1="' + pos + '" x2="' + pos + '" y1="0" y2="240" stroke="' + grid_color + '" stroke-width="0.3" fill="none" />');
		figure.html(figure.html() + '<text x="' + (pos + daysNumber(i) / 2) + '" y="246" fill="' + font_color + '" font-family="' + font_family + '" font-size="5" text-anchor="middle">' + monthName(i) + '</text>');
		pos += daysNumber(i);
	}
	// Horizontal grid for hours
	for (let i = 0; i <= 24; i++) {
		figure.html(figure.html() + '<line x1="0" x2="365" y1="' + i * 10 + '" y2="' + i * 10 + '" stroke="' + grid_color + '" stroke-width="0.3" fill="none" />');
		if (i > 0 && i < 24)
			figure.html(figure.html() + '<text x="-2" y="' + (i * 10 + 2) + '" fill="' + font_color + '" font-family="' + font_family + '" font-size="5" text-anchor="end">' + i + '</text>');
	}
}

// Return X and Y coordinates from the page ones
var coordX = (xFigure => xFigure / $('#figure').width() * table_width - 11);
var coordY = (yFigure => yFigure / $('#figure').height() * table_height);

var cityField = $('#searchCity');
var citySuggest = $('#searchCitySuggest');
cityField.keyup(searchCity);

function searchCity() {
	let query = cityField.val().replace(/[^a-z0-9\s]/gi, '');
	let request_url = 'https://api.openweathermap.org/geo/1.0/direct?q=' + query + '&limit=5&appid=b63716abfb568c82a090e4123b60187e';

	$(function () {
		var label = '';
		var lat = 0;
		var lon = 0;
		cityField.autocomplete({
			source: function (response) {
				$.ajax({
					type: 'GET',
					url: request_url, success: function (data) {
						response($.map(data, function (item) {
							label = item.name + ', ' + item.country + ', ' + item.state;
							lat = item.lat;
							lon = item.lon;
							return label;
						}));
					}
				});
			},

			select: function (event) {
				console.log(lat, lon);
				$('#special').val(lat + lon);
			}
		})
	})
}

function searchCityOld() {
	// Reading the request dtring, clearing it from special characters
	let query = cityField.val().replace(/[^a-z0-9\s]/gi, '');

	// Performing the ajax request to the Open Weather Geocoding API
	let request_url = 'https://api.openweathermap.org/geo/1.0/direct?q=' + query + '&limit=5&appid=b63716abfb568c82a090e4123b60187e';
	$.ajax({
		url: request_url
	}).done(function (data) {
		console.log(data.length);
		citySuggest.html('');
		console.log(data[0].name);
		for (let i = 0; i < data.length; i++) {
			citySuggest.append('<option lat=' + data[i].lat + ' lon=' + data[i].lon + ' name=' + data[i].name + '>' + data[i].name + ', ' + data[i].country + ', ' + data[i].state + '</option>');
		}
		//cityField.autocomplete();
	});
};

function getEventsLine(latitude, longitude, elevation, year, eventSel = [...Array(14).keys()].map(i => i + 1)) {
	let sunEventsLine = [];
	let events = new Array(15);
	events[0] = [-2, 0];

	let year_days = isLeap(year) ? 366 : 365;
	let date = new Date(year - 1, 11, 31, 0, 0, 0);


	for (let i = 0; i < year_days + 3; i++) {
		let times = SunCalc.getTimes(date, latitude, longitude, elevation);

		// Reading the events of the day
		for (let e = 1; e <= 14; e++) {
			let hours = times[eventTypes[e]];
			hours = isNaN(hours) ? -1 : hours;
			events[e] = [hours, e];
		}

		//console.log(events[e][1], new Date(events[e][0].getTime()))
		// Sorting the array basing on time
		events.sort((a, b) => a[0] - b[0]);

		// Pushing the events into the needed array
		for (let e = 1; e <= 14; e++) {
			//console.log(i, events[e][1]);
			//if (events[e][0] > 0)
			//console.log(new Date(events[e][0].getTime()));
			if (eventSel.includes(events[e][1]) && events[e] !== undefined && events[e][0] >= 0) {
				sunEventsLine.push(events[e]);
			}
		}

		date = addOneDay(date);
	}
	sunEventsLine.push([new Date(date.getTime()), 0]);

	// Adding the date separation events into the line
	date = new Date(year - 1, 11, 30, 0, 0, 0);
	let event = 0;
	let eventsLine = [];
	let days_event_index = [];
	for (let e = 0; e < sunEventsLine.length; e++) {
		if (date.getDay() !== sunEventsLine[e][0].getDay()) {
			while (Math.abs(date - sunEventsLine[e][0]) > 1000 * 60 * 60 * 24) {
				date = addOneDay(date);
				eventsLine.push([new Date(date.getTime()), event]);
				days_event_index.push(eventsLine.length - 1);
			}
		}
		event = -sunEventsLine[e][1];
		/*if (dayOfYear(sunEventsLine[e][0]) > 180 && dayOfYear(sunEventsLine[e][0]) < 190)
			console.log('SOS', sunEventsLine[e]);*/
		eventsLine.push(sunEventsLine[e]);
	}
	return [eventsLine, days_event_index];
};

function getEvents(eventFlow, index) {
	let events = Array.from({ length: index.length }, e => Array(15).fill(-1));

	for (let d = 0; d < index.length; d++) {
		e = index[d];
		let day = eventFlow[e][0].getDay();
		events[d][0] = eventFlow[e][1];
		while (e < eventFlow.length && eventFlow[e][0].getDay() == day) {
			if (eventFlow[e][1] > 0)
				events[d][eventFlow[e][1]] = fractHours(eventFlow[e][0]);
			e++;
		}
	}
	return events;
};

function getDurations(eventFlow, index) {
	let durations = Array.from({ length: year_days + 1 }, e => Array(13).fill(0));
	for (let d = 0; d <= year_days; d++) {
		e = index[d];
		let day = eventFlow[e][0].getDay();
		while (e < eventFlow.length - 1 && eventFlow[e][0].getDay() == day) {
			durations[d][Math.abs(eventFlow[e][1]) - 1] += (eventFlow[e + 1][0] - eventFlow[e][0]) / 1000 / 60 / 60;
			e++;
		}
	}
	return durations;
};

function getPeriods(durations, repartition) {
	let periods = Array.from({ length: durations.length }, e => Array(repartition.length).fill(0));
	for (let d = 0; d < durations.length; d++)
		for (let p = 0; p < repartition.length; p++)
			for (let i = repartition[p][0]; i <= repartition[p][1]; i++)
				periods[d][p] += durations[d][i];
	return periods;
};

function getDaysWithPeriodValue(periods, values, limits, precision) {
	let index = Array.from({ length: values.length }, e => Array());
	//let index = new Array(values.length).fill([]);
	for (let p = 0; p < values.length; p++) {
		let i = limits[0];
		while (i < periods.length) {
			if (Math.abs(periods[i][p] - values[p]) < precision && i <= limits[1]) {
				let start = i;
				while (Math.abs(periods[i][p] - values[p]) < precision && i <= limits[1])
					i++;
				index[p].push([start, i - 1]);
			}
			i++;
		}
	}
	return index;
};

function stringDatePeriods(periods, year) {
	let str = "";
	for (let i = 0; i < periods.length; i++) {
		if (str.length > 0)
			str += ", ";

		date_start = dayToDate(periods[i][0], year);
		date_end = dayToDate(periods[i][1], year);
		if (periods[i][0] == periods[i][1])
			str += date_start[1] + "\u00A0" + monthName(date_start[0]);
		else if (date_start[0] == date_end[0])
			str += date_start[1] + " \u2014 " + date_end[1] + "\u00A0" + monthName(date_start[0]);
		else
			str += date_start[1] + "\u00A0" + monthName(date_start[0]) + " \u2014 " + date_end[1] + "\u00A0" + monthName(date_end[0]);
	}
	return str;
};

function displayTimes(timesBlock) {
	timesBlock.html("");
	for (let i = repartition.length - 1; i >= 0; i--) {
		let time = $('<div>').attr('class', 'time').attr('style', 'border-left: solid 8px ' + repartition[i][2] + ';');
		title = $('<div>').attr('class', 'time-title').text(repartition[i][4]);
		time.append('<div style="border: solid 2px #202020; background: ' + repartition[i][2] + '; width: 16px; height: 16px; float: left; margin: 3px 5px 3px 3px;"></div>');
		time.append(title);
		row = $('<div>').attr('class', 'row');
		let colSum = $('<div>').attr('class', 'col');
		colSum.append('<div class="time-char">Summary</div>');
		colSum.append('<div class="time-time">' + Math.round(sum_durations[i]) + separators["hour"] + '</div>');
		let colMax = $('<div>').attr('class', 'col');
		colMax.append('<div class="time-char">Longest</div>');
		colMax.append('<div class="time-time">' + toInterval(max_durations[i], separators) + '</div>');
		colMax.append('<div class="time-date">' + stringDatePeriods(max_duration_days[i], year) + '</div>');
		let colMin = $('<div>').attr('class', 'col');
		colMin.append('<div class="time-char">Shortest</div>');
		colMin.append('<div class="time-time">' + toInterval(min_durations[i], separators) + '</div>');
		colMin.append('<div class="time-date">' + stringDatePeriods(min_duration_days[i], year) + '</div>');
		row.append(colSum);
		row.append(colMax);
		row.append(colMin);
		time.append(row);
		timesBlock.append(time);
	}
};

function drawWorkHours() {
	let path = Array.from({ length: work_times.length }, e => Array());
	let curValue = 0;
	let start = 0;
	console.log(work_days);
	for (let i = 1; i < year_days; i++) {
		//console.log(i, curValue, work_days[i]);
		if (0 == curValue && 1 == work_days[i]) {
			start = i;
			curValue = 1;
			for (let j = 0; j < work_times.length; j++)
				path[j].push([i - 1, work_times[j][0]]);
		}
		if (1 == curValue && 0 == work_days[i]) {
			for (let j = 0; j < work_times.length; j++) {
				path[j].push([i - 1, work_times[j][0]]);
				path[j].push([i - 1, work_times[j][1]]);
				path[j].push([start - 1, work_times[j][1]]);
				//console.log(path);
				drawSector(path[j], '#C0C0C0', 0.4);
			}
			curValue = 0;
			path = Array.from({ length: work_times.length }, e => Array());
		}
	}
};