console.log(window.location.search)

$(document).ready(() => {
    initForm();
});

function displayFlight() {
}

function goToBooking(btn) {
    let flightId = btn.attributes['data-flightid'].nodeValue

    window.location.href = '/booking';
}