function setMinDate() {
    // Set to today the minimum date for departure
    let today = new Date().toISOString().split("T")[0];
    let datePickerDep = document.getElementById('departureDateField');
    let datePickerArr = document.getElementById('arrivalDateField');
    datePickerDep.min = today;
    datePickerArr.min = today

     // TODO: change min when first selected
}

function toggleArrivalDate() {
    let arrivalDate = document.getElementById('arrivalDateFieldCont');
    let checkbox = document.getElementById('onlyDepCheckbox');
    arrivalDate.style.visibility = checkbox.checked ? 'collapse' : 'visible';
}

async function loadAirportsList() {
    console.log("dsfs");
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