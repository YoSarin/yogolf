
function Course() {
    var __self__ = this;

    this.rowid = null;
    this.name = null;
    this.longtitude = null;
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
                        item.longtitude = resultSet.rows.item(k).longtitude;
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
        return this.paths.map(function (path) { return '<small>' + path.describe() + '</small>'; }).join('<br />');
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
        return '#' + this.number + ':  par ' + this.par + ' | ' + this.distance().toFixed(0) + ' meters';
    }
}


Path.LoadForLayout = function (tx, layout, callback) {
    tx.executeSql(
        "SELECT rowid, * FROM path WHERE layout = ?;",
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

function Tee(name, longtitude, latitude) {
    var __self__ = this;

    this.name = name
    this.longtitude = longtitude
    this.latitude = latitude
}

Tee.prototype = {
    describe : function () {
        return this.longtitude + ',' + this.latitude;
    },
    coord: function () {
        return new Coord(this.longtitude, this.latitude);
    }
}

Tee.Load = function (tx, row, callback) {
    tx.executeSql(
        "SELECT rowid, * FROM tee WHERE rowid = ?;",
        [row.tee],
        function (tx, resultSet) {
            for (var k = 0; k < resultSet.rows.length; k++) {
                callback(new Tee(resultSet.rows.item(k).name, resultSet.rows.item(k).longtitude, resultSet.rows.item(k).latitude), row);
            }
        },
        function (tx, error) {
            Panic(error.message);
        }
    );
}

function Basket(name, longtitude, latitude) {
    var __self__ = this;

    this.name = name
    this.longtitude = longtitude
    this.latitude = latitude
}

Basket.prototype = {
    describe: function () {
        return this.longtitude + ',' + this.latitude;
    },
    coord: function () {
        return new Coord(this.longtitude, this.latitude);
    }
}

Basket.Load = function (tx, row, callback) {
    tx.executeSql(
        "SELECT rowid, * FROM basket WHERE rowid = ?;",
        [row.basket],
        function (tx, resultSet) {
            for (var k = 0; k < resultSet.rows.length; k++) {
                callback(new Basket(resultSet.rows.item(k).name, resultSet.rows.item(k).longtitude, resultSet.rows.item(k).latitude), row);
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