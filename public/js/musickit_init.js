/**
 * assumes the following script is loaded on the page: https://js-cdn.music.apple.com/musickit/v3/musickit.js
 */

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

    if (errorString.length !== 0) {
        $("#error").removeAttr("hidden");
        $("#error").html(errorString);
    } else {
        // MusicKit instance is available at this point!
        $("#musickit-js-auth").click(async (event) => {
            let music = MusicKit.getInstance();
            const mut = await music.authorize(); // get music user token to store in db
            if (mut === undefined || mut === null) {
                $("#error").removeAttr("hidden");
                $("#error").html("Unable to complete authorization.");
            } else {
                window.location.href = `/auth/appleMusic/success?mut=${mut}`; // redirect to the success page
            }
        });

        $("#musickit-js-unauth").click(async (event) => {
            let music = MusicKit.getInstance();
            await music.unauthorize(); // unauthorize the user
        });

        $("#testButton").click(async () => {
            let music = MusicKit.getInstance();
            const mut = await music.authorize();
            const playlist = await music.api.music("v1/me/library/playlists");
            console.log(playlist);
        });
    }
});
