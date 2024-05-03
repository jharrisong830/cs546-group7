$("#searchForm").submit((event) => {
    const searchText = $("#searchText").val().trim();
    if (searchText.length === 0) {
        $("#error").html(
            "You must enter a search term. Try searching for your favorite song!"
        );
        $("#error").removeAttr("hidden");
        event.preventDefault();
    }
});

$("#searchText").keyup((event) => {
    // dynamically enable the search button
    const submitButton = $("#submitButton");
    if ($("#searchText").val().trim().length === 0) {
        submitButton.attr("disabled", true);
    } else {
        submitButton.removeAttr("disabled");
    }
});

$(document).ready((event) => {
    // on page reload (post req.), set the button status (since we persist the search term after submit)
    const submitButton = $("#submitButton");
    if ($("#searchText").val().trim().length === 0) {
        submitButton.attr("disabled", true);
    } else {
        submitButton.removeAttr("disabled");
    }
});
