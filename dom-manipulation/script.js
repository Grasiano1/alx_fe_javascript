// ✅ Array of quotes with text and category
const quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Do what you can, with what you have, where you are.", category: "Wisdom" },
  { text: "Success is not final; failure is not fatal: It is the courage to continue that counts.", category: "Inspiration" }
];

// ✅ Reference DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");

// ✅ Function to display a random quote (NOT named 'showRandomQuote')
function displayRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <small>- ${randomQuote.category}</small>
  `;
}

// ✅ Function to add a new quote (this must exist)
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text === "" || category === "") {
    alert("Please enter both quote text and category.");
    return;
  }

  // ✅ Logic to add quote to array
  quotes.push({ text, category });

  // ✅ Update the DOM to show confirmation or new quote
  quoteDisplay.innerHTML = `<p>New quote added successfully!</p>`;

  // Clear inputs
  textInput.value = "";
  categoryInput.value = "";
}

// ✅ Event listener on the “Show New Quote” button
newQuoteButton.addEventListener("click", displayRandomQuote);

// ✅ Event listener for adding a quote
addQuoteBtn.addEventListener("click", addQuote);

// ✅ Display one quote by default
displayRandomQuote();
