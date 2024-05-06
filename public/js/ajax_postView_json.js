let newCommentForm = $("#newComment"),
    commentArea = $("#commentArea"),
    textComment = $("#textComment"),
    idUrl = $("div").first().attr("id"),
    likeButton = $("#likeButton"),
    commentLikeButton = $("#commentLikeButton"),
    likes = $(".likes"),
    newRatingForm = $("#newRating"),
    ratingArea = $("#ratingArea"),
    ratingText = $("#ratingText"),
    ratingValue = $("#rating");

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

$(document).on("click", "#ratingLikeButton", function (event) {
    event.preventDefault();
    const ratingId = $(this).data("rating-id");
    let requestConfig = {
        method: "POST",
        url: "/api/ratings/like",
        contentType: "application/json",
        data: JSON.stringify({
            idUrl: ratingId
        })
    };
    $.ajax(requestConfig).then(function (responseMessage) {
        const likesElement = $(`#likes-rating-${ratingId}`);
        if (responseMessage.liked) {
            const currentLikes = parseInt(likesElement.text().split(" ")[0]);
            const newLikes = currentLikes + 1;
            if (newLikes === 1) {
                likesElement.text(newLikes + " Like");
            } else {
                likesElement.text(newLikes + " Likes");
            }
        } else {
            const currentLikes = parseInt(likesElement.text().split(" ")[0]);
            const newLikes = currentLikes - 1;
            if (newLikes === 1) {
                likesElement.text(newLikes + " Like");
            } else {
                likesElement.text(newLikes + " Likes");
            }
        }
    });
});

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

                        <input type="button" value="Like" class="btn btn-sm btn-danger" id="likeButton_${responseMessage.addedComment._id}">
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

commentLikeButton.on("click", function (event) {
    event.preventDefault();

    var commentIdUrl = $(this).data("comment-id"); // idUrl for a specific comment
    var likesElement = $(`#likes-comment-` + commentIdUrl);

    console.log("Likes element is" + likesElement);

    let requestConfig = {
        method: "POST",
        url: "/api/posts/like",
        contentType: "application/json",
        data: JSON.stringify({
            idUrl: commentIdUrl,
            type: "comment"
        })
    };
    $.ajax(requestConfig).then(function (responseMessage) {
        let curLikes = 0;
        console.log(responseMessage);
        if (responseMessage.liked) {
            curLikes = (
                parseInt(likesElement.text().split(" ")[0]) + 1
            ).toString();
            if (curLikes == 1) {
                likesElement.text(`${curLikes} Like`);
            } else {
                likesElement.text(`${curLikes} Likes`);
            }
        } else {
            const curLikes = (
                parseInt(likesElement.text().split(" ")[0]) - 1
            ).toString();
            if (curLikes == 1) {
                likesElement.text(`${curLikes} Like`);
            } else {
                likesElement.text(`${curLikes} Likes`);
            }
        }
    });
});

$('.star-rating input[type="radio"]').change(function () {
    // Gets the star value and sets the dropdown value to it
    const starValue = $(this).val();
    $("#rating").val(starValue);
});

newRatingForm.submit((event) => {
    event.preventDefault();
    let newRating = ratingText.val();
    let selectedRating = $('input[name="rating"]:checked').val();
    //console.log(selectedRating);

    if (newRating) {
        let requestConfig = {
            method: "POST",
            url: "/api/ratings",
            contentType: "application/json",
            data: JSON.stringify({
                textContent: newRating,
                ratingNumber: selectedRating, // This sends the star rating (1-5)
                idUrl: idUrl
            })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            console.log(responseMessage);
            if (!responseMessage.success) {
                if (responseMessage.message) {
                    // make an alert on the page with the message
                    alert(responseMessage.message);
                } else {
                    const postRenderError = $(
                        `<div class='renderError'>
                        <h1>Could not render ratings </h1>
                        </div>`
                    );
                    ratingArea.append(postRenderError);
                }
            } else {
                responseMessage.addedRating.createTime = new Date(
                    responseMessage.addedRating.createTime * 1000
                )
                    .toISOString()
                    .split("T")[0];
                let ele = $(`
                <div class="card mx-5 my-4">
                    <div class="card-body">
                        <h5 class="card-title text-body-emphasis">${responseMessage.addedRating.authorUsername}</h5>
                        <h6 class="card-subtitle mb-2">${responseMessage.addedRating.createTime}</h6>
                
                        <p class="card-text">${responseMessage.addedRating.textContent}</p>
                        <p>Rating: ${responseMessage.addedRating.starRating}/5 Stars</p>
                    </div>
                </div>
                `);
                ratingArea.prepend(ele);
                ratingText.val(""); // clear the input value
                $("input#star5").prop("checked", true); // Reset to 5 stars
                $("#rating").val("5"); // Set the select to "Perfect!"
            }
        });
    }
});
