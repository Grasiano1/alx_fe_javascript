// --- GLOBAL VARIABLES AND INITIAL DATA ---

// The master array of quotes (local state)
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration", id: 1 },
    { text: "Strive not to be a success, but rather to be of value.", category: "Inspiration", id: 2 },
    { text: "The two most important days in your life are the day you are born and the day you find out why.", category: "Life", id: 3 },
    { text: "If you want to live a happy life, tie it to a goal, not to people or things.", category: "Life", id: 4 },
    { text: "Do not wait to strike till the iron is hot; but make the iron hot by striking.", category: "Action", id: 5 },
];

// Simulated Server Data (Task 3)
// This array simulates data coming from a remote source.
let serverQuotes = [
    { text: "A computer science server update.", category: "Technology", id: 100 },
    { text: "Server quote takes precedence over local changes.", category: "Conflict", id: 101 },
    { text: "The server is the source of truth.", category: "Technology", id: 102 },
];

// Unique ID counter for new quotes (ensures consistent object keys)
let nextId = 1000;

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const currentQuoteText = document.getElementById('currentQuoteText');
const currentQuoteCategory = document.getElementById('currentQuoteCategory');
const categoryFilter = document.getElementById('categoryFilter');
const filteredListContainer = document.getElementById('filteredListContainer');
const quoteList = document.getElementById('quoteList');
const notificationArea = document.getElementById('notificationArea');
const notificationMessage = document.getElementById('notificationMessage');
const newQuoteButton = document.getElementById('newQuote');
const confirmationModal = document.getElementById('confirmationModal'); // NEW MODAL ELEMENT

// --- WEB STORAGE (TASK 2) & UTILITIES ---

/**
 * Loads quotes from local storage or uses default quotes if none are found.
 */
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        try {
            quotes = JSON.parse(storedQuotes);
            console.log('Quotes loaded from localStorage.');
        } catch (e) {
            console.error('Error parsing stored quotes:', e);
            // Fallback to default if parsing fails
        }
    }
    // Determine the next starting ID to avoid collision
    if (quotes.length > 0) {
        const maxId = quotes.reduce((max, quote) => Math.max(max, quote.id || 0), 0);
        nextId = maxId >= 1000 ? maxId + 1 : 1000;
    }
}

/**
 * Saves the current quotes array to local storage.
 */
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

/**
 * Sets and displays a temporary notification.
 * @param {string} message - The message to display.
 * @param {string} type - The type ('success', 'warning', 'error') for styling.
 */
function showNotification(message, type = 'success') {
    notificationMessage.textContent = message;
    notificationArea.classList.remove('hidden');

    // Reset classes
    notificationMessage.className = 'p-3 rounded-lg shadow-md text-sm font-medium border';

    if (type === 'success') {
        notificationMessage.classList.add('bg-green-100', 'text-green-800', 'border-green-300');
    } else if (type === 'warning') {
        notificationMessage.classList.add('bg-yellow-100', 'text-yellow-800', 'border-yellow-300');
    } else if (type === 'error') {
        notificationMessage.classList.add('bg-red-100', 'text-red-800', 'border-red-300');
    }

    setTimeout(() => {
        notificationArea.classList.add('hidden');
    }, 5000);
}

// --- DYNAMIC CONTENT GENERATION (TASK 1) ---

/**
 * Displays a random quote based on the current filter, or a message if no quotes match.
 */
function displayRandomQuote() {
    const selectedCategory = categoryFilter.value;
    let filteredQuotes;

    if (selectedCategory === 'all') {
        filteredQuotes = quotes;
    } else {
        filteredQuotes = quotes.filter(q => q.category === selectedCategory);
    }

    if (filteredQuotes.length === 0) {
        currentQuoteText.textContent = "No quotes available for this category. Try adding one!";
        currentQuoteCategory.textContent = "";
        sessionStorage.removeItem('lastViewedQuote');
        return;
    }

    // Get a random quote
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];

    // Update DOM
    currentQuoteText.textContent = randomQuote.text;
    currentQuoteCategory.textContent = `- Category: ${randomQuote.category}`;

    // Store last viewed quote in session storage (Task 2 - Optional)
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

/**
 * Adds a new quote from the input fields.
 */
function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');

    const text = textInput.value.trim();
    let category = categoryInput.value.trim();

    if (!text || !category) {
        showNotification("Quote text and category cannot be empty.", 'error');
        return;
    }

    // Capitalize category for consistency
    category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

    const newQuote = {
        text: text,
        category: category,
        id: nextId++ // Assign unique ID
    };

    quotes.push(newQuote);
    saveQuotes();
    showNotification(`New quote added: "${newQuote.text.substring(0, 30)}..."`, 'success');

    // Clear inputs
    textInput.value = '';
    categoryInput.value = '';

    // Refresh categories and filtering view
    populateCategories();

    // If the new category is selected, refresh the list
    if (categoryFilter.value === category || categoryFilter.value === 'all') {
        // After adding, show the quote itself if the filter allows
        displayRandomQuote();
        renderQuotes(); // Also update list view
    }
}

