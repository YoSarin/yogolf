function View() { }

View.Courses = function (db) {
    Course.WithAll(db, function (courses) {
        $(':mobile-pagecontainer').pagecontainer('change', $('#courses'));
        $.each(courses, function (k, course) {
            var path = course.layouts.map(function (layout) { return layout.describe() + layout.describePaths(); }).join('</li><li>');
            var layouts = $('<li>' + path + '</li>');
            $('#courses .content')
                .append($('<h2 class="showCompass" coords="' + course.coord().toString() + '">').text(course.name))
                .append($('<ul>').append(layouts))
        });
        $(".showCompass").each(function (k, item) {
            $(item).append($("#templates .compass").clone());
        });
    });
}

View.HeadingArrow = function (direction, svg) {
    var angleInRadians = -1*((direction + 90) % 360).toRad();
    var radius = 10;

    var x = 10 + Math.round(radius * Math.cos(angleInRadians));
    var y = 10 + Math.round(radius * Math.sin(angleInRadians));

    svg.find(".pointer").attr("x2", x).attr("y2", y);
}