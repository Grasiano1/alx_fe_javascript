// Initial array of quote objects
let quotes = [
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

// === Function: show a random quote ===
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
}

// === Function: create dropdown filter dynamically ===
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

// === Function: create the Add Quote form dynamically ===
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

  // Attach event listener to the add quote button
  const addQuoteBtn = document.getElementById("addQuoteBtn");
  addQuoteBtn.addEventListener("click", addQuote);
}

// === Function: logic to add a new quote ===
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text: newQuoteText, category: newQuoteCategory });

  updateCategoryDropdown(); // Refresh categories
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("New quote added successfully!");
}

// === Event listeners ===
newQuoteBtn.addEventListener("click", showRandomQuote);

// === Initialize the app ===
updateCategoryDropdown();
createAddQuoteForm();