// --- DYNAMIC FILTERING (TASK 2) ---

/**
 * Extracts unique categories and populates the filter dropdown.
 */
function populateCategories() {
    const uniqueCategories = new Set(quotes.map(q => q.category).filter(c => c)); // Filter out any empty categories

    // Get the currently selected value before updating the list
    const currentFilterValue = categoryFilter.value;

    // Clear existing options (except 'All Categories')
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    // Add new unique category options
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore the previously selected filter value if it still exists
    if (currentFilterValue && (currentFilterValue === 'all' || uniqueCategories.has(currentFilterValue))) {
        categoryFilter.value = currentFilterValue;
    } else {
        // If the stored filter is no longer valid, default to 'all'
        categoryFilter.value = 'all';
        localStorage.removeItem('lastSelectedCategory');
    }
}

/**
 * Filters quotes based on the selected category and updates the display.
 * @param {string} selectedCategory - The category value from the dropdown.
 */
function filterQuotes(selectedCategory) {
    // Task 2: Remember the last selected filter
    if (selectedCategory !== 'all') {
        localStorage.setItem('lastSelectedCategory', selectedCategory);
    } else {
        localStorage.removeItem('lastSelectedCategory');
    }

    renderQuotes(selectedCategory);
}

/**
 * Renders the quote display either as a single random quote or a list.
 * @param {string} selectedCategory - The category to filter by.
 */
function renderQuotes(selectedCategory = categoryFilter.value) {
    const isFiltering = selectedCategory !== 'all';

    if (isFiltering) {
        newQuoteButton.textContent = `Show Random ${selectedCategory} Quote`;
        filteredListContainer.classList.remove('hidden');
        quoteDisplay.classList.add('hidden'); // Hide single display

        const filtered = quotes.filter(q => q.category === selectedCategory);
        quoteList.innerHTML = ''; // Clear list

        if (filtered.length === 0) {
            quoteList.innerHTML = '<p class="text-center text-gray-500 p-4">No quotes found for this category.</p>';
            return;
        }

        filtered.forEach(quote => {
            const item = document.createElement('div');
            item.className = 'p-3 bg-white border border-gray-100 rounded-md shadow-sm text-gray-700';
            item.innerHTML = `<p class='text-sm italic'>"${quote.text}"</p><p class='text-xs text-indigo-500 font-medium mt-1'>${quote.category}</p>`;
            quoteList.appendChild(item);
        });
    } else {
        newQuoteButton.textContent = "Show New Quote";
        filteredListContainer.classList.add('hidden');
        quoteDisplay.classList.remove('hidden'); // Show single display
        displayRandomQuote();
    }
}

// --- JSON IMPORT/EXPORT (TASK 2) ---

/**
 * Exports all current quotes to a downloadable JSON file.
 */
function exportQuotes() {
    const json = JSON.stringify(quotes, null, 2);
    const blob = new Blob([json], { type: 'application/json' });

    // Create a temporary link element
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'exported_quotes.json';

    // Programmatically click the link to trigger download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showNotification('Quotes exported successfully as exported_quotes.json', 'success');
}

/**
 * Handles the file input change event for importing JSON.
 * @param {Event} event - The file input change event.
 */
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = function (e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);

            if (!Array.isArray(importedQuotes)) {
                showNotification('Import failed: JSON file must contain an array of quotes.', 'error');
                return;
            }

            // Simple validation: ensure imported quotes have text and category
            const validQuotes = importedQuotes
                .filter(q => q.text && q.category)
                .map(q => ({
                    text: q.text,
                    category: q.category.charAt(0).toUpperCase() + q.category.slice(1).toLowerCase(),
                    id: nextId++
                }));

            quotes.push(...validQuotes);
            saveQuotes();
            populateCategories();
            renderQuotes();
            showNotification(`${validQuotes.length} quotes imported successfully!`, 'success');

        } catch (error) {
            console.error('Import Error:', error);
            showNotification('Import failed: Invalid JSON file format.', 'error');
        } finally {
            // Clear the file input so the same file can be imported again
            event.target.value = '';
        }
    };
    fileReader.readAsText(file);
}

// --- NEW MODAL FUNCTIONS FOR DELETION ---

/**
 * Shows the custom confirmation modal.
 */
