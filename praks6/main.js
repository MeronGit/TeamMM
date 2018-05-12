
function toggleFrustrationsList() {
    let el = document.getElementById("frustrationsList");
    if (el.style.display == 'none') {
        el.style.display = 'block';
    } else {
        el.style.display = 'none';
    }
}

function logIn() {
    let emailEl = document.getElementById("email");
    let passwordEl = document.getElementById("password");
    if (emailEl.value == "asd@asd.ee" && passwordEl.value == "asd") {
        if (location.search == '?1') {
            location.search = '?2';
        }  else if (location.search == '?2') {
            location.search = '?success';
        } else {
            location.search = '?1';
        }
    } else {
        location.search = '';
    }
}

if (location.search == '?1') {
    document.body.className = 'attemptTwo';
} else if (location.search == '?2') {
    document.body.className = 'attemptThree';
} else if (location.search == '?success') {
    document.body.className = 'success';
}
