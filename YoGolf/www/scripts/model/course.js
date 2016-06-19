var BUTTON_OK = 1;


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

    Save: function (callback) {
        var __self__ = this;
        callback = callback || function () { }
        if (this.rowid == null) {
            App.db.executeSql(
                "INSERT INTO course (name, longitude, latitude) VALUES (?, ?, ?);",
                [this.name, this.longitude, this.latitude],
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
                "UPDATE course SET name = ?, longitude = ?, latitude = ? WHERE rowid = ?;",
                [this.name, this.longitude, this.latitude, this.rowid],
                function (resultSet) {
                    console.log(resultSet);
                    callback(__self__);
                },
                function (error) {
                    Panic(error.message);
                }
            );
        }
    },

    Delete: function (callback) {
        callback = callback || function () { };
        if (this.rowid) {
            App.db.executeSql(
                "DELETE FROM course WHERE rowid = ?",
                [this.rowid],
                function (resultSet) {
                    App.dbCleanup();
                    callback(true);
                },
                function (error) {
                    Panic(error.message);
                }
            );
        }
    },

    DeleteWithConfirm: function (buttonPressed) {
        console.log(this);
        if (buttonPressed == BUTTON_OK) {
            this.Delete(function () { View.Courses(App.db); });
        }
    },

    coord: function () {
        return new Coord(this.latitude, this.longitude);
    }
}

Course.New = function (name, latitude, longitude) {
    var item = new Course();

    item.name = name;
    item.longitude = longitude;
    item.latitude = latitude;
    item.layouts = Array();

    return item;
}

Course.NewFromPrompt = function (prompt) {
    if (prompt.buttonIndex == BUTTON_OK && prompt.input1) {
        var c = null;
        if (App.position) {
            c = Course.New(prompt.input1, App.position.coords.latitude, App.position.coords.longitude);
        } else {
            c = Course.New(prompt.input1, null, null);
        }
        c.Save(function (course) {
            if (course) {
                var l = Layout.New("Standard", course);
                l.Save(function (layout) {
                    View.Courses(App.db);
                });
            } else {
                Panic("Course save failed");
            }
        });
    }
}

