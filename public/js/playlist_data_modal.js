// Array from: https://developer.spotify.com/documentation/web-api/reference/get-recommendation-genres
// Now changed so tags are chosen from a dropdown of genres

const genresArray = [
    "acoustic",
    "afrobeat",
    "alt-rock",
    "alternative",
    "ambient",
    "anime",
    "black-metal",
    "bluegrass",
    "blues",
    "bossanova",
    "brazil",
    "breakbeat",
    "british",
    "cantopop",
    "chicago-house",
    "children",
    "chill",
    "classical",
    "club",
    "comedy",
    "country",
    "dance",
    "dancehall",
    "death-metal",
    "deep-house",
    "detroit-techno",
    "disco",
    "disney",
    "drum-and-bass",
    "dub",
    "dubstep",
    "edm",
    "electro",
    "electronic",
    "emo",
    "folk",
    "forro",
    "french",
    "funk",
    "garage",
    "german",
    "gospel",
    "goth",
    "grindcore",
    "groove",
    "grunge",
    "guitar",
    "happy",
    "hard-rock",
    "hardcore",
    "hardstyle",
    "heavy-metal",
    "hip-hop",
    "holidays",
    "honky-tonk",
    "house",
    "idm",
    "indian",
    "indie",
    "indie-pop",
    "industrial",
    "iranian",
    "j-dance",
    "j-idol",
    "j-pop",
    "j-rock",
    "jazz",
    "k-pop",
    "kids",
    "latin",
    "latino",
    "malay",
    "mandopop",
    "metal",
    "metal-misc",
    "metalcore",
    "minimal-techno",
    "movies",
    "mpb",
    "new-age",
    "new-release",
    "opera",
    "pagode",
    "party",
    "philippines-opm",
    "piano",
    "pop",
    "pop-film",
    "post-dubstep",
    "power-pop",
    "progressive-house",
    "psych-rock",
    "punk",
    "punk-rock",
    "r-n-b",
    "rainy-day",
    "reggae",
    "reggaeton",
    "road-trip",
    "rock",
    "rock-n-roll",
    "rockabilly",
    "romance",
    "sad",
    "salsa",
    "samba",
    "sertanejo",
    "show-tunes",
    "singer-songwriter",
    "ska",
    "sleep",
    "songwriter",
    "soul",
    "soundtracks",
    "spanish",
    "study",
    "summer",
    "swedish",
    "synth-pop",
    "tango",
    "techno",
    "trance",
    "trip-hop",
    "turkish",
    "work-out",
    "world-music"
];

let tagCount = 1;

function populateDropdown(genres) {
    $(".form-control.mt-2.genre-dropdown").each(function () {
        const select = $(this);
        select.empty(); // Clear current options
        select.append($("<option>", { value: "", text: "Select a genre..." }));
        genres.forEach((genre) => {
            select.append($("<option>", { value: genre, text: genre }));
        });
    });
}

