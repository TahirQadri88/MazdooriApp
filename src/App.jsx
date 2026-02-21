import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home as HomeIcon, PlusSquare, FileText, Settings, Check, 
  AlertCircle, ArrowUp, ArrowDown, Trash2, Plus, 
  Image as ImageIcon, Share2, Calendar, CalendarRange, 
  CalendarDays, DownloadCloud, UploadCloud, Trash, RefreshCw 
} from 'lucide-react';

// Firebase Imports (Standard Modular v9+)
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, collection, onSnapshot, 
  updateDoc, deleteDoc, writeBatch 
} from 'firebase/firestore';

// --- CONFIGURATION ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'khyber-traders-final';

const DEFAULT_CATEGORIES = [
  { id: '1', name: "1st floor carton", group: "Labour", rate: 18 },
  { id: '2', name: "1st floor bags", group: "Labour", rate: 18 },
  { id: '3', name: "Makkah Market", group: "Labour", rate: 18 },
  { id: '4', name: "2nd floor", group: "Labour", rate: 18 },
  { id: '5', name: "3rd floor", group: "Labour", rate: 18 },
  { id: '6', name: "Ahmed Chamber", group: "Labour", rate: 18 },
  { id: '7', name: "TPT Out", group: "Transport", rate: 30 },
  { id: '8', name: "BABA", group: "Transport", rate: 30 },
  { id: '9', name: "TPT OTHERS", group: "Transport", rate: 30 },
  { id: '10', name: "LCC", group: "Suzuki", rate: 4500 },
  { id: '11', name: "SHW", group: "Suzuki", rate: 5000 },
  { id: '12', name: "GADAP", group: "Suzuki", rate: 5000 },
  { id: '13', name: "AL HILAL", group: "Suzuki", rate: 2500 },
  { id: '14', name: "HILTON", group: "Suzuki", rate: 4000 },
  { id: '15', name: "HUB", group: "Suzuki", rate: 2500 }
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
const getWeek = () => {
  const t = new Date();
  const d = t.getDay() || 7;
  const s = new Date(t); s.setDate(t.getDate() - d + 1);
  const e = new Date(s); e.setDate(s.getDate() + 6);
  return { start: s.toISOString().split('T')[0], end: e.toISOString().split('T')[0] };
};

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('entry');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global Synced State
  const [cats, setCats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pays, setPays] = useState([]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Auth Effect
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Sync Effect
  useEffect(() => {
    if (!user) return;

    const unsubCats = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'categories'), (s) => {
      const d = s.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setCats(d.length ? d.sort((a,b) => (a.order || 0) - (b.order || 0)) : DEFAULT_CATEGORIES);
      setLoading(false);
    }, () => setLoading(false));

    const unsubLogs = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'logs'), (s) => {
      setLogs(s.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    const unsubPays = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'payments'), (s) => {
      setPays(s.docs.map(doc => ({ ...doc.data(), id: doc.id })));
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
      const cat = cats.find(c => c.id === cid);
      if (q > 0 && cat) {
        const rid = `${date}_${cid}`;
        batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'logs', rid), {
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
      <span className="text-[10px] font-black tracking-[0.3em] uppercase">Syncing Khyber Cloud</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 w-full overflow-x-hidden">
      <header className="bg-blue-950/40 backdrop-blur-md border-b border-blue-500/20 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent uppercase tracking-tighter">KHYBER TRADERS</h1>
            <p className="text-[9px] font-bold text-blue-300/60 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Network Active
            </p>
          </div>
          <div className="text-[10px] bg-slate-900 border border-slate-700 px-2 py-1 rounded text-slate-400 font-bold">2026 LIVE</div>
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
        {tab === 'home' && <Home logs={logs} />}
        {tab === 'entry' && <Entry cats={cats} logs={logs} onSave={saveDaily} />}
        {tab === 'reports' && <Reports logs={logs} cats={cats} pays={pays} appId={appId} showToast={showToast} />}
        {tab === 'admin' && <Admin cats={cats} appId={appId} showToast={showToast} />}
      </main>

      <nav className="fixed bottom-0 w-full bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 p-3 z-40">
        <div className="max-w-md mx-auto flex justify-around">
          <button onClick={() => setTab('home')} className={`flex flex-col items-center ${tab === 'home' ? 'text-blue-400 scale-110' : 'text-slate-600'}`}><HomeIcon size={22}/><span className="text-[9px] font-bold uppercase">Home</span></button>
          <button onClick={() => setTab('entry')} className={`flex flex-col items-center ${tab === 'entry' ? 'text-blue-400 scale-110' : 'text-slate-600'}`}><PlusSquare size={22}/><span className="text-[9px] font-bold uppercase">Entry</span></button>
          <button onClick={() => setTab('reports')} className={`flex flex-col items-center ${tab === 'reports' ? 'text-blue-400 scale-110' : 'text-slate-600'}`}><FileText size={22}/><span className="text-[9px] font-bold uppercase">Reports</span></button>
          <button onClick={() => setTab('admin')} className={`flex flex-col items-center ${tab === 'admin' ? 'text-blue-400 scale-110' : 'text-slate-600'}`}><Settings size={22}/><span className="text-[9px] font-bold uppercase">Admin</span></button>
        </div>
      </nav>
    </div>
  );
}

// --- VIEW COMPONENTS ---

function Home({ logs }) {
  const d = new Date().toISOString().split('T')[0];
  const t = logs.filter(l => l.date === d).reduce((s, l) => s + l.total, 0);
  return (
    <div className="bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/20 p-8 rounded-[2rem] shadow-2xl">
      <h2 className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Total Entry Today</h2>
      <div className="text-6xl font-black text-white">Rs. {t.toLocaleString()}</div>
    </div>
  );
}

function Entry({ cats, logs, onSave }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [grp, setGrp] = useState('Labour');
  const [map, setMap] = useState({});

  useEffect(() => {
    const m = {};
    logs.filter(l => l.date === date).forEach(l => m[l.categoryId] = l.qty.toString());
    setMap(m);
  }, [date, logs]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl font-bold text-white text-center" />
        <div className="flex bg-slate-950 p-1 rounded-xl">
          {['Labour', 'Transport', 'Suzuki'].map(g => (
            <button key={g} onClick={() => setGrp(g)} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${grp === g ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>{g}</button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {cats.filter(c => c.group === grp).map(c => (
          <div key={c.id} className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div><div className="font-bold text-white text-sm">{c.name}</div><div className="text-[9px] font-bold text-blue-400">RATE: Rs.{c.rate}</div></div>
            <input type="number" value={map[c.id] || ''} onChange={e => setMap({...map, [c.id]: e.target.value})} placeholder="0" className="w-24 bg-slate-950 border border-slate-700 p-3 rounded-xl text-center font-black text-xl text-white outline-none focus:border-blue-500" />
          </div>
        ))}
      </div>
      <button onClick={() => onSave(date, map)} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all tracking-widest">SYNC DAY TO CLOUD</button>
    </div>
  );
}

function Reports({ logs, cats, pays, appId, showToast }) {
  const [tab, setTab] = useState('summary');
  const [range, setRange] = useState(getWeek());

  const filteredLogs = logs.filter(l => l.date >= range.start && l.date <= range.end);
  const filteredPays = pays.filter(p => p.date >= range.start && p.date <= range.end);

  return (
    <div className="space-y-4">
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
        {['summary', 'ledger', 'payments', 'export'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-[10px] font-black rounded-lg uppercase ${tab === t ? 'bg-blue-600' : 'text-slate-600'}`}>{t}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="date" value={range.start} onChange={e => setRange({...range, start: e.target.value})} className="flex-1 bg-slate-900 p-2 rounded-lg border border-slate-800 text-[10px] text-white" />
        <input type="date" value={range.end} onChange={e => setRange({...range, end: e.target.value})} className="flex-1 bg-slate-900 p-2 rounded-lg border border-slate-800 text-[10px] text-white" />
      </div>

      {tab === 'summary' && <Summary filteredLogs={filteredLogs} cats={cats} />}
      {tab === 'ledger' && <Ledger filteredLogs={filteredLogs} cats={cats} />}
      {tab === 'payments' && <Payments filteredPays={filteredPays} appId={appId} showToast={showToast} />}
      {tab === 'export' && <Export filteredLogs={filteredLogs} cats={cats} range={range} showToast={showToast} />}
    </div>
  );
}

function Summary({ filteredLogs, cats }) {
  const totals = useMemo(() => {
    let l = 0, t = 0, s = 0;
    filteredLogs.forEach(log => {
      const c = cats.find(cat => cat.id === log.categoryId);
      if (!c) return;
      if (c.group === 'Labour') l += log.total;
      else if (c.group === 'Transport') t += log.total;
      else if (c.group === 'Suzuki') s += log.total;
    });
    return { l, t, s, grand: l + t + s };
  }, [filteredLogs, cats]);

  return (
    <div className="space-y-3 pb-10">
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex justify-between items-center"><span className="text-xs font-bold text-slate-500">LABOUR TOTAL</span><span className="text-xl font-black text-blue-400">Rs.{totals.l.toLocaleString()}</span></div>
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex justify-between items-center"><span className="text-xs font-bold text-slate-500">TRANSPORT TOTAL</span><span className="text-xl font-black text-purple-400">Rs.{totals.t.toLocaleString()}</span></div>
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex justify-between items-center"><span className="text-xs font-bold text-slate-500">SUZUKI FREIGHT</span><span className="text-xl font-black text-amber-400">Rs.{totals.s.toLocaleString()}</span></div>
      <div className="bg-emerald-900/20 p-6 rounded-3xl border border-emerald-500/30 flex justify-between items-center"><span className="text-sm font-black text-emerald-400">GRAND TOTAL</span><span className="text-3xl font-black text-white">Rs.{totals.grand.toLocaleString()}</span></div>
    </div>
  );
}

function Ledger({ filteredLogs, cats }) {
  const dates = [...new Set(filteredLogs.map(l => l.date))].sort().reverse();
  const active = cats.filter(c => filteredLogs.some(l => l.categoryId === c.id));
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-2xl">
      <table className="w-full text-left text-[10px] whitespace-nowrap">
        <thead className="bg-slate-950 text-slate-600 font-black uppercase">
          <tr><th className="p-4">Date</th>{active.map(c => <th key={c.id} className="p-4 text-center">{c.name}</th>)}<th className="p-4 text-right">Day Total</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {dates.map(d => (
            <tr key={d} className="hover:bg-slate-800/30 transition-colors">
              <td className="p-4 font-bold text-white">{fmtDate(d)}</td>
              {active.map(c => <td key={c.id} className="p-4 text-center text-slate-400">{filteredLogs.find(l => l.date === d && l.categoryId === c.id)?.qty || '-'}</td>)}
              <td className="p-4 text-right font-black text-emerald-400">Rs.{filteredLogs.filter(l => l.date === d).reduce((s, x) => s + x.total, 0).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Payments({ filteredPays, appId, showToast }) {
  const [n, setN] = useState('');
  const [a, setA] = useState('');

  const add = async () => {
    if(!n || !a) return;
    const id = Date.now().toString();
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'payments', id), {
      name: n, amount: Number(a), date: new Date().toISOString().split('T')[0]
    });
    setN(''); setA('');
    showToast("Advance Logged");
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
        <input type="text" placeholder="Worker/Party Name" value={n} onChange={e=>setN(e.target.value)} className="w-full bg-slate-950 p-3 rounded-xl border border-slate-700 text-white" />
        <div className="flex gap-2">
          <input type="number" placeholder="Amount (Rs)" value={a} onChange={e=>setA(e.target.value)} className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-700 text-white" />
          <button onClick={add} className="bg-blue-600 px-5 rounded-xl text-white font-bold"><Plus size={20}/></button>
        </div>
      </div>
      {filteredPays.map(p => (
        <div key={p.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center shadow-sm">
          <div><div className="font-bold text-white">{p.name}</div><div className="text-[10px] text-slate-500 uppercase">{fmtDate(p.date)}</div></div>
          <div className="flex items-center gap-4">
            <div className="font-black text-amber-400">Rs.{p.amount.toLocaleString()}</div>
            <button onClick={async () => await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'payments', p.id))} className="text-red-500/30 hover:text-red-500"><Trash2 size={18}/></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Export({ filteredLogs, cats, range, showToast }) {
  const [working, setWorking] = useState(false);
  const items = cats.map(c => {
    const l = filteredLogs.filter(x => x.categoryId === c.id);
    return l.length ? { ...c, qty: l.reduce((s, x) => s + x.qty, 0), total: l.reduce((s, x) => s + x.total, 0) } : null;
  }).filter(Boolean);
  const grand = items.reduce((s, x) => s + x.total, 0);

  const download = async () => {
    if (!items.length) return;
    setWorking(true);
    showToast("Generating HD 4:5 Post...");
    const h2c = await loadHtml2Canvas();
    const node = document.getElementById('hd-export');
    node.style.display = 'flex';
    const canvas = await h2c(node, { scale: 2, backgroundColor: '#020617', width: 1080, height: 1350 });
    node.style.display = 'none';
    const link = document.createElement('a');
    link.download = `Khyber_Report_${range.start}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setWorking(false);
  };

  return (
    <div className="space-y-4 pb-20">
      <button onClick={download} disabled={working} className="w-full bg-indigo-600 font-black py-5 rounded-3xl flex justify-center items-center gap-3 shadow-2xl transition-all active:scale-95">
        <ImageIcon size={22}/> {working ? 'Baking Post...' : 'Download HD Social Report'}
      </button>

      {/* 4:5 EXPORT FRAME (1080x1350) - HIDDEN UNTIL EXPORT */}
      <div id="hd-export" className="bg-[#020617] text-white p-16 flex-col absolute left-[-9999px]" style={{ display: 'none', width: '1080px', height: '1350px', fontFamily: 'sans-serif' }}>
        <h1 className="text-8xl font-black text-blue-400 border-b-8 border-blue-600 pb-10 mb-12 uppercase tracking-tighter">KHYBER TRADERS</h1>
        <div className="text-4xl text-slate-500 font-bold mb-10 flex justify-between items-center uppercase tracking-widest">
          <span>Report Summary</span>
          <span>{fmtDate(range.start)} - {fmtDate(range.end)}</span>
        </div>
        <div className="flex-1 bg-slate-900/50 rounded-[3rem] p-12 border-4 border-slate-800">
          <table className="w-full text-4xl">
            <thead className="text-slate-500 border-b-4 border-slate-800 uppercase tracking-widest"><th className="pb-8 text-left">Item Name</th><th className="pb-8 text-center">Qty</th><th className="pb-8 text-right">Total Rs.</th></thead>
            <tbody className="divide-y-2 divide-slate-800/40">
              {items.map(i => <tr key={i.id}><td className="py-8 font-semibold">{i.name}</td><td className="py-8 text-center font-bold">{i.qty}</td><td className="py-8 text-right font-black text-blue-300">Rs.{i.total.toLocaleString()}</td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="mt-12 bg-emerald-950 p-16 rounded-[3rem] border-4 border-emerald-500 flex justify-between items-center shadow-2xl">
          <div className="text-6xl font-black uppercase text-emerald-400 tracking-widest">Grand Total</div>
          <div className="text-[10rem] font-black leading-none">Rs.{grand.toLocaleString()}</div>
        </div>
        <div className="absolute bottom-6 w-full left-0 text-center text-2xl text-slate-700 font-bold uppercase tracking-[0.5em]">Khyber Traders Mazdoori System</div>
      </div>
    </div>
  );
}

function Admin({ cats, appId, showToast }) {
  const [n, setN] = useState('');
  const [g, setG] = useState('Labour');
  const [r, setR] = useState('');

  const add = async () => {
    if(!n || !r) return;
    const id = Date.now().toString();
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', id), {
      name: n, group: g, rate: Number(r), order: cats.length
    });
    setN(''); setR('');
    showToast("Added to Global Database");
  };

  const move = async (index, dir) => {
    if ((dir === -1 && index === 0) || (dir === 1 && index === cats.length - 1)) return;
    const batch = writeBatch(db);
    batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'categories', cats[index].id), { order: index + dir });
    batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'categories', cats[index+dir].id), { order: index });
    await batch.commit();
  };

  const edit = async (id, field, val) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', id), { [field]: field === 'rate' ? Number(val) : val });
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="font-black text-slate-500 uppercase text-xs tracking-widest mb-2 border-b border-slate-800 pb-2">Global Settings</h3>
        <input type="text" placeholder="New Item Name" value={n} onChange={e=>setN(e.target.value)} className="w-full bg-slate-950 p-3 rounded-xl border border-slate-700 text-white font-bold" />
        <div className="flex gap-2">
          <select value={g} onChange={e=>setG(e.target.value)} className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-700 text-white font-bold"><option>Labour</option><option>Transport</option><option>Suzuki</option></select>
          <input type="number" placeholder="Rate" value={r} onChange={e=>setR(e.target.value)} className="w-24 bg-slate-950 p-3 rounded-xl border border-slate-700 text-white font-bold text-center" />
        </div>
        <button onClick={add} className="w-full bg-blue-600 font-black py-4 rounded-xl shadow-lg transition-all active:scale-95">ADD TO SHARED CLOUD</button>
      </div>

      <div className="space-y-2">
        {cats.map((c, i) => (
          <div key={c.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="flex flex-col gap-1 shrink-0">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-slate-600 hover:text-white disabled:opacity-10"><ArrowUp size={16}/></button>
              <button onClick={() => move(i, 1)} disabled={i === cats.length - 1} className="text-slate-600 hover:text-white disabled:opacity-10"><ArrowDown size={16}/></button>
            </div>
            <div className="flex-1 space-y-2">
              <input value={c.name} onChange={e => edit(c.id, 'name', e.target.value)} className="w-full bg-transparent border-b border-slate-800 focus:border-blue-500 outline-none font-bold text-white text-sm" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase">{c.group}</span>
                <input type="number" value={c.rate} onChange={e => edit(c.id, 'rate', e.target.value)} className="w-20 bg-slate-950 p-1 rounded text-right font-black text-amber-400 text-xs" />
              </div>
            </div>
            <button onClick={async () => { if(window.confirm(`Delete ${c.name} globally?`)) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', c.id)); }} className="text-red-500/20 hover:text-red-500 p-2"><Trash2 size={20}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

