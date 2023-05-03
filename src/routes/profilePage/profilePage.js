
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
          
          // calcola il numero di biglietti per slide
          var itemsPerSlide = 3;
          // calcola il numero di slide necessarie
          var numSlides = Math.ceil(response.length / itemsPerSlide);
          console.log(numSlides)
  
          // inizializza l'indice corrente del carosello
          var currentSlide = 0;
  
          for (var i = 0; i < numSlides; i++) {
            // crea un nuovo elemento per ogni slide
            var newSlide = $('<div class="carousel-item"></div>');
            
            newSlide.css({
              'display':'inline-block'
            })

            // aggiungi gli indicatori di slide
            var active = i === 0 ? 'active' : '';
            carouselIndicators.append('<button type="button" data-bs-target="#carousel-biglietti" data-bs-slide-to="' + i + '" class="' + active + '"></button>');
  
            // aggiungi gli elementi alla slide corrente
            for (var j = 0; j < itemsPerSlide; j++) {
              var index = (i * itemsPerSlide) + j;
              if (index >= response.length) {
                break;
              }
  
              // crea un nuovo elemento per ogni biglietto
              var newDiv = $('<div class="carousel-item"></div>');
              newDiv.css({
                'display': 'inline-block',
                'position': 'relative',
                'width': '33%',
                'top': '0',
                'left': 33 * j + '%'
              });
  
              // crea un nuovo iframe per ogni biglietto
              var iframe = $('<iframe src="/src/routes/common/biglietto.html"></iframe>');
              var item = response[index]
              
              // aggiungi l'iframe al nuovo elemento
              newDiv.append(iframe);

              (function(item,iframe){
                iframe.on("load",()=>{
                  var iframeContent = iframe.contents();
                  iframeContent.find('#flightCode').html('<span>Flight</span>' + item.id);
                  iframeContent.find('#owner').html('<span>Passenger</span>' + item.nome + ' ' + item.cognome);
                })
              })(item,iframe);


/*
              iframe.on('load', (function(item) {
                return function() {
                  var iframeContent = iframe.contents();
                  iframeContent.find('#flightCode').html('<span>Flight</span>' + item.id);
                  iframeContent.find('#owner').html('<span>Passenger</span>' + item.nome + ' ' + item.cognome);
                };
              })(item));
  */
              // aggiungi il nuovo elemento alla slide corrente
              newSlide.append(newDiv);
            }
  
            // aggiungi la nuova slide al carosello
            carouselInner.append(newSlide);
          }
  
          // aggiungi i pulsanti di controllo
          $('#carousel-biglietti').append('<button class="carousel-control-prev" type="button" data-bs-target="#carousel-biglietti" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span></button>');
          $('#carousel-biglietti').append('<button class="carousel-control-next" type="button" data-bs-target="#carousel-biglietti" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span></button>');
         
        },
        error: function(xhr, status, error) {
      
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
