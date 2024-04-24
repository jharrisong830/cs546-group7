if ($("#error").is(":hidden") && $("#error").html().length > 0) {
    // if the page is re-rendered and has error content already, then un-hide it
    $("#error").removeAttr("hidden");
}

const today = new Date().toISOString().split("T")[0]; // get current date as string in form of 'YYYY-MM-DD'

$("#dateOfBirth").attr({ max: today }); // dynamically set max date value to today

$("#signup").submit((event) => {
    let errors = [];

    const dobArray = $("#dateOfBirth")
        .val()
        .trim()
        .split("-")
        .map((num) => parseInt(num)); // [YYYY, MM, DD]
    if (!Array.isArray(dobArray) || dobArray.length !== 3) {
        errors.push("Invalid date supplied");
    } else {
        const [year, month, day] = dobArray;
        if (
            // date validation, error triggered if any of the following are true
            year < 0 ||
            month < 0 ||
            month > 11 || // why tf is it month index lmao
            day < 1 ||
            day > 31 || // day must be in [1, 31] or else immediately invalid
            (month === 1 && day > (year % 4 === 0 ? 29 : 28)) || // feb, year % 4 -> leap year, max 29 days, else 28
            ([3, 5, 8, 10].includes(month) && day > 30) // april, june, september, november only have 30 days
        ) {
            errors.push("Invalid date supplied");
        } else {
            const dateOfBirth = new Date(year, month - 1, day);
            const today = new Date();
            if (
                today.getTime() - dateOfBirth.getTime() <
                3600 * 24 * 365 * 13 * 1000
            ) {
                // 3600 s/hr * 24 hrs/d * 365 d/yr * 13 yrs * 1000 for s -> ms = 13 years in milliseconds
                errors.push(
                    "You must be at least 13 years of age to register for an account"
                );
            }
        }
    }

    const username = $("#username").val().trim().toLowerCase(); // case-insensitive
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

    const invalidPasswordChars = /[^\w*&%$#@!-]/g; // matches anything not in this character class
    const specialChars = /[_*&%$#@!-]/g;
    const password = $("#password").val().trim(); // case-sensitive
    if (password.length < 8) {
        errors.push("Invalid password. Length must be at least 8 characters");
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

    const name = $("#name").val().trim();
    if (name !== undefined && name !== null && name.length > 30) {
        errors.push("Invalid display name. Length be less than 30 characters");
    }

    const publicProfile = $('input[name="publicProfile"]:checked')
        .val()
        .trim()
        .toLowerCase(); // get the checked button value
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
