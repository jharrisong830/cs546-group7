$("#submitSearchCatalog").click((event) => {
    // song search bar (mimics a form)
    const searchText = $("#searchCatalog").val().trim();

    if (searchText.length === 0) {
        $("#error").html(
            "You must enter a search term. Try searching for your favorite song!"
        );
        $("#error").removeAttr("hidden");
    } else {
        $("#contentLoading").removeAttr("hidden"); // render loading when clicked, and clear all output
        $(".spinner-border").removeAttr("hidden");

        $("#error").html("");
        $("#error").attr("hidden", true);

        $("#contentSelector").html("");
        $("#contentSelector").attr("hidden", true);

        const requestConfig = {
            method: "GET",
            url: `/api/music/spotify/searchCatalog?q=${searchText}`
        };

        $.ajax(requestConfig).then(
            (response) => {
                response.results.forEach((item) => {
                    // begin to generate html for each catalog item (will be radio buttons)
                    const newOption = $(`
                <div class="form-check">
                    <input required type="radio" id="${item._id}" value="${item._id}" content-type="${item.type}" name="musicContentId" class="form-check-input">
                    <label for="${item._id}" class="form-check-label">
                        <img class="" alt="" src="">
                        <br>
                        <p class="text-body-emphasis">${item.name} (${item.type})</p>
                        <p class="text-body-secondary">${item.artists}</p>
                    </label>
                </div>
                `);
                    $("#contentSelector").append(newOption); // add the playlist html to the div
                });
                $("#contentLoading").attr("hidden", true);
                $(".spinner-border").attr("hidden", true);
                $("#contentSelector").removeAttr("hidden");
            },
            (responseError) => {
                $("#error").html(
                    `There was an error fetching your results. Please try again. (Error message: ${responseError.responseJSON.errmsg})`
                );
                $("#error").removeAttr("hidden");
                $("#contentLoading").attr("hidden", true);
                $(".spinner-border").attr("hidden", true);
            }
        );
    }
});

$("#postModal").on("shown.bs.modal", (event) => {
    // when the modal is shown...
    const outerText = $("#textContentOuter").val().trim();
    $("#textContentInner").val(outerText); // set the value of the text area to be whatever the user was typing before
    $("#musicContentTypeButtons").off(); // remove all event handlers from the buttons (otherwise they start to stack lol)
    $("#playlists").off();
    $("#catalog").off();

    // prevents clicks of children elements from being double-registered
    $("#playlists").click((event) => {
        event.stopPropagation();
    });
    $("#catalog").click((event) => {
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

        $("#searchCatalogContainer").attr("hidden", true);

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
                                <input required type="radio" id="${pl._id}" value="${pl._id}" content-type="${pl.type}" name="musicContentId" class="form-check-input">
                                <label for="${pl._id}" class="form-check-label">
                                    <img class="" alt="${pl.name} playlist thumbnail" src="${pl.thumbnailURL}">
                                    <br>
                                    <p class="text-body-emphasis">${pl.name}</p>
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
        } else if (currChecked === "catalog") {
            $("#searchCatalogContainer").removeAttr("hidden");
            $("#contentLoading").attr("hidden", true);
            $(".spinner-border").attr("hidden", true);
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
