let filename, cipherKey, polygonKeys = [], polygonData = [];
let div_map;
const show = new URLSearchParams(window.location.search).get('show') || 'ext';

async function initVars() {
    const params =  window.location.hash.replace("#", "").split("/");
    filename = params[0];
    cipherKey = params[1].split("-");
    try {
        polygonData = JSON.parse(await fetchAndDecrypt(filename, cipherKey));
        polygonKeys = Object.keys(polygonData);
    } catch (e) {
        console.error(e);
    }
}
function initView() {
    div_map = L.map("FM_DIV_Map").setView([48.215, 16.25], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
    }).addTo(div_map);
}
function prepareView() {
    polygonKeys.forEach(key => {
        let item = polygonData[key];
        let polygonClass = '';
        if (key === "penzing") polygonClass = "gen";
        else if (1400 <= item.int_n && item.int_n < 1500) polygonClass = "green";
        else if (1500 <= item.int_n && item.int_n < 1600) polygonClass = "petrol";
        else if (1600 <= item.int_n && item.int_n < 1700) polygonClass = "orange";
        else if (3000 <= item.int_n && item.int_n < 3100) polygonClass = "brown";
        if (key !== "penzing") {
            const polygon = L.polygon(item.cords.map(([lat, lon]) => [48 + lat / 1000000,16 + lon / 1000000]), {
                className: `polygon ${polygonClass}`
            });
            polygon.addTo(div_map);
            let n = item.ext_n;
            if (show === 'int') n = item.int_n;
            let addresses = "", notVisit = "";
            if (item.nov.length !== 0) {
                notVisit = `
                <h3>Nicht besuchen</h3>
                <ul class="FM_UL">
                    <li>${item.nov.sort((a, b) => a.localeCompare(b)).join("</li><li>")}</li>
                </ul>`;
            }
            addresses = `
                <h3>Adressen</h3>
                <ul class="FM_UL">
                    <li>${item.adr.sort((a, b) => a.localeCompare(b)).join("</li><li>")}</li>
                </ul>
            `;
            polygon.bindPopup(`<h2><a href=detail.html#${filename}/${key}/${encode(cipherKey, key)} target="_blank">Gebiet ${n}</a></h2>${addresses}${notVisit}`, {
                className: `popup ${polygonClass}`
            });
            const icon = L.divIcon({
                className: `marker-icon ${polygonClass}`,
                html: `<div class="marker-text">${n}</div>`,
                iconSize: [32, 24]
            });
            const marker = L.marker(polygon.getBounds().getCenter(), {
                icon: icon,
            });
            marker.addTo(div_map);
        }
    });
}

initVars().then(r => {
    initView();
    prepareView();
});