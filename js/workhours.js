let worktimes_number = 0;
let worktimes_index = [];
let vacations_number = 0;
let vacations_index = [];
let sleeptimes_number = 0;
let sleeptimes_index = [];

let work_times = [], vacations = [], work_days = [], sleep_times = [];

const worktimes_block = $('#work').ready(addWorkTime);
const vacations_block = $('#vacation');
const sleeptimes_block = $('#sleep').ready(addSleepTime);

const work_add_button = $('#work-add').click(addWorkTime);
const vacation_add_button = $('#vacation-add').click(addVacation);
const sleep_add_button = $('#sleep-add').click(addSleepTime);

const apply_workhours_button = $('#apply-work-hours').click(getWorkData);

function getWorkData() {
	work_times = defineWorkTimes();
	vacations = defineVacations();
	sleep_times = defineSleepTimes();
	work_days = getWorkDays(defineWorkRegime(), vacations, year);
	total_work_days = work_days.reduce((partialSum, a) => partialSum + a, 0);
	//console.log('vacations and work days', vacations, work_days);
	updateScreen();
};

function addWorkTime() {
	let worktime_index = firstMissing(worktimes_index, 1);
	worktimes_index.push(worktime_index);

	let row = $('<div>').attr('class', 'row mt-2').attr('id', 'work-' + worktime_index);
	let col_fill = $('<div>').attr('class', 'col-1');

	let col_start = $('<div>').attr('class', 'col input-group').attr('id', 'work-start-' + worktime_index);
	let start = $('<input>').attr('class', 'form-control').attr('type', 'time').attr('name', 'work-start-time-' + worktime_index).attr('id', 'work-start-time-' + worktime_index).val("09:00");
	col_start.append(start);

	let col_end = $('<div>').attr('class', 'col input-group').attr('id', 'work-end-' + worktime_index);
	let end = $('<input>').attr('class', 'form-control').attr('type', 'time').attr('name', 'work-end-time-' + worktime_index).attr('id', 'work-end-time-' + worktime_index).val("18:00");
	col_end.append(end);

	let col_del = $('<div>').attr('class', 'col-2').attr('id', 'work-del-' + worktime_index);
	let del_symb = $('<span>').attr('class', 'material-symbols-outlined').text('remove');
	let del = $('<button>').attr('class', 'btn btn-secondary').attr('type', 'button').attr('style', 'padding: 6px 6px 0 6px;').attr('id', 'work-del-button-' + worktime_index).append(del_symb).click(deleteWorkTime);
	col_del.append(del);

	row.append(col_fill).append(col_start).append(col_end).append(col_del);
	worktimes_block.append(row);
};

function deleteWorkTime() {
	worktimes_index.splice(worktimes_index.indexOf(parseInt(this.id.replace(/\D/g, ''))), 1);
	$('#' + this.id.replace('del-button-', '')).remove();
};

function addVacation() {
	let vacation_index = firstMissing(vacations_index, 1);
	vacations_index.push(vacation_index);

	let row = $('<div>').attr('class', 'row mt-2').attr('id', 'vacation-' + vacation_index);

	let col_fill = $('<div>').attr('class', 'col-1');

	let col_start = $('<div>').attr('class', 'col input-group').attr('id', 'vacation-start-' + vacation_index);
	let start_day = $('<input>').attr('class', 'form-control').attr('type', 'number').attr('name', 'vacation-start-day-' + vacation_index).attr('id', 'vacation-start-day-' + vacation_index);
	let start_month = $('<select>').attr('class', 'form-select').attr('id', 'vacation-start-month-' + vacation_index).change(restrainMonthDay);
	for (let m = 0; m < 12; m++)
		start_month.append($('<option>').val(m).text(monthNames[m]));
	col_start.append(start_day).append(start_month);

	let col_end = $('<div>').attr('class', 'col input-group').attr('id', 'vacation-end-' + vacation_index);
	let end_day = $('<input>').attr('class', 'form-control').attr('width', '10%').attr('type', 'number').attr('name', 'vacation-end-day-' + vacation_index).attr('id', 'vacation-end-day-' + vacation_index);
	let end_month = $('<select>').attr('class', 'form-select').attr('id', 'vacation-end-month-' + vacation_index).change(restrainMonthDay);
	for (let m = 0; m < 12; m++)
		end_month.append($('<option>').val(m).text(monthNames[m]));
	col_end.append(end_day).append(end_month)

	let col_del = $('<div>').attr('class', 'col-2').attr('id', 'vacation-del-' + vacation_index);
	let del_symb = $('<span>').attr('class', 'material-symbols-outlined').text('remove');
	let del = $('<button>').attr('class', 'btn btn-secondary').attr('type', 'button').attr('style', 'padding: 6px 6px 0 6px;').attr('id', 'vacation-del-button-' + vacation_index).append(del_symb).click(deleteVacation);
	col_del.append(del);

	row.append(col_fill).append(col_start).append(col_end).append(col_del);
	vacations_block.append(row);
};

function deleteVacation() {
	vacations_index.splice(vacations_index.indexOf(parseInt(this.id.replace(/\D/g, ''))), 1);
	$('#' + this.id.replace('del-button-', '')).remove();
};

