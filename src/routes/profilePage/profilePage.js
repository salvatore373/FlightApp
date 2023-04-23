$(document).ready(function() {
    $('#resetPassword').submit(function(event) {
      event.preventDefault();
      const email = localStorage.getItem("email")
      const old_pass = $('#inputOldPassword').val();
      const new_pass = $('#inputNewPassword').val();
      const conf_new_pass = $('#inputConfirmPassword').val();
      $.ajax({
        url: '/reset-password/',
        type: 'POST',
        data: {email: email, old_pass: old_pass, new_pass: new_pass, conf_new_pass},
        success: function(data) {
            if(data.code == 1000){
                $("#error-message").text("Nuovapassword e confermaNuovaPassword diverse").show();
            }
            else if(data.code == 1001){
                $("#error-message").text("Vecchia password errata").show();
            }else if (data.code =="success"){
                $("#success-message").text("Password aggiornata").show();
            }
        },
        error: function(xhr, status, error) {
      
        }
      });
    });
  });

  function hideErrorMessage(){
    
    const old_pass = document.getElementById("inputOldPassword")
    old_pass.addEventListener("input",()=>{
        document.getElementById("error-message").style.display = "none"
        document.getElementById("success-message").style.display = "none"
    })

    const new_pass = document.getElementById("inputNewPassword")
    new_pass.addEventListener("input",()=>{
        document.getElementById("error-message").style.display = "none"
        document.getElementById("success-message").style.display = "none"
    })

    const conf_pass = document.getElementById("inputConfirmPassword")
    conf_pass.addEventListener("input", ()=>{
        document.getElementById("error-message").style.display = "none"
        document.getElementById("success-message").style.display = "none"
    })

}


$(document).ready(function() {
    $('#button-info').click(function(event) {
      event.preventDefault();
      $.ajax({
        url: '/get-personal-info/',
        type: 'GET',
        success: function(data) {
            //tolgo l'attributo readonly dei campi input
            $("#nome-form").removeAttr("readonly")
            $("#cognome-form").removeAttr("readonly")
            $("#email-form").removeAttr("readonly")
            $("#username-form").removeAttr("readonly")

            //modifico i value dei campi input
            $("#nome-form").val(data.nome)
            $("#cognome-form").val(data.cognome)
            $("#email-form").val(data.email)
            $("#username-form").val(data.username)

            //risetto l'attributo readonly dei campi input
            $("#nome-form").attr("readonly",true);
            $("#cognome-form").attr("readonly",true);
            $("#email-form").attr("readonly",true);
            $("#username-form").attr("readonly",true);
        },
        error: function(xhr, status, error) {
            console.log("error")
        }
      });
    });
  });


  
$("#button-info").on("click",()=>{
    fetch("/get-personal-info")
    .then(data => console.log(data))
})


$(document).ready(function() {
  $('#cancellazioneAccount').submit(function(event) {
    event.preventDefault();
    const pass = $('#pass-cancellazione').val();
    const conf_pass = $('#pass-conf-cancellazione').val();
    $.ajax({
      url: '/cancellazione-account/',
      type: 'POST',
      data: {pass:pass,conf_pass:conf_pass},
      success: function(data) {
          if(data.error_code == 1000){
              $("#error-message-elimination-account").text("Error: passwords are not equal").show();
          }

      },
      error: function(xhr, status, error) {
    
      }
    });
  });
});


let cont = document.querySelector("#error-message-elimination-account")   //getElementById("error-message-elimination")
console.log(cont)  
//if(cont.innerHTML.indexOf("Error") !== -1){//è presente una sottostringa Error
  //  const popUp = document.getElementById("Modal");
  //  popUp.style.display = "none";
  //}
