
function Course() {
    var __self__ = this;

    this.rowid = null;
    this.name = null;
    this.longitude = null;
    this.latitude = null;
    this.layouts = Array();
}

Course.prototype = {

    Load: function (tx) {
        var __self__ = this;
        Layout.LoadForCourse(tx, this, function (layout) { __self__.layouts.push(layout); } );
    },

    Save: function () {
        var __self__ = this;
        if (this.rowid == null) {
            App.db.executeSql(
                "INSERT INTO course (name, longitude, latitude) VALUES (?, ?, ?);",
                [this.name, this.longitude, this.latitude],
                function (resultSet) { __self__.rowid = resultSet.insertId; },
                function (error) { Panic(error.message); }
            );
        } else {
            App.db.executeSql(
                "UPDATE course SET name = ?, longitude = ?, latitude = ? WHERE rowid = ?;",
                [this.name, this.longitude, this.latitude, this.rowid],
                function (resultSet) { console.log(resultSet); },
                function (error) { Panic(error.message); }
            );
        }
    },

    coord: function () {
        return new Coord(this.latitude, this.longitude);
    }
}

Course.New = function (name, longitude, latitude) {
    var item = new Course();

    item.name = name;
    item.longitude = longitude;
    item.latitude = latitude;
    item.layouts = Array();

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
                        item.longitude = resultSet.rows.item(k).longitude;
                        item.latitude = resultSet.rows.item(k).latitude;
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

function Layout(name, course) {
    var __self__ = this;
    this.name = name;
    this.course = course;
    this.paths = Array();
}

Layout.prototype = {
    Load: function (tx) {
        var __self__ = this;
        Path.LoadForLayout(tx, this, function (path) { __self__.paths.push(path); });
    },
    describePaths: function () {
        return this.paths.map(function (path) { return '<div class="description" coords="' + path.tee.coord().toString() + '">' + path.describe() + '</div>'; }).join("\n");
    },
    describe: function () {
        return this.name + ': ' + this.paths.length + ' holes | par ' + this.par() + ' | ' + this.length().toFixed(0) + ' meters';
    },
    par: function () {
        var par = 0;
        $.each(this.paths, function (k, v) {
            par += v.par;
        });
        return par;
    },
    length: function () {
        var len = 0;
        $.each(this.paths, function (k, v) {
            len += v.distance();
        });
        return len;
    }
}

Layout.LoadForCourse = function (tx, course, callback) {

    tx.executeSql(
        "SELECT rowid, * FROM layout WHERE course = ?;",
        [course.rowid],
        function (tx, resultSet) {
            for (var k = 0; k < resultSet.rows.length; k++) {
                var item = new Layout(resultSet.rows.item(k).name, course);
                item.rowid = resultSet.rows.item(k).rowid;
                item.Load(tx);
                callback(item);
            }
        },
        function (tx, error) {
            Panic(error.message);
        }
    );
}

function Path(number, layout, basket, tee, par) {
    var __self__ = this;

    this.rowid = null;
    this.number = number;
    this.layout = layout;
    this.basket = basket;
    this.tee = tee;
    this.par = par;
}

Path.prototype = {
    distance: function () {
        return this.tee.coord().distanceTo(this.basket.coord())
    },
    describe: function () {
        return '[' + this.number + '] ' + this.tee.name + ' ➟ ' + this.basket.name + ':  par ' + this.par + ' | ' + this.distance().toFixed(0) + ' meters | <span class="showCompass showDistance" coords="' + this.tee.coord().toString() + '"><span class="distance"></span></span>';
    }
}


Path.LoadForLayout = function (tx, layout, callback) {
    tx.executeSql(
        "SELECT rowid, * FROM path WHERE layout = ? ORDER BY number ASC;",
        [layout.rowid],
        function (tx, resultSet) {
            var paths = Array();

            for (var k = 0; k < resultSet.rows.length; k++) {
                var row = resultSet.rows.item(k);
                Basket.Load(tx, row, function (basket, row) {
                    Tee.Load(tx, row, function (tee, row) {
                        var item = new Path(row.number, layout, basket, tee, row.par);
                        callback(item);
                    })
                });
            }
        },
        function (tx, error) {
            Panic(error.message);
        }
    );
}

function Tee(name, latitude, longitude) {
    var __self__ = this;

    this.name = name
    this.longitude = longitude
    this.latitude = latitude
}

Tee.prototype = {
    describe : function () {
        return this.latitude + ',' + this.longitude;
    },
    coord: function () {
        return new Coord(this.latitude, this.longitude);
    }
}

Tee.Load = function (tx, row, callback) {
    tx.executeSql(
        "SELECT rowid, * FROM tee WHERE rowid = ?;",
        [row.tee],
        function (tx, resultSet) {
            for (var k = 0; k < resultSet.rows.length; k++) {
                callback(new Tee(resultSet.rows.item(k).name, resultSet.rows.item(k).latitude, resultSet.rows.item(k).longitude), row);
            }
        },
        function (tx, error) {
            Panic(error.message);
        }
    );
}

function Basket(name, latitude, longitude) {
    var __self__ = this;

    this.name = name
    this.longitude = longitude
    this.latitude = latitude
}

Basket.prototype = {
    describe: function () {
        return this.latitude + ',' + this.longitude;
    },
    coord: function () {
        return new Coord(this.latitude, this.longitude);
    }
}

Basket.Load = function (tx, row, callback) {
    tx.executeSql(
        "SELECT rowid, * FROM basket WHERE rowid = ?;",
        [row.basket],
        function (tx, resultSet) {
            for (var k = 0; k < resultSet.rows.length; k++) {
                callback(new Basket(resultSet.rows.item(k).name, resultSet.rows.item(k).latitude, resultSet.rows.item(k).longitude), row);
            }
        },
        function (tx, error) {
            Panic(error.message);
        }
    );
}


/** Converts numeric degrees to radians */
if (typeof (Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }
}