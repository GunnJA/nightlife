let $nextButt = $("#nextButt");
let $logButt = $("#logButt");
let $outButt = $("#outButt");
let $signButt = $("#signButt");
let $userField = $("#username");
let $passField = $("#password");
let $passDiv = $("#passwordDiv");
let $signForm = $("#signForm");

function userIn() {
    $passDiv.toggle();
    $nextButt.toggle();
    $userField.prop("disabled", true);
}

function loginSuccess(user) {
    $signForm.toggle();
    $outButt.toggle();
    $userField.val('');
    $passField.val('');
    $passDiv.toggle();
    $("body").prepend(`<p id="loggedIn">(logged in as ${user})</p>`);
}

function logoutSuccess() {
    $signForm.toggle();
    $("#loggedIn").remove();
    $outButt.toggle();
    $signButt.hide();
    $logButt.hide();
    $nextButt.toggle();
    $userField.prop("disabled", false);
}

$nextButt.on('click', function(event) {
    event.preventDefault();
    let userEntry = $userField.val();
    $.get(`/usercheck?user=${userEntry}`, function(userStatus) {
        if (userStatus.user === "new") {
            userIn();
            $signButt.toggle();
        } else {
            userIn();
            $logButt.toggle();
        }
    });
});

$signButt.on('click', function(event) {
    event.preventDefault();
    let userEntry = $userField.val();
    let passEntry = $passField.val();
    $.get(`/signup?user=${userEntry}&pass=${passEntry}`, function(obj) {
        if (obj.loggedIn === true) {
            loginSuccess(userEntry);
        } else {
            console.log("signup error");
        }
    });
});

$logButt.on('click', function(event) {
    event.preventDefault();
    let userEntry = $userField.val();
    let passEntry = $passField.val();
    $.get(`/login?user=${userEntry}&pass=${passEntry}`, function(obj) {
        if (obj.loggedIn === true) {
            loginSuccess(userEntry);
        } else {
            window.alert("incorrect password");
            $passfield.val("");
            console.log("login error");
        }
    });
});

$outButt.on('click', function(event) {
    event.preventDefault();
    $.get('/logout', function(obj) {
        if (obj.loggedIn === false) {
            logoutSuccess();
        } else {
            console.log("logout error");
        }
    });
});