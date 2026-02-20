// app.js
const firebaseConfig = {
  apiKey: "AIzaSyA4jzSmYJeDgULCDdpAblmS4x-wU9szMJc",
  authDomain: "mazdooriapp.firebaseapp.com",
  projectId: "mazdooriapp",
  storageBucket: "mazdooriapp.firebasestorage.app",
  messagingSenderId: "407506330676",
  appId: "1:407506330676:web:00fdf738e749ecea3c1661"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const appId = 'khyber-traders'; // Assuming an appId, adjust as needed

// Paths as per spec
const recordsPath = `/artifacts/${appId}/public/data/records`;
const usersPath = `/artifacts/${appId}/public/data/users`;
const configPath = `/artifacts/${appId}/public/data/config/main`;

// Default fields if config empty
const defaultFields = {
    Labour: [
        { name: '1st floor carton', rate: 18 },
        { name: '1st floor bags', rate: 18 },
        { name: 'Makkah Market', rate: 18 },
        { name: '2nd floor', rate: 18 },
        { name: '3rd floor', rate: 18 },
        { name: 'Ahmed Chamber', rate: 18 }
    ],
    Transport: [
        { name: 'TPT Out', rate: 30 },
        { name: 'BABA', rate: 30 },
        { name: 'TPT OTHERS', rate: 30 }
    ]
    // Supply not specified, add if needed
};

// Master admin fallback
const masterAdmin = { username: 'admin', password: '123' };

// Local storage keys
const LOGIN_STATE = 'loginState';

// Current user
let currentUser = null;
let isAdmin = false;
let fields = { Labour: [], Transport: [], Supply: [] };

// Helper: Guard Firestore calls
function guardFirestore(fn) {
    if (!auth.currentUser) return;
    fn();
}

// Init auth
auth.signInAnonymously().catch(console.error);

// Load config
async function loadConfig() {
    const configDoc = await db.doc(configPath).get();
    if (configDoc.exists && configDoc.data().fields) {
        fields = configDoc.data().fields;
    } else {
        // Pre-load defaults
        fields = defaultFields;
        await db.doc(configPath).set({ fields });
    }
}

// Login
document.getElementById('login-btn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Check master admin first
    if (username === masterAdmin.username && password === masterAdmin.password) {
        currentUser = { uid: 'admin', username: 'admin' };
        isAdmin = true;
        postLogin();
        return;
    }

    // Check cloud users
    const usersQuery = await db.collection(usersPath).where('username', '==', username).get();
    if (!usersQuery.empty) {
        const userDoc = usersQuery.docs[0];
        if (userDoc.data().password === password) {
            currentUser = { uid: userDoc.id, username };
            isAdmin = userDoc.data().isAdmin || false;
            postLogin();
            return;
        }
    }
    alert('Invalid credentials');
});

function postLogin() {
    localStorage.setItem(LOGIN_STATE, JSON.stringify(currentUser));
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    if (isAdmin) {
        document.getElementById('admin-btn').style.display = 'block';
        document.querySelector('#view-mode option[value="summary"]').style.display = 'block';
    }
    loadConfig();
    showScreen('add-work-screen');
}

// Check persisted login
const savedState = localStorage.getItem(LOGIN_STATE);
if (savedState) {
    currentUser = JSON.parse(savedState);
    isAdmin = currentUser.username === 'admin'; // Simplify, adjust if more admins
    postLogin();
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem(LOGIN_STATE);
    location.reload();
});

// Navigation
document.getElementById('add-work-btn').addEventListener('click', () => showScreen('add-work-screen'));
document.getElementById('ledger-btn').addEventListener('click', () => showScreen('ledger-screen'));
document.getElementById('admin-btn').addEventListener('click', () => showScreen('admin-panel'));

function showScreen(screenId) {
    const screens = ['add-work-screen', 'ledger-screen', 'admin-panel'];
    screens.forEach(id => document.getElementById(id).style.display = 'none');
    document.getElementById(screenId).style.display = 'block';
    if (screenId === 'add-work-screen') loadFields();
    if (screenId === 'admin-panel') loadAdminData();
    if (screenId === 'ledger-screen') loadLedger();
}

// Load fields for add work
function loadFields() {
    const container = document.getElementById('fields-container');
    container.innerHTML = '';
    Object.keys(fields).forEach(type => {
        const group = document.createElement('div');
        group.className = 'field-group';
        group.innerHTML = `<h3>${type} (@ Rs ${fields[type][0].rate})</h3>`;
        fields[type].forEach(field => {
            group.innerHTML += `
                <div class="field">
                    <label>${field.name}</label>
                    <input type="number" data-name="${field.name}" value="0" min="0">
                </div>
            `;
        });
        container.appendChild(group);
    });
}