function confirmDeleteAllQuotes() {
    confirmationModal.classList.remove('hidden');
}

/**
 * Hides the custom confirmation modal.
 */
function hideModal() {
    confirmationModal.classList.add('hidden');
}

/**
 * Clears all quotes from the array and localStorage.
 */
function deleteAllQuotes() {
    // Clear the local state array
    quotes = [];

    // Clear the storage
    localStorage.removeItem('quotes');

    // Reset dynamic elements
    populateCategories();
    renderQuotes();

    // Reset nextId to ensure new quotes start from a low number if all data is cleared
    nextId = 1;

    // Update UI
    currentQuoteText.textContent = "All quotes have been deleted.";
    currentQuoteCategory.textContent = "";
    showNotification('All local quotes have been successfully deleted.', 'error');
}

// --- SERVER SYNC & CONFLICT RESOLUTION (TASK 3) ---

/**
 * Simulates fetching the latest data from a server.
 * This function occasionally adds a new server quote to simulate updates/conflicts.
 * @returns {Promise<Array>} A promise that resolves with the server quotes.
 */
function simulateServerFetch() {
    return new Promise(resolve => {
        // Occasional simulated server update
        if (Math.random() < 0.2) { // 20% chance of a server update
            const newServerQuote = {
                text: `New Server Insight #${serverQuotes.length + 1}. Time: ${new Date().toLocaleTimeString()}`,
                category: "Server Update",
                id: 200 + serverQuotes.length
            };
            serverQuotes.push(newServerQuote);
        }
        setTimeout(() => resolve(serverQuotes), 500); // 0.5 second latency
    });
}

/**
 * Syncs local quotes with server data and resolves conflicts (Server takes precedence).
 */
async function syncQuotes() {
    try {
        const remoteQuotes = await simulateServerFetch();
        let mergedQuotes = [...quotes];
        let conflictCount = 0;
        let newQuoteCount = 0;

        // 1. Identify new server quotes and quotes that cause conflict
        remoteQuotes.forEach(remoteQuote => {
            const existingIndex = mergedQuotes.findIndex(localQuote => localQuote.id === remoteQuote.id);

            if (existingIndex !== -1) {
                // Conflict Resolution: Server data takes precedence
                // This handles cases where both sides have the same ID but different content.
                if (mergedQuotes[existingIndex].text !== remoteQuote.text || mergedQuotes[existingIndex].category !== remoteQuote.category) {
                    mergedQuotes[existingIndex] = remoteQuote; // Overwrite local version
                    conflictCount++;
                }
            } else {
                // New Quote: Add the server quote
                mergedQuotes.push(remoteQuote);
                newQuoteCount++;
                // Also update the nextId if the server ID is higher
                if (remoteQuote.id >= nextId) {
                    nextId = remoteQuote.id + 1;
                }
            }
        });

        // 2. Update local state if changes were made
        if (conflictCount > 0 || newQuoteCount > 0) {
            quotes = mergedQuotes;
            saveQuotes();
            populateCategories();
            renderQuotes();

            let message = `Sync complete. ${newQuoteCount} new quotes added from server.`;
            if (conflictCount > 0) {
                message += ` ${conflictCount} conflicts resolved (Server data prioritized).`;
                showNotification(message, 'warning');
            } else {
                showNotification(message, 'success');
            }
        } else {
            console.log('Sync check: No changes detected.');
        }

    } catch (error) {
        console.error('Error during sync:', error);
        showNotification('Data synchronization failed.', 'error');
    }
}

// --- INITIALIZATION ---

window.onload = function () {
    loadQuotes();
    populateCategories();

    // Task 2: Restore last selected filter
    const lastFilter = localStorage.getItem('lastSelectedCategory');
    if (lastFilter) {
        categoryFilter.value = lastFilter;
    }

    // Task 2: Restore last viewed quote from session storage (if 'all' is selected)
    const lastQuote = sessionStorage.getItem('lastViewedQuote');
    if (categoryFilter.value === 'all' && lastQuote) {
        try {
            const quoteObj = JSON.parse(lastQuote);
            currentQuoteText.textContent = quoteObj.text;
            currentQuoteCategory.textContent = `- Category: ${quoteObj.category}`;
        } catch (e) {
            displayRandomQuote(); // Show random if session data is corrupted
        }
    } else {
        renderQuotes(); // Initial rendering based on filter (will call displayRandomQuote if 'all')
    }

    // Task 3: Start periodic server sync simulation
    // Checks for updates every 15 seconds
    setInterval(syncQuotes, 15000);
    console.log('Dynamic Quote Generator Initialized. Server sync running every 15s.');
};
