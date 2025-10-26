// quotes array with objects containing text and category
const quotes = [
    { text: "The best way to predict the future is to create it.", category: "Motivation" },
    { text: "Do what you can, with what you have, where you are.", category: "Wisdom" },
    { text: "Success usually comes to those who are too busy to be looking for it.", category: "Success" }
];

// DOM refs
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');

// displayRandomQuote function (selects random quote and updates DOM)
function displayRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.textContent = 'No quotes available.';
        return;
    }
    const idx = Math.floor(Math.random() * quotes.length);
    const q = quotes[idx];
    quoteDisplay.innerHTML = `<p>"${q.text}"</p><small>- ${q.category}</small>`;
}

// addQuote function (adds to quotes array and updates DOM)
function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const catInput = document.getElementById('newQuoteCategory');
    const text = textInput.value.trim();
    const category = catInput.value.trim();

    if (!text || !category) {
        alert('Please enter both quote text and category.');
        return;
    }

    // add to quotes array
    quotes.push({ text, category });

    // update DOM to reflect change (show newly added quote)
    quoteDisplay.innerHTML = `<p>Added: "${text}"</p><small>- ${category}</small>`;

    // clear inputs
    textInput.value = '';
    catInput.value = '';
}

// Event listeners
newQuoteButton.addEventListener('click', displayRandomQuote); // event listener on "Show New Quote"
addQuoteBtn.addEventListener('click', addQuote);

// show an initial quote
displayRandomQuote();
