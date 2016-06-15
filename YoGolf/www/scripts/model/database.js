function WithDatabase(callback) {
    var __self__ = this;

    window.sqlitePlugin.openDatabase(
        { name: 'yogolf.db', location: 'default' },
        function (db) { console.log("DB opened"); __self__.init(db); },
        function () { Panic("DB open failed"); }
    );

    this.init = function (db) {
        __self__.db = db
        console.log("DB init");
        db.transaction(function (tx) {
            tx.executeSql(
                "SELECT * FROM app_info ORDER BY version DESC LIMIT 1;",
                [],
                function (tx, resultSet) {
                    console.log("Tables are there");
                    callback(db);
                },
                function (tx, error) {
                    __self__.create(db);
                    callback(db);
                    return false;
                })
            ;
        }, function (error) {
            Panic(error.message)
        });
    }

    this.create = function (db) {
        console.log("creating tables");

        db.sqlBatch(
            [
                "CREATE TABLE IF NOT EXISTS player(name varchar(255), email varchar(255));",
                "CREATE TABLE IF NOT EXISTS course(name varchar(255), longitude float, latitude float);",
                "CREATE TABLE IF NOT EXISTS tee(name varchar, longitude float, latitude float, description text);",
                "CREATE TABLE IF NOT EXISTS basket(name varchar, longitude float, latitude float, description text);",
                "CREATE TABLE IF NOT EXISTS layout(name, course int);",
                "CREATE TABLE IF NOT EXISTS path(number int, layout int, basket int, tee int, par int, description text);",
                "CREATE TABLE IF NOT EXISTS app_info(version int, updated datetime DEFAULT CURRENT_TIMESTAMP);",
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

                "INSERT INTO course (name, latitude, longitude) VALUES ('Eden', 50.0669067, 14.4734086);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('Tee 1', 50.0669533, 14.4735361);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('Tee 2', 50.0663886, 14.4733725);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('Tee 3', 50.0666658, 14.4737439);",
                "INSERT INTO tee (name, latitude, longitude) VALUES ('Tee 4', 50.0669067, 14.4750969);",
                "INSERT INTO basket (name, latitude, longitude) VALUES ('Basket 1', 50.0669533, 14.4735361);",
                "INSERT INTO layout (name, course) VALUES ('Rectangle', 2);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (1, 3, 10, 10, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (2, 3, 11, 10, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (3, 3, 12, 10, 3);",
                "INSERT INTO path (number, layout, tee, basket, par) VALUES (4, 3, 13, 10, 3);",

            ],
            function () { console.log("db created"); },
            function (error) { Panic(error.message); }
        );
    }
}