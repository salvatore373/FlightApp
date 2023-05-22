let vueContext;
let icaoJson = null;

$(document).ready(() => {
    Vue.createApp({
        data: function () {
            return {
                isLoading: false, // Whether we are executing the request to retrieve results
                isError: false, // Whether the API to retrieve results returned an error
                startCity: '',
                arrCity: '',
                arcDegrees: -90,
            };
        },
        methods: {},
        mounted() {
            vueContext = this;
        }
    }).mount('#globalContainer');
})

async function retrieveFlightInfo() {
    vueContext.isLoading = true;

    // let code = 'RYR1199' // DEBUG: test code
    let code = $('#flightCode').val();
    let airlineCode = code.slice(0, 3);
    let flightCode = code.slice(3);
    let url = new URL(`https://api.laminardata.aero/v1/airlines/${airlineCode}/flights/${flightCode}?`);
    url.searchParams.append('user_key', 'e841ebfb7b6ffe547fd8e65747dced50');

    // url = new URL('http://localhost:3000/example-tracker-res2.json'); // DEBUG uncomment url above and comment this to get real data

    $.get({
            url: url,
            success: function (res) {
                console.log(res)

                if (res.features.length === 0) {
                    // Show error
                    vueContext.isLoading = false;
                    vueContext.isError = true;
                } else {
                    // Get the trip times
                    let obj = res.features[res.features.length - 1].properties
                    let depTime = obj.departure.runwayTime.estimated;
                    if (!depTime) depTime = obj.departure.runwayTime.actual
                    if (!depTime) depTime = obj.departure.runwayTime.initial
                    let arrTime = obj.arrival.runwayTime.estimated;
                    if (!arrTime) arrTime = obj.arrival.runwayTime.actual
                    if (!arrTime) arrTime = obj.arrival.runwayTime.initial
                    if (!depTime || !arrTime) {
                        vueContext.isLoading = false;
                        vueContext.isError = true;
                        return;
                    }

                    // Get the trip starting and arriving point
                    getCityFromICAO(obj.departure.aerodrome.scheduled).then(res => vueContext.startCity = res);
                    getCityFromICAO(obj.arrival.aerodrome.scheduled).then(res => vueContext.arrCity = res);

                    // Calculate the trip percentage
                    depTime = (new Date(depTime)).getTime();
                    arrTime = (new Date(arrTime)).getTime();
                    let now = new Date();
                    now = now.getTime();
                    let arcPercentage = (now - depTime) / (arrTime - depTime);

                    // Set the percentage in the right bound
                    if (arcPercentage < 0) arcPercentage = 0;
                    if (arcPercentage > 1) arcPercentage = 1;

                    // Convert the percentage to degrees
                    let arcDegrees = calcDegrees(arcPercentage);

                    // Start the animation
                    $('#arc').append('<div id="plane"><img src="/assets/icons/airplane-big.png" style="height: 80px; width: 80px;"/></div>');

                    // Calculate the animation
                    const plane = document.getElementById("plane");
                    const animKeyframe = new KeyframeEffect(
                        plane, // element to animate
                        [
                            {transform: "rotate(-180deg) translate(calc((60vw - 20px) / 2))"},
                            {transform: `rotate(${arcDegrees}deg) translate(calc((60vw - 20px) / 2))`},
                        ],
                        {duration: 3000, fill: "forwards"}
                    );
                    const animation = new Animation(
                        animKeyframe,
                        document.timeline
                    );
                    animation.play();

                    vueContext.isLoading = false;
                }
            },
            error: function (err) {
                console.log(err)
                vueContext.isError = true;
                vueContext.isLoading = false;
            }
        }
    )
}

async function getCityFromICAO(icao) {
    if (icaoJson === null) {
        try {
            icaoJson = await $.getJSON('/assets/data/icao-city.json');
        } catch (e) {
            console.log("The following error occurred while getting the city associated to a certain ICAO code:");
            console.log(e);
            return '';
        }
    }
    for (let i = 0; i < icaoJson.length; i++) {
        let el = icaoJson[i];
        if (el.icao === icao) {
            return el.city;
        }
    }
}

function calcDegrees(percentage) {
    return Math.floor(-180 + 180 * percentage);
}