Course.WithAll = function (callback) {
    var courses = Array();

    App.db.readTransaction(
        function (tx) {
            tx.executeSql(
                "SELECT rowid, * FROM course ORDER BY name ASC;",
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
    Save: function (callback) {
        var __self__ = this;
        callback = callback || function () { }
        if (this.rowid == null) {
            App.db.executeSql(
                "INSERT INTO layout (name, course) VALUES (?, ?);",
                [this.name, this.course.rowid],
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
                "UPDATE layout SET name = ?, course = ? WHERE rowid = ?;",
                [this.name, this.course.rowid, this.rowid],
                function (resultSet) {
                    console.log(resultSet);
                    callback(__self__);
                },
                function (error) {
                    Panic(error.message);
                }
            );
        }
    },

    Delete: function (callback) {
        callback = callback || function () { };
        if (this.rowid) {
            App.db.executeSql(
                "DELETE FROM layout WHERE rowid = ?",
                [this.rowid],
                function (resultSet) {
                    App.dbCleanup();
                    callback(true);
                },
                function (error) {
                    Panic(error.message);
                }
            );
        }
    },

    DeleteWithConfirm: function (buttonPressed) {
        console.log(this);
        if (buttonPressed == BUTTON_OK) {
            this.Delete(function () { View.Courses(App.db); });
        }
    },
    getPathByNumber: function (number) {
        return this.paths[number - 1];
    },
    describePaths: function () {
        return this.paths.map(function (path) { return '<div class="description" coords="' + path.tee.coord().toString() + '">' + path.describe() + '</div>'; }).join("\n");
    },
    describe: function () {
        return this.name + ': ' + this.paths.length + ' holes | par ' + this.par() + ' | ' + this.length().toFixed(0) + ' meters';
    },
    par: function () {
        var par = 0;
        console.log(this);
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


Layout.New = function (name, course) {
    var l = new Layout(name, course);
    return l;
}

Layout.LoadForCourse = function (tx, course, callback) {

    tx.executeSql(
        "SELECT rowid, * FROM layout WHERE course = ? ORDER BY name ASC;",
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
    this.description = "";
}

Path.prototype = {
    Save: function (callback) {
        Model.Save(this, callback);
    },
    tableName: function() {
        return "path";
    },
    getData: function () {
        return {
            "number": this.number,
            "layout": this.layout.rowid,
            "basket": this.basket.rowid || null,
            "tee": this.tee.rowid || null,
            "par": this.par,
            "description": this.description,
        }
    },
    distance: function () {
        return this.tee.coord().distanceTo(this.basket.coord())
    },
    describe: function () {
        return '[' + this.number + '] ' + this.tee.name + ' ➟ ' + this.basket.name + ':  par ' + this.par + ' | ' + this.distance().toFixed(0) + ' meters | <span class="showCompass showDistance" coords="' + this.tee.coord().toString() + '"></span>';
    }
}

Path.NewFromPrompt = function (prompt, number, layout, callback) {
    if (prompt.buttonIndex == BUTTON_OK && prompt.input1) {
        tee = new Tee(number, null, null);
        tee.Save(function (tee) {
            basket = new Basket(number, null, null);
            basket.Save(function (basket) {
                p = new Path(number, layout, tee, basket, parseInt(prompt.input1));
                p.Save(function (path) { layout.paths.push(path); callback(path); });
            });
        });
    }
    return null;
}

Path.LoadForLayout = function (tx, layout, callback) {
    tx.executeSql(
        "SELECT rowid, * FROM path WHERE layout = ? ORDER BY number ASC;",
        [layout.rowid],
        function (tx, resultSet) {
            var paths = Array();

            for (var k = 0; k < resultSet.rows.length; k++) {
                (function(row) {
                    Basket.Load(tx, row.basket, function (basket) {
                        Tee.Load(tx, row.tee, function (tee) {
                            var item = new Path(row.number, layout, basket, tee, row.par);
                            item.rowid = row.rowid;
                            callback(item);
                        })
                    });
                }) (resultSet.rows.item(k));
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
    Save: function (callback) {
        Model.Save(this, callback);
    },
    tableName: function () {
        return "tee";
    },
    getData: function () {
        return {
            "name": this.name,
            "latitude": this.latitude,
            "longitude": this.longitude,
        }
    },
    describe : function () {
        return this.latitude + ',' + this.longitude;
    },
    coord: function () {
        return new Coord(this.latitude, this.longitude);
    }
}

Tee.NewFromPrompt = function (prompt, callback) {
    if (prompt.buttonIndex == BUTTON_OK && prompt.input1) {
        var lat = null;
        var long = null;
        if (App.position) {
            lat = App.position.coords.latitude;
            long = App.position.coords.longitude;
        }
        t = new Tee(prompt.input1, lat, long);
        t.Save(callback);
    }
    return null;
}

Tee.Load = function (tx, rowid, callback) {
    tx.executeSql(
        "SELECT rowid, * FROM tee WHERE rowid = ?;",
        [rowid],
        function (tx, resultSet) {
            for (var k = 0; k < resultSet.rows.length; k++) {
                var t = new Tee(resultSet.rows.item(k).name, resultSet.rows.item(k).latitude, resultSet.rows.item(k).longitude);
                t.rowid = resultSet.rows.item(k).rowid;
                callback(t);
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
    Save: function (callback) {
        Model.Save(this, callback);
    },
    tableName: function () {
        return "basket";
    },
    getData: function () {
        return {
            "name": this.name,
            "latitude": this.latitude,
            "longitude": this.longitude,
        }
    },
    describe: function () {
        return this.latitude + ',' + this.longitude;
    },
    coord: function () {
        return new Coord(this.latitude, this.longitude);
    }
}

Basket.Load = function (tx, rowid, callback) {
    tx.executeSql(
        "SELECT rowid, * FROM basket WHERE rowid = ?;",
        [rowid],
        function (tx, resultSet) {
            for (var k = 0; k < resultSet.rows.length; k++) {
                var b = new Basket(resultSet.rows.item(k).name, resultSet.rows.item(k).latitude, resultSet.rows.item(k).longitude)
                b.rowid = resultSet.rows.item(k).rowid;
                callback(b);
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