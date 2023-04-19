console.log(window.location.search)

function displayFlight() {
}

function goToBooking(btn) {
    let flightId = btn.attributes['data-flightid'].nodeValue

    window.location.href = '/booking';
}