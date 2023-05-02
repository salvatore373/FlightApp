const flightAttributes = {
    departureAirportCode: 'dep',
    arrivalAirportCode: 'arr',
    numAdults: 'adults',
    numChildren: 'children',
    departureDate: 'depDate',
    arrivalDate: 'arrDate',
}

if (typeof window === 'undefined') {
    module.exports.flightAttributes = flightAttributes;
}