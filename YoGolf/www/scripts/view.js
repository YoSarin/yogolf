function View() { }

View.Courses = function () {
    App.AddToHistory(View.Courses, arguments);
    Course.WithAll(function (courses) {
        $(':mobile-pagecontainer').pagecontainer('change', $('#courses'));
        $("#courses .content").html("");
        $.each(courses, function (k, course) {
            var layouts = course.layouts.map(function (layout) {
                return $('<tr>')
                    .data("layout", layout)
                    .append($('<th>').text(layout.name))
                    .append($('<td>').text(layout.paths.length))
                    .append($('<td>').text(layout.par()))
                    .append($('<td>').text(layout.length().toFixed(0)))
                    .append($('<td>')
                        .append($('<span class="red layout delete button">').text("🗑"))
                        .append($('<span class="blue info button">').text('ℹ'))
                        .append($('<span class="green start button">').text('⛳'))
                    )
            });
            $('#courses .content')
                .append($('<div class="course">')
                    .append($('<span class="red course delete button">').data('course', course).text("🗑"))
                    .append($('<h2 class="showCompass showDistance" coords="' + course.coord().toString() + '">').text(course.name))
                    .append($('<table class="layouts">')
                        .append($('<tr>')
                            .append($('<th>').text(""))
                            .append($('<th>').text("Holes"))
                            .append($('<th>').text("Par"))
                            .append($('<th>').text("Length (m)"))
                            .append($('<th>').text("Info"))
                        )
                        .append(layouts)
                    )
                )
            });
        $('#courses .content')
            .append($('<div id="newCourse" class="require_GPS">')
                .append($('<input type="button" value="I am on the new field Now!">'))
            );
        $('#newCourse input[type=button]').click(function () {
            navigator.notification.prompt("Cool! What's its name?", Course.NewFromPrompt, "New course");
        });
        $('#courses .course.delete').click(function (event) {
            var course = $(this).data("course");
            navigator.notification.confirm (
                "This will locally delete whole course, with all its layouts, tees and baskets.",
                function (button) { course.DeleteWithConfirm(button); },
                "Are you sure?"
            );
        });
        $('#courses .info').click(function (event) {
            View.Layout($(this).closest('tr').data("layout"));
        });
        $('#courses .start').click(function (event) {
            View.StartRound($(this).closest('tr').data("layout"));
        });
        $('#courses .layout.delete').click(function (event) {
            var layout = $(this).closest('tr').data("layout");
            navigator.notification.confirm (
                "This will locally delete whole layout (tees and baskets used by other layouts will stay in app).",
                function (button) { layout.DeleteWithConfirm(button); },
                "Are you sure?"
            );
        });
        $('#courses .content h2').click(function (event) {
            $(this).closest('div.course').find(".layouts").toggleClass("hidden");
        });
        View.Enrich($("#courses"));
    });
}

