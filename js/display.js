function traceSector(paths, absciss, sectorStart, sectorEnd, cutStart, cutEnd, start) {
	let empty = true;
	for (let i = 0; i < absciss.length; i++)
		if (!isNaN(sectorStart[i]) || !isNaN(sectorEnd[i]))
			empty = false;
	if (empty)
		return paths;

	let work, help, cut, curve = 0;

	if (start < absciss.length) {
		work = unwrapData(sectorEnd, 24);
		help = sectorStart;
	} else {
		work = unwrapData(sectorStart, 24);
		help = sectorEnd;
		start -= absciss.length;
		curve = 1;
	}

	let pos = start;
	while ((isNaN(work[pos]) || work[pos] < 0 || work[pos] > 24) && pos < absciss.length)
		pos++;

	start = pos;
	let path = [];

	while (!isNaN(work[pos]) && work[pos] >= 0 && work[pos] <= 24 && pos < absciss.length) {
		path.push([absciss[pos], work[pos]]);
		pos++;
	}
	for (let i = pos - 1; i >= start; i--) {
		if (curve == 0) {
			path.push([absciss[i], help[i] < work[i] ? help[i] : cutStart]);
			if (help[i] < work[i])
				help[i] = NaN;
			work[i] = NaN;
		} else if (curve == 1) {
			path.push([absciss[i], help[i] > work[i] ? help[i] : cutEnd]);
			if (help[i] > work[i])
				help[i] = NaN;
			work[i] = NaN;
		}

	}

	if (path.length > 0) {
		paths.push(path);
		paths = traceSector(paths, absciss, sectorStart, sectorEnd, cutStart, cutEnd, curve * absciss.length + pos);
	}

	return paths;
};

function makeSvgPath(path, scaleX = 1, scaleY = 1) {
	let s = "";
	for (let i = 0; i < path.length; i++)
		s += path[i][0] * scaleX + "," + path[i][1] * scaleY + " ";
	return s;
};

function unwrapData(data, threshold) {
	let res = new Array(data.length).fill(0);
	let unwrap_level = 0;
	let ref = 0;

	while (isNaN(data[ref]) && ref < data.length)
		ref++;

	if (ref == data.length)
		return data;

	for (let i = 0; i < data.length; i++) {
		unwrap_level = Math.round((data[ref] - data[i]) / threshold);
		res[i] = data[i] + threshold * unwrap_level;
	}

	return res;
};

function drawSectors(figure, pathes, color) {
	let content = "";
	for (let i = 0; i < pathes.length; i++) {
		let path_show = makeSvgPath(pathes[i], scaleX = 1, scaleY = 10);
		content += '<polyline points="' + path_show + '" stroke="none" fill="' + color + '" />';
	}
	figure.html(figure.html() + content);
};

function drawSector(figure, path, color, opacity = 1) {
	let path_show = makeSvgPath(path, scaleX = 1, scaleY = 10);
	figure.html(figure.html() + '<polyline points="' + path_show + '" stroke="none" fill="' + color + '" fill-opacity="' + opacity + '"/>');
};

