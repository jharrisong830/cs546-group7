$("#postModal").on("shown.bs.modal", (event) => {
    // when the modal is shown...
    const outerText = $("#textContentOuter").val().trim();
    $("#textContentInner").val(outerText); // set the value of the text area to be whatever the user was typing before
    $("#musicContentTypeButtons").off(); // remove all event handlers from the buttons (otherwise they start to stack lol)

    // prevents clicks of children elements from being double-registered
    $("#playlists").click((event) => {
        event.stopPropagation();
    });
    $("#songs").click((event) => {
        event.stopPropagation();
    });
    $("#albums").click((event) => {
        event.stopPropagation();
    });

    $("#musicContentTypeButtons").click((event) => {
        // on click of the button group (listens on all buttons in the container)...
        $("#contentLoading").removeAttr("hidden"); // render loading when clicked, and clear all output
        $(".spinner-border").removeAttr("hidden");

        $("#error").html("");
        $("#error").attr("hidden", true);

        $("#contentSelector").html("");
        $("#contentSelector").attr("hidden", true);

        const currChecked = $('input[name="musicContentType"]:checked')
            .val()
            .trim()
            .toLowerCase(); // get the checked option (determines the view)
        if (currChecked === "playlists") {
            // render playlists
            const requestConfig = {
                method: "GET",
                url: "/api/music/spotify/playlists"
            };
            $.ajax(requestConfig).then(
                (response) => {
                    if (response.playlists.length === 0) {
                        $("#error").html(
                            "We couldn't find any playlists. Add some playlists to your library and try again."
                        );
                        $("#error").removeAttr("hidden");
                        $("#contentLoading").attr("hidden", true);
                        $(".spinner-border").attr("hidden", true);
                    } else {
                        response.playlists.forEach((pl) => {
                            // begin to generate html for each playlist (will be radio buttons)
                            const newPlaylistOption = $(`
                            <div class="form-check">
                                <input required type="radio" id="${pl._id}" value="${pl._id}" name="musicContentId" class="form-check-input">
                                <label for="${pl._id}" class="form-check-label">
                                    <img class="" alt="${pl.name} playlist thumbnail" src="${pl.thumbnailURL}">
                                    <br>
                                    ${pl.name}
                                </label>
                            </div>
                            `);
                            $("#contentSelector").append(newPlaylistOption); // add the playlist html to the div
                        });
                        $("#contentLoading").attr("hidden", true);
                        $(".spinner-border").attr("hidden", true);
                        $("#contentSelector").removeAttr("hidden");
                    }
                },
                (responseError) => {
                    // triggered if an http error code is received (from jquery docs, responseError is a different object than our api's response)
                    $("#error").html(
                        `There was an error fetching your playlists. Please try again. (Error message: ${responseError.responseJSON.errmsg})`
                    );
                    $("#error").removeAttr("hidden");
                    $("#contentLoading").attr("hidden", true);
                    $(".spinner-border").attr("hidden", true);
                }
            );
        } else if (currChecked === "songs") {
            const requestConfig = {
                method: "GET",
                url: "/api/music/spotify/playlists" // just playlists for now, add buttons once working
            };
            $.ajax(requestConfig).then(
                // renders playlists by default
                (response) => {
                    if (response.playlists.length === 0) {
                        $("#error").html(
                            "We couldn't find any playlists. Add some playlists to your library and try again."
                        );
                        $("#error").removeAttr("hidden");
                        $("#contentLoading").attr("hidden", true);
                        $(".spinner-border").attr("hidden", true);
                    } else {
                        response.playlists.forEach((pl) => {
                            // begin to generate html for each playlist (will be radio buttons)
                            const newPlaylistOption = $(`
                            <div class="form-check">
                                <input required type="radio" id="${pl._id}" value="${pl._id}" name="musicContentId" class="form-check-input">
                                <label for="${pl._id}" class="form-check-label">
                                    <img class="" alt="${pl.name} playlist thumbnail" src="${pl.thumbnailURL}">
                                    <br>
                                    ${pl.name}
                                </label>
                            </div>
                            `);
                            $("#contentSelector").append(newPlaylistOption); // add the playlist html to the div
                        });
                        $("#contentLoading").attr("hidden", true);
                        $(".spinner-border").attr("hidden", true);
                        $("#contentSelector").removeAttr("hidden");
                    }
                },
                (responseError) => {
                    // triggered if an http error code is received (from jquery docs, responseError is a different object than our api's response)
                    $("#error").html(
                        `There was an error fetching your playlists. Please try again. (Error message: ${responseError.responseJSON.errmsg})`
                    );
                    $("#error").removeAttr("hidden");
                    $("#contentLoading").attr("hidden", true);
                    $(".spinner-border").attr("hidden", true);
                }
            );
        } else if (currChecked === "albums") {
            const requestConfig = {
                method: "GET",
                url: "/api/music/spotify/playlists" // just playlists for now, add buttons once working
            };
            $.ajax(requestConfig).then(
                // renders playlists by default
                (response) => {
                    if (response.playlists.length === 0) {
                        $("#error").html(
                            "We couldn't find any playlists. Add some playlists to your library and try again."
                        );
                        $("#error").removeAttr("hidden");
                        $("#contentLoading").attr("hidden", true);
                        $(".spinner-border").attr("hidden", true);
                    } else {
                        response.playlists.forEach((pl) => {
                            // begin to generate html for each playlist (will be radio buttons)
                            const newPlaylistOption = $(`
                            <div class="form-check">
                                <input required type="radio" id="${pl._id}" value="${pl._id}" name="musicContentId" class="form-check-input">
                                <label for="${pl._id}" class="form-check-label">
                                    <img class="" alt="${pl.name} playlist thumbnail" src="${pl.thumbnailURL}">
                                    <br>
                                    ${pl.name}
                                </label>
                            </div>
                            `);
                            $("#contentSelector").append(newPlaylistOption); // add the playlist html to the div
                        });
                        $("#contentLoading").attr("hidden", true);
                        $(".spinner-border").attr("hidden", true);
                        $("#contentSelector").removeAttr("hidden");
                    }
                },
                (responseError) => {
                    // triggered if an http error code is received (from jquery docs, responseError is a different object than our api's response)
                    $("#error").html(
                        `There was an error fetching your playlists. Please try again. (Error message: ${responseError.responseJSON.errmsg})`
                    );
                    $("#error").removeAttr("hidden");
                    $("#contentLoading").attr("hidden", true);
                    $(".spinner-border").attr("hidden", true);
                }
            );
        } else {
            // hopefully shouldn't hit this...
            $("#error").html(
                `Current checked item is ${currChecked}... I don't think you're supposed to be here`
            );
            $("#error").removeAttr("hidden");
            $("#contentLoading").attr("hidden", true);
            $(".spinner-border").attr("hidden", true);
        }
    });

    $("#musicContentTypeButtons").trigger("click"); // click to start loading content (since playlists is selected by default, that is what will be rendered)
});

$("#postModal").on("hidden.bs.modal", (event) => {
    // when the modal is closed...
    const innerText = $("#textContentInner").val().trim();
    $("#textContentOuter").val(innerText); // set the value of the input area to be whatever the user was typing before

    // now, reset all of the fields

    $("#contentLoading").removeAttr("hidden");
    $(".spinner-border").removeAttr("hidden");

    $("#error").html("");
    $("#error").attr("hidden", true);

    $("#contentSelector").html("");
    $("#contentSelector").attr("hidden", true);
});
