
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

// Chiamata ajax subito dopo il caricamento della pagina 
// (Informazioni personali è la section attiva subito dopo il caricamento della pagina)
$(document).ready(function() {
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

//chiamata ajax al click del button Informazioni Personali
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



//chiamata ajax al click del button Reset Password
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

//chiamata ajax al click del button Biglietti Prenotati
$(document).ready(function() {
  var carousel = $('#carouselBiglietti');

  $('#list-biglietti-list').click(function(event) {
    event.preventDefault();
    $.ajax({
      url: '/biglietti-prenotati/',
      type: 'GET',
      success: function(response) {

        // svuota il carosello
        carousel.empty();
         
        if(response.length == 0){
          console.log("zero Biglietti")
          $("#casoZeroBiglietti").text("Non hai acquistato nessun biglietto")
        }else{
          //Nascondo il messaggio del caso di zero biglietti
          $("#casoZeroBiglietti").hide()

          // crea una slide per ogni biglietto
          response.forEach(function(item) {
         
          // crea un nuovo iframe per ogni biglietto
          var iframe = $('<iframe src="/src/routes/common/biglietto.html"></iframe>');

          // carica i dati del biglietto nell'iframe
          iframe.on("load", function() {
            var iframeContent = iframe.contents();
            console.log(item)
            iframeContent.find('#flightCode').html('<span>Flight</span>' + item.id);
            iframeContent.find('#owner').html('<span>Passenger</span>' + item.nome + ' ' + item.cognome);
            iframeContent.find('#seat').html('<span>Seat</span>' + item.postonumero);
            iframeContent.find('#cityFrom').html(item.cittapartenza);
            iframeContent.find('#toCity').html(item.cittaarrivo);
            iframeContent.find('#departs').html('<span>Departs</span>' + item.orapartenza);
            iframeContent.find('#arrives').html('<span>Arrives</span>' + item.oraarrivo);
          });

          carousel.append(iframe);
        });

          // distrugge il carosello precedente
          carousel.trigger('destroy.owl.carousel');

          // inizializza il carosello con Owl Carousel
          carousel.owlCarousel({
            loop: false,
            margin: 30,
            nav: true,
            navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
            dots: true,
            responsive:{
              0:{
                items:1
              },
              600:{
                items:2
              },
              1000:{
                items:3
              }
            }
          });
        
          // rimuove la classe owl-hidden dal tag del carosello
          carousel.removeClass('owl-hidden');
        }
      },
      error: function(xhr, status, error) {
        // gestione dell'errore
      }
    });
  });
});

//chiamata ajax per controllo password per il delete account 
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

