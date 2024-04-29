$(document).on("musickitloaded", async (event) => {
    // event handler for musickit on the whole document
    const requestConfig = {
        method: "GET",
        url: "/api/music/appleMusic/devToken"
    };

    let errorString = "";

    $.ajax(requestConfig).then(
        async (response) => {
            try {
                // reference for implementation: https://js-cdn.music.apple.com/musickit/v3/docs/index.html?path=/story/get-started--page
                await MusicKit.configure({
                    developerToken: response.AMDevToken,
                    app: {
                        name: "Tweeter",
                        build: "0.0.1"
                    }
                });
            } catch (e) {
                errorString = e;
            }
        },
        (responseError) => {
            // get error message if thrown
            errorString = responseError.responseJSON.errmsg;
        }
    );

    let music = MusicKit.getInstance();
    await music.authorize();

    console.log("MUSICKIT LOADED");

    if (errorString.length !== 0) {
        $("#error").removeAttr("hidden");
        $("#error").html(errorString);
    } else {
        // MusicKit instance is available at this point!
        $("#AMShowPlaylists").click(async (event) => {
            let music = MusicKit.getInstance();
            const mut = await music.authorize();
            if (mut === undefined || mut === null) {
                $("#error").html(
                    `There was an error fetching your playlists. Try connecting your Apple Music account`
                );
                $("#error").removeAttr("hidden");
                $("#playlistLoading").attr("hidden", true);
                $(".spinner-border").attr("hidden", true);
            } else {
                // start by showing loading div and clearing any errors
                $("#AMShowPlaylists").addClass("active");

                $("#playlistLoading").removeAttr("hidden");
                $(".spinner-border").removeAttr("hidden");

                $("#error").html("");
                $("#error").attr("hidden", true);

                $("#playlistSelector").html("");
                $("#playlistSelector").attr("hidden", true);

                const AMResponse = await music.api.music(
                    "v1/me/library/playlists"
                );
                if (!Object.keys(AMResponse).includes("data")) {
                    $("#error").html(
                        `There was an error fetching your playlists. Please try again`
                    );
                    $("#error").removeAttr("hidden");
                    $("#playlistLoading").attr("hidden", true);
                    $(".spinner-border").attr("hidden", true);
                } else {
                    const plArray = AMResponse.data.data; // base object is { req, res, data }, inside of data is another data field, which is array of playlists
                    const cleanedPlaylists = plArray.map((pl) => ({
                        // filter out unnecessary data (unfortunately this is all i can get :( )
                        _id: pl.id,
                        name: pl.attributes.name
                    }));

                    cleanedPlaylists.forEach((pl) => {
                        // begin to generate html for each playlist (will be radio buttons)
                        const newPlaylistOption = $(`
                        <div class="form-check">
                            <input required type="radio" id="${pl._id}" value="${pl._id}" name="musicContentId" class="form-check-input">
                            <label for="${pl._id}" class="form-check-label">
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
            }
        });
    }
});
