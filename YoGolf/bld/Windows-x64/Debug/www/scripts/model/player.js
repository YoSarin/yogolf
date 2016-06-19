Player.STATES = {
    1: "myself",
    2: "friend",
    4: "blocked",
}

function Player(name, email) {
    var __self__ = this;
    this.name = name;
    this.email = email;
}

Player.LoadAll = function (callback) {
    App.db.executeSql(
        "SELECT rowid, * FROM player ORDER BY name DESC;",
        [],
        function (resultSet) {
            for (var k = 0; k < resultSet.rows.length; k++) {
                var item = new Player(resultSet.rows.item(k).name, resultSet.rows.item(k).email);
                item.rowid = resultSet.rows.item(k).rowid;
                callback(item);
            }
        },
        function (error) {
            Panic(error.message);
        }
    );
}

Player.prototype = {
    Save: function (callback) {
        var __self__ = this;
        callback = callback || function () { }
        if (this.rowid == null) {
            App.db.executeSql(
                "INSERT INTO player (name, email) VALUES (?, ?);",
                [this.name, this.email],
                function (resultSet) {
                    __self__.rowid = resultSet.insertId;
                    callback(__self__);
                },
                function (error) {
                    Panic(error.message);
                }
            );
        } else {
            App.db.executeSql(
                "UPDATE player SET name = ?, email = ? WHERE rowid = ?;",
                [this.name, this.email, this.rowid],
                function (resultSet) {
                    console.log(resultSet);
                    callback(__self__);
                },
                function (error) {
                    Panic(error.message);
                }
            );
        }
    }
}