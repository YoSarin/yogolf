function YoGolf(db) {
    var __self__ = this;
    this.db = db

    this.heading = null;
    this.position = null;

    this.players = Array();

    this.watchHeading();
    this.watchLocation();

    this.history = Array();
}

YoGolf.prototype = {
    LoadPlayers: function () {
        this.players = Array();
        var __self__ = this;
        Player.LoadAll(function (player) { __self__.players.push(player); });
    },
    AddToHistory: function (callback, params) {
        var place = this.history.length - 1;
        if (place < 0 || (this.history[place]['callback'] != callback && this.history[place]['params'] != params)) {
            this.history.push({ 'callback': callback, 'params': params });
        }
    },
    goBack: function () {
        if (this.history.length > 1) {
            var current = this.history.pop();
            var fn = this.history[this.history.length - 1]['callback'];
            var params = this.history[this.history.length - 1]['params'];
            fn.apply(params);
        }
    },
    watchHeading: function (backoff) {
        var backoff =  Math.min((backoff || 0.5) * 2, 64);
        navigator.compass.getCurrentHeading(
            function (heading) {
                App.heading = heading;
                if (App.position) {
                    View.refreshHeading(App.position, heading);
                }
                setTimeout(function () { App.watchHeading(); }, 250);
            }, function (error) {
                console.log(error);
                App.heading = null;
                setTimeout(function () { App.watchHeading(backoff); }, backoff * 250);
            }
        );
    },
    watchLocation: function (backoff) {
        var options = { enableHighAccuracy: true, timeout: 5000
        };
        var backoff = Math.min((backoff || 0.5) * 2, 64);
        navigator.geolocation.getCurrentPosition(function (position) {
            App.position = position;
            View.refreshDistance(position);
            setTimeout(App.watchLocation, 250);
        }, function (error) {
            console.log(error);
            App.position = null;
            setTimeout(function () { App.watchLocation(backoff); }, backoff * 250);
        }, options);
    },
        dbCleanup: function () {
            this.db.sqlBatch([
                "DELETE FROM layout WHERE course NOT IN (SELECT rowid FROM course);",
                "DELETE FROM path WHERE layout NOT IN (SELECT rowid FROM layout);",
                "DELETE FROM tee WHERE rowid NOT IN (SELECT tee FROM path);",
                "DELETE FROM basket WHERE rowid NOT IN (SELECT basket FROM path);",
            ],
                function () {
            },
                function (error) { console.log("cleanup failed " +error.message);
            }
        );
    }
}

function Panic(message) {
    $(':mobile-pagecontainer').pagecontainer('change', $('#error'));
    $("#error .error-list").append(
        $('<div>').text(message).append('<br />').append($('<small>').text(calledFrom()))
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