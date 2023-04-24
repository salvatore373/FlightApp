function showPassword(){
    const pass = document.getElementById("password")
    const showButton = document.getElementById("show-password-button")

    if (pass.type === "password"){
        pass.type = "text"
        showButton.textContent = "Nascondi"
    } else {
        pass.type = "password"
        showButton.textContent = "Mostra"
    }
}

function checkEmailInput(){
    const emailInput = document.getElementById("email")
    const regex = /^[A-z0-9\.\+_-]+@[A-z0-9\._-]+\.[A-z]{2,6}$/;

    emailInput.addEventListener("input",()=>{
        const emailValue = emailInput.value.trim()//trim() rimuove spazi vuoti a inizio e fine stringa
        if(emailValue == ""){
            emailInput.style.borderColor = ""
        }
        else if(regex.test(emailValue)){
            emailInput.style.borderColor = "#0c0"
        }else{
            emailInput.style.borderColor = "#c00"
        }
    })
}

$(document).ready(function() {
    $('#signinForm').submit(function(event) {
      event.preventDefault();
      const email = $('#email').val();
      const password = $('#password').val();
      $.ajax({
        url: '/api/sign-in/',
        type: 'POST',
        data: {email: email, password: password},
        success: function(data) {
            if(data.code == "Success"){
                localStorage.setItem("email", email)
                localStorage.setItem('authenticated', 'true');
                setTimeout(()=>{
                    localStorage.setItem('authenticated', 'false')//dopo 10 minuti viene risettata a false
                },600000);
                window.location.href = "/dashboard";
            }else{
                $("#error-message").text("Credenziali errate").show();
            }
        },
        error: function(xhr, status, error) {
            $("#error-message").text("Credenziali errate").show();      
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

}