function addSleepTime() {
	let sleeptime_index = firstMissing(sleeptimes_index, 1);
	sleeptimes_index.push(sleeptime_index);

	let row = $('<div>').attr('class', 'row mt-2').attr('id', 'sleep-' + sleeptime_index);
	let col_fill = $('<div>').attr('class', 'col-1');

	let col_start = $('<div>').attr('class', 'col input-group').attr('id', 'sleep-start-' + sleeptime_index);
	let start = $('<input>').attr('class', 'form-control').attr('type', 'time').attr('name', 'sleep-start-time-' + sleeptime_index).attr('id', 'sleep-start-time-' + sleeptime_index).val("00:00");
	col_start.append(start);

	let col_end = $('<div>').attr('class', 'col input-group').attr('id', 'sleep-end-' + sleeptime_index);
	let end = $('<input>').attr('class', 'form-control').attr('type', 'time').attr('name', 'sleep-end-time-' + sleeptime_index).attr('id', 'sleep-end-time-' + sleeptime_index).val("08:00");
	col_end.append(end);

	let col_del = $('<div>').attr('class', 'col-2').attr('id', 'sleep-del-' + sleeptime_index);
	let del_symb = $('<span>').attr('class', 'material-symbols-outlined').text('remove');
	let del = $('<button>').attr('class', 'btn btn-secondary').attr('type', 'button').attr('style', 'padding: 6px 6px 0 6px;').attr('id', 'sleep-del-button-' + sleeptime_index).append(del_symb).click(deleteSleepTime);
	col_del.append(del);

	row.append(col_fill).append(col_start).append(col_end).append(col_del);
	sleeptimes_block.append(row);
};

function deleteSleepTime() {
	sleeptimes_index.splice(sleeptimes_index.indexOf(parseInt(this.id.replace(/\D/g, ''))), 1);
	$('#' + this.id.replace('del-button-', '')).remove();
};

function firstMissing(array, start = 0) {
	while (array.indexOf(start) != -1)
		start++;
	return start;
};

function defineWorkTimes() {
	let worktimes = [];
	for (let i = 0; i < worktimes_index.length; i++) {
		let start_time = $('#work-start-time-' + worktimes_index[i]).val().split(":").map(a => parseInt(a));
		start_time = start_time[0] + start_time[1] / 60;
		let end_time = $('#work-end-time-' + worktimes_index[i]).val().split(":").map(a => parseInt(a));
		end_time = end_time[0] + end_time[1] / 60;

		worktimes.push([start_time, end_time]);
	}
	return worktimes;
};

function defineVacations() {
	let vacations = [];
	for (let i = 0; i < vacations_index.length; i++)
		vacations.push([
			dayOfYear(new Date(year, parseInt($('#vacation-start-month-' + vacations_index[i]).val()), parseInt($('#vacation-start-day-' + vacations_index[i]).val()))),
			dayOfYear(new Date(year, parseInt($('#vacation-end-month-' + vacations_index[i]).val()), parseInt($('#vacation-end-day-' + vacations_index[i]).val()))),
		]);
	return vacations;
};

function defineSleepTimes() {
	let sleeptimes = [];
	for (let i = 0; i < sleeptimes_index.length; i++) {
		let start_time = $('#sleep-start-time-' + sleeptimes_index[i]).val().split(":").map(a => parseInt(a));
		start_time = start_time[0] + start_time[1] / 60;
		let end_time = $('#sleep-end-time-' + sleeptimes_index[i]).val().split(":").map(a => parseInt(a));
		end_time = end_time[0] + end_time[1] / 60;

		sleeptimes.push([start_time, end_time]);
	}
	return sleeptimes;
};

function defineWorkRegime() {
	return $("input[name='work-regime']:checked").val();
};

function restrainMonthDay(event) {
	$('#' + this.id.replace('month', 'day')).attr('min', 1).attr('max', daysNumber(this.value, isLeap(year)));
};

function getWorkDays(regime, vacations, year) {
	let date = new Date(year, 0, 1, 0, 0, 0);
	let pattern = regime.split('/').map(a => parseInt(a));
	let regime_map = makeRegimeMap(pattern);
	let day_shift = date.getDay();
	let work_days = [-1];
	for (let i = 0; i < yearDaysNumber(year); i++) {
		let state = isVacationDay(i, vacations) ? 0 : regime_map[(i + regime_map.length + day_shift) % regime_map.length];
		work_days.push(state);
		date = addOneDay(date);
	}
	return work_days;
};

function makeRegimeMap(pattern, shift = 1) {
	let map = [];
	for (let i = 0; i < pattern.length; i++)
		for (let j = 0; j < pattern[i]; j++)
			map.push((i + 1) % 2);
	rotateArray(map, shift, true);
	return map;
};

function rotateArray(arr, n = 1, reverse = false) {
	for (let i = 0; i < n; i++)
		if (reverse)
			arr.unshift(arr.pop());
		else
			arr.push(arr.shift());
	return arr;
};

function isVacationDay(day, vacations) {
	for (let v = 0; v < vacations.length; v++)
		if (day >= vacations[v].sort()[0] && day <= vacations[v].sort()[1])
			return true;
	return false;
};