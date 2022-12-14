<?
	// Filtering latitude
	$query = "";
	if (isset($_GET['query'])) {
		$whiteSpace = '\s';
		$pattern = '/[^a-zA-Z0-9'.$whiteSpace.']/u';
 		$query = preg_replace($pattern, '', (string) $_GET['query']);
	}
	
	// Making the request
	$request_url = "https://api.openweathermap.org/geo/1.0/direct?q={$query}}&limit=5&appid=b63716abfb568c82a090e4123b60187e";

	// Executing the request and returning it in JSON format
	header('Content-Type: application/json; charset=utf-8');
	echo file_get_contents($request_url);
?>