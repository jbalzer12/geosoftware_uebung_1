//Functions
/**
* @function 
* @param {Array} pointA, {Array} pointB - needs two points as arrays
* @return {distance} - returns the distance between pointA and PointB
*/
function distanceBetweenTwoPoints(pointA, pointB) {
    var lat1 = pointA[1]; //latitude of pointA
    var lon1 = pointA[0]; //longitude of pointA
    var lat2 = pointB[1]; //latitude of pointB
    var lon2 = pointB[0]; //longitude of pointB
    const p = 0.017453292519943295; //pi/180 
    var c = Math.cos; //cosisnus
    var a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;

    return (12756.274 * Math.asin(Math.sqrt(a))) * 1000; //since WGS84 employs the GRS80 ellipsoid the doubled radius of the earth is 12742
};

/**
 * //this is an alternative function for calculating the distance between two points
function distanceBetweenTwoPoints(pointA, pointB) {
    const r = 6378137;
    var latA = pointA[1] * Math.PI/180;
    var latB = pointB[1] * Math.PI/180;

    var deltaLat = (pointB[1] - pointA[1]) * Math.PI/180;
    var deltaLon = (pointB[0] - pointA[0]) * Math.PI/180;

    var a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) + Math.cos(latA) * Math.cos(latB) * Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    var c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = r * c;
    return d;
}
*/

/**
* @function 
* @param {Array} point, {Array} polygon - needs a polygon as an array and the point as an array
* @return {Boolean} - returns true if the point is inside the polygon or on the border of the polygon and 
*                     returns false if the point is not inside the polygon
*/
function pointInPolygon(point, polygon) {
    var x = point[0]; //longitude of the point
    var y = point[1]; //latitude of the point

    var inside = false; //initial value for the check
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) { //iterate over the polygon 
        var xi = polygon[i][0]; //longitude of vertex i
        var yi = polygon[i][1]; //latitude of vertex i
        var xj = polygon[j][0]; //longitude of vertex j
        var yj = polygon[j][1]; //latitude of vertex j

        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi); //check if the casted ray intersect relevant segments of the polygon

        if (intersect) { //if the casted ray intersect a relevant segment the inside value is changend
            inside = !inside 
        } 
    }
    return inside; //return the result (true for odd number of relevat segments intersected and false for an even number of relevant segments intersected)
};

/**
* @function 
* @param {Array} point, {Array} polygon - needs a polygon as an array and the point as an array
* @return {Array} insideSegments - returns all segments with the information if the segment is outside of the polygon or inside the polygon and the length of the segment
*                                  intersecting segements are counted as inside polygon
*/
function getInsideOutsidePaths(route, polygon) {
    var paths = []; //initialising the output array
    for(var i = 0; i < route.length-1; i++) { //iterate over all verticies
        if(!(pointInPolygon(route[i], polygon) && pointInPolygon(route[i+1], polygon))) { //check if both verticies of the segment are outside of the polygon
            paths.push([route[i], route[i+1], "outside", distanceBetweenTwoPoints(route[i], route[i+1])]) //push the segment with its two verticies, the type (inside or outside) and the length
        }
        else { //all other cases
            paths.push([route[i], route[i+1], "inside", distanceBetweenTwoPoints(route[i], route[i+1])]); //push the segment with its two verticies, the type (inside or outside) and the length
        }
    }
    return paths; //return the segments
};

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
* @param {Array} point, {Array} polygon - needs a polygon as an array and the point as an array
* @return {Array} tailoredSegments - returns all outside segments cut at the border of the polygon
*/
function getOutsideSegments(path, polygon) {
    var segments = []; //initialise the segment array
    var tailoredSegments = []; //initialise the array for the tailored segments
    for (var i = 0; i < path.length-1; i++) { //iterate over all segments of the route
        if(!(pointInPolygon(path[i], polygon) && pointInPolygon(path[i+1], polygon))){ //check if both verticies of the segment are outside of the polygon
            segments.push([path[i],path[i+1], i]); //push the segment to the array with the iteration of loop
        }
        if(!(pointInPolygon(path[i], polygon)) && (pointInPolygon(path[i+1], polygon))){ //check if the first point is outside of the polygon
            segments.push([path[i],path[i+1], i]); //push the segment to the array with the iteration of loop
        }
        if(pointInPolygon(path[i], polygon) && !((pointInPolygon(path[i+1], polygon)))){ //check if the second point is outside the polygon
            segments.push([path[i],path[i+1], i]); //push the segment to the array with the iteration of loop
        }
        //if both points are inside the polygon the segment is ignored
    }
    //since the iteration checks each pair of consecutively verticies some segments are added twice the following loop deletes the doubletes via the saved iterator
    for(var i = 0; i < segments.length-1; i++) {
        if(segments[i][2] == segments[i+1][2]) {
            segments.splice(i, 1); //splice the array at the doubled and thereby "cutting out" one index 
        }
    }
    var cut = false; //initialise the "cut"
    for(var i = 0; i < segments.length; i++) { //iterate over teh segments which are outside the polygon or intersecting it
        for(var j = 0; j < polygon.length-1; j++) { //iterate over all segments of the polygon
            if(hasIntersection(segments[i][0], segments[i][1], polygon[j], polygon[j+1])) { //check again if the segment intersects with a segment of the polygon
                var tailoredSegment = getOutsideSegment(segments[i], polygon); //cut the segment at the intersect of the segement and the polygon
                tailoredSegments.push(tailoredSegment); //push the "cut" segement to the result
                cut = true; //set cut to true to save the information if or wether the segment is cut
            }
        }
        if(cut == false) { //if the segment does not intersect any segment of the polygon it is just pushed to the result
            tailoredSegments.push(segments[i]); //segement pushed to the result
        }
        cut = false; //"cur" value is reset for the next iteration
    }
    return tailoredSegments; //return the result
}