View.Layout = function (layout) {
    App.AddToHistory(View.Layout, arguments);
    $(':mobile-pagecontainer').pagecontainer('change', $('#layout'));
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

View.StartRound = function (layout) {
    var round = new Round(layout);
    View.Round(round, round.hole_number);
}

View.Round = function (round, hole_number) { // passing hole number separately, to be able to track history while walking through layout
    App.AddToHistory(View.Round, arguments);
    $(':mobile-pagecontainer').pagecontainer('change', $('#round'));
    $("#round .content").html("");
    var path = round.layout.getPathByNumber(hole_number);
    if (path) {
        $("#round .content")
            .append(
                $('<table class="path">')
                    .append(
                        $("<tr>")
                            .append($("<th>").text("#"))
                            .append($("<th>").text("Tee"))
                            .append($("<th>").text("Basket"))
                            .append($("<th>").text("Par"))
                            .append($("<th>").text("Length"))
                    )
                    .append(
                        $("<tr>")
                            .append($("<td>").text(path.number + '/' + path.layout.paths.length))
                            .append($("<td>").text(path.tee.name))
                            .append($("<td>").text(path.basket.name))
                            .append($("<td>").text(path.par))
                            .append($("<td>").text(path.distance().toFixed(0)))
                    )
            )
            .append($('<p>').text(path.description))
            .append($('<table class="players">')
            );

        $.each(round.scores, function (email, scoreList) {
            $('#round .players')
                .append($('<tr>')
                    .append($('<td>').text(email))
                    .append($('<td>').append($('<span class="green minus button">').text("-")))
                    .append($('<td>').text(scoreList[path.rowid] ? scoreList[path.rowid] : path.par))
                    .append($('<td>').append($('<span class="red plus button">').text("+")))
                    .append($('<td>').append($('<span class="red ob button">').text("OB")))
                );
        });
        
        $('#round .players')
            .append($('<tr>')
                .append($('<td colspan="5">').append($('<span class="padded blue full_width add_player button">').text("Add player")))
            );

        $("#round h1.header").html(path.layout.course.name + ' <small>' + path.layout.name + '</small>');

        $("#round div.footer").text("");
        if (path.number > 1) {
            $("#round div.footer").append($('<div class="padded blue prev button at_left">Previous</div>'));
        }
        $("#round div.footer").append($('<div class="padded blue next button">Next</div>'));
        $("#round h4.footer")
            .text("Tee: ")
            .append($('<span class="showCompass showDistance updateCoords" coords="' + path.tee.coord().toString() + '">').data("object", path.tee))
            .append(" | Basket: ")
            .append($('<span class="showCompass showDistance updateCoords" coords="' + path.basket.coord().toString() + '">').data("object", path.basket));

        $("#round .button.next").click(function (event) {
            round.moveToNext();
            View.Round(round, round.hole_number);
        });
        $("#round .button.prev").click(function (event) {
            round.moveToPrev();
            View.Round(round, round.hole_number);
        });
    } else {
        $("#round .content")
            .append($("<h2>").text("No more throws to do!"))
            .append($("<p>").text("Seems, that you're done."))
            .append($("<p>")
                .append($('<div class="padded blue finish button">True, lets finish it</div>'))
                .append($('<div class="padded blue new-hole button">Noo, there is another tee!</div>'))
            );
        $("#round .new-hole").click(function () {
            navigator.notification.prompt(
                "Okay, what is its par?",
                function (prompt) {
                    p = Path.NewFromPrompt(prompt, round.hole_number, round.layout, function () { View.Round(round); } );
                },
                "Then lets add it!", ["Ok", "Cancel"], 3);
        });
        $("#round div.footer").text("");
        $("#round h4.footer").text("We're done!");
    }
    View.Enrich($('#round'));
}

// COMMON FUNCTIONS
View.Enrich = function (page) {
    $(page).find(".showCompass").each(function (k, item) {
        $(item).append($("#templates .compass").clone());
    });
    $(page).find(".showDistance").each(function (k, item) {
        $(item).append($('<span class="distance hidden require_GPS">'));
    });
    $(page).find(".updateCoords").click(function (event) {
        var obj = $(this).data("object");
        var elem = $(this);
        if (App.position) {
            navigator.notification.confirm("Are you at place?", function (button) {
                if (button == 1) {
                    obj.latitude = App.position.coords.latitude;
                    obj.longitude = App.position.coords.longitude;
                    obj.Save();
                    elem.attr("coords", obj.coord.toString());
                }
            }, "Changing location");
        }
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
    var cl = $('.require_HEADING').attr('class').replace(/(\s|^)hidden(\s|$)/, "$1$2");
    $('.require_HEADING').attr('class', cl);
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
            $(item).find(".distance").text(distance + " m (± " + position.coords.accuracy + ")");
        }
    });
    var cl = $('.require_GPS').attr('class').replace(/(\s|^)hidden(\s|$)/, "$1$2");
    $('.require_GPS').attr('class', cl);
}

View.HeadingArrow = function (direction, svg) {
    var angleInRadians = -1*((direction + 90) % 360).toRad();
    var radius = 10;

    var x = 10 + Math.round(radius * Math.cos(angleInRadians));
    var y = 10 + Math.round(radius * Math.sin(angleInRadians));

    svg.find(".pointer").attr("x2", x).attr("y2", y);
}