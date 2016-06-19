function Round(layout) {
    this.layout = layout;
    this.hole_number = 1;
    this.rowid = null;
    this.start = new Date();
    this.finished = false;

    this.scores = {};
}

Round.prototype = {
    Save: function (callback) {
        enrichedCallback = function (round) {
            $.each(this.scores, function (email, pathList) {
                $.each(pathList, function (pathid, score) {
                    score.Save();
                });
            });
            callback(round);
        }
        Model.Save(this, enrichedCallback);
    },
    moveToNext: function () {
        this.hole_number += 1;
        this.Save();
    },
    moveToPrev: function () {
        this.hole_number = Math.max(1, this.hole_number - 1);
        this.Save();
    },
    addScore: function (player, throws) {
        var path = this.layout.getPathByNumber(this.hole_number);
        if (path) {
            if (!this.scores[player.email]) {
                this.scores[player.email] = {};
                for (var i = 1; i < this.hole_number; i++) {
                    var p = this.layout.getPathByNumber(i);
                    if (p) {
                        this.scores[player.email][p.rowid] = new Score(this, player, path, path.par);
                    }
                }
            }
            if (!this.scores[player.email][path.rowid]) {
                this.scores[player.email][path.rowid] = new Score(this, player, path, throws);
            } else {
                this.scores[player.email][path.rowid].throws = throws;
            }
        }
    },
    addPlayer: function (player) {
        if (this.scores[player.email]) {
            return;
        }
        this.scores[player.email] = {};
        var round = this;
        $.each(this.layout.paths, function (k, path) {
            round.scores[player.email][path.rowid] = new Score(round, player, path, path.par);
        });
    },
    players: function () {
        var emails = Object.keys(this.scores);
        return emails.map(function (email) { return App.playerByEmail(email); });
    },
    tableName: function() {
        return "round";
    },
    getData: function () {
        return {
            "start": this.start,
            "layout": this.layout.rowid,
            "hole_number": this.hole_number,
            "finished": this.finished,
        }
    },
    playerScoreList: function (player) {
        var scores = new Array();
        if (!this.scores[player.email]) {
            return scores;
        }
        $.each(this.scores[player.email], function (key, score) {
            scores.push(score);
        });
        return scores;
    },
    playerScore: function (player) {
        if (this.playerScoreList(player).length < 1) {
            return 0;
        }
        return this.playerScoreList(player).map(function (score) { return score.throws; }).reduce(function (a, b) { return a + b; });
    },
    relativePlayerScore: function (player) {
        if (this.playerScoreList(player).length < 1) {
            return 0;
        }
        return this.playerScoreList(player).map(function (score) { return score.throws - score.path.par; }).reduce(function (a, b) { return a + b; });
    }
}

Round.WithAll = function (callback) {

    // not ready yet!
    var courses = Array();

    App.db.readTransaction(
        function (tx) {
            tx.executeSql(
                "SELECT rowid, * FROM round ORDER BY rowid DESC;",
                [],
                function (tx, resultSet) {
                    for (var k = 0; k < resultSet.rows.length; k++) {
                        var item = new Round();
                        item.rowid = resultSet.rows.item(k).rowid;
                        item.hole_number = resultSet.rows.item(k).hole_number;
                        item.start = resultSet.rows.item(k).start;
                        item.end = resultSet.rows.item(k).end;
                        // item.layout = Layout.
                        item.Load(tx);
                        courses.push(item);
                    }
                },
                function (tx, error) {
                    Panic(error.message);
                }
            );
        }, function (error) {
            Panic(error.message);
        }, function () {
            callback(courses);
        }
    );
}

function Score(round, player, path, throws) {
    this.round = round;
    this.player = player;
    this.throws = throws || path.par;
    this.path = path;
}

Score.prototype = {
    Save: function (callback) {
        Model.Save(this, callback);
    },
    getData: function () {
        return {
            "round": this.round.rowid,
            "player": this.player.rowid,
            "path": this.path.rowid,
            "throws": this.throws,
        }
    },
    tableName: function() {
        return "score";
    }
}