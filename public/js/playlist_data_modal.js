$("#postModal").on("shown.bs.modal", (event) => {
    // when the modal is shown...
    const requestConfig = {
        method: "GET",
        url: "/api/music/spotify/playlists" // just playlists for now, add buttons once working
    };

    const outerText = $("#textContentOuter").val().trim();
    $("#textContentInner").val(outerText); // set the value of the text area to be whatever the user was typing before
    $.ajax(requestConfig).then(
        (response) => {
            if (response.playlists.length === 0) {
                $("#error").html(
                    "We couldn't find any playlists. Add some playlists to your library and try again."
                );
                $("#error").removeAttr("hidden");
                $("#playlistLoading").attr("hidden", true);
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
                    $("#playlistSelector").append(newPlaylistOption); // add the playlist html to the div
                });
                $("#playlistLoading").attr("hidden", true);
                $(".spinner-border").attr("hidden", true);
                $("#playlistSelector").removeAttr("hidden");
            }
        },
        (responseError) => {
            // triggered if an http error code is received (from jquery docs, responseError is a different object than our api's response)
            $("#error").html(
                `There was an error fetching your playlists. Please try again. (Error message: ${responseError.responseJSON.errmsg})`
            );
            $("#error").removeAttr("hidden");
            $("#playlistLoading").attr("hidden", true);
            $(".spinner-border").attr("hidden", true);
        }
    );
});

$("#postModal").on("hidden.bs.modal", (event) => {
    // when the modal is closed...
    const innerText = $("#textContentInner").val().trim();
    $("#textContentOuter").val(innerText); // set the value of the input area to be whatever the user was typing before

    // now, reset all of the fields

    $("#playlistLoading").removeAttr("hidden");
    $(".spinner-border").removeAttr("hidden");

    $("#error").html("");
    $("#error").attr("hidden", true);

    $("#playlistSelector").html("");
    $("#playlistSelector").attr("hidden", true);
});
