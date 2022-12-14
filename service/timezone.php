<?
	// Filtering latitude
	$lat = 0;
	if (isset($_GET['lat']))
		$lat = (double)$_GET['lat'];
	if (-90 >= $lat || 90 <= $lat)
		$lat = 0;
	
	// Filtering longitude
	$lon = 0;
	if (isset($_GET['lon']))
		$lon = (double)$_GET['lon'];
	if (-180 >= $lon || 180 <= $lon)
		$lon = 0;
	
	// Making the request
	$request_url = "http://api.geonames.org/timezoneJSON?lat={$lat}&lng={$lon}&username=aristina";

	// Executing the request and returning it in JSON format
	header('Content-Type: application/json; charset=utf-8');
	echo file_get_contents($request_url);
?>