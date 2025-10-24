// Array of quote objects
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
  { text: "Failure will never overtake me if my determination to succeed is strong enough.", category: "Perseverance" }
];

// Get references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// ✅ Function 1: Display a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> "${randomQuote.text}"</p>
    <p><em>Category:</em> ${randomQuote.category}</p>
  `;
}

// ✅ Function 2: Create Add Quote Form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;

  document.body.appendChild(formContainer);

  // Attach event listener for add quote button inside the form
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

// ✅ Function 3: Add a new quote
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (quoteText === "" || quoteCategory === "") {
    alert("Please enter both quote text and category.");
    return;
  }

  const newQuote = { text: quoteText, category: quoteCategory };
  quotes.push(newQuote);

  // Update DOM with the new quote immediately
  quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> "${newQuote.text}"</p>
    <p><em>Category:</em> ${newQuote.category}</p>
  `;

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("New quote added successfully!");
}

// ✅ Event listener for “Show New Quote” button
newQuoteBtn.addEventListener("click", showRandomQuote);

// ✅ Initialize
showRandomQuote();
createAddQuoteForm();
