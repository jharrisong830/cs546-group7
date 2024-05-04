$("#requestStatus").submit((event) => {
    let errors = [];

    const acceptStatus = $("#acceptStatus").val().trim().toLowerCase();
    if (
        acceptStatus !== "" &&
        acceptStatus !== "accept" &&
        acceptStatus !== "decline"
    ) {
        errors.push(
            'Accept Status must be in either ["", "accept", "decline"]'
        );
    }

    if (errors.length !== 0) {
        // render errors and prevent form submission, if there were any
        event.preventDefault();

        let errorString = "<ul>";
        errors.forEach((err) => {
            errorString += `<li>${err}</li>`;
        });
        errorString += "</ul>";

        $("#error").removeAttr("hidden");
        $("#error").html(errorString);
    }
});
