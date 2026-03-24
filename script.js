// Key for saving data in localStorage
const STORAGE_KEY = "moodEntries";

// Load existing entries
let entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Get DOM elements
const moodPicker = document.getElementById("moodPicker");
const moodButtons = document.querySelectorAll(".mood-grid button");
const activitiesInput = document.getElementById("activities");
const saveBtn = document.getElementById("save-btn");
const filterBar = document.getElementById("filter");
const entriesList = document.getElementById("entries-list");
const searchInput = document.getElementById("search");
const toggleBtn = document.getElementById("toggle-theme");
const moodTabs = document.getElementById("moodTabs");

// State variables
let selectedMood = "";
let activeFilter = "";

// Mood colors
const moodColors = {
    happy: "#ffd93d",
    sad: "#4dabf7",
    angry: "#ff6b6b",
    relaxed: "#63e6be"
};

// Save data to localStorage
const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

// Select mood
moodPicker.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    moodButtons.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    selectedMood = btn.dataset.mood;
});

// Save entry
saveBtn.addEventListener("click", () => {
    const activities = activitiesInput.value.trim().split("\n").filter(Boolean);

    if (!selectedMood) return alert("Select a mood!");
    if (!activities.length) return alert("Add activity!");

    entries.push({
        id: Date.now(),
        date: new Date().toLocaleString(),
        mood: selectedMood,
        activities
    });

    saveToStorage();

    // Reset inputs
    activitiesInput.value = "";
    selectedMood = "";
    moodButtons.forEach(b => b.classList.remove("selected"));

    renderEntries();
    updateStats();
});

// Filter buttons
filterBar.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    activeFilter = btn.dataset.filter;

    document.querySelectorAll(".filter-bar button")
        .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    renderEntries();
});

// Sliding tabs filter
moodTabs.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    activeFilter = btn.dataset.tab;

    document.querySelectorAll(".mood-tabs button")
        .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    renderEntries();
});

// Search input
searchInput.addEventListener("input", renderEntries);

// Delete entry
entriesList.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = Number(btn.dataset.id);

    entries = entries.filter(e => e.id !== id);

    saveToStorage();
    renderEntries();
    updateStats();
});

// Render entries on screen
function renderEntries() {
    entriesList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();

    entries
        .filter(e => {
            const moodMatch = activeFilter ? e.mood === activeFilter : true;
            const searchMatch = e.activities.some(a =>
                a.toLowerCase().includes(searchText)
            );
            return moodMatch && searchMatch;
        })
        .sort((a, b) => b.id - a.id)
        .forEach(entry => {
            const div = document.createElement("div");
            div.className = "entry";

            div.innerHTML = `
        <div style="border-left:5px solid ${moodColors[entry.mood]}; padding-left:10px;">
          <strong>${entry.date} • ${entry.mood}</strong><br>
          ${entry.activities.map(a => `- ${a}`).join("<br>")}
        </div>
        <button data-id="${entry.id}">X</button>
      `;

            entriesList.appendChild(div);
        });
}

// Update stats dashboard
function updateStats() {
    if (!entries.length) return;

    document.getElementById("totalEntries").textContent = entries.length;

    const counts = {};
    entries.forEach(e => counts[e.mood] = (counts[e.mood] || 0) + 1);

    const most = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    document.getElementById("mostFrequent").textContent = most;

    document.getElementById("weeklyAvg").textContent =
        (entries.length / 7).toFixed(1);

    document.getElementById("streak").textContent = entries.length;

    const moodBars = document.getElementById("moodBars");
    moodBars.innerHTML = "";

    for (let mood in counts) {
        const percent = (counts[mood] / entries.length) * 100;

        const row = document.createElement("div");
        row.className = "bar-row";

        row.innerHTML = `
      <span style="width:80px">${mood}</span>
      <div class="bar">
        <div class="bar-fill" style="width:${percent}%; background:${moodColors[mood]}"></div>
      </div>
      <span>${counts[mood]}</span>
    `;

        moodBars.appendChild(row);
    }
}

// Toggle dark/light mode
toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
});

// Default active tab
document.querySelector(".mood-tabs button").classList.add("active");

// Initial render
renderEntries();
updateStats();