// Initialize Brew Date to Today
document.getElementById('brewDate').valueAsDate = new Date();

function calculateStartingPoint() {
    const roast = document.getElementById('roast').value;
    const alt = document.getElementById('altitude').value;
    const rDate = new Date(document.getElementById('roastDate').value);
    const bDate = new Date(document.getElementById('brewDate').value);
    const advice = document.getElementById('setup-advice');

    advice.classList.remove('hidden');
    let temp = "93°C";
    let ratio = "1:2";
    
    // Roast Age Logic
    const ageDays = Math.ceil(Math.abs(bDate - rDate) / (1000 * 60 * 60 * 24));
    let gasAdvice = ageDays < 5 ? "Very fresh! Use a 30s bloom or slightly coarser grind to manage CO2." : "Degassed. Extraction should be stable.";

    if (roast === 'light' || alt > 1700) {
        temp = "95-96°C"; ratio = "1:2.2+";
    } else if (roast === 'dark') {
        temp = "88-90°C"; ratio = "1:1.5-1.8";
    }

    advice.innerHTML = `<strong>SL Starting Point:</strong> Temp ${temp} | Ratio ${ratio} | Age: ${ageDays} Days Post-Roast.<br><br>${gasAdvice}`;
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
        desc.innerText = "Compass: Salty/Sour. You are under-extracted. Increase water output (Yield) to pull more sweetness.";
        note.innerText = "Hierarchy: Lock Dose. Change Yield.";
    } else if (zone === 'red') {
        box.classList.add('bg-red-500', 'text-white');
        title.innerText = "Decrease Yield";
        desc.innerText = "Compass: Bitter/Dry/Empty. You are over-extracted. Shorten the yield to avoid the dry finish.";
        note.innerText = "Hierarchy: Yield is the primary fix for balance.";
    } else if (zone === 'thin') {
        box.classList.add('bg-blue-500', 'text-white');
        title.innerText = "Grind Finer";
        desc.innerText = "Compass: Thin/Bland. Low strength. Grinding finer increases contact time and texture.";
        note.innerText = "Hierarchy: Yield is balanced? Now adjust Time/Grind.";
    } else if (zone === 'heavy') {
        box.classList.add('bg-stone-800', 'text-white');
        title.innerText = "Grind Coarser";
        desc.innerText = "Compass: Heavy/Muddled. Strength too high. Speed up flow to reveal clarity and fruit.";
        note.innerText = "Hierarchy: Don't change yield if flavor is good.";
    }
}

function toggleTrouble() {
    const content = document.getElementById('trouble-content');
    content.classList.toggle('hidden');
}

function saveSession() {
    const rDate = new Date(document.getElementById('roastDate').value);
    const bDate = new Date(document.getElementById('brewDate').value);
    const age = Math.ceil(Math.abs(bDate - rDate) / (1000 * 60 * 60 * 24));

    const session = {
        origin: document.getElementById('origin').value || "Unknown",
        age: age,
        recipe: `${document.getElementById('dose').value}g / ${document.getElementById('yield').value}g / ${document.getElementById('time').value}s`,
        result: document.getElementById('g-title').innerText || "No Result"
    };

    let logs = JSON.parse(localStorage.getItem('sl_logs')) || [];
    logs.unshift(session);
    localStorage.setItem('sl_logs', JSON.stringify(logs));
    renderLogs();
}

function renderLogs() {
    const list = document.getElementById('log-list');
    const logs = JSON.parse(localStorage.getItem('sl_logs')) || [];
    list.innerHTML = logs.map(log => `
        <div class="p-4 bg-stone-100 rounded-xl border border-stone-200">
            <div class="flex justify-between font-bold text-xs uppercase tracking-widest mb-1">
                <span>${log.origin}</span>
                <span class="text-emerald-600">${log.age} Days Old</span>
            </div>
            <p class="text-sm font-black">${log.recipe}</p>
            <p class="text-[10px] uppercase text-stone-500 mt-1 italic">Last Note: ${log.result}</p>
        </div>
    `).join('');
}

window.onload = renderLogs;