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
        responseMessage.forEach((feedPost) => {
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
