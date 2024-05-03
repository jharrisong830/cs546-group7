(function ($) {
    let newPostForm = $("#newPostForm"),
        newPostText = $("#textContentInner"),
        feedArea = $("#feedArea");

    let requestConfig = {
        method: "GET",
        url: "/api/posts/feed"
    };

    $.ajax(requestConfig).then(function (responseMessage) {
        if (!responseMessage) {
            // TODO: show error here
            const postRenderError = $(
                `<div class='renderError'>
                <h1>Could not render feed posts </h1>
                </div>`
            );
            feedArea.append(postRenderError);
        } else {
            responseMessage.feedPosts.forEach((feedPost) => {
                feedPost.lastUpdated = new Date(feedPost.lastUpdated * 1000)
                    .toISOString()
                    .split("T")[0];
                const postCard = $(`
                <div class="card mx-5 my-4">
                        <div class="card-body">
                            <h5 class="card-title text-body-emphasis">${feedPost.authorUsername}</h5>
                            <h6 class="card-subtitle mb-2">${feedPost.lastUpdated}</h6>
        
                            <p class="card-text">${feedPost.textContent}</p>

                            <iframe style="border-radius:12px" src="https://open.spotify.com/embed/${feedPost.musicContent.type}/${feedPost.musicContent._id}?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                            <a href="/post/${feedPost._id}" role="button" class="btn btn-outline-dark btn-sm stretched-link">View Post</a>
                        </div>
                    </div>
                `);
                feedArea.append(postCard);
            });
        }
    });

    newPostForm.submit(function (event) {
        event.preventDefault();
        let newPost = newPostText.val();
        let musicContent = $('input[name="musicContentId"]:checked');

        let tags = [];
        for (let i = 1; i <= 3; i++) {
            let genre = $(`select[name="tag${i}"]`).val();
            tags.push(genre);
        }

        if (newPost) {
            let requestConfig = {
                method: "POST",
                url: "/api/posts",
                contentType: "application/json",
                data: JSON.stringify({
                    textContent: newPost,
                    musicContentId: musicContent.val(),
                    musicContentType: musicContent.attr("content-type"), // custom attribute for the input tag, to vary between song/album/playlist
                    tags: tags
                })
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                //console.log(responseMessage);
                if (!responseMessage.success) {
                    // TODO: display error message
                } else {
                    responseMessage.addedPost.lastUpdated = new Date(
                        responseMessage.addedPost.lastUpdated * 1000
                    )
                        .toISOString()
                        .split("T")[0];
                    let ele = $(
                        `<div class="card mx-5 my-4">
                        <div class="card-body">
                            <h5 class="card-title text-body-emphasis">${responseMessage.addedPost.authorUsername}</h5>
                            <h6 class="card-subtitle mb-2">${responseMessage.addedPost.lastUpdated}</h6>
        
                            <p class="card-text">${responseMessage.addedPost.textContent}</p>

                            <iframe style="border-radius:12px" src="https://open.spotify.com/embed/${responseMessage.addedPost.musicContent.type}/${responseMessage.addedPost.musicContent._id}?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                            <a href="/post/${responseMessage.addedPost._id}" role="button" class="btn btn-outline-dark btn-sm stretched-link">View Post</a>
                        </div>
                    </div>`
                    );
                    feedArea.prepend(ele);
                    newPostText.val(""); // clear the input value...
                    $("#postModal").modal("hide"); // ...hide bootstrap modal when done! (the .modal method should be loaded from the cdn links i think???? but it works!)
                    // newPostText.focus();
                }
            });
        }
    });
})(window.jQuery);

/*<iframe style="border-radius:12px" src="https://open.spotify.com/embed/playlist/3gBrgOKZRKfOSgKrTNWE2y?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe> */
