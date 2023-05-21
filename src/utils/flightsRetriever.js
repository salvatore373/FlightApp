const constants = require('./constants');
const https = require('https');
const url = require('url');
const fs = require("fs");
const iataConverter = require('airlines-iata-codes');

const ACCESS_TOKEN = 'nwx2IvkqGCyOFwjHPtfYxT29B5loxGtv';

function getAccessToken() {
    return new Promise((resolve, reject) => {
        const API_KEY = 'nwx2IvkqGCyOFwjHPtfYxT29B5loxGtv';
        const API_SECRET = 'mFiDTtq9pUICjjuX';

        const options = {
            hostname: 'test.api.amadeus.com',
            path: '/v1/security/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')}`
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) reject(`Status Code: ${res.statusCode}`);

            res.on('data', (d) => {
                const response = JSON.parse(d);
                resolve(response.access_token);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write('grant_type=client_credentials');
        req.end();
    });
}

async function sendAPIRequest(request) {
    let departureAirportCode = request.query[constants.flightAttributes.departureAirportCode];
    let arrivalAirportCode = request.query[constants.flightAttributes.arrivalAirportCode];
    let numAdults = request.query[constants.flightAttributes.numAdults];
    let numChildren = request.query[constants.flightAttributes.numChildren];
    let departureDate = request.query[constants.flightAttributes.departureDate];
    let arrivalDate = request.query[constants.flightAttributes.arrivalDate];

    const path = new URL('/v2/shopping/flight-offers', 'https://test.api.amadeus.com/');
    path.searchParams.append('originLocationCode', departureAirportCode);
    path.searchParams.append('destinationLocationCode', arrivalAirportCode);
    path.searchParams.append('departureDate', departureDate);
    if (arrivalDate !== 'none') path.searchParams.append('returnDate', arrivalDate);
    path.searchParams.append('adults', numAdults);
    if (numChildren > 0) path.searchParams.append('children', numChildren);

    let accessToken = await getAccessToken();
    const options = {
        hostname: path.hostname,
        path: path.pathname + path.search,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    };


    return new Promise((resolve, reject) => {
        https.get(options, (res) => {
            let data = ''

            if (res.statusCode !== 200) reject(`Status Code: ${res.statusCode}`);

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(JSON.parse(data));
            });

        }).on("error", (err) => {
            reject(err);
        }).end();
    });
}

// DEBUG Test with sample data
function readFlightsFromFile() {
    let fs = require('fs');
    return new Promise((resolve, reject) => {
        fs.readFile('example-amadeus-res.json', (err, data) => {
            resolve(err ? err : JSON.parse(data));
        });
    });
}

async function retrieveFlights(request) {
    const timeRegex = /(?<=T)[0-9]{2}:[0-9]{2}/g;
    const durationRegex = /([0-9]+H[0-9]+M)|([0-9]+H)|([0-9]+M)/g;
    let isOneWay = request.query[constants.flightAttributes.arrivalDate] === 'none';

    let data = await sendAPIRequest(request);
    // let data = await readFlightsFromFile(); // DEBUG: uncomment above and comment this to get real data
    let flights = data.data;
    let result = []

    let idCounter = 0;

    for (let i = 0; i < flights.length && result.length < 20; i++) {
        let f = flights[i];

        // Do not display this result if the user requested 2 ways but this is a one way trip
        if (!isOneWay && f.oneWay) continue;

        // Create a flight object for the way on and one for the way back (if it is not one way)
        let numTrips = isOneWay ? 1 : 2;
        let trips = {
            id: idCounter++,
            flights: [],
        }
        for (let j = 0; j < numTrips; j++) {
            let trip = f.itineraries[j];

            let airlineCode = trip.segments[0].carrierCode;
            let airlineName = iataConverter.getAirlineName(airlineCode);
            if (typeof airlineName !== 'string') airlineName = 'NAF';

            trips.flights.push({
                id: j,
                dep: trip.segments[0].departure.iataCode,
                arr: trip.segments.slice(-1)[0].arrival.iataCode,
                depTime: trip.segments[0].departure.at.match(timeRegex)[0],
                arrTime: trip.segments.slice(-1)[0].arrival.at.match(timeRegex)[0],
                duration: trip.duration.match(durationRegex)[0],
                stopovers: trip.segments.length,
                airlineName: airlineName,
                airlineLogo: `https://www.gstatic.com/flights/airline_logos/70px/${airlineCode}.png`,
            });
        }

        trips.price = f.price.total;

        result.push(trips);
    }

    return result;
}


module.exports.retrieveFlights = retrieveFlights;