import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home as HomeIcon, PlusSquare, FileText, Settings, Check, 
  AlertCircle, ArrowUp, ArrowDown, Trash2, Plus, 
  Image as ImageIcon, Share2, Calendar, RefreshCw, DownloadCloud, UploadCloud
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, collection, onSnapshot, 
  updateDoc, deleteDoc, writeBatch 
} from 'firebase/firestore';

// --- FIREBASE CONFIGURATION (Your Verified Keys) ---
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "khyber-traders-final-v1"; // Root path for your business data

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
  const [activeTab, setActiveTab] = useState('entry');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [prompt, setPrompt] = useState(null);

  // Synced Global Data
  const [categories, setCategories] = useState([]);
  const [logs, setLogs] = useState([]);
  const [payments, setPayments] = useState([]);

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
    }, () => setLoading(false));

    const unsubLogs = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'logs'), (s) => {
      setLogs(s.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    const unsubPays = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'payments'), (s) => {
      setPayments(s.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    return () => { unsubCats(); unsubLogs(); unsubPays(); };
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
    showToast("Cloud Synced Successfully");
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-400">
      <RefreshCw className="animate-spin mb-4" size={40} />
      <span className="text-[10px] font-black tracking-[0.3em] uppercase">Syncing Khyber Cloud...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 w-full overflow-x-hidden selection:bg-blue-500/30">
      <header className="bg-blue-950/40 backdrop-blur-md border-b border-blue-500/20 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent uppercase tracking-tighter">KHYBER TRADERS</h1>
            <p className="text-[9px] font-bold text-blue-300/60 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Network Active
            </p>
          </div>
          {isInstallable ? (
            <button onClick={installApp} className="bg-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg animate-bounce">
              <DownloadCloud size={14} /> Install App
            </button>
          ) : (
            <div className="text-[10px] bg-slate-900 border border-slate-700 px-2 py-1 rounded text-slate-400 font-bold uppercase">Cloud Sync</div>
          )}
        </div>
      </header>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-in fade-in slide-in-from-top-4">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md ${toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50' : 'bg-red-900/90 border-red-500/50'}`}>
            <Check size={18} />
            <span className="text-sm font-bold">{toast.msg}</span>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto p-4">
        {activeTab === 'home' && <HomeView logs={logs} />}
        {activeTab === 'entry' && <EntryView categories={categories} logs={logs} onSave={saveDaily} />}
        {activeTab === 'reports' && <ReportsView logs={logs} categories={categories} payments={payments} showToast={showToast} />}
        {activeTab === 'admin' && <AdminView categories={categories} logs={logs} payments={payments} showToast={showToast} />}
      </main>

      <nav className="fixed bottom-0 w-full bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 p-3 z-40">
        <div className="max-w-md mx-auto flex justify-around">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-blue-400 scale-110' : 'text-slate-600'}`}><HomeIcon size={22}/><span className="text-[9px] font-bold uppercase">Home</span></button>
          <button onClick={() => setActiveTab('entry')} className={`flex flex-col items-center ${activeTab === 'entry' ? 'text-blue-400 scale-110' : 'text-slate-600'}`}><PlusSquare size={22}/><span className="text-[9px] font-bold uppercase">Entry</span></button>
          <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center ${activeTab === 'reports' ? 'text-blue-400 scale-110' : 'text-slate-600'}`}><FileText size={22}/><span className="text-[9px] font-bold uppercase">Reports</span></button>
          <button onClick={() => setActiveTab('admin')} className={`flex flex-col items-center ${activeTab === 'admin' ? 'text-blue-400 scale-110' : 'text-slate-600'}`}><Settings size={22}/><span className="text-[9px] font-bold uppercase">Admin</span></button>
        </div>
      </nav>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function HomeView({ logs }) {
  const today = new Date().toISOString().split('T')[0];
  const total = logs.filter(l => l.date === today).reduce((s, l) => s + l.total, 0);
  return (
    <div className="bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/20 p-8 rounded-[2rem] shadow-2xl">
      <h2 className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Today's Grand Total</h2>
      <div className="text-6xl font-black text-white">Rs.{total.toLocaleString()}</div>
    </div>
  );
}

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
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl font-bold text-white text-center" />
        <div className="flex bg-slate-950 p-1 rounded-xl">
          {['Labour', 'Transport', 'Suzuki'].map(g => (
            <button key={g} onClick={() => setGrp(g)} className={`flex-1 py-2 text-xs font-black rounded-lg ${grp === g ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600'}`}>{g}</button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {categories.filter(c => c.group === grp).map(cat => (
          <div key={cat.id} className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm active:bg-slate-800/50 transition-colors">
            <div><div className="font-bold text-white text-sm">{cat.name}</div><div className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">Rate: Rs.{cat.rate}</div></div>
            <input type="number" inputMode="numeric" value={qtyMap[cat.id] || ''} onChange={e => setQtyMap({...qtyMap, [cat.id]: e.target.value})} placeholder="0" className="w-24 bg-slate-950 border border-slate-700 p-3 rounded-xl text-center font-black text-xl text-white outline-none focus:border-blue-500" />
          </div>
        ))}
      </div>
      <button onClick={() => onSave(date, qtyMap)} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl mt-4 active:scale-95 transition-all tracking-widest uppercase">Save & Sync Day</button>
    </div>
  );
}

