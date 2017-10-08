let $nextButt = $("#nextButt");
let $logButt = $("#logButt");
let $outButt = $("#outButt");
let $signButt = $("#signButt");
let $userField = $("#username");
let $passField = $("#password");
let $passDiv = $("#passwordDiv");
let $signForm = $("#signForm");
let $pollNextButt = $("#pollNextButt");
let $pollName = $("#pollName");
let $option1Input = $("#option1Input");
let $option2Input = $("#option2Input");
let $optionsDiv = $("#optionsDiv");
let $pollCreateButt = $("#pollCreateButt");
let $pollAddButt = $("#pollAddButt");
let $pollSpace = $("#pollSpace");
let $newOptionDiv = $("#newOptionDiv");
let $optionAddInput = $("#optionAddInput");

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

function optionsPop() {
    console.log("optionsPop");
    if ($option1Input.val().length >= 1 && $option2Input.val().length >= 1) {
        $pollCreateButt.prop("disabled", false);
    } else {
        $pollCreateButt.prop("disabled", true);
    }
}

function newOptionPop() {
    if ($optionAddInput.val().length >= 1 ) {
        $pollAddButt.prop("disabled", false);
    } else {
        $pollAddButt.prop("disabled", true);
    }
}

function modOption(pollName,option) {
    return new Promise(function(resolve,reject) {
        $.post(`/modify?name=${pollName}&option=${option}`, function(response) {
            if (response.error) {
                window.alert(response.error);
            } else {
                resolve(response);
            }
        });
    });
}

function pollObjDisplay(obj) {
    let newHTML = `<ul id="poll">${obj.name}<br>`;
    let itemID = 0;
    $.each(obj.options, function(key, value) {
        itemID += 1;
        newHTML += `<li id="${itemID}li"><button id="${itemID}Butt">Vote</button>${key} - ${value}</li>`
    });
    $pollSpace.empty();
    $pollSpace.append(newHTML);
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

$pollNextButt.on('click', function(event) {
    event.preventDefault();
    if ($pollName.val().length > 0) {
        let pollName = $pollName.val();
        $.get(`/new?name=${pollName}`, function(valid) {
            if (valid.existing) {
                window.alert(`${pollName} already exists, choose another name`);
            } else {
                $optionsDiv.toggle();
            }
        });
    } else {
        window.alert("Need to name your poll son.")
    }
});

$(".option").on("change",optionsPop);
$(".option").on("change",newOptionPop);

$pollCreateButt.on('click', function(event) {
    event.preventDefault();
    let pollName = $pollName.val();
    let option1 = $option1Input.val();
    let option2 = $option2Input.val();
    modOption(pollName,option1).then(function() {
        modOption(pollName,option2).then(function(obj) {
            pollObjDisplay(obj);
         });
    });
    $newOptionDiv.toggle();
});

$pollAddButt.on('click', function(event) {
    event.preventDefault();
    let pollName = $pollName.val();
    let option = $optionAddInput.val();
    modOption(pollName,option).then(function(obj) {
            pollObjDisplay(obj);
    });
});