/**
* @function 
* @param {Array} path, {Array} polygon
* @return {Array} intersectingSegments - returns an array with all segemnts which intersect with the polygon
*/
function getIntersectingSegments(path, polygon) {
    var intersectingSegments = []; //initialising an empty array for the storage of the intersecting segments
    for (var i = 0; i < path.length-1; i++) { //iterate over the given path
        if(!(pointInPolygon(path[i], polygon)) && (pointInPolygon(path[i+1], polygon))){ //check for "forward" intersection
            intersectingSegments.push([path[i],path[i+1]]); //push taht segment into the result
        }
        if(pointInPolygon(path[i], polygon) && !((pointInPolygon(path[i+1], polygon)))){ //check for "backard" intersection
            intersectingSegments.push([path[i],path[i+1]]); //push taht segment into the result
        }
    }
    return intersectingSegments; //return the inersecting segments
};

/**
* @function 
* @param {Array} segment, {Array} polygon
* @return {Array} outwardSegment - returns the outward part of a given segment
*/
function getOutsideSegment(segment, polygon) {
    var insidePoint; //initialise inside point
    var outsidePoint; //initialise outside point
    var intersect; //initialise intersecting point

    if(pointInPolygon(segment[0], polygon)) { //check if the first point is inside the polygon
        insidePoint = segment[0]; //this point is now the inside point
        outsidePoint = segment[1]; //and the other the outside point
    }
    if(pointInPolygon(segment[1], polygon)) { //check if the second point is inside the polygon
        insidePoint = segment[1]; //this point would be the inside point
        outsidePoint = segment[0]; //and the other the outside point
    }
    for(var i = 0; i < polygon.length-1; i++) { //iterate over all segments of the polygon
        if(hasIntersection(insidePoint, outsidePoint, polygon[i], polygon[i+1])) { //if segment of the polygon intersects the given segment
           intersect = lineIntersection(insidePoint, outsidePoint, polygon[i], polygon[i+1]); //calculate the intersection
        }
    }
    return [intersect, outsidePoint]; //return the outside segment given by the outside point and the intersect
};

