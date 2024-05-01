let postArea = $("#postArea");

let requestConfig = {
    method: "GET",
    url: "/api/posts/user"
};

$.ajax(requestConfig).then(function (responseMessage) {
    if (!responseMessage) {
        const postRenderError = $(
            `<div class='renderError'>
            <h1>Could not render feed posts </h1>
            </div>`
        );
        postArea.append(postRenderError);
    } else {
        responseMessage.userPosts.forEach((userPost) => {
            userPost.lastUpdated = new Date(userPost.lastUpdated * 1000)
                .toISOString()
                .split("T")[0];
            const postCard = $(`
            <div class="card mx-5 my-4">
                    <div class="card-body">
                        <h5 class="card-title text-body-emphasis">${userPost.authorUsername}</h5>
                        <h6 class="card-subtitle mb-2">${userPost.lastUpdated}</h6>
    
                        <p class="card-text">${userPost.textContent}</p>

                        <iframe style="border-radius:12px" src="https://open.spotify.com/embed/${userPost.musicContent.type === "song" ? "track" : userPost.musicContent.type}/${userPost.musicContent._id}?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                        <a href="/post/${userPost._id}" role="button" class="btn btn-outline-dark btn-sm stretched-link">View Post</a>
                    </div>
                </div>
            `);
            postArea.append(postCard);
        });
    }
});
