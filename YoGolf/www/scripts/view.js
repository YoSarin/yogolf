function View() { }

View.Courses = function (db) {
    Course.WithAll(db, function (courses) {
        $(':mobile-pagecontainer').pagecontainer('change', $('#courses'));
        $("#courses .content").html("");
        $.each(courses, function (k, course) {
            var layouts = course.layouts.map(function (layout) {
                return $('<li>')
                    .text(layout.name + ': ' + layout.paths.length + ' holes | par ' + layout.par() + ' | ' + layout.length().toFixed(0) + ' meters')
                    .data("layout", layout);
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
            $(this).closest('div.course').find("ul.layouts").toggleClass("hidden");
        });
        $('#courses .content .layouts li').click(function (event) {
            View.Layout($(this).data("layout"));
        });
    });
}

View.Layout = function (layout) {
    $(':mobile-pagecontainer').pagecontainer('change', $('#layout'));
    console.log(layout);
    $("#layout .content").html("");
    $("#layout .content").append($("<h2>").text(layout.course.name + ": " + layout.name));
    $("#layout .content").append($('<ul class="paths">'));
    $.each(layout.paths, function (k, path) {
        $("#layout .content ul.paths").append(
            $("<li>")
                .text('[' + path.number + '] ' + path.tee.name + ' ➟ ' + path.basket.name + ':  par ' + path.par + ' | ' + path.distance().toFixed(0) + ' meters | ')
                .append($('<span class="showCompass showDistance" coords="' + path.tee.coord().toString() + '"></span>'))
        );
    });
    $(".showCompass").each(function (k, item) {
        $(item).append($("#templates .compass").clone());
    });
    $(".showDistance").each(function (k, item) {
        $(item).append($('<span class="distance">'));
    });
}

View.HeadingArrow = function (direction, svg) {
    var angleInRadians = -1*((direction + 90) % 360).toRad();
    var radius = 10;

    var x = 10 + Math.round(radius * Math.cos(angleInRadians));
    var y = 10 + Math.round(radius * Math.sin(angleInRadians));

    svg.find(".pointer").attr("x2", x).attr("y2", y);
}