
function Course(name, longtitude, latitude) {
    var __self__ = this;

    this.rowid = null;
    this.name = null;
    this.longtitude = null;
    this.latitude = null;
    this.layouts = null;
}

Course.prototype = {

    load: function (tx) {
        Layout.LoadForCourse(tx, this, function (layouts) { this.layouts = layouts; } );
    },

    save: function () {
        var __self__ = this;
        if (this.rowid == null) {
            App.db.executeSql(
                "INSERT INTO course (name, longtitude, latitude) VALUES (?, ?, ?);",
                [this.name, this.longtitude, this.latitude],
                function (resultSet) { __self__.rowid = resultSet.insertId; },
                function (error) { Panic(error.message); }
            );
        } else {
            App.db.executeSql(
                "UPDATE course SET name = ?, longtitude = ?, latitude = ? WHERE rowid = ?;",
                [this.name, this.longtitude, this.latitude, this.rowid],
                function (resultSet) { console.log(resultSet); },
                function (error) { Panic(error.message); }
            );
        }
    }
}

Course.New = function (name, longtitude, latitude) {
    var item = new Course();

    item.name = name;
    item.longtitude = longtitude;
    item.latitude = latitude;

    return item;
}

Course.WithAll = function (db, callback) {
    var courses = Array();

    db.readTransaction(
        function (tx) {
            tx.executeSql(
                "SELECT rowid, * FROM course;",
                [],
                function (tx, resultSet) {
                    for (var k = 0; k < resultSet.rows.length; k++) {
                        var item = new Course();
                        item.rowid = resultSet.rows.item(k).rowid;
                        item.name = resultSet.rows.item(k).name;
                        item.longtitude = resultSet.rows.item(k).longtitude;
                        item.latitude = resultSet.rows.item(k).latitude;
                        // item.load(tx);
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

function Tee(name, course, longtitude, latitude) {
    var __self__ = this;

    this.name = name
    this.course = course
    this.longtitude = longtitude
    this.latitude = latitude
}

function Basket(name, course, longtitude, latitude) {
    var __self__ = this;

    this.name       = name
    this.course     = course
    this.longtitude = longtitude
    this.latitude   = latitude

}

function Layout(name, course) {
    var __self__ = this;
    this.name = name;
    this.course = course;
}

Layout.LoadForCourse = function (tx, course, callback) {

    tx.executeSql(
        "SELECT rowid, * FROM layout WHERE course = ?;"
        [course.rowid],
        function (tx, resultset) {
            var layouts = Array();

            for (var k = 0; k < resultSet.rows.length; k++) {
                var item = new Layout();
                item.name = resultSet.rows.item(k).name;
                item.course = course;
                layouts.push(item);
            }

            callback(layouts);
        },
        function (tx, error) {
            Panic(error.message);
        }
    );
}

function Path(number, layout, basket, tee, par) {
    var __self__ = this;

    this.name = name;
    this.layout = layout;
    this.basket = basket;
    this.tee = tee;
    this.par = par;

    this.distance = function () {
        // see http://www.movable-type.co.uk/scripts/latlong.html
        var R = 6371e3; // metres
        var φ1 = __self__.tee.latitude.toRadians();
        var φ2 = __self__.basket.latitude.toRadians();
        var Δφ = (__self__.basket.latitude - __self__.tee.latitude).toRadians();
        var Δλ = (__self__.basket.longtitude - __self__.tee.longtitude).toRadians();

        var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return d;
    }
}