let filename, key, cipherKey, polygonData, polygonClass = '';
let h_title, div_map, ul_address, ul_notVisit;

async function initVars() {
    let params= window.location.hash.replace("#", "").split("/");
    filename = params[0];
    key = params[1];
    cipherKey = decode(params[2].split("-"), key);
    try {
        console.log(filename, cipherKey);
        polygonData = JSON.parse(await fetchAndDecrypt(filename, cipherKey));
        if (Object.keys(polygonData).includes(key)) polygonData = polygonData[key];
        else polygonData = null;
    } catch (e) {console.error(e);/*window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";*/}
    if (polygonData !== undefined && polygonData !== null) {
        if (1400 <= polygonData.int_n && polygonData.int_n < 1500) polygonClass = "green";
        else if (1500 <= polygonData.int_n && polygonData.int_n < 1600) polygonClass = "petrol";
        else if (1600 <= polygonData.int_n && polygonData.int_n < 1700) polygonClass = "orange";
        else if (3000 <= polygonData.int_n && polygonData.int_n < 3100) polygonClass = "brown";
    }
    // else window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
}
function initView() {
    h_title = document.getElementById("DM_H_Title");
    div_map = L.map("DM_DIV_Map");
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
    }).addTo(div_map);
    ul_address = document.getElementById("DM_UL_Addresses");
    ul_notVisit = document.getElementById("DM_UL_NotVisit");
}
function prepareView() {
    document.title = `Gebiet ${polygonData.ext_n}`;
    document.body.className = polygonClass;
    h_title.textContent = `Gebiet ${polygonData.ext_n} (${polygonData.int_n})`;
    drawPolygon();
    polygonData.adr.sort((a, b) => a.localeCompare(b)).forEach(adr => {
        const li = document.createElement("li");
        li.className = "DM_LI";
        li.textContent = adr;
        ul_address.appendChild(li);
    });
    if (polygonData.nov.length !== 0) {
        polygonData.nov.forEach(nov => {
            const li = document.createElement("li");
            li.id = "DM_LI";
            li.textContent = nov;
            ul_notVisit.appendChild(li);
        });
    }
    else document.getElementById("DM_DIV_NotVisit").style.display = "none";
    new QRCode(document.getElementById("DM_DIV_QR"), {
        text: window.location.href,
        correctLevel: QRCode.CorrectLevel.L,
        className: polygonClass,
        width: 128,
        height: 128,
        colorLight: getComputedStyle(document.querySelector("." + polygonClass)).getPropertyValue("--light").trim()
    });
}
function drawPolygon() {
    const polygon = L.polygon(polygonData.cords.map(([lat, lon]) => [48 + lat / 1000000,16 + lon / 1000000]), {
        className: `polygon ${polygonClass}`
    });
    polygon.addTo(div_map);
    div_map.fitBounds(polygon.getBounds(), {
        maxZoom: 17
    });
}

initVars().then(r => {
    initView();
    prepareView();
});

function formatDate(date) {
    const months = ["Jänner","Februar","März","Apirl","Main","Juni","Juli","August","September","Oktober","November","Dezember"];
    return `${date.getDay()}. ${months[date.getMonth()]} ${date.getFullYear()}`
}