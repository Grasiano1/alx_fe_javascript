/* ===== Sync Layer for Dynamic Quote Generator =====
   Requirements implemented:
   - Periodic polling from a configurable server endpoint (default: JSONPlaceholder)
   - Local quote objects contain { id, text, category, lastModified }
   - Conflict detection (based on id & lastModified)
   - Default resolution: server wins; user can override via UI
   - Manual sync button and status indicator
*/

// ----------------- Configuration -----------------
const SERVER_BASE = "https://jsonplaceholder.typicode.com"; // mock server (change to your real endpoint)
const SERVER_RESOURCE = "/posts"; // this will be used to simulate fetching quotes
const POLL_INTERVAL_MS = 30_000; // poll every 30 seconds (adjust as required)

// ----------------- Utilities -----------------
function nowISO() {
  return new Date().toISOString();
}
function generateId() {
  // simple UUID v4-ish generator (good enough for client-side ids)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ----------------- Local storage bootsrap -----------------
// Ensure quotes have id and lastModified fields
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { id: generateId(), text: "The best way to get started is to quit talking and begin doing.", category: "Motivation", lastModified: nowISO() },
  { id: generateId(), text: "Success is not in what you have, but who you are.", category: "Inspiration", lastModified: nowISO() },
  { id: generateId(), text: "Your time is limited, don't waste it living someone else's life.", category: "Life", lastModified: nowISO() },
  { id: generateId(), text: "Push yourself, because no one else is going to do it for you.", category: "Motivation", lastModified: nowISO() }
];
localStorage.setItem("quotes", JSON.stringify(quotes));

