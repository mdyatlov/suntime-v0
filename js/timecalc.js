// Events and Durations calculation functions

const DateTime = luxon.DateTime;
const Interval = luxon.Interval;

// rewritten using luxon
function getEventsThread(latitude, longitude, elevation, year, timezone, eventSel = [...Array(14).keys()].map(i => i + 1)) {
	let sun_events_thread = [];
	let events = new Array(15);
	events[0] = [-2, 0];

	let year_days = yearDaysNumber(year);
	let date = new Date(year - 1, 11, 31, 0, 0, 0);
	//let date = DateTime.fromObject({ year: year - 1, month: 11, day: 31, hour: 0, minute: 0, second: 0 }, { zone: timezone });
	//console.log(date);

	for (let i = 0; i < year_days + 3; i++) {
		let times = SunCalc.getTimes(date, latitude, longitude, elevation);

		// Reading the events of the day
		for (let e = 1; e < event_types.length; e++) {
			let hours = times[event_types[e]];
			hours = isNaN(hours) ? -1 : hours;
			events[e] = [hours, e];
		}

		// Sorting the array basing on time
		events.sort((a, b) => a[0] - b[0]);

		// Pushing the events into the needed array
		for (let e = 1; e <= 14; e++) {
			if (eventSel.includes(events[e][1]) && events[e] !== undefined && events[e][0] >= 0) {
				//sun_events_thread.push(events[e]);
				//console.log(events[e]);
				sun_events_thread.push([DateTime.fromJSDate(events[e][0]).setZone(timezone), events[e][1]]);
			}
		}

		date = addOneDay(date);
	}
	//sun_events_thread.push([new Date(date.getTime()), 0]);
	sun_events_thread.push([DateTime.fromJSDate(new Date(date.getTime())).setZone(timezone), 0]);
	//console.log(sun_events_thread);

	// Adding the date separation events into the line
	//date = new Date(year - 1, 11, 30, 0, 0, 0);
	date = DateTime.fromObject({ year: year - 1, month: 12, day: 30, hour: 0, minute: 0, second: 0 }, { zone: timezone });

	let event = 0;
	let events_thread = [];
	let events_days_index = [];
	for (let e = 0; e < sun_events_thread.length; e++) {
		if (date.day !== sun_events_thread[e][0].day) {
			while (Interval.fromDateTimes(date, sun_events_thread[e][0]).length('days') > 1) {
				//console.log(date.toISO());
				//date = addOneDay(date);
				date = date.plus({ days: 1 });
				events_thread.push([date, event]);
				events_days_index.push(events_thread.length - 1);
			}
		}
		event = -sun_events_thread[e][1];
		/*if (dayOfYear(sunEventsLine[e][0]) > 180 && dayOfYear(sunEventsLine[e][0]) < 190)
			console.log('SOS', sunEventsLine[e]);*/
		events_thread.push(sun_events_thread[e]);
	}
	//console.log(events_thread, events_days_index);

	return [events_thread, events_days_index];
};

