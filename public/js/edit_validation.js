if ($("#error").is(":hidden") && $("#error").html().length > 0) {
    // if the page is re-rendered and has error content already, then un-hide it
    $("#error").removeAttr("hidden");
}

$("#editUser").submit((event) => {
    const username = $("#username").val().trim().toLowerCase(); // case-insensitive
    if (username.length !== 0) {
        if (username.length < 5 || username.length > 25) {
            errors.push(
                "Invalid username. Length must be at least 5 characters and no more than 25 characters"
            );
        }
        if (username.match(/\W/g) !== null) {
            // \W = negation of \w (allowed alphanumeric characters + underscore)
            errors.push(
                "Invalid username. Must contain only alphanumeric characters and/or underscores"
            );
        }
    }

    const invalidPasswordChars = /[^\w*&%$#@!-]/g; // matches anything not in this character class
    const specialChars = /[_*&%$#@!-]/g;
    const password = $("#password").val().trim(); // case-sensitive
    if (password.length !== 0) {
        // only validate if new password is provided
        if (password.length < 8) {
            errors.push(
                "Invalid password. Length must be at least 8 characters"
            );
        }
        if (password.match(invalidPasswordChars) !== null) {
            errors.push(
                "Invalid password. Must only contain alphanumeric characters and/or the following special characters: [_, *, &, %, $, #, @, !, -]"
            );
        }
        if (
            password.match(specialChars) === null || // at least one special char
            password.match(/\d/g) === null || // at least one number
            password.match(/[A-Z]/g) === null || // at least one uppercase letter
            password.match(/[a-z]/g) === null // at least one lowercase letter
        ) {
            // if any of the following matches are null, password is invalid
            errors.push(
                "Invalid password. Password must contain at least one of each: uppercase letter, lowercase letter, number, special character in [_, *, &, %, $, #, @, !, -]"
            );
        }

        const confirmPassword = $("#confirmPassword").val().trim();
        if (password !== confirmPassword) {
            errors.push("Password and its confirmation do not match!");
        }
    }

    const name = $("#name").val().trim();
    if (name !== undefined && name !== null && name.length > 30) {
        errors.push("Invalid display name. Length be less than 30 characters");
    }

    const publicProfile = $('input[name="publicProfile"]:checked')
        .val()
        .trim()
        .toLowerCase();
    if (publicProfile !== "public" && publicProfile !== "private") {
        errors.push('Profile setting must be in either ["public", "private"]');
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
