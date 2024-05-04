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

commentLikeButton.on("click", function (event) {
    event.preventDefault();

    var commentIdUrl = $(this).data('comment-id'); // idUrl for a specific comment
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
            curLikes = (parseInt(likesElement.text().split(" ")[0]) + 1).toString();
            if (curLikes == 1) {
                likesElement.text(`${curLikes} Like`);
            } else {
                likesElement.text(`${curLikes} Likes`);
            }
        } 
        else {
            const curLikes = (parseInt(likesElement.text().split(" ")[0]) - 1).toString();
            if (curLikes == 1) {
                likesElement.text(`${curLikes} Like`);
            } else {
                likesElement.text(`${curLikes} Likes`);
            }
        }

    });
});

$('.star-rating input[type="radio"]').change(function() {
    // Gets the star value and sets the dropdown value to it
    const starValue = $(this).val();
    $("#rating").val(starValue);
});

newRatingForm.submit((event) => {
    event.preventDefault();
    let newRating = ratingText.val();
    let selectedRating = $('input[name="rating"]:checked').val();
    console.log(selectedRating);

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
                const postRenderError = $(
                    `<div class='renderError'>
                    <h1>Could not render ratings </h1>
                    </div>`
                );
                ratingArea.append(postRenderError);
            } 
            else {
                responseMessage.addedRating.createTime = new Date(responseMessage.addedRating.createTime * 1000)
                    .toISOString()
                    .split("T")[0];
                let ele = $(`
                <div class="card mx-5 my-4">
                    <div class="card-body">
                        <h5 class="card-title text-body-emphasis">${responseMessage.addedRating.authorUsername}</h5>
                        <h6 class="card-subtitle mb-2">${responseMessage.addedRating.createTime}</h6>
                
                        <p class="card-text">${responseMessage.addedRating.ratingText}</p>
                        <p>Rating: ${responseMessage.addedRating.rating}/5 Stars</p>
                    </div>
                </div>
                `);
                ratingArea.prepend(ele);
                ratingText.val(""); // clear the input value
                $('input#star5').prop('checked', true); // Reset to 5 stars
                $('#rating').val('5'); // Set the select to "Perfect!"
            }
        });
    }
});
