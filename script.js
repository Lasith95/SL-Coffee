// Set Brew Date to Today by default
document.getElementById('brewDate').valueAsDate = new Date();

function calculateStartingPoint() {
    const roast = document.getElementById('roast').value;
    const altitude = parseInt(document.getElementById('altitude').value) || 0;
    const rDate = new Date(document.getElementById('roastDate').value);
    const bDate = new Date(document.getElementById('brewDate').value);
    const advice = document.getElementById('setup-advice');

    advice.classList.remove('hidden');
    
    // Altitude-Based Logic
    let temp = "93°C";
    let ratio = "1:2";
    let densityNote = "Standard bean density.";

    if (altitude > 1600 || roast === 'light') {
        temp = "95-96°C";
        ratio = "1:2.2 to 1:2.5";
        densityNote = "High density bean. Needs high energy (Heat) and more water to unlock sugars.";
    } else if (altitude < 1200 || roast === 'dark') {
        temp = "88-91°C";
        ratio = "1:1.5 to 1:1.8";
        densityNote = "Low density / Soft bean. Extracts very fast. Lower heat to prevent bitterness.";
    }

    // Roast Age Logic
    const ageDays = Math.ceil(Math.abs(bDate - rDate) / (1000 * 60 * 60 * 24));
    let gasAdvice = ageDays < 5 ? "⚠️ Very Gassy! Use a long bloom or coarser grind to manage CO2 resistance." : "✅ Degassed. Extraction should be predictable.";

    advice.innerHTML = `
        <strong>SL Calibration Target:</strong><br>
        🌡️ Temp: ${temp} | ⚖️ Ratio: ${ratio}<br>
        📅 Roast Age: ${ageDays} Days | 🏔️ ${densityNote}<br>
        <em>${gasAdvice}</em>
    `;
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
        desc.innerText = "Salty/Sour/Sharp. You are Under-extracted. You need more water (Yield) to wash away the acids and reach the sugars.";
        note.innerText = "Perger Hierarchy: DO NOT change dose. Fix Yield first.";
    } else if (zone === 'red') {
        box.classList.add('bg-red-500', 'text-white');
        title.innerText = "Decrease Yield";
        desc.innerText = "Bitter/Dry/Ashy. You are Over-extracted. Stop the shot earlier to cut off the hollow and bitter finish.";
        note.innerText = "Perger Hierarchy: Yield is the primary tool for flavor balance.";
    } else if (zone === 'thin') {
        box.classList.add('bg-blue-500', 'text-white');
        title.innerText = "Grind Finer";
        desc.innerText = "Thin/Bland/Watery. Low Strength. Increase surface area by grinding finer. If it's also sour, increase yield too.";
        note.innerText = "Veneziano Logic: Fix Ratio first, then Grind for body.";
    } else if (zone === 'heavy') {
        box.classList.add('bg-stone-800', 'text-white');
        title.innerText = "Grind Coarser";
        desc.innerText = "Heavy/Muddled/Muddy. Strength too high. Speed up flow (Coarser) to reveal clarity and fruit nuances.";
        note.innerText = "Perger Hierarchy: Only adjust grind/time if flavor is already sweet.";
    }
}

function toggleTrouble() {
    document.getElementById('trouble-content').classList.toggle('hidden');
}

function saveSession() {
    const rDate = new Date(document.getElementById('roastDate').value);
    const bDate = new Date(document.getElementById('brewDate').value);
    const age = Math.ceil(Math.abs(bDate - rDate) / (1000 * 60 * 60 * 24)) || 0;

    const session = {
        id: Date.now(),
        origin: document.getElementById('origin').value || "Unknown",
        age: age,
        altitude: document.getElementById('altitude').value || "N/A",
        recipe: `${document.getElementById('dose').value}g / ${document.getElementById('yield').value}g / ${document.getElementById('time').value}s`,
        result: document.getElementById('g-title').innerText || "Balanced"
    };

    let logs = JSON.parse(localStorage.getItem('sl_coffee_logs')) || [];
    logs.unshift(session);
    localStorage.setItem('sl_coffee_logs', JSON.stringify(logs));
    renderLogs();
}

function renderLogs() {
    const list = document.getElementById('log-list');
    const logs = JSON.parse(localStorage.getItem('sl_coffee_logs')) || [];
    if (logs.length === 0) {
        list.innerHTML = `<p class="text-center text-stone-400 italic text-sm">No logs yet.</p>`;
        return;
    }
    list.innerHTML = logs.map(log => `
        <div class="p-4 bg-stone-100 rounded-xl border border-stone-200">
            <div class="flex justify-between font-bold text-[10px] uppercase tracking-widest text-stone-500 mb-1">
                <span>${log.origin} (${log.altitude}m)</span>
                <span class="text-emerald-600">${log.age} Days Post-Roast</span>
            </div>
            <p class="text-sm font-black">${log.recipe}</p>
            <p class="text-[10px] uppercase text-stone-400 mt-1 italic">Note: ${log.result}</p>
        </div>
    `).join('');
}

window.onload = renderLogs;