var BUTTON_OK = 1;


function Course() {
    var __self__ = this;

    this.rowid = null;
    this.name = null;
    this.longitude = null;
    this.latitude = null;
}

Course.prototype = {

    tableName: function () {
        return "course";
    },
    getData: function () {
        return {
            "name": this.name,
            "latitude": this.latitude,
            "longitude": this.longitude,
        }
    },
/*
    afterLoad: function (tx, callback) {
        var __self__ = this;
        var wg = new WaitGroup(callback, [__self__]);
        wg.Add(1);
        Layout.LoadForCourse(tx, this, function (layouts) {
            __self__.layouts = (layouts);
            wg.Done();
        });
    },
*/
    WithEachLayout: function (callback) {
        Model.WithEach(Layout, callback, { course: this.rowid });
    },

    Save: function (callback) {
        Model.Save(this, callback);
    },

    Delete: function (callback) {
        Model.Delete(this, callback);
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
    Model.WithAll(Course, callback);
}

function Layout(name, course) {
    var __self__ = this;
    this.name = name;
    this.course = course;
    this.paths = Array();
}

Layout.prototype = {

    tableName: function () {
        return "layout";
    },

    getData: function () {
        return {
            "name": this.name,
            "course": this.course,
        }
    },

    /*
    afterLoad: function (tx, callback) {
        var __self__ = this;
        var wg = new WaitGroup(callback, [__self__]);
        wg.Add(2);
        Path.LoadForLayout(tx, this, function (paths) {
            __self__.paths = paths;
            wg.Done();
        });
        if (typeof this.course == 'number') {
            Model.WithOne(Course, this.course, function (course) {
                __self__.course = course;
                wg.Done();
            });
        } else {
            wg.Done();
        }
    },
    */

    WithCourse: function (callback) {
        Model.WithOne(Course, this.course, callback);
    },

    WithPaths: function (callback) {
        var __self__ = this;
        Model.WithAll(Path, function (paths) {
            __self__.paths = paths;
            callback(paths);
        }, { layout: this.rowid });
    },

    WithEachPath: function (callback) {
        var __self__ = this;
        __self__.paths = Array();
        Model.WithEach(Path, function (path) {
            __self__.paths.push(path);
            callback(path);
        }, { layout: this.rowid });
    },

    Save: function (callback) {
        Model.Save(this, callback);
    },

    Delete: function (callback) {
        Model.Delete(this, callback);
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
    WithLength: function (callback) {
        var wg = new WaitGroup(callback, [0]);
        wg.Add(this.paths.length);
        $.each(this.paths, function (k, path) {
            path.WithDistance(function (distance) {
                wg.IncParam(0, distance);
                wg.Done();
            });
        });
    }
}


Layout.New = function (name, course) {
    var l = new Layout(name, course);
    return l;
}

Layout.LoadForCourse = function (tx, course, callback) {
    var layouts = Array();
    Model.WithDb(tx).WithAll(Layout, callback, { course: course.rowid });
    /*
    tx.executeSql(
        "SELECT rowid, * FROM layout WHERE course = ? ORDER BY name ASC;",
        [course.rowid],
        function (tx, resultSet) {
            for (var k = 0; k < resultSet.rows.length; k++) {
                var item = new Layout(resultSet.rows.item(k).name, course);
                item.rowid = resultSet.rows.item(k).rowid;
                item.afterLoad(tx, function (layout) {
                    layouts.push(layout);
                });
            }
            callback(layouts);
        },
        function (tx, error) {
            Panic(error.message);
        }
    );
    */
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
            "layout": this.layout,
            "basket": this.basket || null,
            "tee": this.tee || null,
            "par": this.par,
            "description": this.description,
        }
    },
    WithTee: function (callback) {
        Model.WithOne(Tee, this.tee, callback);
    },
    WithLayout: function (callback) {
        Model.WithOne(Layout, this.layout, callback);
    },
    WithBasket: function (callback) {
        Model.WithOne(Basket, this.basket, callback);
    },
    WithDistance: function (callback) {
        var wg = new WaitGroup(function (tee, basket) {
            callback(tee.coord().distanceTo(basket.coord()));
        }, [null, null]);

        wg.Add(2);

        this.WithTee(function (tee) {
            wg.SetParam(0, tee);
            wg.Done();
        });
        this.WithBasket(function (basket) {
            wg.SetParam(1, basket);
            wg.Done();
        });
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
        function (resultSetOrTx, maybeResultSet) {
            var paths = Array();

            var resultSet = maybeResultSet || resultSetOrTx;
            var wg = new WaitGroup(callback, [paths]);

            wg.Add(resultSet.rows.length);
            for (var k = 0; k < resultSet.rows.length; k++) {
                var done = 0;
                (function (row) {
                    var wgPath = new WaitGroup(function (basket, tee, layout, number, par) {
                        var path = new Path(number, layout, basket, tee, par);
                        paths.push(path);
                        wg.Done();
                    }, [null, null, layout, row.number, row.par]);

                    wgPath.Add(2);

                    Basket.WithOne(row.basket, function (basket) {
                        wgPath.SetParam(0, basket);
                        wgPath.Done();
                    });

                    Tee.WithOne(row.tee, function (tee) {
                        wgPath.SetParam(1, tee);
                        wgPath.Done();
                    });
                }) (resultSet.rows.item(k));
            }
        },
        function (errorOrTx, maybeError) {
            var error = maybeError || errorOrTx;
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

Tee.WithOne = function (rowid, callback) {
    Model.WithOne(Tee, rowid, callback);
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

Basket.WithOne = function (rowid, callback) {
    Model.WithOne(Basket, rowid, callback);
}


/** Converts numeric degrees to radians */
if (typeof (Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }
}