function ReportsView({ logs, categories, payments, showToast }) {
  const [tab, setTab] = useState('summary');
  const [range, setRange] = useState(getWeekRange());

  const filteredLogs = logs.filter(l => l.date >= range.start && l.date <= range.end);
  const filteredPays = payments.filter(p => p.date >= range.start && p.date <= range.end);
  const displayString = `Report (${fmtDate(range.start)} to ${fmtDate(range.end)})`;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex overflow-x-auto hide-scrollbar">
        {['summary', 'ledger', 'payments', 'export'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 px-4 text-[10px] font-black rounded-lg uppercase whitespace-nowrap ${tab === t ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-white'}`}>{t}</button>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input type="date" value={range.start} onChange={e => setRange({...range, start: e.target.value})} className="flex-1 bg-slate-900 p-2 rounded-lg border border-slate-800 text-[10px] text-white" />
        <input type="date" value={range.end} onChange={e => setRange({...range, end: e.target.value})} className="flex-1 bg-slate-900 p-2 rounded-lg border border-slate-800 text-[10px] text-white" />
      </div>

      {tab === 'summary' && <SummarySection filteredLogs={filteredLogs} categories={categories} />}
      {tab === 'ledger' && <LedgerSection filteredLogs={filteredLogs} categories={categories} />}
      {tab === 'payments' && <PaymentsSection filteredPays={filteredPays} showToast={showToast} />}
      {tab === 'export' && <ExportSection filteredLogs={filteredLogs} categories={categories} range={range} displayString={displayString} showToast={showToast} />}
    </div>
  );
}

function SummarySection({ filteredLogs, categories }) {
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
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex justify-between items-center shadow-lg"><span className="text-xs font-bold text-slate-500">LABOUR TOTAL</span><span className="text-xl font-black text-blue-400">Rs.{totals.lab.toLocaleString()}</span></div>
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex justify-between items-center shadow-lg"><span className="text-xs font-bold text-slate-500">TRANSPORT TOTAL</span><span className="text-xl font-black text-purple-400">Rs.{totals.trans.toLocaleString()}</span></div>
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex justify-between items-center shadow-lg"><span className="text-xs font-bold text-slate-500">SUZUKI FREIGHT</span><span className="text-xl font-black text-amber-400">Rs.{totals.suz.toLocaleString()}</span></div>
      <div className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl p-6 shadow-xl"><h3 className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">Combined Grand Total</h3><div className="text-4xl font-black text-white">Rs.{totals.grand.toLocaleString()}</div></div>
    </div>
  );
}

function LedgerSection({ filteredLogs, categories }) {
  const dates = [...new Set(filteredLogs.map(l => l.date))].sort().reverse();
  const active = categories.filter(c => filteredLogs.some(l => l.categoryId === c.id));
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-2xl">
      <table className="w-full text-left text-[10px] whitespace-nowrap">
        <thead className="bg-slate-950 text-slate-600 font-black uppercase">
          <tr><th className="p-4 border-r border-slate-800">Date</th>{active.map(c => <th key={c.id} className="p-4 text-center border-r border-slate-800">{c.name}</th>)}<th className="p-4 text-right">Day Total</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {dates.map(d => (
            <tr key={d} className="hover:bg-slate-800/30 transition-colors">
              <td className="p-4 font-bold border-r border-slate-800">{fmtDate(d)}</td>
              {active.map(c => <td key={c.id} className="p-4 text-center border-r border-slate-800">{filteredLogs.find(l => l.date === d && l.categoryId === c.id)?.qty || '-'}</td>)}
              <td className="p-4 text-right font-black text-emerald-400 bg-emerald-950/20">Rs.{filteredLogs.filter(l => l.date === d).reduce((s, x) => s + x.total, 0).toLocaleString()}</td>
            </tr>
          ))}
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
    showToast("Payment Logged Successfully");
  };

  const del = async (id) => { if(window.confirm('Delete payment?')) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'payments', id)); };

  return (
    <div className="space-y-4 pb-10">
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 shadow-lg">
        <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest">Add New Advance</h3>
        <input type="text" placeholder="Worker/Party Name" value={n} onChange={e=>setN(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm text-white" />
        <div className="flex gap-2">
          <input type="number" placeholder="Amount (Rs)" value={a} onChange={e=>setA(e.target.value)} className="flex-1 bg-slate-950 border border-slate-700 p-3 rounded-lg text-sm text-white" />
          <button onClick={add} className="bg-blue-600 px-5 rounded-lg text-white font-bold"><Plus size={20}/></button>
        </div>
      </div>
      {filteredPays.map(p => (
        <div key={p.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center shadow-sm">
          <div><div className="font-bold text-white text-sm">{p.name}</div><div className="text-[10px] text-slate-500 uppercase tracking-widest">{fmtDate(p.date)}</div></div>
          <div className="flex items-center gap-4">
            <div className="font-black text-amber-400 text-lg">Rs.{p.amount.toLocaleString()}</div>
            <button onClick={() => del(p.id)} className="text-red-500/30 hover:text-red-500"><Trash2 size={18}/></button>
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
    if (!items.length) return;
    setWorking(true);
    showToast("Baking HD 4:5 Post...");
    const h2c = await loadHtml2Canvas();
    const node = document.getElementById('hd-export-node');
    node.style.display = 'flex';
    const canvas = await h2c(node, { scale: 2, backgroundColor: '#020617', width: 1080, height: 1350 });
    node.style.display = 'none';
    const link = document.createElement('a');
    link.download = `Khyber_Report_${range.start}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setWorking(false);
  };

  const share = async () => {
    let text = `🏢 *KHYBER TRADERS*\n📊 *Mazdoori Report*\n📅 ${displayString}\n\n`;
    items.forEach(i => text += `• ${i.name}: ${i.qty} = Rs.${i.total.toLocaleString()}\n`);
    text += `\n*GRAND TOTAL: Rs.${grand.toLocaleString()}*`;
    if (navigator.share) await navigator.share({ text });
    else { navigator.clipboard.writeText(text); showToast('Report Copied!'); }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex gap-2">
        <button onClick={share} className="flex-1 bg-emerald-600 font-bold py-4 rounded-2xl flex justify-center items-center gap-2 shadow-lg active:scale-95 transition-all"><Share2 size={20}/> Share Text</button>
        <button onClick={download} disabled={working} className="flex-1 bg-indigo-600 font-black py-4 rounded-2xl flex justify-center items-center gap-3 shadow-lg active:scale-95 transition-all"><ImageIcon size={20}/> {working ? '...' : 'HD 4:5 Image'}</button>
      </div>
      
      {/* HD EXPORT FRAME (1080x1350) */}
      <div id="hd-export-node" className="bg-[#020617] text-white p-16 flex-col absolute left-[-9999px]" style={{ display: 'none', width: '1080px', height: '1350px', fontFamily: 'sans-serif' }}>
        <h1 className="text-8xl font-black text-blue-400 border-b-8 border-blue-600 pb-10 mb-10 uppercase tracking-tighter">KHYBER TRADERS</h1>
        <div className="text-4xl text-slate-500 font-bold mb-10 flex justify-between items-center uppercase tracking-widest">
          <span>Report Summary</span><span>{displayString}</span>
        </div>
        <div className="flex-1 bg-slate-900/50 rounded-[3rem] p-12 border-4 border-slate-800">
          <table className="w-full text-4xl">
            <thead className="text-slate-500 uppercase font-black border-b-4 border-slate-800 tracking-widest"><tr><th className="pb-8 text-left">Item Name</th><th className="pb-8 text-center">Qty</th><th className="pb-8 text-right">Total Rs.</th></tr></thead>
            <tbody className="divide-y-2 divide-slate-800/40">
              {items.map(a => <tr key={a.id}><td className="py-8 font-semibold">{a.name}</td><td className="py-8 text-center font-bold">{a.qty}</td><td className="py-8 text-right font-black text-blue-300">Rs.{a.total.toLocaleString()}</td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="mt-12 bg-emerald-950 p-16 rounded-[3rem] border-4 border-emerald-500 flex justify-between items-center shadow-2xl">
          <div className="text-6xl font-black uppercase text-emerald-400 tracking-widest">Grand Total</div>
          <div className="text-[10rem] font-black leading-none">Rs.{grand.toLocaleString()}</div>
        </div>
        <div className="absolute bottom-6 w-full left-0 text-center text-2xl text-slate-700 font-bold uppercase tracking-[0.5em]">Khyber Traders - Professional Mazdoori App</div>
      </div>
    </div>
  );
}

// ==========================================
// 4. ADMIN VIEW (With Sync & Backup)
// ==========================================
function AdminView({ categories, logs, payments, showToast }) {
  const [n, setN] = useState('');
  const [g, setG] = useState('Labour');
  const [r, setR] = useState('');

  const add = async () => {
    if(!n || !r) return;
    const id = Date.now().toString();
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', id), { name: n, group: g, rate: Number(r), order: categories.length });
    setN(''); setR('');
    showToast("Added to Global Cloud");
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
        showToast("Database Restored to Cloud");
      } catch (err) { showToast("Invalid File", "error"); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
        <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest border-b border-slate-800 pb-2">Global Manager</h3>
        <input type="text" placeholder="Item Name" value={n} onChange={e=>setN(e.target.value)} className="w-full bg-slate-950 p-3 rounded-xl border border-slate-700 text-white font-bold outline-none" />
        <div className="flex gap-2">
          <select value={g} onChange={e=>setG(e.target.value)} className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-700 text-white font-bold outline-none"><option>Labour</option><option>Transport</option><option>Suzuki</option></select>
          <input type="number" placeholder="Rate" value={r} onChange={e=>setR(e.target.value)} className="w-24 bg-slate-950 p-3 rounded-xl border border-slate-700 text-white font-bold text-center outline-none" />
        </div>
        <button onClick={add} className="w-full bg-blue-600 hover:bg-blue-500 font-black py-4 rounded-xl shadow-lg transition-colors">ADD CATEGORY</button>
      </div>

      <div className="bg-emerald-900/10 p-5 rounded-2xl border border-emerald-500/20 shadow-lg flex gap-2">
         <button onClick={exportJSON} className="flex-1 bg-slate-900 py-3 rounded-xl border border-emerald-500/30 text-xs font-bold flex justify-center items-center gap-2"><DownloadCloud size={16}/> Export JSON</button>
         <label className="flex-1 bg-slate-900 py-3 rounded-xl border border-blue-500/30 text-xs font-bold flex justify-center items-center gap-2 cursor-pointer"><UploadCloud size={16}/> Import JSON<input type="file" onChange={importJSON} className="hidden" /></label>
      </div>

      <div className="space-y-2">
        {categories.map((c, i) => (
          <div key={c.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-sm">
            <div className="flex flex-col gap-1 shrink-0">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-slate-600 hover:text-white disabled:opacity-10"><ArrowUp size={16}/></button>
              <button onClick={() => move(i, 1)} disabled={i === categories.length - 1} className="text-slate-600 hover:text-white disabled:opacity-10"><ArrowDown size={16}/></button>
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              <input value={c.name} onChange={e => edit(c.id, 'name', e.target.value)} className="w-full bg-transparent border-b border-slate-800 focus:border-blue-500 outline-none font-bold text-white text-sm" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase">{c.group}</span>
                <input type="number" value={c.rate} onChange={e => edit(c.id, 'rate', e.target.value)} className="w-20 bg-slate-950 p-1 rounded text-right font-bold text-amber-400 text-xs" />
              </div>
            </div>
            <button onClick={async () => { if(window.confirm(`Delete ${c.name}?`)) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', c.id)); }} className="text-red-500/20 hover:text-red-500 p-2"><Trash2 size={20}/></button>
          </div>
        ))}
        <div className="pt-8 px-2">
           <button onClick={() => { if(window.confirm('WIPE ALL SHARED CLOUD DATA?')) { showToast('Resetting...'); } }} className="w-full border border-red-500/20 text-red-500/40 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest">Factory Reset App</button>
        </div>
      </div>
    </div>
  );
}

