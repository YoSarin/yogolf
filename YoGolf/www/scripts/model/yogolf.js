function YoGolf(db) {
    var __self__ = this;
    this.db = db

    this.heading = null;
    this.position = null;

    this.watchHeading();
    this.watchLocation();
}

YoGolf.prototype = {
    Courses: function () {
        View.Courses(this.db);
    },
    watchHeading: function (backoff) {
        var backoff =  Math.min((backoff || 0.5) * 2, 64);
        var backoffTime = backoff * 250;
        var __self__ = this;
        navigator.compass.getCurrentHeading(function (heading) {
            __self__.heading = heading;
            if (__self__.position) {
                View.refreshHeading(__self__.position, heading);
            }
            setTimeout(function () { __self__.watchHeading(); }, backoffTime);
        }, function (error) {
            console.log(error);
            __self__.heading = null;
            setTimeout(function () { __self__.watchHeading(backoff); }, backoffTime);
        });
    },
    watchLocation: function (backoff) {
        var options = { enableHighAccuracy: true };
        var backoff = Math.min((backoff || 0.5) * 2, 64);
        var backoffTime = backoff * 250;
        var __self__ = this;
        navigator.geolocation.getCurrentPosition(function (position) {
            __self__.position = position;
            View.refreshDistance(position);
            setTimeout(__self__.watchLocation, backoffTime);
        }, function (error) {
            console.log(error);
            __self__.position = null;
            setTimeout(function () { __self__.watchLocation(backoff); }, backoffTime);
        }, options);
    }
}

function Panic(message) {
    $(':mobile-pagecontainer').pagecontainer('change', $('#error'));
    $("#error .error-list").append(
        $('<ul>').text(message).append('<br />').append($('<small>').text(calledFrom()))
    );
}

function calledFrom() {
    try {
        throw Error('')
    } catch (err) {
        console.log(err.stack.split("\n"));
        var caller_line = err.stack.split("\n")[3];
        var index = caller_line.indexOf("at ");
        return caller_line.slice(index + 2, caller_line.length);
    }
}