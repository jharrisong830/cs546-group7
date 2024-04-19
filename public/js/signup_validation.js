
$('#signup').submit((event) => {
    event.preventDefault();
    const userMonth =  $('#user_month').find(":selected").val();
    if (userMonth.length < 1) {
        $('#monthError').show();
        $('#monthError').html('Please select a month');
        $('#signup').trigger('reset');
    } else {
        $('#monthError').hide();
    }
    const userDay = $('#user_day').find(":selected").val();
    if (userDay.length < 1) {
        $('#dayError').show();
        $('#dayError').html('Please select a day');
        $('#signup').trigger('reset');
    } else {
        $('#dayError').hide();
    }
    const userYear = $('#user_year').find(":selected").val();
    if (userYear.length < 1) {
        $('#yearError').show();
        $('#yearError').html('Please select a year');
        $('#signup').trigger('reset');
    } else {
        $('#yearError').hide();
    }
    const userBirth = `${userYear}/${userMonth}/${userDay}`;
    const birthObj = new Date(userBirth);
    if (isNaN(birthObj)) {
        //add error
        $('#birthError').show();
        $('#birthError').html('Birthday is an invalid date');
        $('#signup').trigger('reset');
    }
    var today = new Date();
    var userAge = today.getFullYear() - birthObj.getFullYear();
    var months = today.getMonth() - birthObj.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birthObj.getDate())) {
        userAge--;
    if (userAge < 13) {

        $('#birthError').show();
        $('#birthError').html('You must be at least 13 years old to create an account');
        $('#signup').trigger('reset');
    }
    const username =  $('#userName').val().trim();
    if (!(/\w/.test(username))) {
        $('#usernameError').show();
        $('#usernameError').html('Username can only have letters, numbers, and underscores');
        $('#signup').trigger('reset');
    }
    if (username.length <5 || username.length >25 ) {
        $('#usernameError').show();
        $('#usernameError').html('Username length must be between 5-25 chars');
        $('#signup').trigger('reset');
    }
    username = username.toLowerCase();
    const password =  $('#userPassword').val().trim();
    if (!(/[\w*&%$#@!]/).test(password)) {
        $('#passwordError').show();
        $('#passwordError').html('Password can only have letters, numbers, underscores, and special chars [, *, &, %, $, #, @, !, ]');
        $('#signup').trigger('reset');
    }
    if (password.length < 8) {
        $('#passwordError').show();
        $('#passwordError').html('Pasword must have at least 8 characters');
        $('#signup').trigger('reset');
    }
    if (password == password.toLowerCase()) {
        $('#passwordError').show();
        $('#passwordError').html('Pasword must have at least one uppercase char');
        $('#signup').trigger('reset');
    }
    if (password == password.toUpperCase()) {
        $('#passwordError').show();
        $('#passwordError').html('Pasword must have at least one lowercase char');
        $('#signup').trigger('reset');
    }
    if (!/\d/.test(password)) {
        $('#passwordError').show();
        $('#passwordError').html('Pasword must have at least one number');
        $('#signup').trigger('reset');
    }
    if (!/[*&%$#@!]/.test(reg.password)) {
        $('#passwordError').show();
        $('#passwordError').html('Pasword must have at least one special char ([, *, &, %, $, #, @, !, ])');
        $('#signup').trigger('reset');
    }
    const displayName =  $('#displayName').val().trim();
    if (displayName.length > 30) {
        $('#displayError').show();
        $('#displayError').html('Display name must be less than 30 chars');
        $('#signup').trigger('reset');
    }
    if (displayName.length < 1) {
        displayName = username;
    }
}})