// Save helper that keeps lastModified updated
function saveLocalQuotes() {
  // Ensure every quote has id and lastModified
  quotes = quotes.map(q => ({
    id: q.id || generateId(),
    text: q.text,
    category: q.category,
    lastModified: q.lastModified || nowISO()
  }));
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ----------------- UI hooks (assumes these elements exist in HTML) -----------------
const syncStatusEl = document.getElementById("syncStatus");
const manualSyncBtn = document.getElementById("manualSyncBtn");
const conflictArea = document.getElementById("conflictArea");
const conflictList = document.getElementById("conflictList");
const acceptServerBtn = document.getElementById("acceptServerBtn");
const keepLocalBtn = document.getElementById("keepLocalBtn");

// ----------------- Sync state -----------------
let polling = true;
let pollingTimer = null;
let lastServerFetchAt = null;
let pendingConflicts = []; // array of { id, local, server }

// ----------------- Server interaction helpers -----------------
async function fetchServerQuotes() {
  // This uses JSONPlaceholder /posts to simulate server data.
  // Because JSONPlaceholder returns different fields, we map them to our shape:
  // server -> { id: <use post.id as string>, text: post.title, category: 'server', lastModified: nowISO() }
  // Replace with your actual API and mapping when available.
  const url = SERVER_BASE + SERVER_RESOURCE;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Server responded ${resp.status}`);
  const data = await resp.json();
  // Map to our shape. JSONPlaceholder posts have id, title, body - we use title as text.
  const mapped = data.slice(0, 50).map(p => ({
    id: String(p.id), // server id
    text: p.title || p.body || `Server quote ${p.id}`,
    category: "server", // simulated category — replace mapping if server returns category
    lastModified: nowISO() // server timestamp (simulated)
  }));
  lastServerFetchAt = nowISO();
  return mapped;
}

async function pushLocalQuoteToServer(localQuote) {
  // Try POST or PUT depending on whether server id exists and you have a real endpoint.
  // JSONPlaceholder accepts POST and returns a simulated created object.
  const url = SERVER_BASE + SERVER_RESOURCE;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: localQuote.text, body: localQuote.text, userId: 1 })
  });
  if (!resp.ok) {
    throw new Error(`Push failed: ${resp.status}`);
  }
  const created = await resp.json();
  return created; // simulated server object
}

// ----------------- Conflict detection & resolution -----------------
function detectConflicts(serverQuotes) {
  // Build maps for quick lookup
  const localMap = new Map(quotes.map(q => [String(q.id), q]));
  const serverMap = new Map(serverQuotes.map(sq => [String(sq.id), sq]));

  const conflicts = [];

  // server overwrites local if ids match and times differ
  for (const [sid, sQuote] of serverMap) {
    if (localMap.has(sid)) {
      const lq = localMap.get(sid);
      // compare lastModified timestamps (ISO strings)
      if (lq.lastModified && sQuote.lastModified && lq.lastModified !== sQuote.lastModified) {
        // We have a timestamp mismatch — it's a conflict to present to user
        conflicts.push({ id: sid, local: lq, server: sQuote });
      } else if (lq.text !== sQuote.text || lq.category !== sQuote.category) {
        // also flag non-equal content (safer)
        conflicts.push({ id: sid, local: lq, server: sQuote });
      }
    }
  }

  // Optionally: detect server items absent locally (new server items)
  // We'll treat those as "server-new" items to be merged without conflict.

  return conflicts;
}

function applyServerWins(serverQuotes) {
  // server takes precedence: replace local quotes that match server id, and add any server-only items
  const localMap = new Map(quotes.map(q => [String(q.id), q]));
  const merged = new Map(localMap); // start with local

  for (const s of serverQuotes) {
    merged.set(String(s.id), {
      id: String(s.id),
      text: s.text,
      category: s.category || "server",
      lastModified: s.lastModified || nowISO()
    });
  }

  // Convert back to array
  quotes = Array.from(merged.values());
  saveLocalQuotes();
}

function applyKeepLocal(conflicts) {
  // Do nothing for conflicts — keep local as-is. Optionally push local to server.
  // We'll attempt to push local versions to server (best-effort).
  conflicts.forEach(c => {
    // push asynchronously but don't block UI; errors ignored for now
    pushLocalQuoteToServer(c.local).catch(err => {
      console.warn("Failed to push local to server for id", c.local.id, err);
    });
  });
  // no change to local quotes
  saveLocalQuotes();
}

// ----------------- UI: show conflicts -----------------
function showConflictsUI(conflicts) {
  pendingConflicts = conflicts;
  if (conflicts.length === 0) {
    conflictArea.style.display = 'none';
    conflictList.innerHTML = '';
    return;
  }
  conflictArea.style.display = 'block';
  conflictList.innerHTML = '';
  conflicts.forEach(c => {
    const node = document.createElement('div');
    node.style.marginBottom = '8px';
    node.innerHTML = `
      <div><strong>ID:</strong> ${c.id}</div>
      <div><strong>Local:</strong> ${escapeHtml(c.local.text)} <em>(${c.local.category})</em></div>
      <div><strong>Server:</strong> ${escapeHtml(c.server.text)} <em>(${c.server.category})</em></div>
      <hr/>
    `;
    conflictList.appendChild(node);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[ch]));
}

// ----------------- Sync flow -----------------
async function syncOnce({ showUiNotifications = true } = {}) {
  syncStatusEl.textContent = "Syncing...";
  try {
    const serverQuotes = await fetchServerQuotes();

    // conflict detection
    const conflicts = detectConflicts(serverQuotes);
    if (conflicts.length > 0) {
      // show UI and pause automatic application so user can choose
      showConflictsUI(conflicts);
      syncStatusEl.textContent = `Conflicts: ${conflicts.length}`;
      // don't apply server wins automatically — wait for user action
      return { status: 'conflicts', conflicts };
    }

    // if no conflicts -> apply server (server wins) by default
    applyServerWins(serverQuotes);
    // refresh UI elements (your app's populateCategories/filter function)
    if (typeof populateCategories === 'function') populateCategories();
    if (typeof filterQuotes === 'function') filterQuotes();
    syncStatusEl.textContent = `Synced at ${nowISO()}`;
    return { status: 'ok' };

  } catch (err) {
    console.error("Sync failed:", err);
    syncStatusEl.textContent = `Sync failed: ${err.message}`;
    return { status: 'error', error: err };
  }
}

// ----------------- Polling (avoid overlap using setTimeout) -----------------
async function startPolling() {
  if (!polling) return;
  try {
    await syncOnce();
  } finally {
    pollingTimer = setTimeout(startPolling, POLL_INTERVAL_MS);
  }
}
function stopPolling() {
  polling = false;
  if (pollingTimer) clearTimeout(pollingTimer);
}

// ----------------- Manual controls & conflict handlers -----------------
manualSyncBtn.addEventListener('click', () => {
  // manual immediate sync
  syncOnce({ showUiNotifications: true });
});

acceptServerBtn.addEventListener('click', () => {
  // Apply server versions for pendingConflicts -> we already have server data in conflicts
  // For safety, fetch server again and apply server-wins merge
  fetchServerQuotes()
    .then(serverQuotes => {
      applyServerWins(serverQuotes);
      showConflictsUI([]); // hide UI
      if (typeof populateCategories === 'function') populateCategories();
      if (typeof filterQuotes === 'function') filterQuotes();
      syncStatusEl.textContent = `Server accepted at ${nowISO()}`;
    })
    .catch(err => {
      alert("Failed to fetch server data: " + err.message);
    });
});

keepLocalBtn.addEventListener('click', () => {
  // Keep local versions, attempt to push them to server
  if (!pendingConflicts || pendingConflicts.length === 0) {
    showConflictsUI([]);
    return;
  }
  applyKeepLocal(pendingConflicts);
  showConflictsUI([]); // hide UI
  syncStatusEl.textContent = `Kept local at ${nowISO()}`;
});

// ----------------- Start polling automatically -----------------
startPolling(); // begin periodic sync

// ----------------- Ensure local saves on changes in your existing app -----------------
// Call saveLocalQuotes() when you add/update/delete quotes elsewhere in your code.
// Example addQuote function modification:
function addQuoteFromApp(newText, newCategory) {
  const newQ = { id: generateId(), text: newText, category: newCategory, lastModified: nowISO() };
  quotes.push(newQ);
  saveLocalQuotes();
  if (typeof populateCategories === 'function') populateCategories();
  if (typeof filterQuotes === 'function') filterQuotes();
  // Optionally push to server:
  // pushLocalQuoteToServer(newQ).catch(err => console.warn('push failed', err));
}
