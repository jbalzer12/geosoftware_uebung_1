//Functions
/**
* @function 
* @param {Array} pointA, {Array} pointB, {Array} pointC, {Array} pointD - needs two lines defines by four points
* @return {Array} intersect - returns the longitude and latitude of the intersection !which means we have to check if the lines do even intersect - otherwise the result is nonsense!
*/
function lineIntersection(pointA, pointB, pointC, pointD) { 
    //longitudes and latitudes of the given points with pointA and pointB defining lineA and pointC and pointD defining lineB
    var latA = pointA[1];
    var lonA = pointA[0];
    var latB = pointB[1];
    var lonB = pointB[0];
    var latC = pointC[1];
    var lonC = pointC[0];
    var latD = pointD[1];
    var lonD = pointD[0];

    var d = (lonA - lonB) * (latC - latD) - (latA - latB) * (lonC - lonD); 

    var intersectLon = ((lonA * latB - latA * lonB) * (lonC - lonD) - (lonA - lonB) * (lonC * latD - latC * lonD)) / d;
    var intersectLat = ((lonA * latB - latA * lonB) * (latC - latD) - (latA - latB) * (lonC * latD - latC * lonD)) / d;

    return [intersectLon, intersectLat] //return the intersect
};

/**
* @function 
* @param {Array} pointA, {Array} pointB, {Array} pointC
* @return {integer} - returns 1, 0, -1
*/
function getDirection(pointA, pointB, pointC) {
    if (((pointC[1] - pointA[1]) * (pointB[0] - pointA[0])) > ((pointB[1] - pointA[1]) * (pointC[0] - pointA[0]))) { 
      return 1; //returns 1 if pointC lies to the left of the segemt defined by points A and B
    }
    else if (((pointC[1] - pointA[1]) * (pointB[0] - pointA[0])) == ((pointB[1] - pointA[1]) * (pointC[0] - pointA[0]))) {
      return 0; //returns 0 if pointC lies on  the segemt defined by points A and B
    }
    else {
        return -1; //returns -1 if pointC lies to the right of the segemt defined by points A and B
    }
}

/**
* @function 
* @param {Array} pointA, {Array} pointB, {Array} pointC
* @return {boolean} - returns true or false
*/
function containsSegment(pointA, pointB, pointC) {
    if (pointA[0] < pointB[0] && pointA[0] < pointC[0] && pointC[0] < pointB[0]) { //checking x values -> xA < xB && xA < xC && xC < xB
        return true; //point C lies between point A B with the following order A -> C -> B
    }
    else if (pointB[0] < pointA[0] && pointB[0] < pointC[0] && pointC[0] < pointA[0]) { //checking x values -> xB < xA && xB < xC && xC < xA
        return true; //point C lies between point A B with the following order B -> C -> A
    }
    else if (pointA[1] < pointB[1] && pointA[1] < pointC[1] && pointC[1] < pointB[1]) { //checking y values -> xA < xB && xA < xC && xC < xB
        return true; //point C lies between point A B with the following order A -> C -> B
    }
    else if (pointB[1] < pointA[1] && pointB[1] < pointC[1] && pointC[1] < pointA[1]) { //checking y values -> xB < xA && xB < xC && xC < xA
        return true; //point C lies between point A B with the following order B -> C -> A
    }
    else if (pointA[0] == pointC[0] && pointA[1] == pointC[1] || pointB[0] == pointC[0] && pointB[1] == pointC[1]) { //check if point C is equal to ether point A or B
        return true; //point C has the smae position as point A or B
    }
    return false; //in all other cases -> point C does not lie between point A and B
  }

/**
* @function 
* @param {Array} pointA, {Array} pointB, {Array} pointC, {Array} pointD - needs for points which define two segments
* @return {boolean} - returns true if the segments intersect
*/
function hasIntersection(pointA, pointB, pointC, pointD) {
    //check direction of
    var d1 = getDirection(pointA, pointB, pointD); //pointD to "segment" defined by pointA and pointB
    var d2 = getDirection(pointA, pointB, pointC); //pointC to "segment" defined by pointA and pointB
    var d3 = getDirection(pointA, pointC, pointD); //pointD to "segment" defined by pointA and pointC
    var d4 = getDirection(pointB, pointC, pointD); //pointD to "segment" defined by pointB and pointC
    
    //if the rotations are the opposite of each other thy intersect
    var intersect = d1 != d2 && d3 != d4;
    
    //if the points are all on the same line we have to check for overlap or if one segments (partly) contains the other
    if (d1 == 0 && d2 == 0 && d3 == 0 && d4 == 0) {
      intersect = containsSegment(pointA, pointB, pointC) || containsSegment(pointA, pointB, pointD) ||
      containsSegment(pointC, pointD, pointA) || containsSegment(pointC, pointD, pointB);
    }
    return intersect; //return true or false
};