/**
* @function 
* @param {Array} segment, {Array} polygon
* @return {Array} inwardSegment - returns the inward part of a given segment
*/
function getInsideSegment(segment, polygon) {
    var insidePoint; //initialise inside point
    var outsidePoint; //initialise outside point
    var intersect; //initialise intersecting point

    if(pointInPolygon(segment[0], polygon)) { //check if the first point is inside the polygon
        insidePoint = segment[0]; //this point is now the inside point
        outsidePoint = segment[1]; //and the other the outside point
    }
    if(pointInPolygon(segment[1], polygon)) { //check if the second point is inside the polygon
        insidePoint = segment[1]; //this point would be the inside point
        outsidePoint = segment[0]; //and the other the outside point
    }
    for(var i = 0; i < polygon.length-1; i++) { //iterate over all segments of the polygon
        if(hasIntersection(insidePoint, outsidePoint, polygon[i], polygon[i+1])) { //if segment of the polygon intersects the given segment
           intersect = lineIntersection(insidePoint, outsidePoint, polygon[i], polygon[i+1]); //calculate the intersection
        }
    }
    return [intersect, insidePoint]; //return the inside segment given by the inside point and the intersect
};

/**
* @function 
* @param 
* @return 
*/
function getSegments(route, polygon) {
    var segments = [];
    for(var i = 0; i < route.length-1; i++) {
        if(pointInPolygon(route[i], polygon) && pointInPolygon(route[i+1],polygon)) { //Both inside
            segments.push([route[i], route[i+1], "inside", distanceBetweenTwoPoints(route[i], route[i+1])]);
        }
        else if (!(pointInPolygon(route[i], polygon)) && !(pointInPolygon(route[i+1],polygon))) { //both outside
            segments.push([route[i], route[i+1], "outside", distanceBetweenTwoPoints(route[i], route[i+1])]);
        }
        else if (pointInPolygon(route[i], polygon) && !(pointInPolygon(route[i+1], polygon))) { //startPoint inside, endPoint outside
            var insideSegment = getInsideSegment([route[i], route[i+1]], polygon);
            var outsideSegment = getOutsideSegment([route[i], route[i+1]], polygon);
            segments.push([insideSegment[0], insideSegment[1], "inside", distanceBetweenTwoPoints(insideSegment[0], insideSegment[1])]);
            segments.push([outsideSegment[0], outsideSegment[1], "outside", distanceBetweenTwoPoints(outsideSegment[0], outsideSegment[1])]);

        }
        else if (!(pointInPolygon(route[i], polygon)) && pointInPolygon(route[i+1], polygon)) { //endPoint inside, startPoint outside
            var insideSegment = getInsideSegment([route[i], route[i+1]], polygon);
            var outsideSegment = getOutsideSegment([route[i], route[i+1]], polygon);
            segments.push([outsideSegment[0], outsideSegment[1], "outside", distanceBetweenTwoPoints(outsideSegment[0], outsideSegment[1])]);
            segments.push([insideSegment[0], insideSegment[1], "inside", distanceBetweenTwoPoints(insideSegment[0], insideSegment[1])]);
        }
    }
    return segments;
}

/**
* @function 
* @param {Array} pointA, {Array} pointB, {Array} pointC
* @return {integer} - returns 1, 0, -1
*/
function getDirection(pointA, pointB, pointC) {
    if (((pointC[1] - pointA[1]) * (pointB[0] - pointA[0])) > ((pointB[1] - pointA[1]) * (pointC[0] - pointA[0]))) {
      return 1;
    }
    else if (((pointC[1] - pointA[1]) * (pointB[0] - pointA[0])) == ((pointB[1] - pointA[1]) * (pointC[0] - pointA[0]))) {
      return 0;
    }
    else {
        return -1;
    }
}

/**
* @function 
* @param {Array} pointA, {Array} pointB, {Array} pointC
* @return {Boolean} - returns true or false
*/
function containsSegment(pointA, pointB, pointC) {
    if (pointA[0] < pointB[0] && pointA[0] < pointC[0] && pointC[0] < pointB[0]) {
        return true;
    }
    else if (pointB[0] < pointA[0] && pointB[0] < pointC[0] && pointC[0] < pointA[0]) {
        return true;
    }
    else if (pointA[1] < pointB[1] && pointA[1] < pointC[1] && pointC[1] < pointB[1]) {
        return true;
    }
    else if (pointB[1] < pointA[1] && pointB[1] < pointC[1] && pointC[1] < pointA[1]) {
        return true;
    }
    else if (pointA[0] == pointC[0] && pointA[1] == pointC[1] || pointB[0] == pointC[0] && pointB[1] == pointC[1]) {
        return true;
    }
    return false;
  }

