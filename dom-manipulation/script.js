// Initial quotes array
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" }
];

const QUOTES_STORAGE_KEY = 'quotes';
const LAST_FILTER_KEY = 'lastSelectedCategory';
const MOCK_API_URL = 'https://jsonplaceholder.typicode.com/posts';

// ======================================================================
// Helper Functions for Web Storage (Task 1)
// ======================================================================

/**
 * Saves the current quotes array to local storage.
 */
function saveQuotes() {
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
}

/**
 * Loads quotes from local storage and updates the global quotes array.
 */
function loadQuotes() {
    const storedQuotes = localStorage.getItem(QUOTES_STORAGE_KEY);
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// ======================================================================
// DOM Manipulation & Core Quote Functionality (Task 0)
// ======================================================================

/**
 * Displays a random quote from the currently selected category.
 */
function showRandomQuote() {
    const filter = document.getElementById('categoryFilter').value;
    const filteredQuotes = (filter === 'all')
        ? quotes
        : quotes.filter(quote => quote.category.toLowerCase() === filter.toLowerCase());

    const quoteDisplay = document.getElementById('quoteDisplay');

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes found for this category.</p>';
        // Clear old content, then add the message
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];

    // Advanced DOM Manipulation: Create elements dynamically
    const quoteDiv = document.createElement('div');
    quoteDiv.className = 'quote-item';

    const quoteText = document.createElement('p');
    quoteText.className = 'quote-text';
    quoteText.textContent = `"${randomQuote.text}"`;

    const quoteCategory = document.createElement('p');
    quoteCategory.className = 'category';
    quoteCategory.textContent = `- Category: ${randomQuote.category}`;

    quoteDiv.appendChild(quoteText);
    quoteDiv.appendChild(quoteCategory);

    quoteDisplay.innerHTML = '<h2>Random Quote:</h2>';
    quoteDisplay.appendChild(quoteDiv);

    // Optional Session Storage (Task 1)
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

/**
 * Adds a new quote from the form inputs, updates storage, and repopulates categories.
 */
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (newQuoteText && newQuoteCategory) {
        const newQuote = { text: newQuoteText, category: newQuoteCategory };
        quotes.push(newQuote);

        // Update local storage (Task 1)
        saveQuotes();

        // Update categories dropdown (Task 2)
        populateCategories();

        // Clear inputs
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';

        alert('New Quote Added!');
        filterQuotes(); // Refresh the displayed list/quotes
    } else {
        alert('Please enter both quote text and category.');
    }
}

// Event listener for the "Show Random Quote" button (Task 0)
document.getElementById('newQuote').addEventListener('click', showRandomQuote);


// ======================================================================
// Dynamic Filtering (Task 2)
// ======================================================================

/**
 * Extracts unique categories and populates the category filter dropdown.
 */
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    // Get unique categories, converting to lowercase for case-insensitive comparison
    const uniqueCategories = [...new Set(quotes.map(quote => quote.category.trim()))].sort();

    const currentValue = categoryFilter.value;

    // Clear existing options, but keep the "All Categories" option
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore the selected value
    if (Array.from(categoryFilter.options).some(option => option.value === currentValue)) {
        categoryFilter.value = currentValue;
    } else {
        categoryFilter.value = 'all';
    }
}

/**
 * Filters and displays all quotes belonging to the selected category.
 */
function filterQuotes() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedCategory = categoryFilter.value;
    const quoteDisplay = document.getElementById('quoteDisplay');

    // Save the selected filter to local storage (Task 2)
    localStorage.setItem(LAST_FILTER_KEY, selectedCategory);

    const filteredQuotes = (selectedCategory === 'all')
        ? quotes
        : quotes.filter(quote => quote.category.toLowerCase() === selectedCategory.toLowerCase());

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = `<p>No quotes found for the category: <strong>${selectedCategory}</strong></p>`;
        return;
    }

    // Advanced DOM Manipulation: Display all filtered quotes
    let htmlContent = `<h2>Quotes in Category: ${selectedCategory}</h2>`;
    filteredQuotes.forEach(quote => {
        htmlContent += `
            <div class="quote-item">
                <p class="quote-text">"${quote.text}"</p>
                <p class="category">- Category: ${quote.category}</p>
            </div>
        `;
    });

    quoteDisplay.innerHTML = htmlContent;
}

/**
 * Restores the last selected category from local storage.
 */
function restoreLastFilter() {
    const lastFilter = localStorage.getItem(LAST_FILTER_KEY);
    const categoryFilter = document.getElementById('categoryFilter');

    if (lastFilter) {
        // Check if the filter is a valid option before setting
        if (Array.from(categoryFilter.options).some(option => option.value === lastFilter)) {
            categoryFilter.value = lastFilter;
        }
    }
}


