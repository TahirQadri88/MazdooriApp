// app.js - Local + GitHub Manual Sync (No Firebase)

// === CONFIG - CHANGE THESE ONLY ===
const GITHUB_TOKEN = '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'; // ← YOUR TOKEN HERE
const GITHUB_OWNER = 'TahirQadri88';
const GITHUB_REPO = 'MazdooriApp';
const GITHUB_FILE_PATH = 'records.json';

// Local storage
const LOCAL_RECORDS_KEY = 'mazdoori_my_records';

// Master admin fallback
const masterAdmin = { username: 'admin', password: '123' };
const LOGIN_STATE = 'loginState';

let currentUser = null;
let isAdmin = false;

// Load my local records
function loadMyRecords() {
  const saved = localStorage.getItem(LOCAL_RECORDS_KEY);
  return saved ? JSON.parse(saved) : [];
}

// Save one record locally
function saveRecordLocally(record) {
  const records = loadMyRecords();
  // Prevent duplicate for same date
  if (records.some(r => r.date === record.date)) {
    alert('Aaj ka record pehle se saved hai.');
    return;
  }
  records.push(record);
  localStorage.setItem(LOCAL_RECORDS_KEY, JSON.stringify(records));
  alert('Kaam local mein save ho gaya. Sync button se admin ko bhej dein.');
}

// Sync to GitHub
async function syncToGitHub() {
  if (!GITHUB_TOKEN || GITHUB_TOKEN === 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    alert('Admin ne token set nahi kiya. Sync nahi ho sakta.');
    return;
  }

  const myRecords = loadMyRecords();
  if (myRecords.length === 0) {
    alert('Koi naya record nahi hai sync karne ke liye.');
    return;
  }

  try {
    // Get current file from GitHub
    let sha = null;
    let allRecords = [];
    try {
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
        { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
      );
      if (res.ok) {
        const file = await res.json();
        sha = file.sha;
        allRecords = JSON.parse(atob(file.content));
      }
    } catch (e) {
      // File not exist yet - ok
    }

    // Append only my new records (simple dedup by date + username)
    const existingDates = new Set(allRecords.map(r => r.date + r.username));
    myRecords.forEach(rec => {
      const key = rec.date + currentUser.username;
      if (!existingDates.has(key)) {
        allRecords.push({ ...rec, username: currentUser.username });
      }
    });

    // Update GitHub
    const content = btoa(JSON.stringify(allRecords, null, 2));
    const body = {
      message: `Mazdoori sync from ${currentUser.username} - ${new Date().toISOString()}`,
      content: content,
      sha: sha
    };

    const updateRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.json();
      throw new Error(err.message || 'Failed to sync');
    }

    alert('Sync ho gaya! Data GitHub par chala gaya.');
  } catch (err) {
    alert('Sync fail ho gaya: ' + err.message + '\nInternet check karein.');
    console.error(err);
  }
}

// Pull latest for ledger
async function pullFromGitHub() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );
    if (!res.ok) throw new Error('Cannot load data');
    const file = await res.json();
    const allRecords = JSON.parse(atob(file.content));

    // Show in ledger
    const content = document.getElementById('ledger-content');
    content.innerHTML = '<h3>All Records</h3>';
    allRecords.forEach(r => {
      content.innerHTML += `<p>${r.date} - ${r.username} - Total: Rs ${r.total}</p>`;
    });
  } catch (err) {
    alert('Pull fail: ' + err.message);
  }
}

// Simple login (keep or remove later)
document.getElementById('login-btn').addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (username === masterAdmin.username && password === masterAdmin.password) {
    currentUser = { uid: 'admin', username: 'admin' };
    isAdmin = true;
    localStorage.setItem(LOGIN_STATE, JSON.stringify(currentUser));
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('admin-btn').style.display = 'block';
  } else {
    alert('Invalid credentials');
  }
});

// Check saved login
const saved = localStorage.getItem(LOGIN_STATE);
if (saved) {
  currentUser = JSON.parse(saved);
  isAdmin = currentUser.username === 'admin';
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('main-app').style.display = 'block';
  if (isAdmin) document.getElementById('admin-btn').style.display = 'block';
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem(LOGIN_STATE);
  location.reload();
});

// Navigation (simplified)
document.getElementById('add-work-btn').addEventListener('click', () => {
  document.getElementById('add-work-screen').style.display = 'block';
  document.getElementById('ledger-screen').style.display = 'none';
});
document.getElementById('ledger-btn').addEventListener('click', () => {
  document.getElementById('ledger-screen').style.display = 'block';
  document.getElementById('add-work-screen').style.display = 'none';
});
document.getElementById('admin-btn').addEventListener('click', () => {
  alert('Admin view - abhi sirf ledger dekhein');
});

// Sync & Pull buttons
document.getElementById('sync-btn')?.addEventListener('click', syncToGitHub);
document.getElementById('pull-btn')?.addEventListener('click', pullFromGitHub);

// Placeholder for fields (you can add back your original fields later)
function loadFields() {
  document.getElementById('fields-container').innerHTML = '<p>Fields coming soon...</p>';
}