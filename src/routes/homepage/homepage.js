function setMinDate() {
    // Set to today the minimum date for departure
    let today = new Date().toISOString().split("T")[0];
    let datePickerDep = document.getElementById('departureDateField');
    let datePickerArr = document.getElementById('arrivalDateField');
    datePickerDep.min = today;
    datePickerArr.min = today

    // Change the minimum arrival date when the departure date is selected
    datePickerDep.oninput = (e) => {
        datePickerArr.min = e.target.value;
    };
}

function toggleArrivalDate() {
    let arrivalDate = document.getElementById('arrivalDateFieldCont');
    let checkbox = document.getElementById('onlyDepCheckbox');
    arrivalDate.style.visibility = checkbox.checked ? 'collapse' : 'visible';
}

async function loadAirportsList() {
    let res = await fetch("/assets/data/airports.json");
    let airports = await res.json();
    let datalist = document.getElementById("airportsList");
    let listStr = '';
    for (let a of airports) {
        let el = `<option>${a["Name"]} (${a["Code"]}), ${a["City"]}, ${a["Country"]}</option>`;
        listStr += el;
    }
    datalist.innerHTML = listStr;
}

function initForm() {
    let booker = document.getElementById("bookerForm");

    let dep = document.getElementById("departureField");
    let adults = document.getElementById("adultsNumField");
    let children = document.getElementById("childrenNumField");
    let arr = document.getElementById("arrivalField");
    let depDate = document.getElementById("departureDateField");
    let arrDate = document.getElementById("arrivalDateField");
    let onlyGo = document.getElementById('onlyDepCheckbox');

    // DEBUG fill form
    dep.value = "Leonardo da Vinci–Fiumicino Airport (FCO), Rome, Italy";
    adults.value = 1;
    children.value = 0;
    arr.value = 'John F Kennedy International Airport (JFK), New York, United States';
    depDate.value = '2023-07-14';
    arrDate.value = '2023-07-14';
    onlyGo.checked = false;

    if (dep.value === arr.value) {
        alert("Gli aeroporti di partenza e di arrivo devono essere diversi.");
    }

    let airportCodeRegex = /(?<=\()[A-Z]{3}(?=\),)/g;
    booker.addEventListener('submit', (e) => {
        e.preventDefault();

        const flightsPage = new URL('/flights', 'https://example.com');
        flightsPage.searchParams.append(flightAttributes.departureAirportCode, dep.value.match(airportCodeRegex)[0]);
        flightsPage.searchParams.append(flightAttributes.arrivalAirportCode, arr.value.match(airportCodeRegex)[0]);
        flightsPage.searchParams.append(flightAttributes.numAdults, adults.value);
        flightsPage.searchParams.append(flightAttributes.numChildren, children.value);
        flightsPage.searchParams.append(flightAttributes.departureDate, depDate.value);
        flightsPage.searchParams.append(flightAttributes.arrivalDate, onlyGo.checked ? 'none' : arrDate.value);

        document.location.href = flightsPage.pathname + flightsPage.search
    });
}

function selectRandomDestination() {
    let datalist = $('#airportsList')[0].childNodes;
    let randIndex = Math.floor(Math.random() * datalist.length);
    let randDestination = datalist[randIndex].innerText

    $('#arrivalField').val(randDestination);
}