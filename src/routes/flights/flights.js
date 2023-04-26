console.log(window.location.search)

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
            fetchResults() {
                let exFlight1 = {
                    'flights': [
                        {
                            'id':0,
                            'dep': "FCO",
                            'arr': "JFK",
                            'depTime': "343",
                            'arrTime': "234",
                            "duration": '32',
                            'stopovers': '2',
                            'airlineLogo': 'https://picsum.photos/200/300',
                        },
                        {
                            'id':1,
                            'dep': "JFK",
                            'arr': "FCO",
                            'depTime': "888",
                            'arrTime': "343",
                            "duration": '32',
                            'stopovers': '2',
                            'airlineLogo': 'https://picsum.photos/200/300',
                        }
                    ],
                    'price': 10
                }
                let exFlight2 = {
                    'flights': [
                        {
                            'id':0,
                            'dep': "FCOoo",
                            'arr': "JFK",
                            'depTime': "343",
                            'arrTime': "234",
                            "duration": '32',
                            'stopovers': '2',
                            'airlineLogo': 'https://picsum.photos/200/300',
                        },
                        {
                            'id':1,
                            'dep': "JFK",
                            'arr': "FCOoo",
                            'depTime': "234",
                            'arrTime': "343",
                            "duration": '32',
                            'stopovers': '2',
                            'airlineLogo': 'https://picsum.photos/200/300',
                        }
                    ],
                    'price': 100
                }
                this.results = [exFlight1, exFlight2];

                // TODO: make API request
                // TODO: update isLoading and isError
            }
        },
        mounted() {
            this.fetchResults();
        }
    }).mount('#listContainer');
});

function displayFlight() {
}

function goToBooking(btn) {
    let flightId = btn.attributes['data-flightid'].nodeValue

    window.location.href = '/booking';
}