// Add Work Logic
const workDateInput = document.getElementById('work-date');
workDateInput.addEventListener('change', async () => {
    const date = workDateInput.value;
    if (!date) return;

    // Search for existing record
    guardFirestore(async () => {
        const records = await db.collection(recordsPath).get();
        const existing = records.docs.find(doc => doc.data().uid === currentUser.uid && doc.data().date === date);

        const inputs = document.querySelectorAll('#fields-container input');
        inputs.forEach(input => input.value = 0);

        if (existing) {
            alert('Previous record found for this date');
            const data = existing.data().quantities || {};
            inputs.forEach(input => {
                const name = input.dataset.name;
                input.value = data[name] || 0;
            });
            document.getElementById('save-work-btn').textContent = 'Update My Work';
            document.getElementById('save-work-btn').dataset.mode = 'update';
            document.getElementById('save-work-btn').dataset.docId = existing.id;
        } else {
            document.getElementById('save-work-btn').textContent = 'Save My Work';
            document.getElementById('save-work-btn').dataset.mode = 'new';
        }
    });
});

document.getElementById('save-work-btn').addEventListener('click', async () => {
    const date = workDateInput.value;
    if (!date) return alert('Select a date');

    const quantities = {};
    let total = 0;
    document.querySelectorAll('#fields-container input').forEach(input => {
        const qty = parseInt(input.value) || 0;
        const name = input.dataset.name;
        quantities[name] = qty;

        // Find rate
        const type = Object.keys(fields).find(t => fields[t].some(f => f.name === name));
        const rate = fields[type].find(f => f.name === name).rate;
        total += qty * rate;
    });

    const record = {
        uid: currentUser.uid,
        username: currentUser.username,
        date,
        quantities,
        total
    };

    guardFirestore(async () => {
        const mode = document.getElementById('save-work-btn').dataset.mode;
        if (mode === 'update') {
            const docId = document.getElementById('save-work-btn').dataset.docId;
            await db.collection(recordsPath).doc(docId).update(record);
        } else {
            await db.collection(recordsPath).add(record);
        }
        alert('Work saved!');
    });
});

// Admin Panel: Load data
async function loadAdminData() {
    // Users
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';
    guardFirestore(async () => {
        const users = await db.collection(usersPath).get();
        users.docs.forEach(doc => {
            const user = doc.data();
            usersList.innerHTML += `
                <div>
                    ${user.username}
                    <button onclick="editUser('${doc.id}')">Edit</button>
                    <button onclick="deleteUser('${doc.id}')">Delete</button>
                </div>
            `;
        });
    });

    // Items
    const itemsList = document.getElementById('items-list');
    itemsList.innerHTML = '';
    Object.keys(fields).forEach(type => {
        fields[type].forEach(field => {
            itemsList.innerHTML += `
                <div>
                    ${field.name} (${type} @ Rs ${field.rate})
                    <button onclick="editItem('${type}', '${field.name}')">Edit</button>
                    <button onclick="deleteItem('${type}', '${field.name}')">Delete</button>
                </div>
            `;
        });
    });
}

// Add User
document.getElementById('add-user-btn').addEventListener('click', async () => {
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    if (!username || !password) return alert('Fill fields');

    guardFirestore(async () => {
        await db.collection(usersPath).add({ username, password, isAdmin: false });
        loadAdminData();
    });
});

window.editUser = async (id) => {
    const newPassword = prompt('New Password');
    if (newPassword) {
        guardFirestore(async () => {
            await db.collection(usersPath).doc(id).update({ password: newPassword });
            loadAdminData();
        });
    }
};

window.deleteUser = async (id) => {
    if (confirm('Delete?')) {
        guardFirestore(async () => {
            await db.collection(usersPath).doc(id).delete();
            loadAdminData();
        });
    }
};

// Add Item
document.getElementById('add-item-btn').addEventListener('click', async () => {
    const name = document.getElementById('new-item-name').value;
    const type = document.getElementById('new-item-type').value;
    const rate = parseInt(document.getElementById('new-item-rate').value);
    if (!name || !rate) return alert('Fill fields');

    fields[type].push({ name, rate });
    await db.doc(configPath).update({ fields });
    loadAdminData();
});

window.editItem = async (type, oldName) => {
    const newName = prompt('New Name', oldName);
    const newRate = parseInt(prompt('New Rate'));
    if (newName && newRate) {
        const item = fields[type].find(f => f.name === oldName);
        item.name = newName;
        item.rate = newRate;
        await db.doc(configPath).update({ fields });
        loadAdminData();
    }
};

