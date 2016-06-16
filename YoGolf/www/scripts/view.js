function View() { }

View.Courses = function (db) {
    Course.WithAll(db, function (courses) {
        $(':mobile-pagecontainer').pagecontainer('change', $('#courses'));
        $.each(courses, function (k, course) {
            var layouts = course.layouts.map(function (layout) {
                return $('<li>').text(layout.name + ': ' + layout.paths.length + ' holes | par ' + layout.par() + ' | ' + layout.length().toFixed(0) + ' meters');
            });
            $('#courses .content')
                .append($('<div class="course">')
                    .append($('<h2 class="showCompass showDistance" coords="' + course.coord().toString() + '">').text(course.name))
                    .append($('<ul class="layouts hidden">').append(layouts))
                )
        });
        $(".showCompass").each(function (k, item) {
            $(item).append($("#templates .compass").clone());
        });
        $(".showDistance").each(function (k, item) {
            $(item).append($('<span class="distance">'));
        });
        $('#courses .content h2').click(function (event) {
            console.log(this, $(this).closest('div.course').find("ul.layouts"));
            $(this).closest('div.course').find("ul.layouts").toggleClass("hidden");
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