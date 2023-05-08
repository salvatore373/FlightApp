function showPassword(){
    const pass = document.getElementById("password")
    const confpass = document.getElementById("conferma_password")
    const showButton = document.getElementById("show-password-button")

    if (pass.type === "password"){
        pass.type = "text"
        confpass.type= "text"
        showButton.textContent = "Nascondi"
    } else {
        pass.type = "password"
        confpass.type = "password"
        showButton.textContent = "Mostra"
    }

}

$(document).ready(function() {
    $('#signupForm').submit(function(event) {
      event.preventDefault();
      const nome = $('#nome').val();
      const cognome = $('#cognome').val();
      const username = $('#username').val();
      const email = $('#email').val();
      const password = $('#password').val();
      const conferma_password = $('#conferma_password').val();
      $.ajax({
        url: '/api/sign-up/',
        type: 'POST',
        data: {nome:nome, cognome:cognome, username:username, email: email, password: password, conferma_password:conferma_password},
        success: function(data) {
            if(data.code == 1000){
                $("#error-message").text("Email scorretta").show();
            }
            else if(data.code == 1001){
                $("#error-message").text("Email già presente nel DB").show();
            }
            else if(data.code == 1002){
                $("#error-message").text("Username già esistente").show();
            }
            else if(data.code == 1003){
                $("#error-message").text("password e conferma_password diverse").show();
            }
            
            if(data.code === undefined){
                localStorage.setItem('authenticated', 'true');//salvataggio lato client dello stato di autenticazione 
                localStorage.setItem('nameUser', username);
                window.location.href = "/avvenuta-iscrizione";
            }
        },
        error: function(xhr, status, error) {
        }
      });
    });
  });

function hideErrorMessage(){
    
    const emailInput = document.getElementById("email")
    emailInput.addEventListener("input",()=>{
        document.getElementById("error-message").style.display = "none"
    })

    const passInput = document.getElementById("password")
    passInput.addEventListener("input",()=>{
        document.getElementById("error-message").style.display = "none"
    })

    const usernameInput = document.getElementById("username")
    usernameInput.addEventListener("input",()=>{
        document.getElementById("error-message").style.display = "none"
    })

}