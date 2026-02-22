import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home as HomeIcon, PlusSquare, FileText, Settings, Check, 
  ArrowUp, ArrowDown, Trash2, Plus, 
  Image as ImageIcon, Share2, RefreshCw, DownloadCloud, UploadCloud, Info, Lock
} from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, collection, onSnapshot, 
  updateDoc, deleteDoc, writeBatch 
} from 'firebase/firestore';

// --- FIREBASE CONFIGURATION (Verified) ---
const firebaseConfig = {
  apiKey: "AIzaSyA4jzSmYJeDgULCDdpAblmS4x-wU9szMJc",
  authDomain: "mazdooriapp.firebaseapp.com",
  databaseURL: "https://mazdooriapp-default-rtdb.firebaseio.com",
  projectId: "mazdooriapp",
  storageBucket: "mazdooriapp.firebasestorage.app",
  messagingSenderId: "407506330676",
  appId: "1:407506330676:web:00fdf738e749ecea3c1661",
  measurementId: "G-NMJXVHCPPJ"
};

// Safeguard: Prevent Firebase from initializing twice and causing a white screen
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "khyber-traders-final-v1"; 

const DEFAULT_CATEGORIES = [
  { id: '1', name: "1st floor carton", group: "Labour", rate: 18, order: 0 },
  { id: '2', name: "1st floor bags", group: "Labour", rate: 18, order: 1 },
  { id: '3', name: "Makkah Market", group: "Labour", rate: 18, order: 2 },
  { id: '4', name: "2nd floor", group: "Labour", rate: 18, order: 3 },
  { id: '5', name: "3rd floor", group: "Labour", rate: 18, order: 4 },
  { id: '6', name: "Ahmed Chamber", group: "Labour", rate: 18, order: 5 },
  { id: '7', name: "TPT Out", group: "Transport", rate: 30, order: 6 },
  { id: '8', name: "BABA", group: "Transport", rate: 30, order: 7 },
  { id: '9', name: "TPT OTHERS", group: "Transport", rate: 30, order: 8 },
  { id: '10', name: "LCC", group: "Suzuki", rate: 4500, order: 9 },
  { id: '11', name: "SHW", group: "Suzuki", rate: 5000, order: 10 },
  { id: '12', name: "GADAP", group: "Suzuki", rate: 5000, order: 11 },
  { id: '13', name: "AL HILAL", group: "Suzuki", rate: 2500, order: 12 },
  { id: '14', name: "HILTON", group: "Suzuki", rate: 4000, order: 13 },
  { id: '15', name: "HUB", group: "Suzuki", rate: 2500, order: 14 }
];

// --- HELPERS ---
const loadHtml2Canvas = () => new Promise((resolve, reject) => {
  if (window.html2canvas) return resolve(window.html2canvas);
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  s.onload = () => resolve(window.html2canvas);
  s.onerror = reject;
  document.head.appendChild(s);
});

const fmtDate = (d) => d ? d.split('-').reverse().join('/') : '';
const getWeekRange = () => {
  const t = new Date();
  const d = t.getDay() || 7;
  const s = new Date(t); s.setDate(t.getDate() - d + 1);
  const e = new Date(s); e.setDate(s.getDate() + 6);
  return { start: s.toISOString().split('T')[0], end: e.toISOString().split('T')[0] };
};

