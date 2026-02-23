// Initialization
document.getElementById('brewDate').valueAsDate = new Date();

// --- SITE GATEKEEPER LOGIC ---
function unlockSite() {
    const inputPass = document.getElementById('site-pass').value;
    const correctPass = "Lasith@SLcoffe";
    
    if (inputPass === correctPass) {
        document.getElementById('site-gate').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        // Optional: Save to session so they don't re-login on refresh during the same session
        sessionStorage.setItem('isUnlocked', 'true');
        renderLogs();
    } else {
        const error = document.getElementById('gate-error');
        error.classList.remove('hidden');
        setTimeout(() => error.classList.add('hidden'), 2000);
    }
}

// Check session on load
window.onload = function() {
    if (sessionStorage.getItem('isUnlocked') === 'true') {
        document.getElementById('site-gate').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        renderLogs();
    }
};

// --- CORE PHYSICS & CALIBRATION ---
function calculateStartingPoint() {
    const altitude = parseInt(document.getElementById('altitude').value) || 0;
    const roast = document.getElementById('roast').value;
    const rDate = new Date(document.getElementById('roastDate').value);
    const bDate = new Date(document.getElementById('brewDate').value);
    
    document.getElementById('altitude-physics').classList.remove('hidden');
    
    const localBP = (100 - (altitude / 300)).toFixed(1);
    let bpMsg = `Local Boiling Point: ${localBP}°C.`;
    
    let temp = "93°C"; let ratio = "1:2";
    if (altitude > 1600 || roast === 'light') {
        temp = "95-96°C"; ratio = "1:2.2+";
        if (localBP < 95) bpMsg = `⚠️ <b>WARNING:</b> Water boils at ${localBP}°C. You cannot reach the 96°C target. Compensate with higher yield (1:2.5).`;
    } else if (roast === 'dark') {
        temp = "88-91°C"; ratio = "1:1.5-1.8";
    }

    const age = Math.ceil(Math.abs(bDate - rDate) / (1000 * 60 * 60 * 24)) || 0;
    let ageAlert = age < 5 ? "⚠️ VERY GASSY: High CO2. Use 30s bloom." : "✅ OPTIMAL: Bean is stable.";

    document.getElementById('boiling-point-text').innerHTML = bpMsg;
    document.getElementById('setup-advice').innerHTML = `<b>SL STARTING POINT:</b> Temp ${temp} | Ratio ${ratio}<br><b>AGE:</b> ${age} Days | ${ageAlert}`;
}

function guide(zone) {
    const box = document.getElementById('guidance-box');
    box.classList.remove('hidden', 'bg-yellow-400', 'bg-red-500', 'bg-blue-500', 'bg-stone-800', 'text-white', 'text-black');

    if (zone === 'yellow') {
        box.classList.add('bg-yellow-400', 'text-black');
        document.getElementById('g-title').innerText = "Increase Yield";
        document.getElementById('g-desc').innerText = "Compass: Salty / Sour. Under-extracted. Increase water output to pull sweetness.";
        document.getElementById('g-hierarchy').innerText = "Perger Logic: Fix Yield first. Keep dose static.";
    } else if (zone === 'red') {
        box.classList.add('bg-red-500', 'text-white');
        document.getElementById('g-title').innerText = "Decrease Yield";
        document.getElementById('g-desc').innerText = "Compass: Bitter / Dry / Ashy. Over-extracted. Stop the shot earlier.";
        document.getElementById('g-hierarchy').innerText = "Perger Logic: Yield is your primary flavor balancer.";
    } else if (zone === 'thin') {
        box.classList.add('bg-blue-500', 'text-white');
        document.getElementById('g-title').innerText = "Grind Finer";
        document.getElementById('g-desc').innerText = "Compass: Thin / Bland. Low Strength. Finer grinds increase body and texture.";
        document.getElementById('g-hierarchy').innerText = "Veneziano Logic: Adjust grind for mouthfeel if flavor is balanced.";
    } else if (zone === 'heavy') {
        box.classList.add('bg-stone-800', 'text-white');
        document.getElementById('g-title').innerText = "Grind Coarser";
        document.getElementById('g-desc').innerText = "Compass: Heavy / Muddled. High Strength. Speed up flow for clarity.";
        document.getElementById('g-hierarchy').innerText = "Perger Logic: Only coarsen if you already have sweetness.";
    }
}

function toggleTrouble() { document.getElementById('trouble-content').classList.toggle('hidden'); }

// --- LOGGING ---
function saveSession() {
    // Retaining the second-step confirmation password as per previous turn request
    const password = prompt("Re-enter Admin Password to save log:");
    
    if (password === "Lasith@SLcoffe") {
        const rDate = new Date(document.getElementById('roastDate').value);
        const bDate = new Date(document.getElementById('brewDate').value);
        const age = Math.ceil(Math.abs(bDate - rDate) / (1000 * 60 * 60 * 24)) || 0;
        
        const session = {
            origin: document.getElementById('origin').value || "Unknown",
            age: age,
            recipe: `${document.getElementById('dose').value}g / ${document.getElementById('yield').value}g / ${document.getElementById('time').value}s`,
            note: document.getElementById('g-title').innerText || "Balanced"
        };
        
        let logs = JSON.parse(localStorage.getItem('sl_logs')) || [];
        logs.unshift(session);
        localStorage.setItem('sl_logs', JSON.stringify(logs));
        renderLogs();
    } else {
        alert("Incorrect password.");
    }
}

function renderLogs() {
    const list = document.getElementById('log-list');
    const logs = JSON.parse(localStorage.getItem('sl_logs')) || [];
    list.innerHTML = logs.map(l => `
        <div class="p-4 bg-stone-100 rounded-xl border flex justify-between items-center">
            <div>
                <p class="text-[10px] font-bold text-stone-500 uppercase">${l.origin} • ${l.age}d Post-Roast</p>
                <p class="text-sm font-black">${l.recipe}</p>
            </div>
            <div class="text-[10px] font-black uppercase text-emerald-600">${l.note}</div>
        </div>
    `).join('');
}