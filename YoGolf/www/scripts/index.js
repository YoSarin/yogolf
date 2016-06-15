// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.

var App;

(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener('resume', onResume.bind(this), false);

        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        WithDatabase(function (db) {
            App = new YoGolf(db);
            App.Courses();
        });

        var options = { enableHighAccuracy: true };
        navigator.compass.watchHeading(
            function (heading) {
                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        $(".distance").each(function (key, item) {
                            var coords = $(item).attr("coords").split(",");
                            var c = new Coord(position.coords.latitude, position.coords.longitude);
                            // var c = new Coord(50.0215556, 14.2284575);
                            var itemCoord = new Coord(parseFloat(coords[0]), parseFloat(coords[1]));
                            $(item).text(Math.round(c.distanceTo(itemCoord)));
                            var direction = Math.round(heading.trueHeading - c.directionTo(itemCoord)) % 360;

                            View.HeadingArrow(direction, $(item).closest(".description").find(".compass"));
                        });
                    },
                    function (error) { console.log(error); },
                    options
                );
            },
            function (error) { console.log(error); },
            { frequency: 200 }
        );
        
        Coord.Test();
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
} )();