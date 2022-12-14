// Old function that worked with the JS Date objects
/*function fractHours(time) {
	return time.getHours() + time.getMinutes() / 60;
};*/

function fractHours(time) {
	return time.hour + time.minute / 60 + time.second / 3600;
}

function isLeap(year) {
	year = parseInt(year);
	if (year % 4 === 0) {
		if (year % 100 === 0) {
			if (year % 400 === 0) {
				return true;
			}
			return false;
		}
		return true;
	}
	return false;
};

function addOneDay(date) {
	date.setDate(date.getDate() + 1);
	return date;
};

function dayOfYear(date) {
	var start = new Date(date.getFullYear(), 0, 0);
	var diff = date - start;
	var oneDay = 1000 * 60 * 60 * 24;
	var day = Math.floor(diff / oneDay);
	return day;
};

const monthNames = {
	0: 'January',
	1: 'February',
	2: 'March',
	3: 'April',
	4: 'May',
	5: 'June',
	6: 'July',
	7: 'August',
	8: 'September',
	9: 'October',
	10: 'November',
	11: 'December'
};

const monthShortNames = {
	0: 'Jan',
	1: 'Feb',
	2: 'Mar',
	3: 'Apr',
	4: 'May',
	5: 'Jun',
	6: 'Jul',
	7: 'Aug',
	8: 'Sep',
	9: 'Oct',
	10: 'Nov',
	11: 'Dec'
};

// Returns number of days in a month depending on the month and if the year is leap
function daysNumber(month, leap) {
	if (month == 3 || month == 5 || month == 8 || month == 10)
		return 30;
	if (month == 1)
		if (leap)
			return 29;
		else
			return 28;
	return 31;
};

// Turns the hour time into hours and minutes
//var toTime = (hours => [parseInt(hours), parseInt((hours - parseInt(hours)) * 60)]);

function toTime(hours, separator = ':') {
	if (!isNaN(hours))
		return Math.floor(hours) + separator + String(Math.floor((hours - Math.floor(hours)) * 60)).padStart(2, '0');
	else
		return "—";
}

function getHoursMinutes(hours) {
	return [Math.floor(hours), Math.floor((hours - Math.floor(hours)) * 60)];
};

var getRandomInt = (max => Math.floor(Math.random() * max));

function dayToDate(day, year) {
	let daysInYear = yearDaysNumber(year);
	if (day < 1 || day > daysInYear)
		throw new Error('Day ' + day + ' is not contained in year ' + year);

	let month = 0;
	while (day > daysNumber(month, isLeap(year))) {
		day -= daysNumber(month, isLeap(year));
		month++;
	}

	return [month, day];
};

// Returns the duration of the events in the given limits
function duration(start, end, low_limit, high_limit) {
	let dur = 0;
	if (!isNaN(start))
		dur += start < end ? (end - start) / 2 : high_limit - start;
	if (!isNaN(end))
		dur += end > start ? (end - start) / 2 : end - low_limit;
	return dur;
};

function toDate(day, year) {
	let date = dayToDate(day, year);
	return date[1] + ' ' + monthName(date[0]);
};

function toInterval(hours, separators = { "minute": "m", "hour": "h", "day": "d", "week": "w" }) {
	let str = "";
	/*if (Math.floor(hours / 24 / 7) > 0) {
		str += Math.floor(hours / 24 / 7) + separators["week"];
		hours -= Math.floor(hours / 24 / 7) * 24 * 7;
	}
	if (Math.floor(hours / 24) > 0) {
		if (str.length > 0)
			str += " ";
		str += Math.floor(hours / 24) + separators["day"];
		hours -= Math.floor(hours / 24) * 24;
	}*/
	if (Math.floor(hours) > 0) {
		if (str.length > 0)
			str += " ";
		str += Math.floor(hours) + separators["hour"];
		hours -= Math.floor(hours);
	}
	if (str.length > 0)
		str += " ";
	str += Math.floor(hours * 60) + separators["minute"];
	return str;
};

function yearDaysNumber(year) {
	return isLeap(year) ? 366 : 365;
};

function stringDatePeriods(periods, year, limit = -1) {
	let str = "";
	if (limit >= 0 && periods.length > limit)
		return "Multiple";
	for (let i = 0; i < periods.length; i++) {
		if (str.length > 0)
			str += ", ";

		date_start = dayToDate(periods[i][0], year);
		date_end = dayToDate(periods[i][1], year);
		if (periods[i][0] == periods[i][1])
			str += monthShortNames[date_start[0]] + ",\u00A0" + date_start[1];
		else if (date_start[0] == date_end[0])
			str += date_start[1] + "\u2012" + date_end[1] + "\u00A0" + monthShortNames[date_start[0]];
		else
			str += date_start[1] + "\u00A0" + monthShortNames[date_start[0]] + " \u2014 " + date_end[1] + "\u00A0" + monthShortNames[date_end[0]];
	}
	return str;
};

function searchInterval(number, intervals) {
	for (let i = 0; i < intervals.length; i++) {
		//console.log(number, intervals[i][0], intervals[i][1])
		if (number >= intervals[i][0] && number <= intervals[i][1])
			return i;
	}
	return -1;
};
