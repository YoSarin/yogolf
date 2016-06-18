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
        navigator.compass.getCurrentHeading(function (heading) {
            App.heading = heading;
            if (App.position) {
                View.refreshHeading(App.position, heading);
            }
            setTimeout(function () { App.watchHeading(); }, 250);
        }, function (error) {
            console.log(error);
            App.heading = null;
            setTimeout(function () { App.watchHeading(backoff); }, backoff * 250);
        });
    },
    watchLocation: function (backoff) {
        var options = { enableHighAccuracy: true, timeout: 5000 };
        var backoff = Math.min((backoff || 0.5) * 2, 64);
        navigator.geolocation.getCurrentPosition(function (position) {
            App.position = position;
            console.log(position);
            View.refreshDistance(position);
            setTimeout(App.watchLocation, 250);
        }, function (error) {
            console.log(error);
            App.position = null;
            setTimeout(function () { App.watchLocation(backoff); }, backoff * 250);
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