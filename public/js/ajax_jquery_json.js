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
        } else {
            responseMessage.feedPosts.forEach((feedPost) => {
                const postCard = $(`
                <div class="card mx-5 my-4">
                    <div class="card-body">
                        <h5 class="card-title text-body-emphasis">${feedPost.authorUsername}</h5>
                        <h6 class="card-subtitle mb-2">${feedPost.lastUpdated}</h6>

                        <p class="card-text">${feedPost.textContent}</p>
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
        if (newPost) {
            let requestConfig = {
                method: "POST",
                url: "/api/posts",
                contentType: "application/json",
                data: JSON.stringify({
                    textContent: newPost,
                    musicContentId: musicContent.val(),
                    musicContentType: musicContent.attr("content-type") // custom attribute for the input tag, to vary between song/album/playlist
                })
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                if (!responseMessage.success) {
                    // TODO: display error message
                } else {
                    let ele = $(
                        `<div class="card mx-5 my-4">
                        <div class="card-body">
                            <h5 class="card-title text-body-emphasis">${responseMessage.addedPost.authorUsername}</h5>
                            <h6 class="card-subtitle mb-2">${responseMessage.addedPost.lastUpdated}</h6>
        
                            <p class="card-text">${responseMessage.addedPost.textContent}</p>
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