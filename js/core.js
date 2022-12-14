// Assiging the fields elements of the page

// Titles block
const header_title = $('#title');

// Input block
const lat_field = $('#latitude-field');
const lon_field = $('#longitude-field');
const elev_field = $('#elevation-field');
const zone_field = $('#timezone-field');
const year_field = $('#year-field');
const loc_field = $('#locality-field');
const reg_field = $('#region-field');
const repartition_field = $('#repartition-select').change(chooseRepartition).change(updateScreen);

const lat_box = $('#latitude');
const lon_box = $('#longitude');
const reg_box = $('#region');

// Sun diagram block
const sun_diagram_canvas = $('#sun-diagram').click(function (e) {
	day = parseInt(coordX(e.offsetX)) + 1;
	displaySunDailyPath();
});

// Sun daily detail block objects
const cur_date_box = $('#sun-daily-date');
const cur_date_desc_box = $('#sun-daily-date-desc');
const sun_path_canvas = $('#sun-daily-path');
const sun_stripe_canvas = $('#sun-daily-stripe');
const sun_periods_box = $('#sun-daily-periods');
const sun_plot_box = $('#sun-year-plot');

// Sun durations block
const sun_durations_box = $('#sun-durations');

// Assigning arrays for the calendar data
let days = [];
let sun_thread = [];
let events_thread = [], events_days_index = [];
let periods_change_thread = [], periods_change_days_index = [], periods_durations = [], parts_durations = [];
let pers_periods_thread = [], pers_periods_days_index = [], pers_periods_durations = [], pers_parts_durations = [];
let events = [];
let pad_prev = [], pad_next = [], events_year_start = [], events_year_end = [];
let sum_durations = [], max_durations = [], min_durations = [], max_duration_days = [], min_duration_days = [];
let pers_sum_durations = [], pers_max_durations = [], pers_min_durations = [], pers_max_duration_days = [], pers_min_duration_days = [];

// Assigning the location variables
let latitude = 0;
let longitude = 0;
let locality = '';
let timezone = "Europe/Rome";
//let timezone = 'America/Los_Angeles';

// Setting the current day and year
let day = dayOfYear(new Date());
let year = parseInt(year_field.val());
let year_days = yearDaysNumber(year);
let total_year_time = year_days * 24;
let total_work_time = 0, total_sleep_time = 0, total_work_days = 0;

// Display properties
let sun_diagram_width = year_days + 11;
let sun_diagram_height = 240 + 8;

const disp_dates_limit = 2;

// Display parameters
const font_color = "#404048";
const grid_color = "#606070";
const point_color = "#FF5733";
const font_family = "Rubik";
const separator = ":";
const separators = {
	"minute": "m",
	"hour": "h",
	"day": "d",
	"week": "w"
};
const event_types = [
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
const period_types = [
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
	"day",
	"work",
	"sleep"
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

const event_code_work = 15;
const event_code_sleep = 16;
const part_work = [13, 13, "#4F5157", "work", "Work"];
const part_sleep = [14, 14, "#101020", "sleep", "Sleep"];

let repartition = [], pers_repartition = [];
const repartition_simple = [
	[1, 5, "#0A192F", "night", "Night"],
	[6, 7, "#7199BE", "twilight", "Twilight"],
	[8, 12, "#F4FCFF", "day", "Day"],
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
chooseRepartition();

//const work_color = "#4F5157";
//const sleep_color = "#194535";
function chooseRepartition() {
	repartition = repartitions[repartition_field.val()];
	pers_repartition = [...repartition];
	pers_repartition.push(part_work);
	pers_repartition.push(part_sleep);
	//console.log(repartition);
	//console.log(pers_repartition);
};

// GENERAL PAGE UPDATE FUNCTIONS
function updateScreen() {
	updateValues();
	updateTitle();
	drawDiagram();
	drawWorkHours();
	drawSleepHours();
	drawGrid();
	displaySunDurations(pers_repartition, pers_sum_durations, pers_max_durations, pers_min_durations, pers_max_duration_days, pers_min_duration_days);
	displaySunDailyPath();
	displaySunPlot(sun_plot_box, days, pers_parts_durations.map(a => a[pers_repartition.length - 3]), "#6667AB");
	drawPieDiagram($('#sun-pie-diagram'), pers_sum_durations, pers_repartition.map(a => a[2]), pers_repartition.map(a => a[4]), scale = 20);
};

function updateTitle() {
	header_title.text(locality + ' ' + year);
	lat_box.text(stringCoord(lat_field.val(), false));
	lon_box.text(stringCoord(lon_field.val(), true));
	reg_box.text(reg_field.val());
};

// Updates the values for the astro things
function updateValues() {
	// Getting the location information
	latitude = lat_field.val();
	longitude = lon_field.val();
	elevation = elev_field.val();
	year = parseInt(year_field.val());
	locality = loc_field.val();
	timezone = zone_field.val();
	//console.log(timezone);

	// Calculating year parameters and days vector
	year_days = yearDaysNumber(year);
	total_year_time = year_days * 24;
	days = [...Array(year_days + 1).keys()];
	days.shift();

	[events_thread, events_days_index] = getEventsThread(latitude, longitude, elevation, year, timezone);
	events = getEvents(events_thread, events_days_index).slice(0, year_days + 2);;

	[periods_change_thread, periods_change_days_index] = getEventsThread(latitude, longitude, elevation, year, timezone, [...Array(12).keys()].map(i => i + 2));
	periods_durations = getPeriodsDurations(periods_change_thread, periods_change_days_index).slice(0, year_days + 2);;
	parts_durations = getPartsDurations(periods_durations, repartition).slice(0, year_days + 2);
	parts_durations = parts_durations.slice(0, year_days + 1);

	[pers_periods_thread, pers_periods_days_index] = personalizeThread(periods_change_thread, work_days, work_times, event_code_work, sleep_times, event_code_sleep);
	pers_periods_durations = getPeriodsDurations(pers_periods_thread, pers_periods_days_index).slice(0, year_days + 2);;
	pers_parts_durations = getPartsDurations(pers_periods_durations, pers_repartition).slice(0, year_days + 2);

	sum_durations = parts_durations.reduce((a, b) => a.map((x, i) => x + b[i]));
	max_durations = parts_durations.reduce((a, b) => a.map((m, i) => m < b[i] ? b[i] : m));
	min_durations = parts_durations.reduce((a, b) => a.map((m, i) => m > b[i] ? b[i] : m));
	pers_sum_durations = pers_parts_durations.reduce((a, b) => a.map((x, i) => x + b[i]));
	pers_max_durations = pers_parts_durations.reduce((a, b) => a.map((m, i) => m < b[i] ? b[i] : m));
	pers_min_durations = pers_parts_durations.reduce((a, b) => a.map((m, i) => m > b[i] ? b[i] : m));

	max_duration_days = getDaysWithPeriodValue(parts_durations, max_durations, [1, year_days], 0.000001);
	min_duration_days = getDaysWithPeriodValue(parts_durations, min_durations, [1, year_days], 0.000001);
	pers_max_duration_days = getDaysWithPeriodValue(pers_parts_durations, pers_max_durations, [1, year_days], 0.000001);
	pers_min_duration_days = getDaysWithPeriodValue(pers_parts_durations, pers_min_durations, [1, year_days], 0.000001);

	total_work_time = pers_sum_durations[pers_sum_durations.length - 2];
	total_sleep_time = pers_sum_durations[pers_sum_durations.length - 1];
};
