// Initialization
document.getElementById('brewDate').valueAsDate = new Date();
let localElevation = 0; 
let map, marker, elevationService;

// --- GATEKEEPER LOGIC ---
function unlockSite() {
    const input = document.getElementById('site-pass').value;
    if (input === "Lasith@SLcoffe") {
        document.getElementById('site-gate').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        sessionStorage.setItem('isUnlocked', 'true');
        renderLogs();
    } else {
        document.getElementById('gate-error').classList.remove('hidden');
        setTimeout(() => document.getElementById('gate-error').classList.add('hidden'), 2000);
    }
}

window.onload = function() {
    if (sessionStorage.getItem('isUnlocked') === 'true') {
        document.getElementById('site-gate').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        renderLogs();
    }
};

// --- GOOGLE MAPS ELEVATION SERVICE ---
function openMapModal() {
    document.getElementById('mapModal').classList.remove('hidden');
    if (!map) initMap();
}

function closeMapModal() {
    document.getElementById('mapModal').classList.add('hidden');
    if (localElevation > 0) calculateStartingPoint();
}

function initMap() {
    const slCenter = { lat: 7.8731, lng: 80.7718 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7, 
        center: slCenter,
        styles: [{"stylers": [{"saturation": -100}]}] // Professional Monochrome theme
    });
    elevationService = new google.maps.ElevationService();
    marker = new google.maps.Marker({ map: map });

    map.addListener("click", (event) => {
        marker.setPosition(event.latLng);
        elevationService.getElevationForLocations({ locations: [event.latLng] }, (results, status) => {
            if (status === "OK" && results[0]) {
                localElevation = Math.round(results[0].elevation);
                document.getElementById('detected-meters').innerText = localElevation;
                document.getElementById('local-elev-display').classList.remove('hidden');
            }
        });
    });
}

// --- PROFESSIONAL CALIBRATION LOGIC ---
function calculateStartingPoint() {
    const beanAltitude = parseInt(document.getElementById('altitude').value) || 0;
    const roast = document.getElementById('roast').value;
    const rDate = new Date(document.getElementById('roastDate').value);
    const bDate = new Date(document.getElementById('brewDate').value);
    
    document.getElementById('altitude-physics').classList.remove('hidden');
    
    // Calculate boiling point for cafe elevation
    const localBP = (100 - (localElevation / 300)).toFixed(1);
    let bpMsg = `At your elevation (${localElevation}m), water boils at ${localBP}°C.`;
    
    // Determine target based on bean altitude (Density)
    let temp = "93°C"; let ratio = "1:2";
    let densityType = beanAltitude > 1600 ? "High Density (Hard Bean)" : "Standard Density";

    if (beanAltitude > 1600 || roast === 'light') {
        temp = "95-96°C"; ratio = "1:2.2+";
        if (localBP < 95) {
            bpMsg += `<br>⚠️ <b>PHYSICS WARNING:</b> Target ${temp} is impossible here. Increase your Brew Ratio to 1:2.5 to compensate for lower heat.`;
        }
    } else if (roast === 'dark') {
        temp = "88-91°C"; ratio = "1:1.5";
    }

    const age = Math.ceil(Math.abs(bDate - rDate) / (1000 * 60 * 60 * 24)) || 0;
    
    document.getElementById('boiling-point-text').innerHTML = bpMsg;
    document.getElementById('setup-advice').innerHTML = `
        <b>BEAN:</b> ${densityType}<br>
        <b>TARGET TEMP:</b> ${temp}<br>
        <b>TARGET RATIO:</b> ${ratio}<br>
        <b>REST TIME:</b> ${age} Days post-roast.
    `;
}

function guide(zone) {
    const box = document.getElementById('guidance-box');
    box.classList.remove('hidden', 'bg-yellow-400', 'bg-red-500', 'bg-blue-500', 'bg-stone-800', 'text-white', 'text-black');
    
    if (zone === 'yellow') {
        box.classList.add('bg-yellow-400', 'text-black');
        document.getElementById('g-title').innerText = "Increase Yield";
        document.getElementById('g-desc').innerText = "Sensory: Salty / Sharp / Sour. Under-extracted.";
        document.getElementById('g-hierarchy').innerText = "ACTION: Lock Dose. Increase Yield by 2-4g.";
    } else if (zone === 'red') {
        box.classList.add('bg-red-500', 'text-white');
        document.getElementById('g-title').innerText = "Decrease Yield";
        document.getElementById('g-desc').innerText = "Sensory: Bitter / Dry / Ashy. Over-extracted.";
        document.getElementById('g-hierarchy').innerText = "ACTION: Stop the shot earlier to cut out bitterness.";
    } else if (zone === 'thin') {
        box.classList.add('bg-blue-500', 'text-white');
        document.getElementById('g-title').innerText = "Grind Finer";
        document.getElementById('g-desc').innerText = "Sensory: Thin / Watery / Weak. Low Strength.";
        document.getElementById('g-hierarchy').innerText = "ACTION: Increase resistance to build body.";
    } else if (zone === 'heavy') {
        box.classList.add('bg-stone-800', 'text-white');
        document.getElementById('g-title').innerText = "Grind Coarser";
        document.getElementById('g-desc').innerText = "Sensory: Heavy / Muddled / Chalky. High Strength.";
        document.getElementById('g-hierarchy').innerText = "ACTION: Allow faster flow to reveal clarity.";
    }
}

function toggleTrouble() { document.getElementById('trouble-content').classList.toggle('hidden'); }

// --- HISTORY STORAGE ---
function saveSession() {
    if (prompt("Enter Administration Password:") === "Lasith@SLcoffe") {
        const session = {
            recipe: `${document.getElementById('dose').value}g / ${document.getElementById('yield').value}g / ${document.getElementById('time').value}s`,
            note: document.getElementById('g-title').innerText || "Balanced",
            date: new Date().toLocaleDateString()
        };
        let logs = JSON.parse(localStorage.getItem('sl_logs')) || [];
        logs.unshift(session);
        localStorage.setItem('sl_logs', JSON.stringify(logs));
        renderLogs();
    }
}

function renderLogs() {
    const list = document.getElementById('log-list');
    const logs = JSON.parse(localStorage.getItem('sl_logs')) || [];
    list.innerHTML = logs.map(l => `
        <div class="p-4 bg-stone-100 rounded-xl border flex justify-between items-center shadow-sm">
            <div>
                <p class="text-[9px] font-bold text-stone-400 uppercase">${l.date}</p>
                <p class="text-sm font-black">${l.recipe}</p>
            </div>
            <div class="text-[10px] font-black uppercase text-emerald-600 border border-emerald-100 px-2 py-1 rounded-lg">${l.note}</div>
        </div>
    `).join('');
}