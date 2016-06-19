function Round(layout) {
    this.layout = layout;
    this.hole_number = 1;
    this.rowid = null;
    this.start = new Date();

    this.scores = Array();
}

Round.prototype = {
    Save: function (callback) {
        enrichedCallback = function (round) {
            $.each(this.scores, function (k, score) {
                score.Save();
            });
            callback(round);
        }
        Model.Save(this, enrichedCallback);
    },
    moveToNext: function () {
        this.hole_number += 1;
    },
    moveToPrev: function () {
        this.hole_number = Math.max(1, this.hole_number - 1);
    },
    addScore: function (score) {
        this.scores.push(score);
    },
    tableName: function() {
        return "round";
    },
    getData: function () {
        return {
            "start": this.start,
            "layout": this.layout.rowid,
            "hole_number": this.hole_number,
        }
    }
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