// --- MAIN APPLICATION ---
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [prompt, setPrompt] = useState(null);

  // Synced Global Data
  const [categories, setCategories] = useState([]);
  const [logs, setLogs] = useState([]);
  const [payments, setPayments] = useState([]);
  
  // Admin Security
  const [adminPass, setAdminPass] = useState('1234');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Auth & PWA Effect
  useEffect(() => {
    signInAnonymously(auth).catch(err => console.error("Cloud Auth Error:", err));
    onAuthStateChanged(auth, setUser);

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setIsInstallable(false);
    setPrompt(null);
  };

  // Sync Effect
  useEffect(() => {
    if (!user) return;

    const unsubCats = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'categories'), (s) => {
      const data = s.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setCategories(data.length ? data.sort((a,b) => (a.order || 0) - (b.order || 0)) : DEFAULT_CATEGORIES);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    const unsubLogs = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'logs'), (s) => {
      setLogs(s.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    const unsubPays = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'payments'), (s) => {
      setPayments(s.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    
    // Sync Admin Password (Fixed mathematical path for Firestore)
    const unsubAdmin = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'admin'), (d) => {
      if (d.exists() && d.data().password) {
        setAdminPass(d.data().password);
      }
    });

    return () => { unsubCats(); unsubLogs(); unsubPays(); unsubAdmin(); };
  }, [user]);

  const saveDaily = async (date, qtyMap) => {
    if (!user) return;
    const batch = writeBatch(db);
    const existing = logs.filter(l => l.date === date);
    existing.forEach(l => batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'logs', l.id)));

    Object.entries(qtyMap).forEach(([cid, qStr]) => {
      const q = parseInt(qStr);
      const cat = categories.find(c => c.id === cid);
      if (q > 0 && cat) {
        const docId = `${date}_${cid}`;
        batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'logs', docId), {
          date, categoryId: cid, qty: q, total: q * cat.rate
        });
      }
    });
    await batch.commit();
    showToast("Synced to Cloud");
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-blue-600">
      <RefreshCw className="animate-spin mb-4" size={48} />
      <span className="text-sm font-black tracking-widest uppercase">Connecting to Database</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 w-full overflow-x-hidden selection:bg-blue-100">
      {/* HIGH VISIBILITY HEADER */}
      <header className="bg-blue-700 text-white p-4 sticky top-0 z-40 shadow-md">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-black leading-tight tracking-tight uppercase">Mazdoori Calculator</h1>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Khyber Traders System</p>
          </div>
          {isInstallable ? (
            <button onClick={installApp} className="bg-white text-blue-700 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 shadow-lg">
              <DownloadCloud size={14} /> Install
            </button>
          ) : (
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
               <span className="text-[9px] font-black uppercase opacity-90 tracking-widest">Online</span>
            </div>
          )}
        </div>
      </header>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm z-[100]">
          <div className={`flex items-center gap-3 px-4 py-4 rounded-xl shadow-2xl border-2 ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-red-50 border-red-500 text-red-900'}`}>
            <Check size={20} />
            <span className="text-sm font-black uppercase">{toast.msg}</span>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto p-4 space-y-4">
        {activeTab === 'home' && <HomeView logs={logs} categories={categories} />}
        {activeTab === 'entry' && <EntryView categories={categories} logs={logs} onSave={saveDaily} />}
        {activeTab === 'reports' && <ReportsView logs={logs} categories={categories} payments={payments} showToast={showToast} />}
        
        {/* SECURE ADMIN TAB TONGGLE */}
        {activeTab === 'admin' && !isAdminUnlocked && (
           <AdminAuthView correctPass={adminPass} onUnlock={() => setIsAdminUnlocked(true)} showToast={showToast} />
        )}
        {activeTab === 'admin' && isAdminUnlocked && (
           <AdminView categories={categories} logs={logs} payments={payments} showToast={showToast} />
        )}
      </main>

      {/* CONTRAST NAVIGATION */}
      <nav className="fixed bottom-0 w-full bg-white border-t-2 border-slate-200 p-3 z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex justify-around">
          <NavItem icon={<HomeIcon size={24} />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={<PlusSquare size={24} />} label="Entry" active={activeTab === 'entry'} onClick={() => setActiveTab('entry')} />
          <NavItem icon={<FileText size={24} />} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          <NavItem icon={<Settings size={24} />} label="Admin" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-700 scale-110' : 'text-slate-400'}`}>
      {icon}
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
}

