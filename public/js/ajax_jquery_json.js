(function ($) {
    let newPostForm = $("#newPostForm"),
        newPostText = $("#post"),
        feedArea = $("#feedArea");

    let requestConfig = {
        method: "GET",
        url: "/api/post/json"
    };

    $.ajax(requestConfig).then(function (responseMessage) {
        // console.log(responseMessage);
        responseMessage.map((feedPost) => {
            console.log(feedPost);
            let ele = $(
                `<div class='feed-post'>
                <h1>${feedPost.authorUsername}</h1>
                <p>${feedPost.textContent}</p>
                <p>Likes: ${feedPost.likes.length}</p>
                </div>`
            );
            feedArea.append(ele);
        });
    });

    newPostForm.submit(function (event) {
        event.preventDefault();
        let newPost = newPostText.val();
        if (newPost) {
            let requestConfig = {
                method: "POST",
                url: "/api/post/json",
                contentType: "application/json",
                data: JSON.stringify({
                    post: newPost
                })
            };

            $.ajax(requestConfig).then(function (responseMessage) {
                let ele = $(
                    `<div class='feed-post'>
                    <h1>${responseMessage.user}</h1>
                    <p>${responseMessage.post}</p>
                    </div>`
                );
                feedArea.prepend(ele);
                newPostText.val("");
                newPostText.focus();
            });
        }
    });
})(window.jQuery);
