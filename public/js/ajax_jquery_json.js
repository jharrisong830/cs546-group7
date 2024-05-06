(function ($) {
    /**
     * given a post's id, returns an event callback for that post to handle liking/unliking
     */
    const likePostEvent = (postId) => {
        return (event) => {
            event.preventDefault();
            let requestConfig = {
                method: "POST",
                url: "/api/posts/like",
                contentType: "application/json",
                data: JSON.stringify({
                    idUrl: postId
                })
            };
            $.ajax(requestConfig).then(function (responseMessage) {
                const postLikeCount = $(`.likes_${postId}`);
                if (responseMessage.liked) {
                    const curLikes = (
                        parseInt(postLikeCount.text().split(" ")[0]) + 1
                    ).toString();
                    if (curLikes == 1) {
                        postLikeCount.text(`${curLikes} Like`);
                    } else {
                        postLikeCount.text(`${curLikes} Likes`);
                    }
                } else {
                    const curLikes = (
                        parseInt(postLikeCount.text().split(" ")[0]) - 1
                    ).toString();
                    if (curLikes == 1) {
                        postLikeCount.text(`${curLikes} Like`);
                    } else {
                        postLikeCount.text(`${curLikes} Likes`);
                    }
                }
            });
        };
    };

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
        } else if (responseMessage.feedPosts.length === 0) {
            const emptyRender = $(`
            <div class="container">
                <h5 class="lead">Seems empty... Add some friends or make a post to get started!</h5>
            </div>`);
            feedArea.append(emptyRender);
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
                        <div class="row">
                            <div class="col-4">
                                <p class="card-text">${feedPost.textContent}</p>

                                <input type="button" value="Like" class="btn btn-sm btn-danger" id="likeButton_${feedPost._id}">
                                <p class="likes_${feedPost._id}">${feedPost.likes.length} Likes</p>
                            </div>
                            <div class="col-8">
                                <iframe style="border-radius:12px" src="https://open.spotify.com/embed/${feedPost.musicContent.type}/${feedPost.musicContent._id}?utm_source=generator" height="352" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                            </div>
                        </div>

                        <a href="/post/${feedPost._id}" role="button" class="btn btn-outline-dark btn-sm">View Post</a>
                    </div>
                </div>
                `);
                feedArea.append(postCard);

                $(`#likeButton_${feedPost._id}`).click(
                    likePostEvent(feedPost._id)
                ); // add an event handler to the like button
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
                        `<div class="card mx-5 my-4" id="${responseMessage.addedPost._id}">
                        <div class="card-body">
                            <h5 class="card-title text-body-emphasis">${responseMessage.addedPost.authorUsername}</h5>
                            <h6 class="card-subtitle mb-2">${responseMessage.addedPost.lastUpdated}</h6>
        
                            <div class="row">
                                <div class="col-4">
                                    <p class="card-text">${responseMessage.addedPost.textContent}</p>

                                    <input type="button" value="Like" class="btn btn-sm btn-danger" id="likeButton_${responseMessage.addedPost._id}">
                                    <p class="likes_${responseMessage.addedPost._id}">${responseMessage.addedPost.likes.length} Likes</p>
                                </div>
                                <div class="col-8">
                                    <iframe style="border-radius:12px" src="https://open.spotify.com/embed/${responseMessage.addedPost.musicContent.type}/${responseMessage.addedPost.musicContent._id}?utm_source=generator" height="352" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                                </div>
                            </div>
                            <a href="/post/${responseMessage.addedPost._id}" role="button" class="btn btn-outline-dark btn-sm">View Post</a>
                        </div>
                    </div>`
                    );
                    feedArea.prepend(ele);
                    newPostText.val(""); // clear the input value...
                    $("#postModal").modal("hide"); // ...hide bootstrap modal when done! (the .modal method should be loaded from the cdn links i think???? but it works!)

                    $(`#likeButton_${responseMessage.addedPost._id}`).click(
                        likePostEvent(responseMessage.addedPost._id)
                    ); // add an event handler to the like button
                    // newPostText.focus();
                }
            });
        }
    });
})(window.jQuery);

/*<iframe style="border-radius:12px" src="https://open.spotify.com/embed/playlist/3gBrgOKZRKfOSgKrTNWE2y?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe> */
