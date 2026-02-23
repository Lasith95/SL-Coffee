// --- INITIALIZATION ---
document.getElementById('brewDate').valueAsDate = new Date();

// --- AUTH LOGIC (Firebase Compat) ---
const firebaseConfig = { apiKey: "YOUR_KEY", authDomain: "your.firebaseapp.com", projectId: "your-id" };
firebase.initializeApp(firebaseConfig);

function toggleAuth() { document.getElementById('authModal').classList.toggle('hidden'); }

async function handleAuth(type) {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    try {
        if (type === 'register') await firebase.auth().createUserWithEmailAndPassword(email, pass);
        else await firebase.auth().signInWithEmailAndPassword(email, pass);
        toggleAuth();
    } catch (e) { alert(e.message); }
}

firebase.auth().onAuthStateChanged(user => {
    const btn = document.getElementById('loginBtn');
    const welcome = document.getElementById('userWelcome');
    if (user) {
        btn.innerText = "Logout"; btn.onclick = () => firebase.auth().signOut();
        welcome.innerText = `Barista: ${user.email}`;
    } else {
        btn.innerText = "Login / Register"; btn.onclick = toggleAuth;
        welcome.innerText = "Digital Espresso Compass";
    }
});

// --- CORE CALIBRATION LOGIC ---
function calculateStartingPoint() {
    const roast = document.getElementById('roast').value;
    const altitude = parseInt(document.getElementById('altitude').value) || 0;
    const rDate = new Date(document.getElementById('roastDate').value);
    const bDate = new Date(document.getElementById('brewDate').value);
    const advice = document.getElementById('setup-advice');
    const physicsBox = document.getElementById('altitude-physics');
    const bpText = document.getElementById('boiling-point-text');

    physicsBox.classList.remove('hidden');
    
    // Physics Logic (Boiling Point)
    const localBP = (100 - (altitude / 300)).toFixed(1);
    let bpMessage = `Water boils at approximately ${localBP}°C at this altitude.`;
    
    // Target Setting
    let temp = "93°C"; let ratio = "1:2"; let density = "Medium Density.";
    if (altitude > 1600 || roast === 'light') {
        temp = "95-96°C"; ratio = "1:2.2+"; density = "High Density bean. Hard structure.";
        if (localBP < 95) bpMessage = `⚠️ <b>BOILING POINT WARNING:</b> Boiling at ${localBP}°C. Target 96°C is impossible. Compensate with higher YIELD (1:2.5).`;
    } else if (altitude < 1200 || roast === 'dark') {
        temp = "88-91°C"; ratio = "1:1.5-1.8"; density = "Low Density bean. Extracts fast.";
    }

    const ageDays = Math.ceil(Math.abs(bDate - rDate) / (1000 * 60 * 60 * 24)) || 0;
    let ageNote = ageDays < 5 ? "⚠️ VERY GASSY: Freshly roasted. Use long pre-infusion." : "✅ OPTIMAL: Bean is degassed.";

    bpText.innerHTML = bpMessage;
    advice.innerHTML = `<b>SL Target:</b> ${temp} / Ratio ${ratio}<br><b>Density:</b> ${density}<br><b>Age:</b> ${ageDays} Days | ${ageNote}`;
}

function guide(zone) {
    const box = document.getElementById('guidance-box');
    const title = document.getElementById('g-title');
    const desc = document.getElementById('g-desc');
    const note = document.getElementById('g-hierarchy');
    box.classList.remove('hidden', 'bg-yellow-400', 'bg-red-500', 'bg-blue-500', 'bg-stone-800', 'text-white', 'text-black');

    if (zone === 'yellow') {
        box.classList.add('bg-yellow-400', 'text-black');
        title.innerText = "Increase Yield";
        desc.innerText = "Salty/Sour/Sharp/Quick Finish. You are Under-extracted. Add more water (Yield) to pull the sweetness out.";
        note.innerText = "Dose Locked. Yield Changed. Time will follow.";
    } else if (zone === 'red') {
        box.classList.add('bg-red-500', 'text-white');
        title.innerText = "Decrease Yield";
        desc.innerText = "Bitter/Dry/Ashy/Empty. You are Over-extracted. Stop the shot earlier to cut out the dry, powdery finish.";
        note.innerText = "Dose Locked. Yield Shortened.";
    } else if (zone === 'thin') {
        box.classList.add('bg-blue-500', 'text-white');
        title.innerText = "Grind Finer";
        desc.innerText = "Thin/Bland/Watery. Low Strength. Finer grind increases contact time and texture.";
        note.innerText = "Yield is balanced? Adjust Grind for mouthfeel.";
    } else if (zone === 'heavy') {
        box.classList.add('bg-stone-800', 'text-white');
        title.innerText = "Grind Coarser";
        desc.innerText = "Heavy/Muddled/Muddy/Thick. Strength too high. Speed up flow to reveal fruity clarity.";
        note.innerText = "Maintain Yield. Coarsen Grind.";
    }
}

function toggleTrouble() { document.getElementById('trouble-content').classList.toggle('hidden'); }

function saveSession() {
    const rDate = new Date(document.getElementById('roastDate').value);
    const bDate = new Date(document.getElementById('brewDate').value);
    const age = Math.ceil(Math.abs(bDate - rDate) / (1000 * 60 * 60 * 24)) || 0;
    const session = {
        origin: document.getElementById('origin').value || "Unknown",
        age: age,
        recipe: `${document.getElementById('dose').value}g in / ${document.getElementById('yield').value}g out / ${document.getElementById('time').value}s`,
        note: document.getElementById('g-title').innerText || "No Result"
    };
    let logs = JSON.parse(localStorage.getItem('sl_logs')) || [];
    logs.unshift(session);
    localStorage.setItem('sl_logs', JSON.stringify(logs));
    renderLogs();
}

function renderLogs() {
    const list = document.getElementById('log-list');
    const logs = JSON.parse(localStorage.getItem('sl_logs')) || [];
    list.innerHTML = logs.map(l => `
        <div class="p-4 bg-stone-100 rounded-xl border border-stone-200">
            <div class="flex justify-between font-bold text-[10px] uppercase text-stone-500 mb-1">
                <span>${l.origin}</span> <span class="text-emerald-600">${l.age} Days Old</span>
            </div>
            <p class="text-sm font-black">${l.recipe}</p>
            <p class="text-[10px] uppercase text-stone-400 italic">Result: ${l.note}</p>
        </div>
    `).join('');
}
window.onload = renderLogs;