const city_field = $('#city-search');
const apply_location_button = $('#apply-location').click(function () { updateGeoData(); updateScreen(); });

const choose_lat_field = $('#select-lat-field');
const choose_lon_field = $('#select-lon-field');
const choose_elev_field = $('#select-elev-field');
const choose_zone_field = $('#select-zone-field');
const choose_year_field = $('#select-year');

const choose_lat_box = $('#select-lat');
const choose_lon_box = $('#select-lon');
const choose_elev_box = $('#select-elev');
const choose_zone_box = $('#select-zone');
const choose_city_box = $('#select-city');
const choose_region_box = $('#select-region');

function updateGeoData() {
	loc_field.val(choose_city_box.text());
	reg_field.val(choose_region_box.text());
	lat_field.val(choose_lat_field.val());
	lon_field.val(choose_lon_field.val());
	elev_field.val(choose_elev_field.val());
	year_field.val(choose_year_field.val());
	zone_field.val(choose_zone_field.val());
}

city_field.autocomplete({
	source: function (request, response) {
		console.log(request.term);
		$.ajax({
			url: 'https://api.openweathermap.org/geo/1.0/direct?q=' + String(request.term).replace(/[^a-z0-9\s]/gi, '') + '&limit=5&appid=b63716abfb568c82a090e4123b60187e',
			success: function (data) {
				response(data);
			}
		});
	},
	select: function (event, ui) {
		let city_name = ui.item.name;
		let city_region = (ui.item.state !== undefined ? (ui.item.state + ', ') : '') + ui.item.country;
		let lat = ui.item.lat;
		let lon = ui.item.lon;
		choose_lat_field.val(lat);
		choose_lon_field.val(lon);
		choose_city_box.text(city_name);
		if (city_name == 'Murcia')
			choose_city_box.text(city_name + ' (No Existe!)');
		choose_region_box.text(city_region);
		choose_lat_box.text(stringCoord(lat, false));
		choose_lon_box.text(stringCoord(lon, true));
		drawGeoLocation();
		getElevation(lat, lon);
		getTimeZone(lat, lon);
		$('.ui-autocomplete').attr('style', 'width: ' + city_field.width() + ';')

		return false;
	}
}).autocomplete("instance")._renderItem = function (ul, item) {
	return $("<li>")
		.append("<div>" + item.name + ' (' + (item.state !== undefined ? (item.state + ', ') : '') + item.country + ')' + "</div>")
		.appendTo(ul);
};

function drawGeoLocation() {
	const world_map_canvas = $('#world-map-canvas');
	const world_map_image = $('#world-map-image');
	const w = world_map_image.width();
	const h = world_map_image.height();

	let lat = choose_lat_field.val();
	let lon = choose_lon_field.val();

	let x = (lon / 360 + 0.5) * w;
	let y = (-lat / 180 + 0.5) * h;

	let content = "";
	content += '<circle cx="' + x + '" cy="' + y + '" r="3" fill="' + point_color + '" />';
	content += '<line x1="' + x + '" x2="' + x + '" y1="0" y2="' + h + '" stroke="' + point_color + '" />';
	content += '<line x1="0" x2="' + w + '" y1="' + y + '" y2="' + y + '" stroke="' + point_color + '" />';

	//console.log(lat, lon, w, h, x, y, content);

	world_map_canvas.attr('viewBox', '0 0 ' + w + ' ' + h).html(content);
};


// ELEVATION FUNCTIONS BLOCK
function getElevation(latitude, longitude) {
	let request = 'https://api.open-meteo.com/v1/elevation?latitude=' + latitude + '&longitude=' + longitude;
	let elevation = 0;
	$.ajax({
		url: request,
		success: function (data) {
			elevation = parseInt(data['elevation'][0]);
			choose_elev_field.val(elevation);
			choose_elev_box.text(elevation + ' m');
		}
	});
};

function getTimeZone(latitude, longitude) {
	let request = 'http://api.geonames.org/timezoneJSON?lat=' + latitude + '&lng=' + longitude + '&username=aristina';
	let timezone = 'Europe/Paris';
	$.ajax({
		url: request,
		success: function (data) {
			timezone = data.timezoneId;
			choose_zone_field.val(timezone);
			choose_zone_box.text(timezone);
		}
	});
}

function stringCoord(coord, lon) {
	var deg = coord | 0; // truncate dd to get degrees
	var frac = Math.abs(coord - deg); // get fractional part
	var min = (frac * 60) | 0; // multiply fraction by 60 and truncate
	var sec = frac * 3600 - min * 60;
	let dir = coord < 0 ? (lon ? "W" : "S") : lon ? "E" : "N";
	return Math.abs(deg) + '\u00B0 ' + min + '\u2032 ' + sec.toFixed(2) + '\u2033 ' + dir;
};

//