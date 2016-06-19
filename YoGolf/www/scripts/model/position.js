function Coord(latitude, longitude) {
    this.longitude = longitude;
    this.latitude = latitude;
}

Coord.EarthRadius = 6371e3; // metres

Coord.prototype = {
    toString:function() {
        return this.latitude + ',' + this.longitude;
    },
    latDistanceTo: function (otherCoord) {
        if (!this.latitude || !otherCoord.latitude) {
            return 0;
        }
        return Math.tan((otherCoord.latitude.toRad() - this.latitude.toRad()) / 2) * 2 * Coord.EarthRadius;
    },
    longDistanceTo: function (otherCoord) {
        if (!this.longitude || !otherCoord.longitude) {
            return 0;
        }
        return Math.tan((otherCoord.longitude.toRad() - this.longitude.toRad()) / 2) * 2 * Coord.EarthRadius;
    },
    distanceTo: function (otherCoord) {
        // very, very, VERY approximate
        var lat = this.latDistanceTo(otherCoord);
        var long = this.longDistanceTo(otherCoord);
        return Math.sqrt(lat * lat + long * long);
    },
    directionTo: function (otherCoord) {
        var direction = Math.atan2(this.longDistanceTo(otherCoord), this.latDistanceTo(otherCoord));
        direction = 360 * direction / (2 * Math.PI);
        return direction;
    }
}

Coord.Test = function () {
    var myPlace = new Coord(50.00, 15.00);

    var north = new Coord(55.00, 15.00);
    var east = new Coord(50.00, 20.00);
    var south = new Coord(45.00, 15.00);
    var west = new Coord(50.00, 10.00);

    console.log(myPlace.directionTo(north));
    console.log(myPlace.directionTo(east));
    console.log(myPlace.directionTo(south));
    console.log(myPlace.directionTo(west));
}