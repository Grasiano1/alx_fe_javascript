// Check for existence of the quotes array with text and category properties
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Inspiration" },
  { text: "Do what you can, with what you have, where you are.", category: "Wisdom" }
];

// Reference to DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");

// ✅ Function: displayRandomQuote (NOT showRandomQuote, as per your requirement)
function displayRandomQuote() {
  // Logic to select a random quote and update the DOM
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><small>- ${quote.category}</small>`;
}

// ✅ Function: addQuote
function addQuote() {
  // Get user input
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  // Validation check
  if (newQuoteText === "" || newQuoteCategory === "") {
    alert("Please enter both a quote and a category!");
    return;
  }

  // Logic to add a new quote to the array and update the DOM
  quotes.push({ text: newQuoteText, category: newQuoteCategory });

  // Clear inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Show confirmation message
  quoteDisplay.innerHTML = `<p>New quote added successfully!</p>`;
}

// ✅ Event listeners
newQuoteButton.addEventListener("click", displayRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Show an initial quote when page loads
displayRandomQuote();
