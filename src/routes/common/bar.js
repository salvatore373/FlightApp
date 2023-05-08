function getCookieValue(cookieName) {
    const cookieString = document.cookie;
    const cookies = cookieString.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(cookieName + '=')) {
            return cookie.substring(cookieName.length + 1);
        }
    }
    return null;
}

//localStorage.setItem('authenticated', 'true');//per settare la navbar
const nameValue = getCookieValue('nameUser');//prendo il nome
const logged = getCookieValue("logged") === 'true'
if (logged) {
    localStorage.setItem("authenticated", "true")
} else {
    localStorage.setItem("authenticated", "false")//l'utente ha effettuato l'accesso con google
}
//  const photoGmail = getCookieValue("photoUser")//prendo la foto dell'account google
//  console.log(photoGmail)
//  if(document.getElementById("profileImage") !== undefined){
//    document.getElementById("profileImage").src = photoGmail
//  }


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

            // Set the User's name and profile image
            let imgSrc = decodeURIComponent(getCookieValue('photoUser'));
            if(imgSrc === 'null') imgSrc = '/assets/icons/user.png';
            document.getElementById('profileImage').src = imgSrc;
            let name = nameValue;
            if(nameValue === null) name = localStorage.getItem('nameUser');
            document.getElementById('user-name').textContent = name;

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