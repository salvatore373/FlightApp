let vueContext;

$(document).ready(() => {
    initForm();

    Vue.createApp({
        data: function () {
            return {
                results: [], // The results retrieved from the API
                isLoading: true, // Whether we are executing the request to retrieve results
                isError: false, // Whether the API to retrieve results returned an error
            };
        },
        methods: {
            async fetchResults() {
                // Retrieve the flights via a request to this server
                let url = new URL(window.location);
                url.pathname = '/retrieveFlights';
                url = url.toString();
                $.getJSON(url)
                    .done((res) => {
                        this.results = res;
                    })
                    .fail((err) => {
                        this.isError = true;
                    })
                    .always(() => {
                        this.isLoading = false;
                    });
            }
        },
        mounted() {
            vueContext = this;
            this.fetchResults();
        }
    }).mount('#listContainer');
});

function goToBooking(btn) {
    // When the user selects a flight the json representing the round trip must be saved in localStorage
    // in selectedFlight before redirecting to the booking page
    //  selectedFlight: [{}, {
    //      "depCode": x,
    //      "arrCode": x,
    //      "airlineName": x,
    //      "depTime": x,
    //      "arrTime": x,
    //      "duration": x,
    //      "price": x,
    //      "adults": x,
    //      "children": x,
    //      "stops": x,
    //  }]
    let flightIndex = parseInt(btn.attributes['data-flightid'].nodeValue);
    let flights = vueContext.results[flightIndex];

    let adults = parseInt(window.location.search.match(/(?<=adults=)[0-9]+/g)[0]);
    let children = parseInt(window.location.search.match(/(?<=children=)[0-9]+/g)[0]);

    // Rename some properties
    for (let i = 0; i < flights.flights.length; i++) {
        flights.flights[i].depCode = flights.flights[i].dep;
        flights.flights[i].arrCode = flights.flights[i].arr;
        flights.flights[i].stops = flights.flights[i].stopovers;
        flights.flights[i].price = `€${flights.price}`;
        delete flights.flights[i].dep;
        delete flights.flights[i].arr;
        delete flights.flights[i].stopovers;

        flights.flights[i].adults = adults;
        flights.flights[i].children = children;
    }

    // Save the dates in the object
    flights.flights[0].date = window.location.search.match(/(?<=depDate=)[0-9]{4}-[0-9]{2}-[0-9]{2}/g)[0];
    if (flights.flights.length > 1) {
        flights.flights[1].date = window.location.search.match(/(?<=arrDate=)[0-9]{4}-[0-9]{2}-[0-9]{2}/g)[0];
    }

    localStorage.setItem('selectedFlight', JSON.stringify(flights.flights));
    window.location.href = '/booking';
}