function Coord(longtitude, latitude) {
    this.longtitude = longtitude;
    this.latitude = latitude;
}

Coord.EarthRadius = 6371e3; // metres

Coord.prototype = {
    latDistanceTo: function (otherCoord) {
        return Math.tan((this.latitude.toRad() - otherCoord.latitude.toRad()) / 2) * 2 * Coord.EarthRadius;
    },
    longDistanceTo: function (otherCoord) {
        return Math.tan((this.longtitude.toRad() - otherCoord.longtitude.toRad()) / 2) * 2 * Coord.EarthRadius;
    },
    distanceTo: function (otherCoord) {
        // very, very, VERY approximate
        var lat = this.latDistanceTo(otherCoord);
        var long = this.longDistanceTo(otherCoord);

        return Math.sqrt(lat * lat + long * long);
    },
    directionTo: function (otherCoord) {
        var direction = Math.atan2(this.latDistanceTo(otherCoord), this.longDistanceTo(otherCoord));
        direction = 360 * direction / Math.PI;
        return direction;
    }
}

Coord.Test = function () {
    var myPlace = new Coord(50.0411075, 14.3220511);

    var north = new Coord(50.0490997, 14.3218794);
    var east = new Coord(50.0413556, 14.3391317);
    var south = new Coord(50.0365319, 14.3296903);
    var west = new Coord(50.0412453, 14.3079750);

    console.log(myPlace.directionTo(north));
    console.log(myPlace.directionTo(east));
    console.log(myPlace.directionTo(south));
    console.log(myPlace.directionTo(west));
}