function personalizeThread(events_thread, work_days, work_times, event_code_work, sleep_times, event_code_sleep) {
	let regime_events = [];
	let regime_thread = [];

	for (let i = 0; i < work_times.length; i++) {
		regime_events.push([work_times[i][0], event_code_work]);
		regime_events.push([work_times[i][1], -event_code_work]);
	}
	for (let i = 0; i < sleep_times.length; i++) {
		regime_events.push([sleep_times[i][0], event_code_sleep]);
		regime_events.push([sleep_times[i][1], -event_code_sleep]);
	}
	regime_events.sort((a, b) => a[0] - b[0]);
	//console.log(regime_events);

	for (let i = 1; i <= year_days; i++)
		for (let j = 0; j < regime_events.length; j++)
			if (work_days[i] || Math.abs(regime_events[j][1]) == event_code_sleep) {
				let date = dayToDate(i);
				let time = getHoursMinutes(regime_events[j][0]);
				//regime_thread.push([new Date(year, date[0], date[1], time[0], time[1], 0), regime_events[j][1]]);
				regime_thread.push([DateTime.fromObject({ year: year, month: date[0] + 1, day: date[1], hour: time[0], minute: time[1], second: 0 }, { zone: timezone }), regime_events[j][1]]);
			}
	//console.log(regime_thread);

	let pers_thread = [];
	let pers_days_index = [];
	let events_index = 0;
	let regime_index = 0;
	let open_regimes = 0;
	let last_event = 0;
	let last_regime = 0;

	if (0 == regime_thread.length)
		regime_thread.push([DateTime.fromObject({ year: year + 2, month: 1, day: 1, hour: 0, minute: 0, second: 0 }, { zone: timezone }), undefined]);
	//regime_thread.push([new Date(year + 2, 0, 0, 0, 0, 0), undefined]);

	//console.log(regime_thread);
	while (events_index < events_thread.length && regime_index < regime_thread.length) {
		//console.log('yea');
		let regime_type_sign = 1;
		//console.log(events_index, events_thread[events_index], regime_index, regime_thread[regime_index], regime_type_sign);
		if (regime_thread[regime_index][0] - events_thread[events_index][0] > 0) {
			if (0 == open_regimes) {
				pers_thread.push(events_thread[events_index]);
				if (events_thread[events_index][1] < 0)
					pers_days_index.push(pers_thread.length - 1);
			} else if (events_thread[events_index][1] < 0) {
				pers_thread.push([events_thread[events_index][0], -last_regime]);
				pers_days_index.push(pers_thread.length - 1);
			}
			last_event = Math.abs(events_thread[events_index][1]);
			events_index++;
		} else {
			if (regime_thread[regime_index][1] != undefined) {
				if (0 == regime_thread[regime_index][0] - events_thread[events_index][0]) {
					if (events_thread[events_index][1] < 0) {
						regime_type_sign = -1;
					} else {
						last_event = Math.abs(events_thread[events_index][1]);
					}
					events_index++;
				}
				if (regime_thread[regime_index][1] > 0) {
					// Opening the interval
					pers_thread.push([regime_thread[regime_index][0], regime_thread[regime_index][1] * regime_type_sign]);
					if (regime_type_sign < 0)
						pers_days_index.push(pers_thread.length - 1);
					last_regime = regime_thread[regime_index][1];
					open_regimes++;
				} else {
					// Closing the interval
					pers_thread.push([regime_thread[regime_index][0], last_event]);
					open_regimes--;
				}
				regime_index++;
			} else {
				if (events_index >= events_thread.length - 1)
					regime_index++;
			}
		}
	}
	//console.log(pers_thread);
	//console.log(pers_days_index);

	return [pers_thread, pers_days_index];
};

function getEvents(events_thread, index) {
	const events_number = 14;
	let events = Array.from({ length: index.length }, e => Array(events_number + 1).fill(-1));

	for (let d = 0; d < index.length; d++) {
		e = index[d];
		let day = events_thread[e][0].day;
		events[d][0] = events_thread[e][1];
		while (e < events_thread.length && events_thread[e][0].day == day) {
			if (events_thread[e][1] > 0)
				events[d][events_thread[e][1]] = fractHours(events_thread[e][0]);
			e++;
		}

		// Filtering event pairs (à cause d'un problème au niveau de bibliothèque qui apporte les données astronomiques)
		for (let i = 2; i < events_number; i += 2) {
			if (-1 == events[d][i] && -i != events[d][0])
				events[d][i + 1] = -1;
			if (-1 == events[d][i + 1] && -(i + 1) != events[d][0])
				events[d][i] = -1;
		}
	}

	return events;
};

function getPeriodsDurations(events_thread, index) {
	const periods_number = period_types.length;
	let durations = Array.from({ length: year_days + 1 }, e => Array(periods_number).fill(0));
	for (let d = 0; d <= year_days; d++) {
		e = index[d];
		let day = events_thread[e][0].day;
		while (e < events_thread.length - 1 && events_thread[e][0].day == day) {
			let i = Math.abs(events_thread[e][1]) < 14 ? Math.abs(events_thread[e][1]) - 1 : Math.abs(events_thread[e][1]) - 2;
			durations[d][i] += (events_thread[e + 1][0] - events_thread[e][0]) / 1000 / 60 / 60;
			//console.log(e, events_thread.length - 1, events_thread[e][0]);
			e++;
		}
	}
	return durations;
};

function getPartsDurations(durations, repartition) {
	let periods = Array.from({ length: durations.length }, e => Array(repartition.length).fill(0));
	for (let d = 0; d < durations.length; d++)
		for (let p = 0; p < repartition.length; p++)
			for (let i = repartition[p][0]; i <= repartition[p][1]; i++)
				periods[d][p] += durations[d][i];
	return periods;
};

function getDaysWithPeriodValue(periods, values, limits, precision) {
	//console.log(periods, values, limits);
	let index = Array.from({ length: values.length }, e => Array());
	//let index = new Array(values.length).fill([]);
	for (let p = 0; p < values.length; p++) {
		let i = limits[0];
		while (i < periods.length) {
			if (i <= limits[1] && Math.abs(periods[i][p] - values[p]) < precision) {
				let start = i;
				while (i <= limits[1] && Math.abs(periods[i][p] - values[p]) < precision)
					i++;
				index[p].push([start, i - 1]);
			}
			i++;
		}
	}
	return index;
};
//let zone = DateTime.local(2022, 1, 1, 12, 0, 0, { zone: "Europe/Paris" });
//console.log(zone)


