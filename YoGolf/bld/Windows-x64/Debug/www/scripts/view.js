function View() { }

View.Courses = function (db) {
    Course.WithAll(db, function (courses) {
        $(':mobile-pagecontainer').pagecontainer('change', $('#courses'));
        $.each(courses, function (k, course) {
            var path = course.layouts.map(function (layout) { return layout.describe() + layout.describePaths(); }).join('</li><li>');
            var layouts = $('<li>' + path + '</li>');
            $('#courses .content')
                .append($('<h2>').text(course.name))
                .append($('<ul>').append(layouts))
        });
    });
}