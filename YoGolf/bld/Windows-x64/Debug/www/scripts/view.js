function View() { }

View.Courses = function () {
    App.AddToHistory(View.Courses, arguments);
    Course.WithAll(function (courses) {
        $(':mobile-pagecontainer').pagecontainer('change', $('#courses'));
        $("#courses .content").html("");
        $.each(courses, function (k, course) {
            $('#courses .content')
                .append($('<div class="course" id="course_' + course.rowid + '">')
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
                    )
                );
            course.WithEachLayout(function (layout) {
                layout.WithPaths(function (paths) {
                    layout.WithLength(function (len) {
                        var row = $('<tr>')
                                .data("layout", layout)
                                .append($('<th>').text(layout.name))
                                .append($('<td>').text(layout.paths.length))
                                .append($('<td>').text(layout.par()))
                                .append($('<td>').text(len.toFixed(0)))
                                .append($('<td>')
                                    .append($('<span class="red layout delete button">').text("🗑"))
                                    .append($('<span class="blue info button">').text('ℹ'))
                                    .append($('<span class="green start button">').text('⛳'))
                                );
                        $("#courses .content #course_" + layout.course + " table tbody").append(row);
                    });
                });
            });
        });
        $('#courses .content')
            .append($('<div id="newCourse" class="require_GPS">')
                .append($('<span class="blue add course padded full_width button">').text("I am on the new field Now!"))
            )
            .append($('<div id="oldCourses">')
                .append($('<span class="blue old course padded full_width button">').text("History"))
            );
        $('#courses .add.course').click(function () {
            navigator.notification.prompt("Cool! What's its name?", Course.NewFromPrompt, "New course");
        });
        $('#courses .old.course').click(function () {
            View.Rounds();
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
    round.addPlayer(App.playerByEmail('martin@yosarin.net'));
    round.addPlayer(App.playerByEmail('lidalejsal@gmail.com'));
    round.addPlayer(App.playerByEmail('pzaloha@volny.cz'));
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
                            .append($("<td>").text(hole_number + '/' + path.layout.paths.length))
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
            var player = App.playerByEmail(email);
            $('#round .players')
                .append($('<tr class="player">')
                    .append($('<td>').text(player.name))
                    .append($('<td>').text((round.relativePlayerScore(player) > 0 ? '+' : '') + round.relativePlayerScore(player)))
                    .append($('<td>').append($('<span class="green minus button">').text("-")))
                    .append($('<td>').append($('<span class="score">').text(scoreList[path.rowid] ? scoreList[path.rowid].throws : path.par)))
                    .append($('<td>').append($('<span class="red plus button">').text("+")))
                    .append($('<td>').append($('<span class="padded red ob button">').text("OB")))
                    .data("player", player)
                );
        });
        
        $('#round .players')
            .append($('<tr>')
                .append($('<td colspan="5">').append($('<span class="padded blue full_width add_player button">').text("Add player")))
            );

        $("#round h1.header").html(path.layout.course.name + ' <small>' + path.layout.name + '</small>');

        $("#round div.footer").text("");
        if (path.number > 1) {
            $("#round div.footer").append($('<div class="blue prev button at_left">⤆</div>'));
        }
        $("#round div.footer").append($('<div class="blue next button">⤇</div>'));
        $("#round h4.footer")
            .text("Tee: ")
            .append($('<span class="showCompass showDistance updateCoords" coords="' + path.tee.coord().toString() + '">').data("object", path.tee))
            .append(" | Basket: ")
            .append($('<span class="showCompass showDistance updateCoords" coords="' + path.basket.coord().toString() + '">').data("object", path.basket));

        $("#round .button.plus").click(function (event) {
            var el = $(this).closest("tr").find(".score");
            el.text(parseInt(el.text()) + 1);
        });
        $("#round .button.minus").click(function (event) {
            var el = $(this).closest("tr").find(".score");
            el.text(parseInt(el.text()) - 1);
        });
        $("#round .button.ob").multi_click(
            function (event) {
                var el = $(this).closest("tr").find(".score");
                el.text(parseInt(el.text()) + 1);
                if (el.hasClass("ob2")) {
                    el.addClass("ob3");
                } else if (el.hasClass("ob")) {
                    el.addClass("ob2");
                } else {
                    el.addClass("ob");
                }
            },
            function (event) {
                var el = $(this).closest("tr").find(".score");
                el.text(parseInt(el.text()) - 1);
                if (el.hasClass("ob3")) {
                    el.removeClass("ob3");
                } else if (el.hasClass("ob2")) {
                    el.removeClass("ob2");
                } else {
                    el.removeClass("ob");
                }
            },
            function (event) {

            },
            250
        );
        $("#round .button.next").click(function (event) {
            $('#round tr.player').each(function (key, row) {
                var player = $(row).data("player");
                round.addScore(player, parseInt($(row).find('.score').text()));
            });
            round.moveToNext();
            View.Round(round, round.hole_number);
        });
        $("#round .button.prev").click(function (event) {
            $('#round tr.player').each(function (key, row) {
                var player = $(row).data("player");
                round.addScore(player, parseInt($(row).find('.score').text()));
            });
            round.moveToPrev();
            View.Round(round, round.hole_number);
        });
    } else {
        $("#round .content")
            .append($("<h2>").text("No more throws to do!"))
            .append($("<p>").text("Seems, that you're done."))
            .append($('<table class="players">'))
            .append($("<p>")
                .append($('<div class="padded blue finish button">True, lets finish it</div>'))
                .append($('<div class="padded blue new-hole button">Noo, there is another tee!</div>'))
            );

        $.each(round.scores, function (email, scoreList) {
            var player = App.playerByEmail(email);
            var line = $('<tr class="player">');
            line.append($('<th>').text(player.name))
            $.each(scoreList, function (key, score) {
                line.append($('<td>').text(score.throws));
            });
            line.append($('<th>').text((round.relativePlayerScore(player) > 0 ? '+' : '') + round.relativePlayerScore(player)))
            line.data("player", player)
            $('#round .players').append(line);
        });

        $("#round .new-hole").click(function () {
            navigator.notification.prompt(
                "Okay, what is its par?",
                function (prompt) {
                    p = Path.NewFromPrompt(prompt, round.hole_number, round.layout, function () { View.Round(round, hole_number); });
                },
                "Then lets add it!", ["Ok", "Cancel"], 3);
        });
        $("#round .finish").click(function () {
            round.Save();
            View.Courses();
        });
        $("#round div.footer").text("");
        $("#round h4.footer").text("We're done!");
    }
    View.Enrich($('#round'));
}

