function YoGolf(db, locale) {
    var __self__ = this;
    this.db = db
    this.locale = locale;

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
        if (place < 0 || this.history[place]['callback'] != callback || this.history[place]['params'] != params) {
            this.history.push({ 'callback': callback, 'params': params });
        }
    },
    goBack: function () {
        if (this.history.length > 1) {
            var current = this.history.pop();
            var moveTo = this.history.pop();
            var fn = moveTo['callback'];
            var params = moveTo['params'];
            fn.apply(null, params);
        }
    },
    reload: function () {
        if (this.history.length > 0) {
            var moveTo = this.history.pop();
            var fn = moveTo['callback'];
            var params = moveTo['params'];
            fn.apply(null, params);
        }
    },
    playerByEmail: function (email) {
        var user = null;
        $.each(this.players, function (k, player) {
            if (player.email == email) {
                user = player;
                return;
            }
        });
        return user;
    },
    watchHeading: function (backoff) {
        var __self__ = this;
        var backoff =  Math.min((backoff || 0.5) * 2, 64);
        navigator.compass.getCurrentHeading(
            function (heading) {
                __self__.heading = heading;
                if (__self__.position) {
                    View.refreshHeading(__self__.position, heading);
                }
                setTimeout(function () { __self__.watchHeading(); }, 250);
            }, function (error) {
                console.log(error);
                __self__.heading = null;
                setTimeout(function () { __self__.watchHeading(backoff); }, backoff * 250);
            }
        );
    },
    watchLocation: function (backoff) {
        var options = { enableHighAccuracy: true, timeout: 5000 };
        var backoff = Math.min((backoff || 0.5) * 2, 64);
        navigator.geolocation.getCurrentPosition(function (position) {
            this.position = position;
            View.refreshDistance(position);
            setTimeout(this.watchLocation, 250);
        }.bind(this), function (error) {
            console.log(error);
            this.position = null;
            setTimeout(this.watchLocation.bind(this, backoff), backoff * 250);
        }.bind(this), options);
    },
    dbCleanup: function () {
        this.db.sqlBatch([
                "DELETE FROM layout WHERE course NOT IN (SELECT rowid FROM course);",
                "DELETE FROM path WHERE layout NOT IN (SELECT rowid FROM layout);",
                "DELETE FROM tee WHERE rowid NOT IN (SELECT tee FROM path);",
                "DELETE FROM basket WHERE rowid NOT IN (SELECT basket FROM path);",
            ],
            function () {},
            function (error) { console.log("cleanup failed " + error.message); }
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