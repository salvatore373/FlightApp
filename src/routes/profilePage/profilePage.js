
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

//prima di lavorare sulla pagina carico l'intera pagina utilizzando questo type di listener
document.addEventListener("DOMContentLoaded", ()=>{

  const googleUser = getCookieValue('nameUser')
  if(googleUser !== null){

    //eliminazione sezione "Aggiorna Password"
    const resetPassOnList = document.getElementById("list-password-list")
    resetPassOnList.remove()
    //resetPass1.style.display = "none"
    const resetPassPanel = document.getElementById("password")
    resetPassPanel.style.display = "none"
    

    //eliminazione sezione "Cancella Account"
    const delAccountOnlist = document.getElementById("list-cancellazione-list")
    delAccountOnlist.remove()
    const delAccountPanel = document.getElementById("cancellazione-account")
    delAccountPanel.style.display = "none"

  }else{

    //eliminazione sezione "Cancellazione Dati Google"
    const delGoogleAccount = document.getElementById("list-google-deleteInfo-list")
    delGoogleAccount.remove()
    const delAccountGooglePanel = document.getElementById("cancellazione-googleInfo")
    delAccountGooglePanel.style.display = "none"

  }
  
})



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


$(document).ready(function() {
  $('#list-biglietti-list').click(function(event) {
    event.preventDefault();
    $.ajax({
      url: '/biglietti-prenotati/',
      type: 'GET',
      success: function(response) {
        var carouselInner = $('#carousel-biglietti .carousel-inner');
        var carouselIndicators = $('#carousel-biglietti .carousel-indicators');


        for (var i = 0; i < response.length; i++) {
          var item = response[i];
          var active = i === 0 ? 'active' : '';

          //gestione degli stili css dell'elemento aggiunto
          var new_div = document.createElement("div");
          new_div.classList.add("carousel-item");
          new_div.style.display = "inline-block";
          new_div.style.position = "relative"
          new_div.style.width = "33%"
          new_div.style.top = "0"
          new_div.style.left = 33 * (i%3) + "%"

          carouselIndicators.append('<button type="button" data-bs-target="#carousel-biglietti" data-bs-slide-to="' + i + '" class="' + active + '"></button>');
          carouselInner.append(new_div);

          var iframe = document.createElement("iframe");
          iframe.src = '/src/routes/common/biglietto.html';
          new_div.appendChild(iframe);

          iframe.addEventListener("load", function() {
            
            var iframeContent = iframe.contentDocument;
            
            var flightCode = iframeContent.querySelector("#flightCode");
            flightCode.innerHTML = "<span>Flight</span>"+item.id;
            
            var owner = iframeContent.querySelector("#owner");
            owner.innerHTML = "<span>Passenger</span>" + item.nome + " " + item.cognome
          });
        }
      },
      error: function(xhr, status, error) {
        console.log("error")
      }
    });
  });
});


//controllo password delete account 
$(document).ready(function() {
  $('#cancellazioneAccount').submit(function(event) {
    event.preventDefault();
    const pass = $('#pass-cancellazione').val();
    const conf_pass = $('#pass-conf-cancellazione').val();
    $.ajax({
      url: '/cancellazione-account',
      type: 'POST',
      data: {pass:pass,conf_pass:conf_pass},
      success: function(data) {
          if(data.error_code == "success"){
            $("#exampleModal").modal("show");  
          }
          else if(data.error_code == 1000){
            $("#error-message-elimination-account").text("Error: passwords are not equal").show();
            $("#exampleModal").modal("hide");
          }
          else{
            $("#error-message-elimination-account").text("Error: Wrong password").show();
            $("#exampleModal").modal("hide");
          }

      },
      error: function(xhr, status, error) {
    
      }
    });
  });
});
