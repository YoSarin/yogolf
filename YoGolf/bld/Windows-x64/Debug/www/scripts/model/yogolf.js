function YoGolf(db) {
    var __self__ = this;
    this.db = db
}

YoGolf.prototype = {
    Courses: function () {
        View.Courses(this.db);
    }
}

function Panic(message) {
    $(':mobile-pagecontainer').pagecontainer('change', $('#error'));
    $("#error .error-message").text(message);
    $("#error .address").text(calledFrom());
}

function calledFrom() {
    try {
        throw Error('')
    } catch (err) {
        console.log(err.stack.split("\n"));
        var caller_line = err.stack.split("\n")[3];
        var index = caller_line.indexOf("at ");
        return caller_line.slice(index + 2, caller_line.length);
    }
}

var WaitCount = 0;

function Wait() {
    WaitCount++;
    $.mobile.loading("show");
}

function Done() {
    if (--WaitCount == 0) {
        $.mobile.loading("done");
    }
}