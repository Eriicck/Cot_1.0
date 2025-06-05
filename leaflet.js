const map = L.map('mapa').setView([-34.64948297063554, -58.78710022512634], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
L.marker([-34.64948297063554, -58.78710022512634]).addTo(map)
    .bindPopup('Consultorios Médicos Aquí.')
    .openPopup();