// SUN DAILY DETAIL BLOCK FUNCTIONS
function displaySunDailyPath() {
	let date = dayToDate(day, year);
	cur_date_box.text(monthNames[date[0]] + " " + date[1] + ", " + year);
	cur_date_desc_box.text("The " + day + " day of the year");

	displaySunPath(sun_path_canvas, events_thread, events_days_index[day], sun_display_param);
	displaySunBar(sun_stripe_canvas, periods_change_thread, periods_change_days_index[day], repartition, work_days[day] ? work_times : [], part_work, sleep_times, part_sleep);
	displaySunPeriods(sun_periods_box, parts_durations[day], periods_change_thread, periods_change_days_index[day], repartition, work_days[day] ? work_times : [], part_work, sleep_times, part_sleep);
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

function displaySunBar(figure, eventsLine, start, repartition, work_times, param_work, sleep_times, param_sleep) {
	let content = '';
	let position = 0;
	let curPeriod = searchInterval(-eventsLine[start][1] - 1, repartition);

	// Sun periods
	for (let i = start + 1; eventsLine[i - 1][1] > 0 || i == start + 1; i++) {
		if (searchInterval(eventsLine[i][1] - 1, repartition) !== curPeriod || eventsLine[i][1] < 0) {
			let fin = fractHours(eventsLine[i][0]) != 0 ? fractHours(eventsLine[i][0]) * 10 : 240;
			content += '<line x1="' + position + '" x2="' + fin + '" y1="0.5" y2="0.5" stroke="' + repartition[curPeriod][2] + '" stroke-width="5"></line>'; // drawing the bar
			position = fin;
			curPeriod = searchInterval(eventsLine[i][1] - 1, repartition);
		}
	}

	// Work and sleep periods
	for (let i = 0; i < work_times.length; i++) {
		content += '<line x1="' + work_times[i][0] * 10 + '" x2="' + work_times[i][1] * 10 + '" y1="3" y2="3" stroke="' + param_work[2] + '" opacity="0.6" stroke-width="4"></line>'; // drawing the bar
	}
	for (let i = 0; i < sleep_times.length; i++) {
		content += '<line x1="' + sleep_times[i][0] * 10 + '" x2="' + sleep_times[i][1] * 10 + '" y1="3" y2="3" stroke="' + param_sleep[2] + '" opacity="0.6" stroke-width="4"></line>'; // drawing the bar
	}

	// Grid
	for (let i = 0; i <= 24; i++) {
		content += '<line x1="' + i * 10 + '" x2="' + i * 10 + '" y1="3" y2="-3" stroke="' + grid_color + '" stroke-width="0.2"></line>';
		content += '<text x="' + i * 10 + '" y="-4" fill="' + font_color + '" font-family="' + font_family + '" font-size="3" text-anchor="middle">' + i + '</text>';
	}
	figure.html(content);
};

function displaySunPeriods(container, periods, eventsLine, start, repartition, work_times, param_work, sleep_times, param_sleep) {
	let row = $('<div>').attr('class', 'row mt-2');
	let cols = [];
	let work_index, sleep_index;

	for (let i = 0; i < repartition.length; i++) {
		cols.push($('<div>').attr('id', 'periods-' + i).attr('class', 'col sun-period-block'));
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

	// Work and sleep times
	if (work_times.length > 0 || sleep_times.length > 0)
		row = $('<div>').attr('class', 'row mt-2');

	if (work_times.length > 0) {
		let col = $('<div>').attr('id', 'periods-15').attr('class', 'col sun-period-block');
		let total = 0;
		col.append('<div style="border: solid 2px #202020; background: ' + param_work[2] + '; width: 14px; height: 14px; float: left; margin: 3px;"></div>');
		col.append('<div><div><strong>' + param_work[4] + '</strong></div>');
		for (let i = 0; i < work_times.length; i++) {
			col.append('<div>' + toTime(work_times[i][0], separator) + '\u2014' + toTime(work_times[i][1], separator) + '</div>');
			total += work_times[i][1] - work_times[i][0];
		}
		col.append('Total: ' + (total > 0 ? toInterval(total) : '—') + '</div>');
		row.append(col);
	}
	if (sleep_times.length > 0) {
		let col = $('<div>').attr('id', 'periods-17').attr('class', 'col sun-period-block');
		let total = 0;
		col.append('<div style="border: solid 2px #202020; background: ' + param_sleep[2] + '; width: 14px; height: 14px; float: left; margin: 3px;"></div>');
		col.append('<div><div><strong>' + param_sleep[4] + '</strong></div>');
		for (let i = 0; i < sleep_times.length; i++) {
			col.append('<div>' + toTime(sleep_times[i][0], separator) + '\u2014' + toTime(sleep_times[i][1], separator) + '</div>');
			total += sleep_times[i][1] - sleep_times[i][0];
		}
		col.append('Total: ' + (total > 0 ? toInterval(total) : '—') + '</div>');
		row.append(col);
	}

	container.append(row);
};

function displaySunDurations(repartition, sum_durations, max_durations, min_durations, max_duration_days, min_duration_days) {
	sun_durations_box.html("");

	if (total_work_time > 0) {
		let time = $('<div>').attr('class', 'time').attr('style', 'border-left: solid 8px ' + part_work[2] + ';');
		colorbox = '<div style="border: solid 2px #202020; background: ' + part_work[2] + '; width: 16px; height: 16px; float: left; margin: 3px 5px 3px 3px;"></div>';
		//time.append(colorbox);

		title = $('<div>').attr('class', 'time-title').text(part_work[4]);
		time.append(title);

		row = $('<div>').attr('class', 'row');

		let colSum = $('<div>').attr('class', 'col');
		colSum.append('<div class="time-char">Summary</div>');
		colSum.append('<div class="time-time">' + total_work_time + separators["hour"] + '</div>');
		row.append(colSum);

		let colPer = $('<div>').attr('class', 'col');
		colPer.append('<div class="time-char">Percent</div>');
		colPer.append('<div class="time-time">' + (total_work_time / total_year_time * 100).toFixed(0) + '%</div>');
		colPer.append('<div class="time-date">' + total_work_days + ' ' + (1 == total_work_days % 10 ? 'day' : 'days') + '</div>');
		row.append(colPer);

		time.append(row);

		sun_durations_box.append(time);
	}

	if (total_sleep_time > 0) {
		let time = $('<div>').attr('class', 'time').attr('style', 'border-left: solid 8px ' + part_sleep[2] + ';');
		colorbox = '<div style="border: solid 2px #202020; background: ' + part_sleep[2] + '; width: 16px; height: 16px; float: left; margin: 3px 5px 3px 3px;"></div>';
		//time.append(colorbox);

		title = $('<div>').attr('class', 'time-title').text(part_sleep[4]);
		time.append(title);

		row = $('<div>').attr('class', 'row');

		let colSum = $('<div>').attr('class', 'col');
		colSum.append('<div class="time-char">Summary</div>');
		colSum.append('<div class="time-time">' + total_sleep_time + separators["hour"] + '</div>');
		row.append(colSum);

		let colPer = $('<div>').attr('class', 'col');
		colPer.append('<div class="time-char">Percent</div>');
		colPer.append('<div class="time-time">' + (total_sleep_time / total_year_time * 100).toFixed(0) + '%</div>');
		colPer.append('<div class="time-date">of the year</div>');
		row.append(colPer);

		time.append(row);

		sun_durations_box.append(time);
	}

	for (let i = repartition.length - 1; i >= 0; i--) {
		if (repartition[i][3] !== "work" && repartition[i][3] !== "sleep") {
			let time = $('<div>').attr('class', 'time').attr('style', 'border-left: solid 8px ' + repartition[i][2] + ';');
			colorbox = '<div style="border: solid 2px #202020; background: ' + repartition[i][2] + '; width: 16px; height: 16px; float: left; margin: 3px 5px 3px 3px;"></div>';
			//time.append(colorbox);

			title = $('<div>').attr('class', 'time-title').text(repartition[i][4]);
			time.append(title);

			row = $('<div>').attr('class', 'row');

			let colSum = $('<div>').attr('class', 'col');
			colSum.append('<div class="time-char">Summary</div>');
			colSum.append('<div class="time-time">' + Math.round(sum_durations[i]) + separators["hour"] + '</div>');
			colSum.append('<div class="time-date">' + (sum_durations[i] / total_year_time * 100).toFixed(0) + '%</div>');
			row.append(colSum);

			let colMax = $('<div>').attr('class', 'col');
			colMax.append('<div class="time-char">Longest</div>');
			colMax.append('<div class="time-time">' + toInterval(max_durations[i], separators) + '</div>');
			colMax.append('<div class="time-date">' + stringDatePeriods(max_duration_days[i], year, disp_dates_limit) + '</div>');
			row.append(colMax);

			let colMin = $('<div>').attr('class', 'col');
			colMin.append('<div class="time-char">Shortest</div>');
			colMin.append('<div class="time-time">' + toInterval(min_durations[i], separators) + '</div>');
			colMin.append('<div class="time-date">' + stringDatePeriods(min_duration_days[i], year, disp_dates_limit) + '</div>');
			row.append(colMin);

			time.append(row);

			sun_durations_box.append(time);
		}
	}
};

function displayPersDurations() {

};

function drawWorkHours() {
	let path = Array.from({ length: work_times.length }, e => Array());
	let curValue = 0;
	let start = 0;
	//console.log(work_days);
	for (let i = 1; i < year_days; i++) {
		//console.log(i, curValue, work_days[i]);
		if (0 == curValue && 1 == work_days[i]) {
			start = i;
			curValue = 1;
			for (let j = 0; j < work_times.length; j++)
				path[j].push([i - 1, work_times[j][0]]);
		}
		if (1 == curValue && (0 == work_days[i] || i == year_days - 1)) {
			for (let j = 0; j < work_times.length; j++) {
				path[j].push([i - 1, work_times[j][0]]);
				path[j].push([i - 1, work_times[j][1]]);
				path[j].push([start - 1, work_times[j][1]]);
				//console.log(path);
				drawSector(sun_diagram_canvas, path[j], part_work[2], 0.4);
			}
			curValue = 0;
			path = Array.from({ length: work_times.length }, e => Array());
		}
	}
};

function drawSleepHours() {
	for (let i = 0; i < sleep_times.length; i++) {
		let path = [];
		path.push([0, sleep_times[i][0]]);
		path.push([year_days, sleep_times[i][0]]);
		path.push([year_days, sleep_times[i][1]]);
		path.push([0, sleep_times[i][1]]);
		drawSector(sun_diagram_canvas, path, part_sleep[2], 0.4);
	}
};

// SUN DIAGRAM BLOCK FUNCTIONS
// Draw path in the element
function drawDiagram() {
	sun_diagram_canvas.html("");
	drawSectors(sun_diagram_canvas, [[[0, 0], [0, 24], [year_days, 24], [year_days, 0]]], "#F4FCFF");
	for (let i = repartition.length - 1; i >= 0; i--) {
		drawSectors(sun_diagram_canvas, traceSector([], days, events.map(x => x[repartition[i][1] + 1]).map(x => -1 == x ? NaN : x), events.map(x => x[repartition[i][1] + 2]).map(x => -1 == x ? NaN : x), 0, 24, 0), repartition[i][2]);
	}
};

// Draws the grid with months and hours
function drawGrid() {
	// Vertical grid for months
	let pos = 0;
	for (let i = 0; i <= 12; i++) {
		sun_diagram_canvas.html(sun_diagram_canvas.html() + '<line x1="' + pos + '" x2="' + pos + '" y1="0" y2="240" stroke="' + grid_color + '" stroke-width="0.3" fill="none" />');
		sun_diagram_canvas.html(sun_diagram_canvas.html() + '<text x="' + (pos + daysNumber(i) / 2) + '" y="246" fill="' + font_color + '" font-family="' + font_family + '" font-size="5" text-anchor="middle">' + monthNames[i] + '</text>');
		pos += daysNumber(i);
	}
	// Horizontal grid for hours
	for (let i = 0; i <= 24; i++) {
		sun_diagram_canvas.html(sun_diagram_canvas.html() + '<line x1="0" x2="365" y1="' + i * 10 + '" y2="' + i * 10 + '" stroke="' + grid_color + '" stroke-width="0.3" fill="none" />');
		if (i > 0 && i < 24)
			sun_diagram_canvas.html(sun_diagram_canvas.html() + '<text x="-2" y="' + (i * 10 + 2) + '" fill="' + font_color + '" font-family="' + font_family + '" font-size="5" text-anchor="end">' + i + '</text>');
	}
}

// Adapting the diagram depending on the window size
$(document).ready(function () { adaptFigureHeight(sun_diagram_canvas, sun_diagram_width, sun_diagram_height); updateScreen(); });
$(window).resize(function () { adaptFigureHeight(sun_diagram_canvas, sun_diagram_width, sun_diagram_height); });

function adaptFigureHeight(block, width, height) {
	block.attr('height', block.width() / width * height);
};

// Return X and Y coordinates from the page ones
var coordX = (xFigure => xFigure / sun_diagram_canvas.width() * sun_diagram_width - 11);
var coordY = (yFigure => yFigure / sun_diagram_canvas.height() * sun_diagram_height);

function displaySunPlot(figure, days, durations, color) {
	content = "";
	let path = [];
	path.push([0, 24]);
	for (let i = 0; i < days.length; i++) {
		path.push([days[i] - 1, (24 - durations[i])]);
		path.push([days[i], (24 - durations[i])]);
	}
	path.push([days.length, 24]);
	console.log(path);
	let path_show = makeSvgPath(path, scaleX = 1, scaleY = 2);
	content += '<polyline points="' + path_show + '" stroke="none" fill="' + color + '" fill-opacity="1"/>';

	let pos = 0;
	for (let i = 0; i <= 12; i++) {
		content += '<line x1="' + pos + '" x2="' + pos + '" y1="0" y2="48" stroke="' + grid_color + '" stroke-width="0.3" fill="none" />';
		content += '<text x="' + (pos + daysNumber(i) / 2) + '" y="54" fill="' + font_color + '" font-family="' + font_family + '" font-size="5" text-anchor="middle">' + monthNames[i] + '</text>';
		pos += daysNumber(i);
	}
	for (let i = 0; i <= 6; i++) {
		if (i == 0 || i == 6)
			content += '<line x1="0" x2="365" y1="' + i * 8 + '" y2="' + i * 8 + '" stroke="' + grid_color + '" stroke-width="0.3" fill="none" />';
		if (i > 0)
			content += '<text x="-2" y="' + (i * 8 + 2) + '" fill="' + font_color + '" font-family="' + font_family + '" font-size="5" text-anchor="end">' + (24 - i * 4) + '</text>';
	}
	figure.html(content);
};
