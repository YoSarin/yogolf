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
        $('#courses .content')
            .append($('<div id="newCourse" class="require_GPS">')
                .append($('<input class="clicker" type="button" value="I am on the new field Now!">'))
            );
        $('#newCourse .clicker').click(function () {
            navigator.notification.prompt("Cool! What's its name?", Course.NewFromPrompt, "New course");
        });
        $('#courses .content h2').click(function (event) {
            $(this).closest('div.course').find("ul.layouts").toggleClass("hidden");
        });
        $('#courses .content .layouts li').click(function (event) {
            View.Layout($(this).data("layout"));
        });
        View.Enrich($("#courses"));
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
    View.Enrich($("#layout"));
}

View.Enrich = function (page) {
    $(page).find(".showCompass").each(function (k, item) {
        $(item).append($("#templates .compass").clone());
    });
    $(page).find(".showDistance").each(function (k, item) {
        $(item).append($('<span class="distance">'));
    });
}

View.refreshHeading = function (position, heading) {
    $(".showCompass").each(function (key, item) {
        var coords = $(item).attr("coords").split(",");
        var c = new Coord(position.coords.latitude, position.coords.longitude);
        // var c = new Coord(50.0215556, 14.2284575);
        var itemCoord = new Coord(parseFloat(coords[0]), parseFloat(coords[1]));
        var direction = Math.round(heading.magneticHeading - c.directionTo(itemCoord)) % 360;
        View.HeadingArrow(direction, $(item).find(".compass"));
    });
}

View.refreshDistance = function (position) {
    $(".showDistance").each(function (key, item) {
        var coords = $(item).attr("coords").split(",");
        var c = new Coord(position.coords.latitude, position.coords.longitude);
        // var c = new Coord(50.0215556, 14.2284575);
        var itemCoord = new Coord(parseFloat(coords[0]), parseFloat(coords[1]));
        var distance = Math.round(c.distanceTo(itemCoord));
        if (distance >= 1000) {
            $(item).find(".distance").text((Math.round(distance / 100) / 10) + ' km');
        } else {
            $(item).find(".distance").text(distance + " m");
        }
    });
}

View.HeadingArrow = function (direction, svg) {
    var angleInRadians = -1*((direction + 90) % 360).toRad();
    var radius = 10;

    var x = 10 + Math.round(radius * Math.cos(angleInRadians));
    var y = 10 + Math.round(radius * Math.sin(angleInRadians));

    svg.find(".pointer").attr("x2", x).attr("y2", y);
}