View.Rounds = function () {
    App.AddToHistory(View.Rounds, arguments);
    $("#rounds .content").html('');
    $(':mobile-pagecontainer').pagecontainer('change', $('#rounds'));
    $("#rounds .content")
        .append($('<table class="rounds">'))
    Round.WithEach(function (round) {
        round.WithLayout(function (layout) {
            layout.WithCourse(function (course) {
                console.log(App.locale);
                console.log(App.locale.value);
                var start = new Date(round.start);
                var end = new Date(round.end);
                console.log(start.toLocaleString(App.locale.value));
                console.log(end.toLocaleString(App.locale.value));
                $("#rounds .content table.rounds")
                    .append($("<tr>")
                        .append($("<td>").text(course.name + ":" + layout.name))
                        .append($("<td>").text(start.toLocaleString(App.locale.value)))
                        .append($("<td>").text(end.toLocaleString(App.locale.value)))
                        .append($("<td>").text(round.hole_number))
                        .append($("<td>").text(round.finished))
                    );
            });
        });
    });
}

// COMMON FUNCTIONS
View.Enrich = function (page) {
    $(page).find(".button").click(function (ev) {
        $(this).addClass("clicked");
    });
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
    
    // debug
    $(page).find(".content")
        .append($('<span class="blue back button">').text("⇤"))
        .append($('<span class="blue refresh button">').text("↺"));

    $(page).find(".refresh.button").click(function () {
        App.reload();
    });
    $(page).find(".back.button").click(function () {
        App.goBack();
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