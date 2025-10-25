// ---------- Configuration & Default Data ----------
const LOCAL_STORAGE_KEY = "dynamicQuotes_app_quotes_v1";
const SESSION_STORAGE_KEY_LAST = "dynamicQuotes_app_lastViewed";

const defaultQuotes = [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
    { text: "Failure will never overtake me if my determination to succeed is strong enough.", category: "Perseverance" }
];

// ---------- DOM References ----------
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const exportJsonBtn = document.getElementById("exportJsonBtn");
const importFileInput = document.getElementById("importFile");
const importTriggerBtn = document.getElementById("importTriggerBtn");
const clearStorageBtn = document.getElementById("clearStorageBtn");

// Inputs
const newQuoteTextInput = document.getElementById("newQuoteText");
const newQuoteCategoryInput = document.getElementById("newQuoteCategory");

// ---------- Application State ----------
let quotes = []; // populated by loadFromLocalStorage()

// ---------- Storage Helpers ----------
function saveQuotesToLocalStorage() {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
    } catch (err) {
        console.error("Failed to save to localStorage:", err);
        alert("Unable to save quotes to local storage (maybe storage is full or disabled).");
    }
}

function loadQuotesFromLocalStorage() {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!raw) {
            quotes = [...defaultQuotes];
            saveQuotesToLocalStorage();
            return;
        }
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            // Basic validation: keep only objects with at least a text property
            quotes = parsed.filter(q => q && typeof q.text === "string").map(q => ({
                text: String(q.text),
                category: q.category ? String(q.category) : "Uncategorized"
            }));
            // If after validation array is empty, fallback to defaults
            if (quotes.length === 0) quotes = [...defaultQuotes];
        } else {
            quotes = [...defaultQuotes];
            saveQuotesToLocalStorage();
        }
    } catch (err) {
        console.error("Failed to load from localStorage:", err);
        quotes = [...defaultQuotes];
    }
}

function saveLastViewedToSession(index) {
    try {
        sessionStorage.setItem(SESSION_STORAGE_KEY_LAST, String(index));
    } catch (err) {
        console.warn("Could not save session data:", err);
    }
}

function loadLastViewedFromSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_STORAGE_KEY_LAST);
        if (raw === null) return null;
        const idx = Number(raw);
        return (Number.isInteger(idx) && idx >= 0 && idx < quotes.length) ? idx : null;
    } catch (err) {
        return null;
    }
}

// ---------- UI & Functionality ----------
function renderQuote(quoteObj, index = null) {
    quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> "${escapeHtml(quoteObj.text)}"</p>
    <p><em>Category:</em> ${escapeHtml(quoteObj.category || "Uncategorized")}</p>
    ${index !== null ? `<p style="font-size:12px;color:#666">#${index}</p>` : ""}
  `;
    if (index !== null) saveLastViewedToSession(index);
}

function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.textContent = "No quotes available.";
        return;
    }
    const idx = Math.floor(Math.random() * quotes.length);
    renderQuote(quotes[idx], idx);
}

function addQuote() {
    const quoteText = newQuoteTextInput.value.trim();
    const quoteCategory = newQuoteCategoryInput.value.trim() || "Uncategorized";

    if (!quoteText) {
        alert("Please enter quote text.");
        return;
    }

    const newQuote = { text: quoteText, category: quoteCategory };
    quotes.push(newQuote);
    saveQuotesToLocalStorage();

    // Immediately display the added quote and remember it in session
    renderQuote(newQuote, quotes.length - 1);

    // Clear inputs
    newQuoteTextInput.value = "";
    newQuoteCategoryInput.value = "";

    // Friendly UX
    setTimeout(() => { alert("New quote added and saved to local storage."); }, 50);
}

// ---------- JSON Export ----------
function exportQuotesToJson() {
    try {
        const json = JSON.stringify(quotes, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `quotes_export_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Export failed:", err);
        alert("Failed to export quotes.");
    }
}

// ---------- JSON Import ----------
function importFromJsonFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const parsed = JSON.parse(e.target.result);
            if (!Array.isArray(parsed)) {
                alert("Imported JSON must be an array of quote objects.");
                return;
            }

            // Validate and normalize imported items
            const valid = [];
            parsed.forEach((item, i) => {
                if (item && typeof item.text === "string") {
                    valid.push({
                        text: String(item.text),
                        category: item.category ? String(item.category) : "Uncategorized"
                    });
                } else {
                    console.warn(`Skipping invalid item at index ${i}`, item);
                }
            });

            if (valid.length === 0) {
                alert("No valid quotes found in the imported file.");
                return;
            }

            // Merge imported quotes into current array
            quotes.push(...valid);
            saveQuotesToLocalStorage();

            // Show last imported quote
            renderQuote(quotes[quotes.length - 1], quotes.length - 1);

            alert(`Imported ${valid.length} quotes successfully!`);
        } catch (err) {
            console.error("Import error:", err);
            alert("Failed to parse JSON file. Make sure it is valid JSON.");
        } finally {
            // reset file input so the same file can be imported again if desired
            importFileInput.value = "";
        }
    };

    reader.onerror = function (err) {
        console.error("File read error:", err);
        alert("Failed to read the selected file.");
        importFileInput.value = "";
    };

    reader.readAsText(file);
}

// ---------- Utilities ----------
function escapeHtml(str) {
    // minimal escaping for safe HTML insertion
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// ---------- Clear / Reset ----------
function clearStoredQuotes() {
    if (!confirm("This will clear stored quotes and reset to default quotes. Continue?")) return;
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    loadQuotesFromLocalStorage();
    showRandomQuote();
    alert("Stored quotes reset to defaults.");
}

// ---------- Initialization ----------
function initializeApp() {
    // load stored quotes (or default)
    loadQuotesFromLocalStorage();

    // Attach event listeners
    newQuoteBtn.addEventListener("click", showRandomQuote);
    addQuoteBtn.addEventListener("click", addQuote);
    exportJsonBtn.addEventListener("click", exportQuotesToJson);
    importFileInput.addEventListener("change", importFromJsonFile);
    importTriggerBtn.addEventListener("click", () => importFileInput.click());
    clearStorageBtn.addEventListener("click", clearStoredQuotes);

    // If user had a last viewed quote in session, show it; otherwise show random
    const lastIdx = loadLastViewedFromSession();
    if (lastIdx !== null && quotes[lastIdx]) {
        renderQuote(quotes[lastIdx], lastIdx);
    } else {
        showRandomQuote();
    }
}

// Run the app
initializeApp();
