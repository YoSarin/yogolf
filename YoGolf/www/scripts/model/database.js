function WithDatabase(callback) {
    var __self__ = this;
    this.db = null;
    this.version = null;

    window.sqlitePlugin.openDatabase(
        { name: 'yogolf.db', location: 'default' },
        function (db) {
            console.log("DB opened");
            __self__.init(db);
        },
        function () { Panic("DB open failed"); }
    );

    this.init = function (db) {
        __self__.db = db;
        console.log("DB init");
        db.transaction(function (tx) {
            tx.executeSql(
                "SELECT rowid, * FROM app_info ORDER BY version DESC LIMIT 1;",
                [],
                function (tx, resultSet) {
                    console.log("Tables are there");
                    for (var k = 0; k < resultSet.rows.length; k++) {
                        __self__.update(db, Model.WithDb(db).Fill(Version, resultSet.rows.item(k)), callback);
                    }
                },
                function (tx, error) {
                    __self__.create(db, function () {
                        __self__.init(db);
                    });
                    return false;
                })
            ;
        }, function (error) {
            Panic(error.message)
        });
    }

    this.create = function (db, callback) {
        console.log("creating tables");

        db.sqlBatch(
            [
                "CREATE TABLE IF NOT EXISTS player(name varchar(255), email varchar(255), state int default 0);",
                "CREATE TABLE IF NOT EXISTS course(gid int default null, name varchar(255), longitude float, latitude float, state int default 0);",
                "CREATE TABLE IF NOT EXISTS tee(gid int default null, name varchar, longitude float, latitude float, description text, state int default 0);",
                "CREATE TABLE IF NOT EXISTS basket(gid int default null, name varchar, longitude float, latitude float, description text, state int default 0);",
                "CREATE TABLE IF NOT EXISTS layout(gid int default null, name, course int, state int default 0);",
                "CREATE TABLE IF NOT EXISTS path(gid int default null, number int, layout int, basket int, tee int, par int, description text, state int default 0);",
                "CREATE TABLE IF NOT EXISTS app_info(version int, updated datetime DEFAULT CURRENT_TIMESTAMP);",

                "CREATE TABLE IF NOT EXISTS round (gid int default null, layout int, start datetime, end datetime DEFAULT CURRENT_TIMESTAMP, hole_number int, finished boolean default false)",
                "CREATE TABLE IF NOT EXISTS score (gid int default null, player int, throws int, round int, path int, ob_count int)",

                "INSERT INTO player (name, email) VALUES ('Martin', 'martin@yosarin.net')",
                "INSERT INTO player (name, email) VALUES ('Lída', 'lidalejsal@gmail.com')",
                "INSERT INTO player (name, email) VALUES ('Petr', 'pzaloha@volny.cz')",

                "INSERT INTO app_info (version) VALUES (1);",
                "INSERT INTO course (name, latitude, longitude) VALUES ('Nučice', 50.021287, 14.2269195);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('1', 50.0208542, 14.2297044);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('2', 50.0212964, 14.2290836);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('3', 50.0215669, 14.2286289);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('4', 50.0219761, 14.2281044);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('5', 50.0216289, 14.2282600);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('6', 50.0211758, 14.2287053);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('7', 50.0209611, 14.2283139);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('8', 50.0204881, 14.2281594);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('9', 50.0208061, 14.2288731);",
                "INSERT INTO basket (name, latitude, longitude) VALUES ('1', 50.0212439, 14.2294094);",
                "INSERT INTO basket (name, latitude, longitude) VALUES ('2', 50.0217331, 14.2286250);",
                "INSERT INTO basket (name, latitude, longitude) VALUES ('3', 50.0219408, 14.2283378);",
                "INSERT INTO basket (name, latitude, longitude) VALUES ('4', 50.0217203, 14.2279531);",
                "INSERT INTO basket (name, latitude, longitude) VALUES ('5', 50.0213722, 14.2283928);",
                "INSERT INTO basket (name, latitude, longitude) VALUES ('6', 50.0210328, 14.2281342);",
                "INSERT INTO basket (name, latitude, longitude) VALUES ('7', 50.0206483, 14.2281892);",
                "INSERT INTO basket (name, latitude, longitude) VALUES ('8', 50.0208853, 14.2287403);",
                "INSERT INTO basket (name, latitude, longitude) VALUES ('9', 50.0205708, 14.2296011);",
                "INSERT INTO layout (name, course) VALUES ('Standard', 1);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (1, 1, 1, 1, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (2, 1, 2, 2, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (3, 1, 3, 3, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (4, 1, 4, 4, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (5, 1, 5, 5, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (6, 1, 6, 6, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (7, 1, 7, 7, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (8, 1, 8, 8, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (9, 1, 9, 9, 3);",
                "INSERT INTO layout (name, course) VALUES ('Extended', 1);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (1, 2, 4, 1, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (2, 2, 2, 7, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (3, 2, 8, 4, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (4, 2, 5, 9, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (5, 2, 1, 5, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (6, 2, 6, 3, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (7, 2, 3, 6, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (8, 2, 7, 2, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (9, 2, 2, 8, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (10, 2, 9, 4, 3);",

                "INSERT INTO course (name, latitude, longitude) VALUES ('Lužiny', 50.0474017, 14.3336336);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('1', 50.0474017, 14.3336336);",
                "INSERT INTO basket (name, latitude, longitude) VALUES ('1', 50.0475989, 14.3343781);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('2', 50.0475686, 14.3346233);",
                "INSERT INTO basket (name, latitude, longitude) VALUES ('2', 50.0471081, 14.3345242);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('3', 50.0467108, 14.3344275);",
                "INSERT INTO basket (name, latitude, longitude) VALUES ('3', 50.0467903, 14.3356197);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('4', 50.0469433, 14.3360650);",
                "INSERT INTO basket (name, latitude, longitude) VALUES ('4', 50.0464964, 14.3356561);",
                "INSERT INTO layout (name, course) VALUES ('Standard', 2);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (1, 3, 10, 10, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (2, 3, 11, 11, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (3, 3, 12, 12, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (4, 3, 13, 13, 3);",

            ],
            function () { console.log("db created"); callback(); },
            function (error) { Panic(error.message); }
        );
    }

    this.update = function (db, version, callback) {
        this.version = version || new Version(1);
        var __self__ = this;

        Model.onSave(this.version, function (item) {
            __self__.update(db, item, callback);
        });

        console.log("Version: " + __self__.version.version + "; checking for updates;");

        switch (__self__.version.version) {
            case null:
            case 1:
                /*
                console.log("Updating way how tees and baskets");
                __self__.version.version = 2;
                Model.WithDb(db).Save(__self__.version);
                return;
                */
            default:
                console.log("No more updates!");
        }

        $(".dbVersion").html(__self__.version.version);

        callback(db);
    }
}

