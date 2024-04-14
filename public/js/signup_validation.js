import moment from moment


$('#signup').submit((event) => {
    event.preventDefault();
    const userMonth =  $('#user_month').find(":selected").val();
    const userDay = $('#user_day').find(":selected").val();
    const userYear = $('#user_year').find(":selected").val();
    const userBirth = `${userMonth}/${userDay}/${userYear}`;
    if (!moment(userBirth, 'MM/DD/YYYY').isValid()) {
        //add error
    }
    var yearsOld = moment().diff(userBirth, 'years');
    if (yearsOld < 13) {
        //add error
    }
    /*finish adding client-side validation here */
})