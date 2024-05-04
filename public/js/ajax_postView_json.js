let newCommentForm = $("#newComment"),
    commentArea = $("#commentArea"),
    textComment = $("#textComment"),
    idUrl = $("div").first().attr("id"),
    likeButton = $("#likeButton"),
    likes = $(".likes");

/**
 * given a comment's id, returns an event callback for that comment to handle liking/unliking
 */
const likeCommentEvent = (commentId) => {
    return (event) => {
        event.preventDefault();
        let requestConfig = {
            method: "POST",
            url: "/api/comments/like",
            contentType: "application/json",
            data: JSON.stringify({
                idUrl: commentId
            })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            const commentLikeCount = $(`.likes_${commentId}`);
            console.log(responseMessage);
            if (responseMessage.liked) {
                const curLikes = (
                    parseInt(commentLikeCount.text().split(" ")[0]) + 1
                ).toString();
                if (curLikes == 1) {
                    commentLikeCount.text(`${curLikes} Like`);
                } else {
                    commentLikeCount.text(`${curLikes} Likes`);
                }
            } else {
                const curLikes = (
                    parseInt(commentLikeCount.text().split(" ")[0]) - 1
                ).toString();
                if (curLikes == 1) {
                    commentLikeCount.text(`${curLikes} Like`);
                } else {
                    commentLikeCount.text(`${curLikes} Likes`);
                }
            }
        });
    };
};

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
                responseMessage.addedComment.createTime = new Date(
                    responseMessage.addedComment.createTime * 1000
                )
                    .toISOString()
                    .split("T")[0];
                let ele = $(`
                <div class="card mx-5 my-4" id="${responseMessage.addedComment._id}">
                    <div class="card-body">
                        <h5 class="card-title text-body-emphasis">${responseMessage.addedComment.authorUsername}</h5>
                        <h6 class="card-subtitle mb-2">${responseMessage.addedComment.createTime}</h6>

                        <input type="button" value="Like" id="likeButton_${responseMessage.addedComment._id}">
                        <p class="likes_${responseMessage.addedComment._id}">0 Likes</p>
                
                        <p class="card-text">${responseMessage.addedComment.textContent}</p>
                    </div>
                </div>
                `);
                commentArea.append(ele);
                textComment.val(""); // clear the input value...

                $(`#likeButton_${responseMessage.addedComment._id}`).click(
                    likeCommentEvent(responseMessage.addedComment._id)
                ); // add an event handler to the like button
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
            const curLikes = (
                parseInt(likes.text().split(" ")[0]) - 1
            ).toString();
            if (curLikes == 1) {
                likes.text(`${curLikes} Like`);
            } else {
                likes.text(`${curLikes} Likes`);
            }
        }
    });
});

$(document).ready((event) => {
    // when document is finished loading, add event handlers to all of the rendered comments
    const commentIds = $("#commentArea")
        .children()
        .map(function () {
            return this.id;
        })
        .get(); // get all comment ids on the page...
    commentIds.forEach((id) => {
        $(`#likeButton_${id}`).click(likeCommentEvent(id)); // add an event handler to the like button
    });
});
