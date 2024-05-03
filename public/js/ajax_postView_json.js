let newCommentForm = $("#newComment"),
    commentArea = $("#commentArea"),
    textComment = $("#textComment"),
    idUrl = $("div").first().attr("id"),
    likeButton = $("#likeButton"),
    likes = $(".likes");

newCommentForm.submit((event) => {
    event.preventDefault();
    let newComment = textComment.val();
    if (newComment) {
        let requestConfig = {
            method: "POST",
            url: "/api/comments",
            contentType: "application/json",
            data: JSON.stringify({
                textContent: newComment,
                idUrl: idUrl
            })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            console.log(responseMessage);
            if (!responseMessage.success) {
                const postRenderError = $(
                    `<div class='renderError'>
                    <h1>Could not render comments </h1>
                    </div>`
                );
                commentArea.append(postRenderError);
            } else {
                responseMessage.addedComment.createTime = new Date(responseMessage.addedComment.createTime * 1000)
                    .toISOString()
                    .split("T")[0];
                let ele = $(`
                <div class="card mx-5 my-4">
                    <div class="card-body">
                        <h5 class="card-title text-body-emphasis">${responseMessage.addedComment.authorUsername}</h5>
                        <h6 class="card-subtitle mb-2">${responseMessage.addedComment.createTime}</h6>
                
                        <p class="card-text">${responseMessage.addedComment.textContent}</p>
                    </div>
                </div>
                `);
                commentArea.prepend(ele);
                textComment.val(""); // clear the input value...
            }
        });
    }
});

textComment.keyup((event) => {
    // event handler for enabling the comment button (runs whenever something is typed)
    const commentButton = $("#commentButton");
    if (textComment.val().trim().length === 0) {
        commentButton.attr("disabled", true);
    } else {
        commentButton.removeAttr("disabled");
    }
});

likeButton.on("click", function (event) {
    event.preventDefault();
    let requestConfig = {
        method: "POST",
        url: "/api/posts/like",
        contentType: "application/json",
        data: JSON.stringify({
            idUrl: idUrl
        })
    };
    $.ajax(requestConfig).then(function (responseMessage) {
        let curLikes = 0;
        console.log(responseMessage);
        if (responseMessage.liked) {
            curLikes = (parseInt(likes.text().split(" ")[0]) + 1).toString();
            if (curLikes == 1) {
                likes.text(`${curLikes} Like`);
            } else {
                likes.text(`${curLikes} Likes`);
            }
        } else {
            const curLikes = (parseInt(likes.text().split(" ")[0]) - 1).toString();
            if (curLikes == 1) {
                likes.text(`${curLikes} Like`);
            } else {
                likes.text(`${curLikes} Likes`);
            }
        }

    });
});
