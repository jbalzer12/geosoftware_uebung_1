//Functions
function pointLIsteToPointArray (pointList) {
    pointArray = Array.of(pointList);
    return pointArray;
};

function distanceBetweenTwoPoints(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI/180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;

    return (12742 * Math.asin(Math.sqrt(a))) * 1000; //2 * R; R = 6371 km !! Must be changenged to 6378 conform to WGS-84 
};

function degToRad(deg) {
    return deg * (Math.PI/180);
};

function pointInPolygon(point, polygon) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        var xi = polygon[i][0], yi = polygon[i][1];
        var xj = polygon[j][0], yj = polygon[j][1];

        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) inside = !inside;
    }
    return inside;
};

function lineIntersection(lon1, lat1, lon2, lat2, lon3, lat3, lon4, lat4) { 
    //line 1 is defined by lat1, lon1 and lat2, lon2
    //line 1 is defined by lat3, lon3 and lat4, lon4

    var d = (lon1 - lon2) * (lat3 - lat4) - (lat1 - lat2) * (lon3 - lon4);

    var intersectLon = ((lon1 * lat2 - lat1*lon2) * (lon3 - lon4) - (lon1 - lon2) * (lon3 * lat4 - lat3 * lon4)) / d;
    var intersectLat = ((lon1 * lat2 - lat1 * lon2) * (lat3 - lat4) - (lat1 - lat2) * (lon3 * lat4 - lat3 * lon4)) / d;

    return [intersectLon, intersectLat]
};

function getContainedSegments(path, polygon) {
    var containedSegments = [];
    for (var i = 0; i < path.length-1; i++) {
    //both verticies are inside the polygon
        if(!(pointInPolygon(path[i], polygon) && pointInPolygon(path[i+1], polygon))){
            containedSegments.push([path[i],path[i+1]]);
        }
    }
    return containedSegments;
};

function getIntersectingSegments(path, polygon) {
    var intersectingSegments = [];
    for (var i = 0; i < path.length-1; i++) {
        //one point is inside the polygon
        if(!(pointInPolygon(path[i], polygon)) && (pointInPolygon(path[i+1], polygon))){
            intersectingSegments.push([path[i],path[i+1]]);
        }
        if(pointInPolygon(path[i], polygon) && !((pointInPolygon(path[i+1], polygon)))){
            intersectingSegments.push([path[i],path[i+1]]);
        }
    }
    return intersectingSegments;
};

function splitSegment(segment, polygon) {
    var insidePoint;
    var outsidePoint;
    var intersect;

    if(pointInPolygon(segment[0], polygon)) {
        insidePoint = segment[0];
        outsidePoint = segment[1];
    }
    if(pointInPolygon(segment[1], polygon)) {
        insidePoint = segment[1];
        outsidePoint = segment[0];
    }

    console.log(insidePoint);
    console.log(outsidePoint);

    for(var i = 0; i < polygon.length-1; i++) {
    }
    return intersect;
};

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

function hasIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    var f1 = RotationDirection(x1, y1, x2, y2, x4, y4);
    var f2 = RotationDirection(x1, y1, x2, y2, x3, y3);
    var f3 = RotationDirection(x1, y1, x3, y3, x4, y4);
    var f4 = RotationDirection(x2, y2, x3, y3, x4, y4);
    
    // If the faces rotate opposite directions, they intersect.
    var intersect = f1 != f2 && f3 != f4;
    
    // If the segments are on the same line, we have to check for overlap.
    if (f1 == 0 && f2 == 0 && f3 == 0 && f4 == 0) {
      intersect = containsSegment(x1, y1, x2, y2, x3, y3) || containsSegment(x1, y1, x2, y2, x4, y4) ||
      containsSegment(x3, y3, x4, y4, x1, y1) || containsSegment(x3, y3, x4, y4, x2, y2);
    }
    
    return intersect;
}