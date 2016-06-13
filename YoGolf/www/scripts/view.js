function View() { }

View.Courses = function (db) {
    Course.WithAll(db, function (courses) {
        $(':mobile-pagecontainer').pagecontainer('change', $('#courses'));
        $.each(courses, function (k, v) {
            console.log(v);
            $('#courses .ui-content ul').append(
                $('<li>').text(v.name + ' - ' + v.layouts.map(function (el) { return el.name; }).join(" | "))
            )
        });
    });
}