// ===== Dynamic Quote Generator with Filtering and Storage =====

// Load quotes or use defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Success is not in what you have, but who you are.", category: "Inspiration" },
    { text: "Your time is limited, don't waste it living someone else's life.", category: "Life" },
    { text: "Push yourself, because no one else is going to do it for you.", category: "Motivation" }
];

// Retrieve last selected filter from storage
let lastSelectedCategory = localStorage.getItem("selectedCategory") || "all";

// Select DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportQuotes");
const importFile = document.getElementById("importFile");

// === Step 2: Populate Categories Dynamically ===
function populateCategories() {
    const categories = [...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore last selected category
    categoryFilter.value = lastSelectedCategory;
}

// === Step 2: Filter Quotes Based on Category ===
function filterQuotes() {
    const selected = categoryFilter.value;
    localStorage.setItem("selectedCategory", selected);

    let filtered = quotes;
    if (selected !== "all") {
        filtered = quotes.filter(q => q.category === selected);
    }

    // Display a random quote from the filtered list
    if (filtered.length === 0) {
        quoteDisplay.textContent = `No quotes available for "${selected}"`;
        return;
    }

    const randomIndex = Math.floor(Math.random() * filtered.length);
    const randomQuote = filtered[randomIndex];

    quoteDisplay.innerHTML = `<em>"${randomQuote.text}"</em><br><strong>— ${randomQuote.category}</strong>`;

    // Save last viewed quote in session storage
    sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// === Step 3: Add a new quote and update categories ===
function addQuote() {
    const newText = document.getElementById("newQuoteText").value.trim();
    const newCategory = document.getElementById("newQuoteCategory").value.trim();

    if (!newText || !newCategory) {
        alert("Please fill in both fields!");
        return;
    }

    quotes.push({ text: newText, category: newCategory });
    localStorage.setItem("quotes", JSON.stringify(quotes));

    // Update categories
    populateCategories();
    filterQuotes();

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    alert("New quote added successfully!");
}

// === Show a new random quote ===
function showRandomQuote() {
    filterQuotes();
}

// === Export quotes as JSON ===
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();

    URL.revokeObjectURL(url);
}

// === Import quotes from JSON file ===
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (Array.isArray(importedQuotes)) {
                // Merge with existing quotes
                quotes = [...quotes, ...importedQuotes];
                localStorage.setItem("quotes", JSON.stringify(quotes));
                populateCategories();
                alert("Quotes imported successfully!");
            } else {
                alert("Invalid JSON format.");
            }
        } catch (error) {
            alert("Error importing file: " + error.message);
        }
    };
    reader.readAsText(file);
}

// === Restore last viewed quote from sessionStorage ===
function loadLastViewedQuote() {
    const lastQuote = sessionStorage.getItem("lastQuote");
    if (lastQuote) {
        const quote = JSON.parse(lastQuote);
        quoteDisplay.innerHTML = `<em>"${quote.text}"</em><br><strong>— ${quote.category}</strong>`;
    } else {
        filterQuotes();
    }
}

// === Event Listeners ===
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportToJsonFile);
importFile.addEventListener("change", importFromJsonFile);

// === Initialize App ===
populateCategories();
loadLastViewedQuote();
