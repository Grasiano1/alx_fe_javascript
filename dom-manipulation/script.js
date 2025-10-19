// === Simulated Server URL (using mock API) ===
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock API

// === Fetch quotes from mock server ===
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    // Simulate quotes from server (only take first few)
    const serverQuotes = data.slice(0, 5).map(item => ({
      text: item.title,
      author: "Server Author",
      category: "Server"
    }));

    console.log("Fetched quotes from server:", serverQuotes);
    return serverQuotes;
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
    return [];
  }
}

// === Post new quotes to mock server ===
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    const data = await response.json();
    console.log("Quote synced to server:", data);
  } catch (error) {
    console.error("Error posting quote:", error);
  }
}

// === Conflict Resolution (server takes precedence) ===
function resolveConflicts(localQuotes, serverQuotes) {
  const merged = [...serverQuotes];

  // Add local quotes not found on server
  localQuotes.forEach(local => {
    if (!serverQuotes.some(s => s.text === local.text)) {
      merged.push(local);
    }
  });

  console.log("Conflict resolved: merged data ->", merged);
  return merged;
}

// === Sync Quotes with Server ===
async function syncQuotes() {
  console.log("Starting quote sync...");
  const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
  const serverQuotes = await fetchQuotesFromServer();

  const resolvedQuotes = resolveConflicts(localQuotes, serverQuotes);

  // Save resolved data locally
  localStorage.setItem("quotes", JSON.stringify(resolvedQuotes));

  // Notify user
  displayNotification("Quotes synced successfully with the server!");
}

// === Periodically Check for Server Updates ===
setInterval(syncQuotes, 30000); // every 30 seconds

// === Display Notification on UI ===
function displayNotification(message) {
  let note = document.getElementById("notification");
  if (!note) {
    note = document.createElement("div");
    note.id = "notification";
    note.style.position = "fixed";
    note.style.bottom = "10px";
    note.style.right = "10px";
    note.style.padding = "10px 15px";
    note.style.background = "#222";
    note.style.color = "#fff";
    note.style.borderRadius = "6px";
    note.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    document.body.appendChild(note);
  }
  note.textContent = message;
  note.style.display = "block";
  setTimeout(() => (note.style.display = "none"), 4000);
}

// === Example usage when adding a new quote ===
function addQuote(text, author, category) {
  const newQuote = { text, author, category };
  let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
  quotes.push(newQuote);
  localStorage.setItem("quotes", JSON.stringify(quotes));

  // Immediately sync with server
  postQuoteToServer(newQuote);
  displayNotification("New quote added and synced to server!");
}