function WaitGroup(callback, params) {
    this.count = 0;
    this.callback = callback || function () { };
    this.params = params || Array();

    this.Add = function (count) {
        count = count || 1;
        this.count += count;
    }

    this.SetParam = function (position, value) {
        this.params[position] = value;
    }
    this.IncParam = function (position, value) {
        this.params[position] += value;
    }

    this.Done = function () {
        this.count--;
        if (this.count == 0) {
            this.callback.apply(null, this.params);
        }
    }
}

function Version(ver) {

    this.version = ver;
    this.rowid = null;

    this.tableName = function () {
        return "app_info";
    }

    this.getData = function () {
        return {"version" : this.version }
    }

}

function Model(db) {

    this.db = db;

    this.DB = function () {
        return this.db;
    }

    this.Delete = function (item, callback) {
        callback = callback || function () { };
        if (item.rowid) {
            this.DB().executeSql(
                "DELETE FROM " + item.tableName() + " WHERE rowid = ?",
                [item.rowid],
                function (resultSet) {
                    App.dbCleanup();
                    callback(true);
                },
                function (error) {
                    Panic(error.message);
                }
            );
        }
    }

    this.Save = function (item, callback) {
        callback = callback || function () { }

        var data = item.getData();

        var columns = Object.keys(data);

        var questionmarks = columns.map(function () { return '?'; });
        var values = columns.map(function (value) { return data[value] });
        var query = "INSERT INTO " + item.tableName() + " (" + columns.join(", ") + ") VALUES (" + questionmarks.join(", ") + ");";

        if (item.rowid == null) {
            this.DB().executeSql(
                query,
                values,
                function (resultSet) {
                    item.rowid = resultSet.insertId;
                    callback(item);
                    if (item.__callbacks && item.__callbacks.onSave) {
                        item.__callbacks.onSave(item);
                    }
                },
                function (error) {
                    Panic(error.message);
                }
            );
        } else {
            this.DB().executeSql(
                "UPDATE " + item.tableName() + " SET " + columns.map(function (key) { return key + " = ?"; }).join(", ") + " WHERE rowid = ?;",
                values.concat([item.rowid]),
                function (resultSet) {
                    console.log(resultSet);
                    callback(item);
                    if (item.__callbacks && item.__callbacks.onSave) {
                        item.__callbacks.onSave(item);
                    }
                },
                function (error) {
                    Panic(error.message);
                }
            );
        }
    }

    this.WithAll = function (model, callback, filter) {
        this.WithEach(model, null, filter, callback);
    }

    this.WithEach = function (model, callback, filter, finalCallback) {
        filter = filter || {};
        finalCallback = finalCallback || function (items) { };
        callback = callback || function (item) { };

        var tmp = new model();
        var __self__ = this;
        var params = Array();
        var query = 'SELECT rowid, * FROM ' + tmp.tableName();

        var items = Array();

        var wg = new WaitGroup(finalCallback, [items]);

        var whereClause = Object.keys(filter).map(function (column) { params.push(filter[column]); return column + ' = ?'; });
        if (whereClause.length > 0) {
            query += " WHERE " + whereClause.join(", ");
        }
        console.log(query, params);
        this.DB().executeSql(
            query,
            params,
            function (resultSetOrTx, maybeResultset) {
                var resultSet = maybeResultset || resultSetOrTx;
                if (resultSet.rows.length == 0) {
                    finalCallback([]);
                }
                wg.Add(resultSet.rows.length);
                for (var k = 0; k < resultSet.rows.length; k++) {
                    __self__.Fill(model, resultSet.rows.item(k), function (item) {
                        items.push(item);
                        callback(item);
                        wg.Done();
                    });
                }
            },
            function (errorOrTx, maybeError) {
                var error = maybeError || errorOrTx;
                Panic(error.message);
            }
        )
    }

    this.WithOne = function (model, rowid, callback) {
        var tmp = new model();
        var query = 'SELECT rowid, * FROM ' + tmp.tableName() + ' WHERE rowid = ?';
        var params = [rowid];
        console.log(query, params);
        this.DB().executeSql(
            query,
            params,
            function (resultSetOrTx, maybeResultset) {
                var resultSet = maybeResultset || resultSetOrTx;
                for (var k = 0; k < resultSet.rows.length; k++) {
                    this.Fill(model, resultSet.rows.item(k), callback);
                }
            }.bind(this),
            function (errorOrTx, maybeError) {
                var error = maybeError || errorOrTx;
                Panic(error.message);
            }
        )
    }

    this.Fill = function (model, row, callback) {
        callback = callback || function () { }
        var m = new model();
        $.each(row, function (col, val) {
            m[col] = val;
        });
        if (m.afterLoad) {
            // we rely, that afterLoad method accepts as a input parameter either DB or transaction !!! BEWARE of differencies between transaction and database in callbacks
            m.afterLoad(
                this.DB(),
                callback
            );
        } else {
            callback(m);
        }
    }

};

Model.cache = {};

Model.WithDb = function (db) {
    return new Model(db);
}

Model.onSave = function (item, callback) {
    if (!item.__callbacks) {
        item.__callbacks = {};
    }
    item.__callbacks["onSave"] = callback;
}

Model.Delete = function (item, callback) {
    Model.WithDb(App.db).Delete(item, callback);
}

Model.Save = function (item, callback) {
    Model.WithDb(App.db).Save(item, callback);
}

Model.WithAll = function (model, callback, filter) {
    Model.WithDb(App.db).WithAll(model, callback, filter);
}

Model.WithEach = function (model, callback, filter) {
    Model.WithDb(App.db).WithEach(model, callback, filter);
}

Model.WithOne = function (model, rowid, callback) {
    var m = Model.WithDb(App.db);
    m.WithOne(model, rowid, callback);
}

Model.Fill = function (model, row, callback) {
    return Model.WithDb(App.db).Fill(model, row, callback);
}