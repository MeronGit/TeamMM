
function logIn() {
    let emailInput = document.getElementById("email");
    let passwordInput = document.getElementById("password");

    if (emailInput.value == "asd@asd.ee" &&
            passwordInput.value == "asd") {
        document.body.className = "loggedIn";
    } else {
        let pog = document.getElementById("passwordOuterGroup");
        pog.className = "";
        setTimeout(function() {
            pog.className = "animated shake";
        }, 10);
    }
}
