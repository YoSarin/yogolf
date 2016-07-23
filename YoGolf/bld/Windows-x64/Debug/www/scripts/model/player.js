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
    tableName: function () {
        return 'player';
    },
    getData: function () {
        return {
            "name": this.name,
            "email": this.email,
        }
    },
    Save: function (callback) {
        Model.Save(this, callback);
    }
}