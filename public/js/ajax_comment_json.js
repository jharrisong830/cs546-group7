let newCommentForm = $("#newComment"),
    commentArea = $("#commentArea"),
    textComment = $("#textComment"),
    idUrl = $("div").first().attr("id");

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
            //console.log(responseMessage.addedComment);
            if (!responseMessage.success) {
                const postRenderError = $(
                    `<div class='renderError'>
                    <h1>Could not render comments </h1>
                    </div>`
                );
                commentArea.append(postRenderError);
            } else {
                let ele = $(
                    `<div class="card mx-5 my-4">
                    <div class="card-body">
                        <h5 class="card-title text-body-emphasis">${responseMessage.addedComment.authorId}</h5>
                        <h6 class="card-subtitle mb-2">${responseMessage.addedComment.createTime}</h6>
    
                        <p class="card-text">${responseMessage.addedComment.textContent}</p>
                    </div>
                </div>`
                );
                commentArea.prepend(ele);
                textComment.val(""); // clear the input value...
            }
        });
    }
});
