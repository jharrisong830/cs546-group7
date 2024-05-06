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

document.addEventListener("DOMContentLoaded", function () {
    const subtitleElements = document.querySelectorAll("h6.card-subtitle.mb-2");

    subtitleElements.forEach(function (element) {
        const unixTimestamp = parseInt(element.textContent.trim());
        const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
        const formattedDate = date.toISOString().substring(0, 10); // Format YYYY-MM-DD
        element.textContent = formattedDate;
    });
});
