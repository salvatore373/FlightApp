let airports = null;
let vueContext;

$(document).ready(() => {
    Vue.createApp({
        data: function () {
            return {
                isLoading: true, // Whether we are executing the request to retrieve results
                isError: false, // Whether the API to retrieve results returned an error
                flight: {}, // The flight selected by the user in the flights page
                zones: [], // The data about the departure and the arrival airports
                additionalInfo: [], // Some information about the flight, in the form Header-Content
                wayBackToConfirm: true, // Whether the user has to confirm the back trip or not
                selectedSeats: [], // The seats selected by the user from the cabin map
                numberOfSeatRows: 22, // The total number of seats in the cabin
                ticketsSaveModalMsg: 'Prenotazione in corso...', // The message to display in the ticketsSaveModal
            };
        },
        methods: {
            async fetchResults() {
                let flights = JSON.parse(localStorage.getItem('selectedFlight'));
                if (flights === null || !flights.length) {
                    this.isError = true;
                }

                // Check whether the way back has to be confirmed
                this.wayBackToConfirm = flights.length === 2;

                // Get the airport's name and city
                let f = flights[0]
                let resDep = await getAirportCityAndName(f.depCode);
                let arrDep = await getAirportCityAndName(f.arrCode);
                if (resDep === null || arrDep === null) {
                    this.isError = true;
                    return;
                }
                f.depCity = resDep[0];
                f.arrCity = arrDep[0];
                f.depAirName = resDep[1];
                f.arrAirName = arrDep[1];

                this.flight = f;
                defineZones(f, this);
                getAdditionalInfo(f, this);
                this.isLoading = false;

                // DEBUG comment line below for testing
                localStorage.setItem('selectedFlight', JSON.stringify(flights.slice(1)));
            }
        },
        mounted() {
            // DEBUG test with sample flight
            /*localStorage.setItem('selectedFlight', JSON.stringify(
                [{
                    "depCode": 'FCO',
                    "arrCode": 'JFK',
                    "airlineName": 'Airitaly',
                    "depTime": '8:40',
                    "arrTime": '23:45',
                    "duration": '8h 22m',
                    "price": '€54',
                    "adults": 2,
                    "children": 2,
                    "stops": 1,
                }]
            ));*/

            vueContext = this;
            this.fetchResults();
            initializeSeats(this);
        }
    }).mount('#globalContainer');
})

async function getAirportCityAndName(airportCode) {
    if (airports === null) {
        airports = await $.getJSON('/assets/data/airports.json');
    }
    for (let i = 0; i < airports.length; i++) {
        let ap = airports[i];
        if (ap.Code === airportCode) {

            return [`${ap.City}, ${ap.Country}`, ap.Name];
        }
    }
    return null;
}

function defineZones(flight, context) {
    context.zones = [
        {
            id: 0,
            "airCode": flight.depCode,
            "time": flight.depTime,
            'city': flight.depCity,
            'airName': flight.depAirName
        },
        {
            id: 1,
            "airCode": flight.arrCode,
            "time": flight.arrTime,
            'city': flight.arrCity,
            'airName': flight.arrAirName
        }
    ];
}

function getAdditionalInfo(flight, context) {
    context.additionalInfo = [
        {
            id: 0,
            header: "Durata",
            content: flight.duration
        },
        {
            id: 1,
            header: "Prezzo",
            content: flight.price
        },
        {
            id: 2,
            header: "Adulti",
            content: flight.adults
        },
        {
            id: 4,
            header: "Scali",
            content: flight.stops
        }
    ];
    if (flight.children > 0) {
        context.additionalInfo.splice(3, 0, {
            id: 3,
            header: "Bambini",
            content: flight.children
        });
    }
}

function getRandInt(max) {
    return Math.floor(Math.random() * max);
}

function initializeSeats(context) {
    let totalSeats = context.numberOfSeatRows * 6;
    let notAvailable = getRandInt(totalSeats - 10);

    let rows = $('#seatRows')[0].children;
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i].firstChild.children;
        for (let j = 0; j < row.length; j += (j === 2 ? 2 : 1)) {
            let isAvailable = getRandInt(totalSeats) > notAvailable;

            if (isAvailable) {
                row[j].onclick = () => {
                    selectSeat(row[j], context);
                }
            } else {
                row[j].classList = 'seat-disabled';
            }
        }
    }
}

function selectSeat(btn, context) {
    if (btn.classList[0] === 'seat-selected') {
        // Unselect the button
        context.selectedSeats.splice(context.selectedSeats.indexOf(btn.textContent, 1));
        btn.classList = 'seat-unselected';
    } else {
        // If possible, select the button
        if (context.selectedSeats.length >= context.flight.adults + context.flight.children) {
            return;
        }

        btn.classList = 'seat-selected';
        context.selectedSeats.push(btn.textContent);
    }
}

function saveTicketOnDb(flight) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            url: '/save-ticket',
            data: flight,
            success: resolve,
            error: reject,
        });
    });
}

function confirmBooking() {
    // Check that the right number of seats has been selected, otherwise raise alert
    if (vueContext.selectedSeats.length < vueContext.flight.adults + vueContext.flight.children) {
        // The modal is shown
        return;
    }

    // Show the modal for the saving process progress
    let modal = new bootstrap.Modal($('#ticketsSaveModal'), {
        keyboard: false,
        backdrop: 'static',
    });
    modal.show();

    // Save this ticket in the database
    let requests = [];
    for (let i = 0; i < vueContext.selectedSeats.length; i++) {
        let f = Object.assign({}, vueContext.flight);
        f.seat = vueContext.selectedSeats[i];

        requests.push(saveTicketOnDb(f));
    }

    // Update the message when the requests are completed
    Promise.all(requests)
        .then(() => {
            vueContext.ticketsSaveModalMsg = 'La prenotazione è stata effettuata con successo.'
        })
        .catch(() => {
            vueContext.ticketsSaveModalMsg = 'Si è verificato un errore durante la prenotazione.'
        });
}