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
                "CREATE TABLE IF NOT EXISTS course(name varchar(255), longtitude float, latitude float);",
                "CREATE TABLE IF NOT EXISTS tee(name varchar, course int, longtitude float, latitude float, description text);",
                "CREATE TABLE IF NOT EXISTS basket(name varchar, course int, longtitude float, latitude float, description text);",
                "CREATE TABLE IF NOT EXISTS layout(name, course int);",
                "CREATE TABLE IF NOT EXISTS path(number int, layout int, basket int, tee int, par int, description text);",
                "CREATE TABLE IF NOT EXISTS app_info(version int, updated datetime DEFAULT CURRENT_TIMESTAMP);",
                "INSERT INTO app_info (version) VALUES (1);",
                "INSERT INTO course (name, longtitude, latitude) VALUES ('Nučice', 50.021287, 14.2269195);",
                "INSERT INTO tee (name, course, longtitude, latitude) VALUES ('1', 0, 50.0208714, 14.2297951);",
                "INSERT INTO tee (name, course, longtitude, latitude) VALUES ('2', 0, 50.021305, 14.2285361);",
                "INSERT INTO tee (name, course, longtitude, latitude) VALUES ('3', 0, 50.021573, 14.2280701);",
                "INSERT INTO tee (name, course, longtitude, latitude) VALUES ('4', 0, 50.021976, 14.2275401);",
                "INSERT INTO tee (name, course, longtitude, latitude) VALUES ('5', 0, 50.021622, 14.2276971);",
                "INSERT INTO tee (name, course, longtitude, latitude) VALUES ('6', 0, 50.021191, 14.2281351);",
                "INSERT INTO tee (name, course, longtitude, latitude) VALUES ('7', 0, 50.020958, 14.2277621);",
                "INSERT INTO tee (name, course, longtitude, latitude) VALUES ('8', 0, 50.020516, 14.2275991);",
                "INSERT INTO tee (name, course, longtitude, latitude) VALUES ('9', 0, 50.020821, 14.2283121);",
                "INSERT INTO basket (name, course, longtitude, latitude) VALUES ('1', 0, 50.02125, 14.2288504);",
                "INSERT INTO basket (name, course, longtitude, latitude) VALUES ('2', 0, 50.021709, 14.2280881);",
                "INSERT INTO basket (name, course, longtitude, latitude) VALUES ('3', 0, 50.021944, 14.2277761);",
                "INSERT INTO basket (name, course, longtitude, latitude) VALUES ('4', 0, 50.021724, 14.2273891);",
                "INSERT INTO basket (name, course, longtitude, latitude) VALUES ('5', 0, 50.021376, 14.2278321);",
                "INSERT INTO basket (name, course, longtitude, latitude) VALUES ('6', 0, 50.021037, 14.2276171);",
                "INSERT INTO basket (name, course, longtitude, latitude) VALUES ('7', 0, 50.020645, 14.2276291);",
                "INSERT INTO basket (name, course, longtitude, latitude) VALUES ('8', 0, 50.020888, 14.2281731);",
                "INSERT INTO basket (name, course, longtitude, latitude) VALUES ('9', 0, 50.020577, 14.2290472);",
                "INSERT INTO layout (name, course) VALUES ('Standard', 0);",
                "INSERT INTO path (number, layout, basket, tee, par) VALUES (1, 0, 1, 1, 3);",
                "INSERT INTO path (number, layout, basket, tee, par) VALUES (2, 0, 2, 2, 3);",
                "INSERT INTO path (number, layout, basket, tee, par) VALUES (3, 0, 3, 3, 3);",
                "INSERT INTO path (number, layout, basket, tee, par) VALUES (4, 0, 4, 4, 3);",
                "INSERT INTO path (number, layout, basket, tee, par) VALUES (5, 0, 5, 5, 3);",
                "INSERT INTO path (number, layout, basket, tee, par) VALUES (6, 0, 6, 6, 3);",
                "INSERT INTO path (number, layout, basket, tee, par) VALUES (7, 0, 7, 7, 3);",
                "INSERT INTO path (number, layout, basket, tee, par) VALUES (8, 0, 8, 8, 3);",
                "INSERT INTO path (number, layout, basket, tee, par) VALUES (9, 0, 9, 9, 3);",
            ],
            function () { console.log("db created"); },
            function (error) { Panic(error.message); }
        );
    }
}