/**
* @function 
* @param {Array} array - the input needs to be an array which represents a line or an polygon
* @return {} - returns the input as an GeoJson
*/
function arrayToGeoJson(array) {
    var geoJson; //variable for storing the result
    //if last first and last entry of the array are equal it is assumed the input is an polygon (later version may include an option that must be set beforehand)
    if(array[0][0] == array[array.length-1][0] && array[0][1] == array[array.length-1][1]) {
        //create an String formatted as an GeoJson polygon by concatenation
        var polygonString = '{' + '"type": "Polygon",' + '"coordinates": [[' + arrayToString(array) + ']]}';
        //parsing the String
        geoJson = JSON.parse(polygonString);
    }
    //other inpits are interpreted as lines
    else {
        //create an String formatted as an GeoJson polygon by concatenation
        var lineString = '{' + '"type": "LineString",' + '"coordinates": [' + arrayToString(array) + ']}';
        //parsing the String
        geoJson = JSON.parse(lineString);     
    }
    //Output
    return geoJson;
}

/**
* @function 
* @param {Array} array
* @return {String} - outputs the array as an correctly formatted String
*/
function arrayToString(array) {
    var string = '[' + array[0] + '],';
    for (var i = 1; i < array.length-1; i++) {
        string = string + '[' + array[i] + '],'
    }
    string = string + '[' + array[array.length-1] + ']'
    return string;
}

/**
* @function 
* @param {Array} array 
* @return {String} - outputs a JSON Rectangle 
*/
function arrayToPolygon(array) {
    array = array.push(array[0]);
    return array;
}

/**
 * @function
 * @param
 * @return
 */
function getAllIntersections(route, polygon) {
    var intersections = [];
    for(i = 0; i < route.length-1; i++) {
        for(j = 0; j < polygon.length-1; j++) {
            if(hasIntersection(route[i], route[i+1], polygon[j], polygon[j+1])) {
                intersections.push(lineIntersection(route[i], route[i+1], polygon[j], polygon[j+1]));
            }
        }
    }
    return intersections;
}

/**
 * @function
 * @param
 * @return
 */
 function convertToLonLat(polygon) { //swap coordinates
    var swappedPolygon = [];
    for(var i = 0; i < polygon.length; i++) {
        var lon = polygon[i][1];
        var lat = polygon[i][0];
        swappedPolygon.push([lon, lat]);
    }
    return swappedPolygon;
}

/**
 * @function
 * @param
 * @return
 */
function arrayToPoint(point) { // arrray of coordinates to geojson point
    var pointGeoJson = '{' + '"type": "Feature",' + '"properties": {},' + '"geometry": {' + '"type": "Point", "coordinates": [' + point[0] + ',' + point[1] + ']}}';
    return JSON.parse(pointGeoJson);
}

/**
 * @function
 * @param
 * @return
 */
function weatherRequest(position, apiKey, marker) { //request weather data to map
    var request = buildRequest(position, apiKey);
    var timezone;
    {$.ajax({
        url: request,
        method: "GET",
        })
        .done(function(response) {
            marker.bindPopup(
                            '<p  style="font-size: 18px;">Wetter an dieser Position</p>' +
                            '<p>Ort: ' +  response.lat + ', ' + response.lon + '<br>' +
                            'Zeitzone: ' + response.timezone + '<br>' +
                            'Temperatur: ' + response.current.temp + '°C<br>' +
                            'Luftfeuchte: ' + response.current.humidity + '%<br>' +
                            'Luftdruck: ' + response.current.pressure + 'hPa<br>' + 
                            'Wolkenbedeckung: ' + response.current.clouds + '%<br>' + 
                            'Wetter: ' + response.current.weather[0].description + '</p>'
            );
        })
        .fail(function(xhr, status, errorThrown) {
            console.log("Request has failed");
            marker.bindPopup(
                '<p  style="font-size: 18px;">Wetter an dieser Position</p>' +
                '<p>Wetterdaten konnten nicht abgerufen werden.</p>'
            );
        })
        .always(function(xhr, status) {
            console.log("Request completed");
        })}
}

/**
 * @function
 * @param
 * @return
 */
function buildRequest(position, key){
    api = "https://api.openweathermap.org/data/2.5/onecall?units=metric&lat="+position[1]+"&lon="+position[0]+"&exclude="+"hourly"+"&appid="+key;
    return api;
}

/**
 * @function
 * @param
 * @return
 */
 function resetMap(){
    markerLayer.clearLayers();
    rectangleLayer.clearLayers();
    inputRectangleArray = [];
    intersections = [];
    return;
}
