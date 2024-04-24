if ($("#error").is(":hidden") && $("#error").html().length > 0) {
    // if the page is re-rendered and has error content already, then un-hide it
    $("#error").removeAttr("hidden");
}

$("#login").submit((event) => {
    let error = ""; // single string, we don't want to give any information about what is wrong for login

    const username = $("#username").val().trim().toLowerCase(); // case-insensitive
    if (username.length < 5 || username.length > 25) {
        error = "Invalid login credentials";
    }
    if (username.match(/\W/g) !== null) {
        // \W = negation of \w (allowed alphanumeric characters + underscore)
        error = "Invalid login credentials";
    }

    const invalidPasswordChars = /[^\w*&%$#@!-]/g; // matches anything not in this character class
    const specialChars = /[_*&%$#@!-]/g;
    const password = $("#password").val().trim(); // case-sensitive
    if (password.length < 8) {
        error = "Invalid login credentials";
    }
    if (password.match(invalidPasswordChars) !== null) {
        error = "Invalid login credentials";
    }
    if (
        password.match(specialChars) === null || // at least one special char
        password.match(/\d/g) === null || // at least one number
        password.match(/[A-Z]/g) === null || // at least one uppercase letter
        password.match(/[a-z]/g) === null // at least one lowercase letter
    ) {
        // if any of the following matches are null, password is invalid
        error = "Invalid login credentials";
    }

    if (error.length !== 0) {
        // render errors and prevent form submission, if there were any
        event.preventDefault();

        $("#error").removeAttr("hidden");
        $("#error").html(error);
    }
});