populateDropdown(genresArray);

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
                    const artworkReq = {
                        method: "GET",
                        url: `/api/music/spotify/artwork?album=${item.type === "album" ? item._id : item.albumId}`
                    };
                    $.ajax(artworkReq).always((resOrErr) => {
                        // can be either of the two, so we check for our data first
                        // begin to generate html for each catalog item (will be radio buttons)
                        const newOption = $(`
                        <div class="form-check">
                            <input required type="radio" id="${item._id}" value="${item._id}" content-type="${item.type}" name="musicContentId" class="form-check-input">
                            <label for="${item._id}" class="form-check-label">
                                <img class="apiThumbnail" alt="${item.name} album artwork thumbnail" src="${
                                    Object.keys(resOrErr).includes("success") &&
                                    resOrErr.url !== null // if request was successful and artwork exists...
                                        ? resOrErr.url // ...then use it!
                                        : "" // empty string otherwise
                                }"> 
                                <br>
                                <p class="text-body-emphasis">${item.name} (${item.type})</p>
                                <p class="text-body-secondary">${item.artists}</p>
                            </label>
                        </div>
                        `);
                        $("#contentSelector").append(newOption); // add the playlist html to the div
                    });
                });
                $("#contentLoading").attr("hidden", true);
                $(".spinner-border").attr("hidden", true);
                $("#contentSelector").removeAttr("hidden");
            },
            (responseError) => {
                $("#error").html(`
                    <p class="font-monospace">You don't seem to have any accounts connected. Add one in your profile settings.</p>
                    <a href="/auth/spotify" role="button" class="spColor btn btn-success">Connect to Spotify</a>
                `);
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
    $('input[name="musicContentType"]').off(); // remove all event handlers from the buttons (otherwise they start to stack lol)

    $('input[name="musicContentType"]').on("change", (event) => {
        // on change of the musicContentType radio buttons...
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
            // Allow for tag selection
            $(".tag-label").removeAttr("hidden");
            $("#customTags").removeAttr("hidden");

            if (tagCount < 3) {
                $("#addTagButton").removeAttr("hidden");
            }

            $("#addTagButton").click(function (event) {
                event.preventDefault();

                if (tagCount < 3) {
                    tagCount++;
                    $(`#customTag${tagCount}`).removeAttr("hidden");
                }

                // Disable the button if the maximum number of tags is reached
                if (tagCount === 3) {
                    $("#addTagButton").attr("hidden", true);
                }
            });

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
                                <input required type="radio" id="${pl._id}" value="${pl._id}" content-type="playlist" name="musicContentId" class="form-check-input">
                                <label for="${pl._id}" class="form-check-label">
                                    <img class="apiThumbnail" alt="${pl.name} playlist thumbnail" src="${!pl.thumbnailURL ? "" : pl.thumbnailURL}">
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
                    if (responseError.responseJSON.notConnected) {
                        $("#error").html(`
                            <p class="font-monospace">You don't seem to have any accounts connected. Add one in your profile settings.</p>
                            <a href="/auth/spotify" role="button" class="spColor btn btn-success">Connect to Spotify</a>
                        `);
                    } else {
                        $("#error").html(`
                            <p>There was an error fetching your playlists. Please try again.</p>
                            <p>(Error message: ${responseError.responseJSON.errmsg})</p>
                        `);
                    }
                    $("#error").removeAttr("hidden");
                    $("#contentLoading").attr("hidden", true);
                    $(".spinner-border").attr("hidden", true);
                }
            );
        } else if (currChecked === "catalog") {
            $("#searchCatalogContainer").removeAttr("hidden");
            $("#contentLoading").attr("hidden", true);
            $(".spinner-border").attr("hidden", true);
            $(`#customTag1`).val("");
            $(`#customTag2`).val("");
            $(`#customTag3`).val("");

            // Hide the tag options if it isn't already hidden
            if (!$(".tag-label").attr("hidden")) {
                $(".tag-label").attr("hidden", true);
            }

            if (!$(".tag-insert").attr("hidden")) {
                $(".tag-insert").attr("hidden", true);
            }

            if (!$("#addTagButton").attr("hidden")) {
                $("#addTagButton").attr("hidden", true);
            }
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

    $('input[name="musicContentType"]:checked').trigger("change"); // trigger to start loading content
});

$("#postModal").on("hidden.bs.modal", (event) => {
    // when the modal is closed...
    const innerText = $("#textContentInner").val().trim();
    $("#textContentOuter").val(innerText); // set the value of the input area to be whatever the user was typing before

    // now, reset all of the fields

    for (let i = 1; i <= 3; i++) {
        if (i !== 1) {
            $(`#customTag${i}`).attr("hidden", true);
        }
    }

    tagCount = 1;

    $("#addTagButton").removeAttr("hidden");

    $("#contentLoading").removeAttr("hidden");
    $(".spinner-border").removeAttr("hidden");

    $("#error").html("");
    $("#error").attr("hidden", true);

    $("#contentSelector").html("");
    $("#contentSelector").attr("hidden", true);
});