// ==========================================
// 1. HOME VIEW
// ==========================================
function HomeView({ logs, categories }) {
  const totals = useMemo(() => {
    const range = getWeekRange();
    const weekLogs = logs.filter(l => l.date >= range.start && l.date <= range.end);
    let labTrans = 0;
    let suzuki = 0;

    weekLogs.forEach(l => {
      const c = categories.find(cat => cat.id === l.categoryId);
      if (!c) return;
      if (c.group === 'Labour' || c.group === 'Transport') {
        labTrans += l.total;
      } else if (c.group === 'Suzuki') {
        suzuki += l.total;
      }
    });

    return { labTrans, suzuki, grand: labTrans + suzuki };
  }, [logs, categories]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="bg-white border-2 border-blue-100 p-6 rounded-[2.5rem] shadow-sm text-center">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">This Week’s Mazdoori Expense</h2>
        <div className="text-5xl font-black text-blue-700 break-words">Rs.{totals.grand.toLocaleString()}</div>
        
        {/* Weekly Breakdown */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-stretch gap-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
           <div className="text-left flex-1 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Labour + Transport</div>
              <div className="text-lg font-black text-indigo-700">Rs.{totals.labTrans.toLocaleString()}</div>
           </div>
           <div className="text-left flex-1 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Suzuki</div>
              <div className="text-lg font-black text-amber-600">Rs.{totals.suzuki.toLocaleString()}</div>
           </div>
        </div>
      </div>
      
      {/* Branding Card */}
      <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-[2rem] flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shrink-0">
          <Info size={24} />
        </div>
        <div>
          <h3 className="font-black text-blue-900 leading-tight">Mazdoori Calculator App</h3>
          <p className="text-[11px] font-bold text-blue-600 mt-1 uppercase tracking-wider">Developed by Muhammad Tahir Qadri</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. DAILY ENTRY VIEW 
// ==========================================
function EntryView({ categories, logs, onSave }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [grp, setGrp] = useState('Labour');
  const [qtyMap, setQtyMap] = useState({});

  useEffect(() => {
    const m = {};
    logs.filter(l => l.date === date).forEach(l => m[l.categoryId] = l.qty.toString());
    setQtyMap(m);
  }, [date, logs]);

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl font-black text-blue-700 text-lg outline-none focus:border-blue-500" />
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {['Labour', 'Transport', 'Suzuki'].map(g => (
            <button key={g} onClick={() => setGrp(g)} className={`flex-1 py-3 text-xs font-black rounded-lg transition-all ${grp === g ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>{g}</button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        {categories.filter(c => c.group === grp).map(cat => (
          <div key={cat.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm">
            <div className="min-w-0 pr-4">
                <div className="font-black text-slate-900 text-base leading-tight uppercase truncate">{cat.name}</div>
                <div className="text-[10px] font-black text-blue-600 uppercase mt-1">Rate: Rs.{cat.rate}</div>
            </div>
            <input 
              type="number" 
              inputMode="numeric" 
              value={qtyMap[cat.id] || ''} 
              onChange={e => setQtyMap({...qtyMap, [cat.id]: e.target.value})} 
              placeholder="0" 
              className="w-24 bg-slate-50 border-2 border-slate-200 p-3 rounded-xl text-center font-black text-2xl text-blue-700 outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-200" 
            />
          </div>
        ))}
      </div>
      
      <button onClick={() => onSave(date, qtyMap)} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-5 rounded-[2rem] shadow-xl mt-4 active:scale-95 transition-all tracking-widest uppercase text-base">
        Sync Cloud Data
      </button>
    </div>
  );
}

// ==========================================
// 3. REPORTS VIEW
// ==========================================
function ReportsView({ logs, categories, payments, showToast }) {
  const [tab, setTab] = useState('summary');
  const [range, setRange] = useState(getWeekRange());

  const filteredLogs = logs.filter(l => l.date >= range.start && l.date <= range.end);
  const filteredPays = payments.filter(p => p.date >= range.start && p.date <= range.end);
  const displayString = `${fmtDate(range.start)} - ${fmtDate(range.end)}`;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-white p-1.5 rounded-2xl border-2 border-slate-200 shadow-sm flex overflow-x-auto hide-scrollbar">
        {['summary', 'ledger', 'payments', 'export'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 px-4 text-[10px] font-black rounded-xl uppercase whitespace-nowrap transition-all ${tab === t ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>{t}</button>
        ))}
      </div>
      
      <div className="flex gap-2 bg-white p-2 rounded-2xl border-2 border-slate-100">
        <div className="flex-1">
            <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Start</label>
            <input type="date" value={range.start} onChange={e => setRange({...range, start: e.target.value})} className="w-full bg-slate-50 p-2 rounded-lg font-bold text-xs" />
        </div>
        <div className="flex-1">
            <label className="text-[8px] font-black text-slate-400 uppercase ml-1">End</label>
            <input type="date" value={range.end} onChange={e => setRange({...range, end: e.target.value})} className="w-full bg-slate-50 p-2 rounded-lg font-bold text-xs" />
        </div>
      </div>

      {tab === 'summary' && <SummaryCards filteredLogs={filteredLogs} categories={categories} />}
      {tab === 'ledger' && <LedgerSection filteredLogs={filteredLogs} categories={categories} />}
      {tab === 'payments' && <PaymentsSection filteredPays={filteredPays} showToast={showToast} />}
      {tab === 'export' && <ExportSection filteredLogs={filteredLogs} categories={categories} range={range} displayString={displayString} showToast={showToast} />}
    </div>
  );
}

function SummaryCards({ filteredLogs, categories }) {
  const totals = useMemo(() => {
    let lab = 0, trans = 0, suz = 0;
    filteredLogs.forEach(l => {
      const c = categories.find(cat => cat.id === l.categoryId);
      if (!c) return;
      if (c.group === 'Labour') lab += l.total;
      else if (c.group === 'Transport') trans += l.total;
      else if (c.group === 'Suzuki') suz += l.total;
    });
    return { lab, trans, suz, grand: lab + trans + suz };
  }, [filteredLogs, categories]);

  return (
    <div className="space-y-3 pb-10">
      <div className="bg-white border-2 border-blue-50 p-5 rounded-3xl flex justify-between items-center shadow-sm"><span className="text-xs font-black text-slate-400 uppercase tracking-widest">Labour</span><span className="text-2xl font-black text-blue-700">Rs.{totals.lab.toLocaleString()}</span></div>
      <div className="bg-white border-2 border-blue-50 p-5 rounded-3xl flex justify-between items-center shadow-sm"><span className="text-xs font-black text-slate-400 uppercase tracking-widest">Transport</span><span className="text-2xl font-black text-indigo-700">Rs.{totals.trans.toLocaleString()}</span></div>
      <div className="bg-white border-2 border-blue-50 p-5 rounded-3xl flex justify-between items-center shadow-sm"><span className="text-xs font-black text-slate-400 uppercase tracking-widest">Suzuki</span><span className="text-2xl font-black text-amber-700">Rs.{totals.suz.toLocaleString()}</span></div>
      <div className="bg-blue-700 p-6 rounded-[2.5rem] flex justify-between items-center shadow-xl"><span className="text-sm font-black text-white uppercase tracking-widest">Grand Total</span><span className="text-4xl font-black text-white">Rs.{totals.grand.toLocaleString()}</span></div>
    </div>
  );
}

function LedgerSection({ filteredLogs, categories }) {
  const dates = [...new Set(filteredLogs.map(l => l.date))].sort().reverse();
  const active = categories.filter(c => filteredLogs.some(l => l.categoryId === c.id));
  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
      <table className="w-full text-left text-[11px] whitespace-nowrap">
        <thead className="bg-slate-100 text-slate-600 font-black uppercase">
          <tr><th className="p-4 border-r-2 border-white">Date</th>{active.map(c => <th key={c.id} className="p-4 text-center border-r-2 border-white">{c.name}</th>)}<th className="p-4 text-right">Total</th></tr>
        </thead>
        <tbody className="divide-y-2 divide-slate-50">
          {dates.map(d => {
            const dayTotal = filteredLogs.filter(l => l.date === d).reduce((s, x) => s + x.total, 0);
            return (
              <tr key={d} className="hover:bg-blue-50">
                <td className="p-4 font-black text-slate-900 border-r-2 border-slate-50">{fmtDate(d)}</td>
                {active.map(c => <td key={c.id} className="p-4 text-center text-slate-500 border-r-2 border-slate-50">{filteredLogs.find(l => l.date === d && l.categoryId === c.id)?.qty || '-'}</td>)}
                <td className="p-4 text-right font-black text-blue-700 bg-blue-50/50">Rs.{dayTotal.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PaymentsSection({ filteredPays, showToast }) {
  const [n, setN] = useState('');
  const [a, setA] = useState('');

  const add = async () => {
    if(!n || !a) return;
    const id = Date.now().toString();
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'payments', id), {
      name: n, amount: Number(a), date: new Date().toISOString().split('T')[0]
    });
    setN(''); setA('');
    showToast("Payment Logged");
  };

  const del = async (id) => { if(window.confirm('Delete payment record?')) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'payments', id)); };

  return (
    <div className="space-y-4 pb-10">
      <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 space-y-3 shadow-sm">
        <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest">New Worker Advance</h3>
        <input type="text" placeholder="Worker Name" value={n} onChange={e=>setN(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-600" />
        <div className="flex gap-2">
          <input type="number" placeholder="Amount (Rs)" value={a} onChange={e=>setA(e.target.value)} className="flex-1 bg-slate-50 border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-600" />
          <button onClick={add} className="bg-blue-700 px-6 rounded-xl text-white font-black"><Plus size={24}/></button>
        </div>
      </div>
      {filteredPays.map(p => (
        <div key={p.id} className="bg-white p-4 rounded-2xl border-2 border-slate-100 flex justify-between items-center shadow-sm">
          <div><div className="font-black text-slate-900">{p.name}</div><div className="text-[10px] text-slate-400 uppercase font-black">{fmtDate(p.date)}</div></div>
          <div className="flex items-center gap-4">
            <div className="font-black text-indigo-700 text-lg">Rs.{p.amount.toLocaleString()}</div>
            <button onClick={() => del(p.id)} className="text-red-300 hover:text-red-600 transition-colors"><Trash2 size={20}/></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExportSection({ filteredLogs, categories, range, displayString, showToast }) {
  const [working, setWorking] = useState(false);
  const items = categories.map(c => {
    const l = filteredLogs.filter(x => x.categoryId === c.id);
    return l.length ? { ...c, qty: l.reduce((s, x) => s + x.qty, 0), total: l.reduce((s, x) => s + x.total, 0) } : null;
  }).filter(Boolean);
  const grand = items.reduce((s, x) => s + x.total, 0);

  const download = async () => {
    if (!items.length) { showToast("No data for this date range", "error"); return; }
    setWorking(true);
    showToast("Generating HD 4:5 Post...");
    const h2c = await loadHtml2Canvas();
    const node = document.getElementById('hd-export-node');
    node.style.display = 'flex';
    const canvas = await h2c(node, { scale: 2, backgroundColor: '#ffffff', width: 1080, height: 1350 });
    node.style.display = 'none';
    const link = document.createElement('a');
    link.download = `Khyber_Report_${range.start}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setWorking(false);
  };

  const share = async () => {
    if (!items.length) { showToast("No data to share", "error"); return; }
    let text = `🏢 *KHYBER TRADERS*\n📊 *Mazdoori Report*\n📅 ${displayString}\n\n`;
    items.forEach(i => text += `• ${i.name}: ${i.qty} = Rs.${i.total.toLocaleString()}\n`);
    text += `\n*GRAND TOTAL: Rs.${grand.toLocaleString()}*`;
    text += `\n\n_Mazdoori Calculator App_\n_Dev: Muhammad Tahir Qadri_`;
    
    if (navigator.share) await navigator.share({ text });
    else { navigator.clipboard.writeText(text); showToast('Report Copied'); }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="grid grid-cols-1 gap-3">
        <button onClick={share} className="bg-emerald-600 text-white font-black py-5 rounded-[2rem] flex justify-center items-center gap-3 shadow-lg active:scale-95 transition-all text-base tracking-widest uppercase">
          <Share2 size={24}/> WhatsApp Report
        </button>
        <button onClick={download} disabled={working} className="bg-indigo-700 text-white font-black py-5 rounded-[2rem] flex justify-center items-center gap-3 shadow-lg active:scale-95 transition-all text-base tracking-widest uppercase disabled:opacity-50">
          <ImageIcon size={24}/> {working ? 'Baking Image...' : 'Download HD Post (4:5)'}
        </button>
      </div>

      <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-3xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
            Exports are optimized for Social Media (1080x1350px).<br/>
            Credits to Muhammad Tahir Qadri will be included.
          </p>
      </div>
      
      {/* PERFECTED HD EXPORT FRAME (1080x1350) */}
      <div id="hd-export-node" className="bg-white text-slate-900 p-20 flex-col absolute left-[-9999px]" style={{ display: 'none', width: '1080px', height: '1350px', fontFamily: 'sans-serif' }}>
        <div className="flex justify-between items-start border-b-[12px] border-blue-700 pb-12 mb-12">
            <div>
                <h1 className="text-8xl font-black text-blue-700 uppercase tracking-tighter leading-none">KHYBER TRADERS</h1>
                <p className="text-4xl font-bold text-slate-400 uppercase mt-4 tracking-[0.3em]">Mazdoori Report Summary</p>
            </div>
            <div className="text-right">
                <div className="text-3xl font-black text-slate-300 uppercase tracking-widest">Date Range</div>
                <div className="text-4xl font-black text-blue-700 mt-2">{displayString}</div>
            </div>
        </div>

        <div className="flex-1 bg-slate-50 rounded-[4rem] p-16 border-4 border-slate-100">
          <table className="w-full text-4xl">
            <thead className="text-slate-400 border-b-4 border-slate-200 uppercase tracking-[0.2em] font-black">
                <tr><th className="pb-10 text-left">Item Name</th><th className="pb-10 text-center">Qty</th><th className="pb-10 text-right">Total Rs.</th></tr>
            </thead>
            <tbody className="divide-y-4 divide-slate-100">
              {items.map(a => (
                <tr key={a.id}>
                    <td className="py-10 font-black text-slate-800 uppercase">{a.name}</td>
                    <td className="py-10 text-center font-bold text-slate-400">{a.qty}</td>
                    <td className="py-10 text-right font-black text-blue-700">Rs.{a.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 bg-blue-700 p-20 rounded-[4rem] flex justify-between items-center shadow-2xl">
          <div className="text-7xl font-black uppercase text-white tracking-widest">Grand Total</div>
          <div className="text-[11rem] font-black text-white leading-none">Rs.{grand.toLocaleString()}</div>
        </div>

        <div className="mt-12 flex justify-between items-center px-10">
            <div className="text-2xl font-black text-slate-300 uppercase tracking-[0.4em]">Mazdoori Calculator App</div>
            <div className="text-2xl font-black text-blue-400 uppercase tracking-widest">Dev: Muhammad Tahir Qadri</div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. ADMIN AUTHENTICATION
// ==========================================
function AdminAuthView({ correctPass, onUnlock, showToast }) {
  const [pin, setPin] = useState('');
  
  const checkPin = () => {
    if (pin === correctPass) {
      onUnlock();
      showToast("Access Granted");
    } else {
      showToast("Incorrect Password", "error");
      setPin('');
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-300 bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm text-center space-y-6 mt-4">
      <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center">
        <Lock size={36} />
      </div>
      <div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Admin Lock</h2>
        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Enter Admin Password</p>
      </div>
      <input 
        type="password" 
        value={pin} 
        onChange={e => setPin(e.target.value)} 
        placeholder="••••"
        className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl text-center font-black text-3xl tracking-[0.5em] outline-none focus:border-blue-600 text-blue-700"
      />
      <button onClick={checkPin} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest">
        Unlock Settings
      </button>
    </div>
  );
}

// ==========================================
// 5. SECURE ADMIN VIEW
// ==========================================
function AdminView({ categories, showToast, logs, payments }) {
  const [n, setN] = useState('');
  const [g, setG] = useState('Labour');
  const [r, setR] = useState('');
  const [newPass, setNewPass] = useState('');

  const add = async () => {
    if(!n || !r) return;
    const id = Date.now().toString();
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', id), { name: n, group: g, rate: Number(r), order: categories.length });
    setN(''); setR('');
    showToast("Added to Shared List");
  };

  const move = async (index, dir) => {
    const batch = writeBatch(db);
    batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'categories', categories[index].id), { order: index + dir });
    batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'categories', categories[index+dir].id), { order: index });
    await batch.commit();
  };

  const edit = async (id, field, val) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', id), { [field]: field === 'rate' ? Number(val) : val });
  };

  const updatePassword = async () => {
    if (!newPass) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'admin'), { password: newPass });
    setNewPass('');
    showToast("Admin Password Updated Globally");
  };

  const exportJSON = () => {
    const data = JSON.stringify({ categories, logs, payments });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Khyber_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const j = JSON.parse(ev.target.result);
        const batch = writeBatch(db);
        if(j.categories) j.categories.forEach(c => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'categories', c.id), c));
        if(j.logs) j.logs.forEach(l => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'logs', l.id), l));
        if(j.payments) j.payments.forEach(p => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'payments', p.id), p));
        await batch.commit();
        showToast("Cloud Database Restored");
      } catch (err) { showToast("Invalid File", "error"); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      
      {/* SECURITY PASSWORD CONTROLS */}
      <div className="bg-white p-6 rounded-3xl border-2 border-rose-100 space-y-4 shadow-sm">
        <h3 className="font-black text-rose-500 uppercase text-[10px] tracking-[0.2em] border-b-2 border-rose-50 pb-2 flex items-center gap-2"><Lock size={14}/> Security Settings</h3>
        <div className="flex gap-2">
          <input type="text" placeholder="New Password" value={newPass} onChange={e=>setNewPass(e.target.value)} className="flex-1 bg-slate-50 border-2 border-slate-100 p-3 rounded-xl text-slate-900 font-bold outline-none focus:border-rose-500" />
          <button onClick={updatePassword} className="bg-rose-500 hover:bg-rose-600 px-4 rounded-xl text-white font-black uppercase text-xs tracking-widest transition-colors">Update</button>
        </div>
      </div>

      {/* CLOUD CATEGORY MANAGER */}
      <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 space-y-4 shadow-sm">
        <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] border-b-2 border-slate-50 pb-2">Global Category Manager</h3>
        <input type="text" placeholder="Item Name (e.g. 1st Floor)" value={n} onChange={e=>setN(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl text-slate-900 font-bold outline-none focus:border-blue-600" />
        <div className="flex gap-2">
          <select value={g} onChange={e=>setG(e.target.value)} className="flex-1 bg-slate-50 border-2 border-slate-100 p-3 rounded-xl text-blue-700 font-black outline-none"><option>Labour</option><option>Transport</option><option>Suzuki</option></select>
          <input type="number" placeholder="Rate" value={r} onChange={e=>setR(e.target.value)} className="w-24 bg-slate-50 border-2 border-slate-100 p-3 rounded-xl text-blue-700 font-black text-center outline-none" />
        </div>
        <button onClick={add} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest">Add Global Category</button>
      </div>

      {/* BACKUP MANAGER */}
      <div className="grid grid-cols-2 gap-3">
         <button onClick={exportJSON} className="bg-white py-4 rounded-2xl border-2 border-emerald-100 text-[10px] font-black text-emerald-700 flex justify-center items-center gap-2 uppercase tracking-widest shadow-sm"><DownloadCloud size={18}/> Export Data</button>
         <label className="bg-white py-4 rounded-2xl border-2 border-blue-100 text-[10px] font-black text-blue-700 flex justify-center items-center gap-2 uppercase tracking-widest shadow-sm cursor-pointer"><UploadCloud size={18}/> Import Data<input type="file" onChange={importJSON} className="hidden" /></label>
      </div>

      {/* LIST OF ITEMS WITH MOVE/DELETE/EDIT */}
      <div className="space-y-2">
        <h3 className="font-black text-slate-400 uppercase text-[10px] px-2 tracking-[0.2em]">Manage Cloud Items</h3>
        {categories.map((c, i) => (
          <div key={c.id} className="bg-white p-4 rounded-2xl border-2 border-slate-50 flex items-center gap-4 shadow-sm hover:border-blue-100 transition-colors">
            <div className="flex flex-col gap-2 shrink-0">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-slate-300 hover:text-blue-600 disabled:opacity-10 transition-colors"><ArrowUp size={18}/></button>
              <button onClick={() => move(i, 1)} disabled={i === categories.length - 1} className="text-slate-300 hover:text-blue-600 disabled:opacity-10 transition-colors"><ArrowDown size={18}/></button>
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              <input value={c.name} onChange={e => edit(c.id, 'name', e.target.value)} className="w-full bg-transparent border-b-2 border-slate-50 focus:border-blue-600 outline-none font-black text-slate-800 text-sm pb-1 uppercase" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{c.group}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black text-slate-400">Rate:</span>
                  <input type="number" value={c.rate} onChange={e => edit(c.id, 'rate', e.target.value)} className="w-20 bg-slate-50 border-2 border-slate-100 p-1.5 rounded-lg text-right font-black text-blue-700 text-xs" />
                </div>
              </div>
            </div>
            <button onClick={async () => { if(window.confirm(`Delete ${c.name} from cloud?`)) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', c.id)); }} className="text-red-200 hover:text-red-600 p-2 transition-colors"><Trash2 size={24}/></button>
          </div>
        ))}
      </div>

      <div className="p-8 text-center bg-white border-2 border-slate-100 rounded-3xl mt-10">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] leading-relaxed">
            Final Perfected Build 2026<br/>
            Muhammad Tahir Qadri
          </p>
      </div>
    </div>
  );
}


