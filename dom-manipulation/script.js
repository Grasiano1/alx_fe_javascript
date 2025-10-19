// ===== Dynamic Quote Generator with Persistent Storage =====

// === Load quotes from localStorage or use defaults ===
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not in what you have, but who you are.", category: "Inspiration" },
  { text: "Your time is limited, don't waste it living someone else's life.", category: "Life" },
  { text: "Push yourself, because no one else is going to do it for you.", category: "Motivation" }
];

let currentCategory = "All"; // Default category

// === Select DOM elements ===
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryContainer = document.createElement("div");
categoryContainer.id = "categoryFilterContainer";
document.body.insertBefore(categoryContainer, quoteDisplay);

// === Show random quote ===
function showRandomQuote() {
  let filteredQuotes = quotes;

  if (currentCategory !== "All") {
    filteredQuotes = quotes.filter(q => q.category === currentCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = `No quotes available for the "${currentCategory}" category.`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<em>"${randomQuote.text}"</em><br> <strong>— ${randomQuote.category}</strong>`;

  // Save last viewed quote to sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// === Create category dropdown ===
function updateCategoryDropdown() {
  categoryContainer.innerHTML = "";

  const uniqueCategories = ["All", ...new Set(quotes.map(q => q.category))];

  const select = document.createElement("select");
  select.id = "categorySelect";

  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  select.value = currentCategory;

  select.addEventListener("change", (e) => {
    currentCategory = e.target.value;
    showRandomQuote();
  });

  categoryContainer.appendChild(select);
}

// === Create Add Quote Form dynamically ===
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.id = "addQuoteContainer";
  formContainer.innerHTML = `
    <h2>Add a New Quote</h2>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;

  document.body.appendChild(formContainer);

  // Attach event listener
  const addQuoteBtn = document.getElementById("addQuoteBtn");
  addQuoteBtn.addEventListener("click", addQuote);
}

// === Add a new quote ===
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text: newQuoteText, category: newQuoteCategory });

  // Save to localStorage
  localStorage.setItem("quotes", JSON.stringify(quotes));

  updateCategoryDropdown();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("New quote added successfully!");
}

// === Create Export/Import Controls ===
function createFileControls() {
  const fileControls = document.createElement("div");
  fileControls.id = "fileControls";
  fileControls.innerHTML = `
    <h2>Import/Export Quotes</h2>
    <button id="exportQuotes">Export Quotes (JSON)</button>
    <input type="file" id="importFile" accept=".json" />
  `;
  document.body.appendChild(fileControls);

  document.getElementById("exportQuotes").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
}

// === Export quotes as JSON file ===
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

// === Import quotes from a JSON file ===
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes = importedQuotes;
        localStorage.setItem("quotes", JSON.stringify(quotes));
        updateCategoryDropdown();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format. Must be a JSON array of quotes.");
      }
    } catch (error) {
      alert("Error reading file: " + error.message);
    }
  };
  reader.readAsText(file);
}

// === Restore last viewed quote from sessionStorage ===
function loadLastViewedQuote() {
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    quoteDisplay.innerHTML = `<em>"${quote.text}"</em><br> <strong>— ${quote.category}</strong>`;
  } else {
    quoteDisplay.textContent = "Click 'Show New Quote' to start!";
  }
}

// === Event listeners ===
newQuoteBtn.addEventListener("click", showRandomQuote);

// === Initialize App ===
updateCategoryDropdown();
createAddQuoteForm();
createFileControls();
loadLastViewedQuote();
