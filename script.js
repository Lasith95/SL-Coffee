function lockDose() {
    document.getElementById('step1').classList.add('opacity-40', 'pointer-events-none');
    document.getElementById('step2').classList.remove('opacity-40', 'pointer-events-none');
    document.getElementById('step2').classList.replace('border-stone-300', 'border-stone-800');
}

function updateYield(zone) {
    const advice = document.getElementById('yield-advice');
    advice.classList.remove('hidden');
    if (zone === 'yellow') {
        advice.innerHTML = "➜ <b>Increase Yield:</b> You are in the Yellow Zone (Under-extracted/Strong)[cite: 2, 4]. More water will pull out sugary sweetness to balance the saltiness.";
    } else {
        advice.innerHTML = "➜ <b>Decrease Yield:</b> You are in the Red Zone (Over-extracted/Weak)[cite: 2, 4]. Stop the shot earlier to avoid 'Bitter' and 'Dry' notes.";
    }
}

function lockYield() {
    document.getElementById('step2').classList.add('opacity-40', 'pointer-events-none');
    document.getElementById('step3').classList.remove('opacity-40', 'pointer-events-none');
    document.getElementById('step3').classList.replace('border-stone-300', 'border-stone-800');
}

function updateGrind(mode) {
    const advice = document.getElementById('grind-advice');
    advice.classList.remove('hidden');
    if (mode === 'finer') {
        advice.innerHTML = "<b>Action: Grind Finer.</b> This increases contact time and extraction. Warning: Don't grind so fine that you cause blockages or uneven flow.";
    } else {
        advice.innerHTML = "<b>Action: Grind Coarser.</b> This will reduce the strength while keeping your balanced flavor yield.";
    }
}