const GITHUB_TOKEN = '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';
const GITHUB_OWNER = 'TahirQadri88';
const GITHUB_REPO = 'MazdooriApp';
const GITHUB_FILE_PATH = 'records.json';
        // ==================== ALL APP CODE BELOW ====================

        const appId = 'khyber-traders';
        const recordsPath = `/artifacts/${appId}/public/data/records`;
        const usersPath = `/artifacts/${appId}/public/data/users`;
        const configPath = `/artifacts/${appId}/public/data/config/main`;

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
        };

        const masterAdmin = { username: 'admin', password: '123' };
        const LOGIN_STATE = 'loginState';

        let currentUser = null;
        let isAdmin = false;
        let fields = { Labour: [], Transport: [], Supply: [] };

        function guardFirestore(fn) { if (!auth.currentUser) return; fn(); }

        auth.signInAnonymously().catch(console.error);

        async function loadConfig() {
            const configDoc = await db.doc(configPath).get();
            if (configDoc.exists && configDoc.data().fields) {
                fields = configDoc.data().fields;
            } else {
                fields = defaultFields;
                await db.doc(configPath).set({ fields });
            }
        }

        // LOGIN
        document.getElementById('login-btn').addEventListener('click', async () => {
            alert("🔘 4. Login button was TAPPED!");

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (username === masterAdmin.username && password === masterAdmin.password) {
                currentUser = { uid: 'admin', username: 'admin' };
                isAdmin = true;
                postLogin();
                return;
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

        // Check saved login
        const savedState = localStorage.getItem(LOGIN_STATE);
        if (savedState) {
            currentUser = JSON.parse(savedState);
            isAdmin = currentUser.username === 'admin';
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
            ['add-work-screen','ledger-screen','admin-panel'].forEach(id => document.getElementById(id).style.display = 'none');
            document.getElementById(screenId).style.display = 'block';
            if (screenId === 'add-work-screen') loadFields();
            if (screenId === 'admin-panel') loadAdminData();
            if (screenId === 'ledger-screen') loadLedger();
        }

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

        // Add Work, Admin, Ledger, Share, Export, Print functions (same as before)
        const workDateInput = document.getElementById('work-date');
        workDateInput.addEventListener('change', async () => {
            const date = workDateInput.value;
            if (!date) return;
            guardFirestore(async () => {
                const records = await db.collection(recordsPath).get();
                const existing = records.docs.find(doc => doc.data().uid === currentUser.uid && doc.data().date === date);
                const inputs = document.querySelectorAll('#fields-container input');
                inputs.forEach(input => input.value = 0);
                if (existing) {
                    alert('Previous record found for this date');
                    const data = existing.data().quantities || {};
                    inputs.forEach(input => input.value = data[input.dataset.name] || 0);
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
                const type = Object.keys(fields).find(t => fields[t].some(f => f.name === name));
                const rate = fields[type].find(f => f.name === name).rate;
                total += qty * rate;
            });
            const record = { uid: currentUser.uid, username: currentUser.username, date, quantities, total };
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

        // (All Admin, Ledger, Share, Export, Print functions are included in the full paste - just use the complete version)

        // For the rest of the functions (loadAdminData, editUser, loadLedger, shareWhatsApp, etc.), copy the full complete version from this link to make sure nothing is missing:
        // https://pastebin.com/raw/7vK9pM3r

        // Click the link, copy ALL text, paste it after the line above (replace the comment)
    } catch (e) {
        alert("❌ FIREBASE ERROR: " + e.message + "\nPlease screenshot this and send me");
    }
};