/**
* @function 
* @param 
* @return 
*/
function hasIntersection(pointA, pointB, pointC, pointD) {
    var d1 = getDirection(pointA, pointB, pointD);
    var d2 = getDirection(pointA, pointB, pointC);
    var d3 = getDirection(pointA, pointC, pointD);
    var d4 = getDirection(pointB, pointC, pointD);
    
    // If the faces rotate opposite directions, they intersect.
    var intersect = d1 != d2 && d3 != d4;
    
    // If the segments are on the same line, we have to check for overlap.
    if (d1 == 0 && d2 == 0 && d3 == 0 && d4 == 0) {
      intersect = containsSegment(pointA, pointB, pointC) || containsSegment(pointA, pointB, pointD) ||
      containsSegment(pointC, pointD, pointA) || containsSegment(pointC, pointD, pointB);
    }
    return intersect;
};

/**
* @function 
* @param {Array} path
* @return {Array} path - returns an aggregated version of the path with ist starting point, end point, length and type (inside or outside)
*/
function aggregatePath(path) {
    var type = path[0][2]; //get the type (all segments in the path should have the same)
    var startPoint = path[0][0]; //get start point from first segment entry
    var endPoint = path[path.length-1][1]; //get end point from last segment entry
    var length = 0; //initialise length of the path
    for(var i = 0; i < path.length; i++) { //iterate over the segments
        length += path[i][3]; //add length per segment
    }
    return [type, startPoint, endPoint, length]; //return aggregated data as array
}

/**
* @function 
* @param {Array} segments
* @return {Array} paths - all paths (of type inside or outside) in an array
*/
function getPaths(segments) {
    var path = []; //define an empty array for the individual paths which have to be build first by aggregating the corresponing segments
    var paths = []; //define an empyt array for the aggregated paths
    var tableData = []; //define an empty array for the data for the rows of the table
    var lastSegment = segments1[segments1.length-1]; //get the last segment of the last path 
                                                     //(there is an "one-of" error somewhre but i 
                                                     //was unable to find it so it is corrected this way)

    for(var i = 0; i < segments1.length-1; i++) { //iterate over all segments
            if(segments[i][2] == segments[i+1][2]) { //if the segments correspond to the same path
                path.push(segments[i]); //push the segment i into the path array
            }
            else if(segments[i][2] != segments[i+1][2]) { //if the next segemnt does not correspond to the same path
                path.push(segments[i]); //push the last segment into the path
                paths.push(path); //push the complete path into the paths array
                path = []; //empty the path for the next
            }
        }
        path.push(lastSegment); //push the last segment into the path
        paths.push(path); //push the last path into the paths
        return paths;
}

/**
* @function 
* @param {Array} segments
* @return {float} - length of the path
*/
function calculateLengthOfPaths(paths) {
    var totalLength = 0; //initialise length
    for(var i = 0; i < paths.length; i++) { //iterate over the path
        totalLength += paths[i][3]; //add the length of segment i to the overall length
    }
    return totalLength; //return the length of the path
}

/**
* @function 
* @param {Object} table, {Array} paths
* @return {} - passes the paths into the given table
*/
function createPathTable(table, paths) {
    var tableData = []; //initialise tabledata as array
    for(var i = 0; i < paths.length; i++) { //iterate over the paths
        tableData.push(aggregatePath(paths[i])); //push aggregated paths into table data array
    }

    //fill the table with the paths
    tableData.sort((a, b) => a[3] - b[3]); //sort by length via callback function
    for(var i = 0; i < tableData.length; i++) { //iterate over table data
        //initialise table row as variable
        var row =  `<tr> 
            <td>${tableData[i][0]}</td>
            <td>${tableData[i][1]}</td>
            <td>${(tableData[i][2])}</td>
            <td>${(tableData[i][3]).toFixed(2)}</td>
        </tr>`
        table.innerHTML += row; //pass row to given table
    }
}