// ======================================================================
// JSON Import/Export (Task 1)
// ======================================================================

/**
 * Exports the current quotes array to a downloadable JSON file.
 */
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Imports quotes from a JSON file selected by the user.
 */
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);

            if (!Array.isArray(importedQuotes) || importedQuotes.some(q => !q.text || !q.category)) {
                alert('Invalid JSON format. Quotes should be an array of objects with "text" and "category" properties.');
                return;
            }

            quotes.push(...importedQuotes);
            saveQuotes();
            populateCategories();
            filterQuotes();
            alert('Quotes imported successfully!');
        } catch (e) {
            alert('Error parsing JSON file: ' + e.message);
        }
    };

    if (event.target.files.length > 0) {
        fileReader.readAsText(event.target.files[0]);
    }
}


// ======================================================================
// Server Sync and Conflict Resolution (Task 3)
// ======================================================================

/**
 * Displays a synchronization status message. This serves as the UI notification.
 */
function setSyncStatus(message, type) {
    const statusDiv = document.getElementById('syncStatus');
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';

    // Set colors based on type for visual feedback
    if (type === 'error') {
        statusDiv.style.backgroundColor = '#f8d7da'; // Light red
        statusDiv.style.color = '#721c24'; // Dark red
    } else if (type === 'success') {
        statusDiv.style.backgroundColor = '#d4edda'; // Light green
        statusDiv.style.color = '#155724'; // Dark green
    } else { // info
        statusDiv.style.backgroundColor = '#fff3cd'; // Light yellow
        statusDiv.style.color = '#856404'; // Dark yellow
    }

    // Hide after 5 seconds
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

/**
 * Simulates fetching quote data from a server.
 */
async function fetchQuotesFromServer() {
    try {
        // Fetch 3 dummy posts from JSONPlaceholder and reformat
        const response = await fetch(`${MOCK_API_URL}?_limit=3`);
        if (!response.ok) throw new Error('Network response was not ok');

        const posts = await response.json();

        // Reformat the mock data
        const serverQuotes = posts.map(post => ({
            text: post.title.charAt(0).toUpperCase() + post.title.slice(1) + ' (Server Update)',
            category: 'Server'
        }));

        return serverQuotes;
    } catch (error) {
        console.error("Error fetching quotes from server:", error);
        setSyncStatus('Error: Failed to fetch data from server.', 'error');
        return [];
    }
}

/**
 * Simulates posting local changes to the server.
 */
async function postLocalQuotesToServer() {
    // In a real app, this sends new quotes to the backend.
    // Here, we just simulate the attempt.
    console.log("Simulating posting local changes to server...");
    // A POST request to JSONPlaceholder usually succeeds, simulating a successful push.
    await fetch(MOCK_API_URL, { method: 'POST', body: JSON.stringify({ status: 'Local push attempt' }) });
}

/**
 * Synchronizes local quotes with server data, applying conflict resolution.
 */
async function syncQuotes() {
    setSyncStatus('Syncing data with server...', 'info');

    // 1. Post local changes first (simulated)
    await postLocalQuotesToServer();

    // 2. Fetch server data
    const serverQuotes = await fetchQuotesFromServer();

    if (serverQuotes.length === 0) return;

    // Conflict Resolution: Server data is merged, avoiding duplicates by quote text.
    let conflictResolved = false;
    const localQuotesTexts = new Set(quotes.map(q => q.text));

    serverQuotes.forEach(serverQuote => {
        // Check for existence. If it's not local, it's a new server quote.
        if (!localQuotesTexts.has(serverQuote.text)) {
            quotes.push(serverQuote);
            conflictResolved = true;
        }
    });

    if (conflictResolved) {
        saveQuotes(); // Update local storage with merged data
        populateCategories();
        filterQuotes();
        // UI Notification for merge/update
        setSyncStatus('Synchronization successful. New quotes from server were merged.', 'success');
    } else {
        // UI Notification for successful, but non-updating sync
        setSyncStatus('Synchronization successful. No new changes detected from server.', 'success');
    }
}

// ======================================================================
// Initialization
// ======================================================================

/**
 * Initializes the application: loads data, populates UI, and sets up sync.
 */
function initialize() {
    // 1. Load quotes from Local Storage (Task 1)
    loadQuotes();

    // 2. Populate Categories (Task 2)
    populateCategories();

    // 3. Restore Last Filter and Display Initial Quotes (Task 2)
    restoreLastFilter();
    filterQuotes();

    // 4. Set up periodic data fetching/sync (Task 3)
    // Run sync every 30 seconds
    setInterval(syncQuotes, 30000);

    // Initial sync on page load (Task 3)
    syncQuotes();
}

// Start the application after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);