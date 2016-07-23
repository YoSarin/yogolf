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
        this.end = new Date();
        this.Save();
    },
    moveToPrev: function () {
        this.hole_number = Math.max(1, this.hole_number - 1);
        this.Save();
    },
    addScore: function (score) {
        var __self__ = this;
        var wg = new WaitGroup(function (player, path, layout) {
            if (!__self__.scores[player.email]) {
                __self__.scores[player.email] = {};
                for (var i = 1; i < __self__.hole_number; i++) {
                    var p = layout.getPathByNumber(i);
                    if (p) {
                        this.scores[player.email][p.rowid] = new Score(this, player, path, path.par);
                    }
                }
            }
            if (!this.scores[player.email][path.rowid]) {
                this.scores[player.email][path.rowid] = score;
            } else {
                this.scores[player.email][path.rowid].throws = score.throws;
            }
        }, [null, null, null]);
        
        wg.Add(3);

        var wgPath = new WaitGroup(function (path) {
            Path.WithLayout(function (layout) {
                wg.SetParam(0, layout);
                wg.Done();
            });
        }, [null]);

        wgPath.Add(1);

        score.WithPlayer(function (player) {
            wg.SetParam(0, player);
            wg.Done();
        });

        score.withPath(function (path) {
            wg.SetParam(1, path);
            wg.Done();
            wgPath.SetParam(0, path);
            wgPath.Done();
        });
    },
    addThrows: function (player, throws, ob_count) {
        var path = this.layout.getPathByNumber(this.hole_number);
        var score = new Score(this.rowid, player, path, path.par);
        score.ob_count = ob_count;
        if (path) {
            this.addScore(score);
        }
    },
    addPlayer: function (player) {
        if (this.scores[player.email]) {
            return;
        }
        this.scores[player.email] = {};
        var round = this;
        $.each(this.layout.paths, function (k, path) {
            round.scores[player.email][path.rowid] = new Score(round.rowid, player, path, path.par);
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
            "layout": this.layout,
            "hole_number": this.hole_number,
            "finished": this.finished,
        }
    },
    WithLayout: function (callback) {
        Model.WithOne(Layout, this.layout, callback);
    },
    WithScore: function (callback) {
        var __self__ = this;
        Model.WithEach(Score, function (score) {
            var wg = new WaitGroup(function (player, path) {
                Panic("Not implemented!");
            }, [null, null]);
            wg.Add(2);
            score.WithPlayer(function (player) {
                wg.SetParam(0, player);
                wg.Done();
            });
            score.WithPath(function (path) {
                wg.SetParam(1, path);
                wg.Done();
            });
            __self__.scores
        },
        { round: this.rowid }, function (scores) {
        });
    },

    WithEachPlayer: function (callback) {
        var playerIds = Array();
        Model.WithEach(Score, function (score) {
            score.WithPlayer(function (player) {
                if (playerIds.indexOf(player.rowid) < 0) {
                    playerIds.push(player.rowid);
                    callback(player);
                }
            });
        });
    },

    WithPlayers: function (callback) {
        var playerIds = Array();
        var players = Array();
        Model.WithEach(Score, function (score) {
            score.WithPlayer(function (player) {
                if (playerIds.indexOf(player.rowid) < 0) {
                    playerIds.push(player.rowid);
                    players.push(player);
                }
            });
        }, { round: this.rowid }, function (scores) {
            callback(players);
        });
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

Round.WithEach = function (callback) {
    Model.WithEach(Round, function (round) {
        callback(round);
    });
}

function Score(round, player, path, throws) {
    this.round = round;
    this.player = player;
    this.throws = throws || (path ? path.par : null);
    this.path = path;
    this.ob_count = 0;
}

Score.prototype = {
    Save: function (callback) {
        Model.Save(this, callback);
    },
    getData: function () {
        return {
            "round": this.round,
            "player": this.player,
            "path": this.path,
            "throws": this.throws,
            "ob_count": this.ob_count,
        }
    },
    tableName: function() {
        return "score";
    },
    WithPlayer: function (callback) {
        Model.WithOne(Player, this.player, callback);
    },
    WithPath: function (callback) {
        Model.WithOne(Path, this.path, callback);
    },
    WithRound: function (callback) {
        Model.WithOne(Round, this.round, callback);
    }
}