window.deleteItem = async (type, name) => {
    if (confirm('Delete?')) {
        fields[type] = fields[type].filter(f => f.name !== name);
        await db.doc(configPath).update({ fields });
        loadAdminData();
    }
};

// Ledger
async function loadLedger() {
    const fromDate = document.getElementById('from-date').value;
    const toDate = document.getElementById('to-date').value;
    const mode = document.getElementById('view-mode').value;

    guardFirestore(async () => {
        let records = await db.collection(recordsPath).get();
        records = records.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Client-side filter
        if (fromDate) records = records.filter(r => r.date >= fromDate);
        if (toDate) records = records.filter(r => r.date <= toDate);

        // Sort by date desc
        records.sort((a, b) => b.date.localeCompare(a.date));

        const content = document.getElementById('ledger-content');
        content.innerHTML = '';

        if (mode === 'log') {
            records.forEach(rec => {
                if (rec.uid !== currentUser.uid && !isAdmin) return; // Owner or admin
                const div = document.createElement('div');
                div.innerHTML = `
                    <p>Date: ${rec.date} | Staff: ${rec.username} | Total: Rs ${rec.total}</p>
                    ${isAdmin || rec.uid === currentUser.uid ? `<button onclick="editRecord('${rec.id}')">Edit</button>` : ''}
                    <button onclick="shareWhatsApp('${rec.id}')">Share WhatsApp</button>
                    <button onclick="exportImage('${rec.id}')">Export Image</button>
                    <button onclick="printThermal('${rec.id}')">Print Thermal</button>
                `;
                content.appendChild(div);
            });
        } else if (mode === 'summary' && isAdmin) {
            // Consolidated table
            const summary = {};
            records.forEach(rec => {
                Object.keys(rec.quantities).forEach(item => {
                    summary[item] = (summary[item] || 0) + rec.quantities[item];
                });
            });
            let table = '<table><tr><th>Item</th><th>Total Qty</th></tr>';
            Object.keys(summary).forEach(item => {
                table += `<tr><td>${item}</td><td>${summary[item]}</td></tr>`;
            });
            table += '</table>';
            content.innerHTML = table;
        }
    });
}

document.getElementById('filter-ledger-btn').addEventListener('click', loadLedger);

window.editRecord = (id) => {
    // Redirect to add-work with date and load
    // For simplicity, alert 'Edit via Add Work screen'
    alert('Select the date in Add Work to edit');
};

window.shareWhatsApp = async (id) => {
    const rec = (await db.collection(recordsPath).doc(id).get()).data();
    let text = `📅 Date: ${rec.date} | 👤 Staff: ${rec.username}\n`;
    Object.keys(rec.quantities).forEach(item => {
        if (rec.quantities[item] > 0) text += `${item}: ${rec.quantities[item]}\n`;
    });
    text += `Total: Rs ${rec.total}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url);
};

window.exportImage = async (id) => {
    const rec = (await db.collection(recordsPath).doc(id).get()).data();
    const studio = document.getElementById('export-studio');
    studio.innerHTML = `
        <h1>KHYBER TRADERS</h1>
        <p>Wholesale Vet Pharmacy, Karachi - 0335-2999006 - https://animalhealth.pk</p>
        <p>Date: ${rec.date} | Staff: ${rec.username}</p>
        ${Object.keys(rec.quantities).map(item => rec.quantities[item] > 0 ? `<p>${item}: ${rec.quantities[item]}</p>` : '').join('')}
        <p>Total: Rs ${rec.total}</p>
    `;
    studio.style.width = '1080px';
    studio.style.height = '1350px'; // 4:5 ratio
    const canvas = await html2canvas(studio);
    const img = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = img;
    link.download = `report_${rec.date}.png`;
    link.click();
    studio.innerHTML = '';
};

window.printThermal = async (id) => {
    const rec = (await db.collection(recordsPath).doc(id).get()).data();
    const studio = document.getElementById('export-studio');
    studio.innerHTML = `
        KHYBER TRADERS
        Wholesale Vet Pharmacy, Karachi - 0335-2999006 - https://animalhealth.pk
        Date: ${rec.date}
        Staff: ${rec.username}
        ${Object.keys(rec.quantities).map(item => rec.quantities[item] > 0 ? `${item}: ${rec.quantities[item]}\n` : '').join('')}
        Total: Rs ${rec.total}
    `;
    window.print();
    studio.innerHTML = '';
};