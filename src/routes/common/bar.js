/**
 * Inserts the navigation bar in the element of the page with ID 'navbar'.
 *
 * To correctly load the NavBar you have to add onload="loadBar();" to the body tag
 * and a <div id="navbar"></div> at the top of the body tab.
 */
function loadBar() {
    let container = document.getElementById('navbar');
    fetch('/src/routes/common/bar.html').then(res1 => {
        res1.text().then(res => {
            container.innerHTML = res;

            adaptToAuthentication();
        });
    });
}

function UnauthloginOrSignup(login, signup) {
    let f = document.querySelector("#unauthForm");
    if (login == true) {
        f.action = "http://localhost:3000/api/sign-in/";
    }
    if (signup == true) {
        f.action = "http://localhost:3000/api/sign-up/";
    }
}

/**
 * Adapts the navigation bar to the user's authentication state
 */
function adaptToAuthentication() {
    let authenticated = localStorage.getItem('authenticated') === 'true';
    if (authenticated) {
        let a = document.getElementById("unauthForm");
        document.getElementById("unauthForm").style.display = 'none'
    } else {
        document.getElementById("authForm").style.display = 'none'
    }
}

function logOut() {
    localStorage.setItem('authenticated', 'false');
    window.location.href = "/logout";
}