import React, { useState, useEffect, useMemo } from 'react';
import { Home, PlusSquare, FileText, Settings, Check, AlertCircle, ArrowUp, ArrowDown, Trash2, Plus, Image as ImageIcon, Share2, Calendar, CalendarRange, CalendarDays, DownloadCloud, UploadCloud, Trash } from 'lucide-react';

// --- INITIAL DEFAULT DATA (2026 Rates) ---
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

// Reusable Hook for LocalStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
}

// Dynamically load html2canvas
const loadHtml2Canvas = () => new Promise((resolve, reject) => {
  if (window.html2canvas) return resolve(window.html2canvas);
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  script.onload = () => resolve(window.html2canvas);
  script.onerror = reject;
  document.head.appendChild(script);
});

// Helper Functions
function getWeekRange() {
  const today = new Date();
  const day = today.getDay() || 7; 
  const start = new Date(today);
  start.setDate(today.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { 
    start: start.toISOString().split('T')[0], 
    end: end.toISOString().split('T')[0] 
  };
}

function formatDateString(dateStr) {
  if(!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('entry');
  const [toast, setToast] = useState(null);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Database State
  const [categories, setCategories] = useLocalStorage('maz_cats_final', DEFAULT_CATEGORIES);
  const [logs, setLogs] = useLocalStorage('maz_logs_final', []);
  const [payments, setPayments] = useLocalStorage('maz_payments_final', []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- SERVICE WORKER & PWA INSTALL LOGIC ---
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => console.log('Service Worker registered:', reg.scope))
          .catch(err => console.error('Service Worker registration failed:', err));
      });
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true); // Shows the Install Button
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstallable(false);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-blue-500/30 overflow-x-hidden w-full max-w-[100vw]">
      
      {/* HEADER WITH INSTALL BUTTON */}
      <header className="bg-blue-950/40 backdrop-blur-md border-b border-blue-500/20 p-4 sticky top-0 z-40 w-full box-border">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-widest bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              KHYBER TRADERS
            </h1>
            <p className="text-xs text-blue-300/70 font-medium tracking-wider">MAZDOORI APP</p>
          </div>
          {isInstallable && (
            <button 
              onClick={handleInstallClick} 
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all animate-in zoom-in duration-300"
            >
              <DownloadCloud size={16} /> Install App
            </button>
          )}
        </div>
      </header>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5 w-[90%] max-w-sm">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md ${
            toast.type === 'success' ? 'bg-emerald-900/95 border-emerald-500/50 text-emerald-100' : 'bg-amber-900/95 border-amber-500/50 text-amber-100'
          }`}>
            {toast.type === 'success' ? <Check size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
            <span className="font-semibold text-sm">{toast.msg}</span>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto p-4 w-full box-border overflow-x-hidden">
        {activeTab === 'home' && <HomeView logs={logs} />}
        {activeTab === 'entry' && <EntryView categories={categories} logs={logs} setLogs={setLogs} showToast={showToast} />}
        {activeTab === 'reports' && <ReportsView logs={logs} categories={categories} payments={payments} setPayments={setPayments} showToast={showToast} />}
        {activeTab === 'admin' && <AdminView categories={categories} setCategories={setCategories} logs={logs} setLogs={setLogs} payments={payments} setPayments={setPayments} showToast={showToast} />}
      </main>

      <nav className="fixed bottom-0 w-full max-w-[100vw] bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 pb-safe z-40 box-border">
        <div className="max-w-md mx-auto flex justify-around p-3">
          <NavItem icon={<Home size={22} />} label="Home" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={<PlusSquare size={22} />} label="Daily Entry" isActive={activeTab === 'entry'} onClick={() => setActiveTab('entry')} />
          <NavItem icon={<FileText size={22} />} label="Reports" isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          <NavItem icon={<Settings size={22} />} label="Admin" isActive={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 w-16 transition-all duration-200 ${isActive ? 'text-blue-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
    >
      {icon}
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
  );
}

// ==========================================
// 1. ENTRY VIEW (Daily Master Form)
// ==========================================
function EntryView({ categories, logs, setLogs, showToast }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [group, setGroup] = useState('Labour');
  const [qtyMap, setQtyMap] = useState({});

  const filteredCats = categories.filter(c => c.group === group);

  useEffect(() => {
    const dayLogs = logs.filter(l => l.date === date);
    const initialMap = {};
    categories.forEach(c => {
      const existing = dayLogs.find(l => l.categoryId === c.id);
      if (existing) initialMap[c.id] = existing.qty.toString();
    });
    setQtyMap(initialMap);
  }, [date, categories, logs]);

  const handleQtyChange = (catId, val) => {
    setQtyMap(prev => ({ ...prev, [catId]: val }));
  };

  const handleSave = () => {
    const filteredOutLogs = logs.filter(l => l.date !== date);
    const newLogsToAdd = [];

    Object.entries(qtyMap).forEach(([catId, qtyStr]) => {
      const qty = parseInt(qtyStr, 10);
      if (!isNaN(qty) && qty > 0) {
        const cat = categories.find(c => c.id === catId);
        if (cat) {
          newLogsToAdd.push({
            id: `${date}-${catId}`,
            date,
            categoryId: catId,
            qty,
            total: qty * cat.rate
          });
        }
      }
    });

    setLogs([...filteredOutLogs, ...newLogsToAdd]);
    showToast(`Records saved for ${formatDateString(date)}`);
    if(document.activeElement) document.activeElement.blur();
  };

  const handleClearDay = () => {
    if (window.confirm(`Are you sure you want to delete ALL records for ${formatDateString(date)}?`)) {
      setLogs(logs.filter(l => l.date !== date));
      setQtyMap({});
      showToast('Day completely cleared.', 'success');
    }
  };

  const liveTotal = useMemo(() => {
    let total = 0;
    Object.entries(qtyMap).forEach(([catId, qtyStr]) => {
      const qty = parseInt(qtyStr, 10);
      if (!isNaN(qty) && qty > 0) {
        const cat = categories.find(c => c.id === catId);
        if (cat) total += (qty * cat.rate);
      }
    });
    return total;
  }, [qtyMap, categories]);

  return (
    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 pb-28 w-full max-w-full">
      <div className="bg-blue-900/20 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 shadow-lg w-full box-border overflow-hidden">
        
        <label className="text-xs text-blue-300/70 font-semibold uppercase mb-1 block">Select Date to Edit/Entry</label>
        <div className="w-full mb-4">
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            className="w-full box-border block bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-base text-white focus:border-blue-500 outline-none appearance-none"
          />
        </div>

        <div className="flex bg-slate-900/80 rounded-lg p-1 border border-slate-800 overflow-hidden">
          {['Labour', 'Transport', 'Suzuki'].map(g => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`flex-1 py-2 text-[11px] sm:text-xs font-bold rounded-md transition-all ${group === g ? 'bg-blue-600 shadow-md text-white' : 'text-slate-400'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 w-full box-border space-y-2">
        <div className="flex justify-between items-center px-1 mb-2">
           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{group} Fields</span>
           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Quantity</span>
        </div>

        {filteredCats.map(cat => (
          <div key={cat.id} className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm">
            <div className="flex-1 min-w-0 pr-3">
              <div className="font-bold text-sm text-white truncate">{cat.name}</div>
              <div className="text-[10px] text-amber-400 font-medium tracking-wide mt-0.5">Rate: Rs. {cat.rate}</div>
            </div>
            <div className="w-24 shrink-0">
              <input 
                type="number" 
                inputMode="numeric"
                pattern="[0-9]*"
                value={qtyMap[cat.id] || ''}
                onChange={e => handleQtyChange(cat.id, e.target.value)}
                placeholder="0"
                className="w-full box-border bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xl font-bold text-center text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700"
              />
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-slate-800/50 mt-4 flex justify-end">
           <button onClick={handleClearDay} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-2 rounded-lg font-bold">
             <Trash size={14} /> Clear Entire Day
           </button>
        </div>
      </div>

      <div className="fixed bottom-[72px] left-0 w-full max-w-[100vw] bg-slate-900 border-t border-slate-700/80 p-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-30 box-border">
        <div className="max-w-md mx-auto flex items-center gap-4 px-2">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider mb-0.5 truncate">Total for {formatDateString(date)}</div>
            <div className="text-2xl font-black text-emerald-400 truncate">Rs. {liveTotal.toLocaleString()}</div>
          </div>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2 whitespace-nowrap bg-blue-600 hover:bg-blue-500 border border-blue-400/50"
          >
            Save Day <Check size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}


// ==========================================
// 2. REPORTS & LEDGER VIEW
// ==========================================
function ReportsView({ logs, categories, payments, setPayments, showToast }) {
  const [reportTab, setReportTab] = useState('summary');
  
  const [filterMode, setFilterMode] = useState('week');
  const [filterDateDaily, setFilterDateDaily] = useState(new Date().toISOString().split('T')[0]);
  const [filterDateFrom, setFilterDateFrom] = useState(getWeekRange().start);
  const [filterDateTo, setFilterDateTo] = useState(getWeekRange().end);

  const filterBounds = useMemo(() => {
    if (filterMode === 'daily') {
      return { start: filterDateDaily, end: filterDateDaily };
    }
    if (filterMode === 'week') {
      return getWeekRange();
    }
    if (filterMode === 'range') {
      const s = filterDateFrom <= filterDateTo ? filterDateFrom : filterDateTo;
      const e = filterDateFrom <= filterDateTo ? filterDateTo : filterDateFrom;
      return { start: s, end: e };
    }
  }, [filterMode, filterDateDaily, filterDateFrom, filterDateTo]);

  const isDateInRange = (dateStr) => {
    return dateStr >= filterBounds.start && dateStr <= filterBounds.end;
  };

  const filteredLogs = useMemo(() => logs.filter(l => isDateInRange(l.date)), [logs, filterBounds]);
  const filteredPayments = useMemo(() => payments.filter(p => isDateInRange(p.date)), [payments, filterBounds]);

  const getDisplayDateString = () => {
    if (filterMode === 'daily') return formatDateString(filterBounds.start);
    return `${formatDateString(filterBounds.start)} to ${formatDateString(filterBounds.end)}`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4 w-full">
      
      <div className="bg-blue-950/40 rounded-xl p-1 border border-blue-500/20 shadow-inner w-full overflow-hidden">
        <div className="flex gap-1 overflow-x-auto hide-scrollbar">
          {[
            { id: 'summary', label: 'Summary' },
            { id: 'ledger', label: 'Data Table' },
            { id: 'payments', label: 'Payments' },
            { id: 'export', label: 'Export' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setReportTab(t.id)}
              className={`flex-1 min-w-[70px] whitespace-nowrap py-2 text-[11px] font-bold rounded-lg transition-all ${reportTab === t.id ? 'bg-blue-600 text-white shadow-md' : 'text-blue-300/60 hover:text-white'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-3 shadow-md w-full box-border">
        <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 overflow-hidden">
          <button onClick={() => setFilterMode('daily')} className={`flex-1 py-2 text-[10px] font-bold rounded flex flex-col justify-center items-center gap-1 transition-all ${filterMode === 'daily' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
            <Calendar size={14}/> Daily
          </button>
          <button onClick={() => setFilterMode('week')} className={`flex-1 py-2 text-[10px] font-bold rounded flex flex-col justify-center items-center gap-1 transition-all ${filterMode === 'week' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
            <CalendarDays size={14}/> This Week
          </button>
          <button onClick={() => setFilterMode('range')} className={`flex-1 py-2 text-[10px] font-bold rounded flex flex-col justify-center items-center gap-1 transition-all ${filterMode === 'range' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
            <CalendarRange size={14}/> Custom
          </button>
        </div>
        
        {filterMode === 'daily' && (
          <input 
            type="date" 
            value={filterDateDaily} 
            onChange={e => setFilterDateDaily(e.target.value)}
            className="w-full box-border bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-indigo-500 outline-none appearance-none"
          />
        )}
        {filterMode === 'week' && (
          <div className="text-center text-xs font-bold text-indigo-300 bg-indigo-900/20 py-2 rounded-lg border border-indigo-500/20">
            {formatDateString(filterBounds.start)} — {formatDateString(filterBounds.end)}
          </div>
        )}
        {filterMode === 'range' && (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">From Date</label>
              <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="w-full box-border bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none appearance-none" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">To Date</label>
              <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="w-full box-border bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none appearance-none" />
            </div>
          </div>
        )}
      </div>

      {reportTab === 'summary' && <SummaryCards filteredLogs={filteredLogs} categories={categories} />}
      {reportTab === 'ledger' && <DetailedLedger filteredLogs={filteredLogs} categories={categories} />}
      {reportTab === 'payments' && <PaymentTracker payments={payments} filteredPayments={filteredPayments} setPayments={setPayments} showToast={showToast} />}
      {reportTab === 'export' && <SocialExport filteredLogs={filteredLogs} categories={categories} showToast={showToast} displayString={getDisplayDateString()} filterMode={filterMode} />}
    </div>
  );
}

function SummaryCards({ filteredLogs, categories }) {
  const totals = useMemo(() => {
    let labour = 0, transport = 0, suzuki = 0;
    filteredLogs.forEach(log => {
      const cat = categories.find(c => c.id === log.categoryId);
      if (!cat) return;
      if (cat.group === 'Labour') labour += log.total;
      if (cat.group === 'Transport') transport += log.total;
      if (cat.group === 'Suzuki') suzuki += log.total;
    });
    return { labour, transport, suzuki, grand: labour + transport + suzuki };
  }, [filteredLogs, categories]);

  const Card = ({ title, amount, color }) => (
    <div className={`bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 shadow-lg relative overflow-hidden w-full box-border`}>
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-full -mr-10 -mt-10 blur-xl`}></div>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</h3>
      <div className={`text-3xl font-black text-${color}-400 truncate`}>Rs. {amount.toLocaleString()}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-3 w-full pb-10">
      <Card title="Labour Total" amount={totals.labour} color="blue" />
      <Card title="Transport Total" amount={totals.transport} color="purple" />
      
      <div className="bg-slate-800/40 border-y border-slate-700/50 p-4 flex justify-between items-center w-full shadow-inner">
         <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Labour & Transport Total</span>
         <span className="text-xl font-bold text-white truncate">Rs. {(totals.labour + totals.transport).toLocaleString()}</span>
      </div>

      <Card title="Suzuki Freight Total" amount={totals.suzuki} color="amber" />
      
      <div className="bg-gradient-to-br from-emerald-900 to-teal-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl w-full box-border mt-2">
        <h3 className="text-xs font-bold text-emerald-200/70 uppercase tracking-widest mb-1">Grand Total (A+B+Suzukis)</h3>
        <div className="text-4xl font-black text-white drop-shadow-md truncate">Rs. {totals.grand.toLocaleString()}</div>
      </div>
    </div>
  );
}

function DetailedLedger({ filteredLogs, categories }) {
  const uniqueDates = [...new Set(filteredLogs.map(l => l.date))].sort().reverse();
  const activeCatIds = [...new Set(filteredLogs.map(l => l.categoryId))];
  const activeCats = categories.filter(c => activeCatIds.includes(c.id));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl w-full">
      <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
        <h3 className="font-bold text-sm">Detailed Ledger Table</h3>
      </div>
      <div className="overflow-x-auto pb-4 w-full">
        <table className="w-full text-left text-xs whitespace-nowrap min-w-full">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-3 font-semibold sticky left-0 bg-slate-950 z-10 border-r border-slate-800">Date</th>
              {activeCats.map(c => (
                <th key={c.id} className="p-3 font-semibold text-center border-r border-slate-800/50">
                  {c.name}<br/><span className="text-[10px] text-blue-400">@{c.rate}</span>
                </th>
              ))}
              <th className="p-3 font-bold text-emerald-400 bg-emerald-950/20">Daily Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {uniqueDates.map(date => {
              const dayLogs = filteredLogs.filter(l => l.date === date);
              const dayTotal = dayLogs.reduce((sum, l) => sum + l.total, 0);
              return (
                <tr key={date} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-medium sticky left-0 bg-slate-900 border-r border-slate-800">{formatDateString(date)}</td>
                  {activeCats.map(c => {
                    const log = dayLogs.find(l => l.categoryId === c.id);
                    return (
                      <td key={c.id} className="p-3 text-center border-r border-slate-800/50">
                        {log ? <span className="text-white font-bold">{log.qty}</span> : <span className="text-slate-600">-</span>}
                      </td>
                    );
                  })}
                  <td className="p-3 font-bold text-emerald-400 bg-emerald-950/10 text-right">Rs. {dayTotal.toLocaleString()}</td>
                </tr>
              );
            })}
            {uniqueDates.length === 0 && (
              <tr><td colSpan={100} className="p-6 text-center text-slate-500">No records found for selected dates.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentTracker({ payments, filteredPayments, setPayments, showToast }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const addPayment = () => {
    if(!name || !amount) return showToast('Fill all fields', 'error');
    const newRecord = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], name, amount: Number(amount) };
    setPayments([newRecord, ...payments]);
    setName(''); setAmount('');
    showToast('Payment Added');
    if(document.activeElement) document.activeElement.blur();
  };

  const deletePayment = (id) => {
    if(window.confirm('Delete this payment?')) {
      setPayments(payments.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-4 w-full box-border pb-10">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 w-full box-border">
        <h3 className="font-bold text-sm text-slate-300">Add Payment / Advance Given</h3>
        <input type="text" placeholder="Name or Party" value={name} onChange={e=>setName(e.target.value)} className="w-full box-border bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-blue-500" />
        <div className="flex gap-2 w-full">
          <input type="number" inputMode="numeric" placeholder="Amount (Rs.)" value={amount} onChange={e=>setAmount(e.target.value)} className="flex-1 box-border min-w-0 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-blue-500" />
          <button onClick={addPayment} className="bg-blue-600 text-white font-bold px-4 rounded-lg shrink-0"><Plus size={20}/></button>
        </div>
      </div>

      <div className="space-y-2 w-full">
        {filteredPayments.map(p => (
          <div key={p.id} className="flex justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded-xl w-full box-border">
            <div className="min-w-0 flex-1 pr-2">
              <div className="font-bold text-white truncate">{p.name}</div>
              <div className="text-[10px] text-slate-500">{formatDateString(p.date)}</div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-bold text-amber-400">Rs. {p.amount.toLocaleString()}</span>
              <button onClick={() => deletePayment(p.id)} className="text-red-500/70 hover:text-red-400"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
        {filteredPayments.length === 0 && (
          <div className="p-4 text-center text-sm text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
            No payments found in this date range.
          </div>
        )}
      </div>
    </div>
  );
}


// ==========================================
// 3. AGGREGATED SOCIAL EXPORT
// ==========================================
function SocialExport({ filteredLogs, categories, showToast, displayString, filterMode }) {
  const [isExporting, setIsExporting] = useState(false);
  
  const aggregatedLogs = useMemo(() => {
    return categories.map(cat => {
      const logsForCat = filteredLogs.filter(l => l.categoryId === cat.id);
      if(logsForCat.length === 0) return null;
      const totalQty = logsForCat.reduce((sum, l) => sum + l.qty, 0);
      const totalRs = logsForCat.reduce((sum, l) => sum + l.total, 0);
      return { id: cat.id, name: cat.name, rate: cat.rate, qty: totalQty, total: totalRs, group: cat.group };
    }).filter(Boolean);
  }, [filteredLogs, categories]);

  const labourTotal = aggregatedLogs.filter(a => a.group === 'Labour').reduce((sum, a) => sum + a.total, 0);
  const transportTotal = aggregatedLogs.filter(a => a.group === 'Transport').reduce((sum, a) => sum + a.total, 0);
  const suzukiTotal = aggregatedLogs.filter(a => a.group === 'Suzuki').reduce((sum, a) => sum + a.total, 0);
  
  const labourAndTransportTotal = labourTotal + transportTotal;
  const grandTotal = labourAndTransportTotal + suzukiTotal;

  const shareText = async () => {
    if (aggregatedLogs.length === 0) return showToast('No data to share', 'error');

    let text = `🏢 *KHYBER TRADERS*\n📊 *Mazdoori Report*\n📅 *Period:* ${displayString}\n\n`;

    const buildSection = (title, groupName) => {
      const groupAggs = aggregatedLogs.filter(a => a.group === groupName);
      if (groupAggs.length === 0) return;
      
      text += `*${title}:*\n`;
      let secTotal = 0;
      groupAggs.forEach(a => {
        text += `• ${a.name}: ${a.qty} @ Rs.${a.rate} = Rs.${a.total.toLocaleString()}\n`;
        secTotal += a.total;
      });
      text += `_Subtotal: Rs. ${secTotal.toLocaleString()}_\n\n`;
    };

    buildSection('Labour', 'Labour');
    buildSection('Transport', 'Transport');
    buildSection('Suzuki Freight', 'Suzuki');

    text += `=====================\n`;
    text += `*GRAND TOTAL: Rs. ${grandTotal.toLocaleString()}*\n`;
    text += `=====================\n\n`;
    text += `_Generated by Mazdoori App_`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Khyber Traders Report', text: text });
      } catch (err) {
        console.error(err);
      }
    } else {
      navigator.clipboard.writeText(text);
      showToast('Copied to clipboard for WhatsApp!', 'success');
    }
  };

  const generateImage = async () => {
    if (aggregatedLogs.length === 0) return showToast('No data to export', 'error');
    setIsExporting(true);
    showToast('Generating HD Image...', 'success');
    
    try {
      const html2canvas = await loadHtml2Canvas();
      const node = document.getElementById('export-node');
      
      node.style.display = 'flex';
      
      const canvas = await html2canvas(node, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#020617', 
        width: 1080,
        height: 1350,
        windowWidth: 1080,
        windowHeight: 1350,
      });

      node.style.display = 'none';

      const link = document.createElement('a');
      link.download = `Mazdoori_Report_${filterMode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Image Downloaded Successfully!');
    } catch (err) {
      console.error(err);
      showToast('Export failed', 'error');
    }
    setIsExporting(false);
  };

  return (
    <div className="space-y-4 w-full pb-10">
      
      <div className="flex gap-2">
        <button 
          onClick={shareText} 
          className="flex-1 box-border bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2"
        >
          <Share2 size={20} /> WhatsApp Text
        </button>

        <button 
          onClick={generateImage} 
          disabled={isExporting}
          className="flex-1 box-border bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
        >
          <ImageIcon size={20} /> Image (4:5)
        </button>
      </div>

      <div className="text-center text-xs text-slate-400">
        Aggregated report for: <strong className="text-white">{displayString}</strong>
      </div>

      <div className="aspect-[4/5] w-full max-w-[400px] mx-auto bg-slate-950 border-2 border-slate-800 rounded-xl p-4 flex flex-col relative overflow-hidden pointer-events-none box-border">
        <div className="flex justify-between items-end border-b border-blue-500 pb-2 mb-4">
          <div className="min-w-0 pr-2">
            <h1 className="text-lg font-black tracking-tighter text-blue-400 truncate">KHYBER TRADERS</h1>
            <p className="text-[10px] text-slate-400 truncate">Mazdoori Summary</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] font-bold text-slate-300">{displayString}</div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden w-full">
          <table className="w-full text-left text-[10px] table-fixed">
            <thead className="text-slate-500 border-b border-slate-800">
              <tr>
                <th className="pb-1 font-semibold w-[40%] truncate">Category</th>
                <th className="pb-1 text-center font-semibold w-[20%]">Rate</th>
                <th className="pb-1 text-center font-semibold w-[15%]">Qty</th>
                <th className="pb-1 text-right font-semibold w-[25%] truncate">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {aggregatedLogs.map(a => (
                <tr key={a.id}>
                  <td className="py-2 font-medium truncate pr-1">{a.name}</td>
                  <td className="py-2 text-center text-slate-400 truncate">Rs.{a.rate}</td>
                  <td className="py-2 text-center font-bold">{a.qty}</td>
                  <td className="py-2 text-right font-bold text-blue-400 truncate">Rs.{a.total}</td>
                </tr>
              ))}
              {aggregatedLogs.length === 0 && (
                 <tr><td colSpan={4} className="py-4 text-center text-slate-600">No records to export</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-2 space-y-1.5 w-full box-border border-t border-slate-800 pt-2">
           <div className="flex justify-between items-center px-1">
             <div className="text-[9px] text-slate-400 uppercase tracking-wider">Labour & Transport Total</div>
             <div className="text-xs font-bold text-slate-300">Rs. {labourAndTransportTotal.toLocaleString()}</div>
           </div>
           <div className="flex justify-between items-center px-1">
             <div className="text-[9px] text-amber-500/80 uppercase tracking-wider">Suzuki Freight Total</div>
             <div className="text-xs font-bold text-amber-400">Rs. {suzukiTotal.toLocaleString()}</div>
           </div>
           <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-lg p-2.5 flex justify-between items-center w-full box-border mt-1">
              <div className="text-[10px] text-emerald-500 font-bold uppercase shrink-0">Grand Total</div>
              <div className="text-base font-black text-white truncate pl-2">Rs. {grandTotal.toLocaleString()}</div>
           </div>
        </div>
      </div>

      <div id="export-node" className="bg-[#020617] text-white p-16 flex-col relative" style={{ display: 'none', width: '1080px', height: '1350px', fontFamily: "Inter, sans-serif" }}>
        <div className="flex justify-between items-end border-b-4 border-blue-500 pb-8 mb-8 w-full">
          <div>
            <h1 className="text-6xl font-black tracking-tighter text-[#60a5fa] whitespace-nowrap">KHYBER TRADERS</h1>
            <p className="text-3xl text-slate-400 font-medium mt-2">Mazdoori Report</p>
          </div>
          <div className="text-right">
            <div className="text-2xl text-slate-400 uppercase tracking-widest mb-1">Period</div>
            <div className="text-3xl font-bold whitespace-nowrap text-slate-200">{displayString}</div>
          </div>
        </div>

        <div className="flex-1 bg-slate-900/50 rounded-3xl border-2 border-slate-800 p-8 flex flex-col w-full overflow-hidden">
          <table className="w-full text-left text-3xl table-fixed">
            <thead className="text-slate-500 border-b-2 border-slate-800">
              <tr>
                <th className="pb-6 font-semibold uppercase tracking-wider w-[40%]">Category</th>
                <th className="pb-6 text-center font-semibold uppercase tracking-wider w-[20%]">Rate</th>
                <th className="pb-6 text-center font-semibold uppercase tracking-wider w-[15%]">Total Qty</th>
                <th className="pb-6 text-right font-semibold uppercase tracking-wider w-[25%]">Total Rs.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {aggregatedLogs.map(a => (
                <tr key={a.id}>
                  <td className="py-6 font-medium pr-4">{a.name}</td>
                  <td className="py-6 text-center text-slate-400">Rs. {a.rate}</td>
                  <td className="py-6 text-center font-bold text-white">{a.qty}</td>
                  <td className="py-6 text-right font-bold text-[#60a5fa]">Rs. {a.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 space-y-4 w-full px-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
             <div className="text-2xl text-slate-400 uppercase tracking-widest">Labour & Transport Total</div>
             <div className="text-3xl font-bold text-slate-300">Rs. {labourAndTransportTotal.toLocaleString()}</div>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
             <div className="text-2xl text-[#fbbf24] uppercase tracking-widest">Suzuki Freight Total</div>
             <div className="text-3xl font-bold text-[#fbbf24]">Rs. {suzukiTotal.toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-8 bg-[#064e3b] border-2 border-[#10b981] rounded-3xl p-10 flex justify-between items-center w-full">
          <div className="text-4xl text-[#34d399] font-bold uppercase tracking-widest">Grand Total</div>
          <div className="text-6xl font-black text-white whitespace-nowrap">Rs. {grandTotal.toLocaleString()}</div>
        </div>
        
        <div className="absolute bottom-6 w-full left-0 text-center text-xl text-slate-600 font-medium">
          Generated by Mazdoori App • Muhammad Tahir Qadri
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. HOME VIEW (Dashboard)
// ==========================================
function HomeView({ logs }) {
  const todayDate = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.date === todayDate);
  const todayTotal = todayLogs.reduce((sum, l) => sum + l.total, 0);

  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-6 w-full box-border">
      <div className="bg-gradient-to-br from-blue-900/60 to-slate-900 border border-blue-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden w-full box-border">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <h2 className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-1">Today's Business</h2>
        <div className="text-5xl font-black text-white mb-4 truncate w-full">Rs. {todayTotal.toLocaleString()}</div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300 bg-slate-950/50 w-fit px-3 py-1.5 rounded-lg border border-slate-700">
          <FileText size={16} className="text-blue-400" /> {todayLogs.length} Entries Logged Today
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. FULL ADMIN VIEW (Includes Local Backup Sync)
// ==========================================
function AdminView({ categories, setCategories, logs, setLogs, payments, setPayments, showToast }) {
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('Labour');
  const [newRate, setNewRate] = useState('');

  const addCategory = () => {
    if(!newName || !newRate) return showToast('Fill name and rate', 'error');
    const newCat = { id: Date.now().toString(), name: newName, group: newGroup, rate: Number(newRate) };
    setCategories([...categories, newCat]);
    setNewName(''); setNewRate('');
    showToast('Category Added!');
    if(document.activeElement) document.activeElement.blur();
  };

  const deleteCategory = (id) => {
    if(window.confirm('Delete this category? Past records will still show its ID.')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const moveCategory = (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === categories.length - 1) return;
    const newCats = [...categories];
    const temp = newCats[index];
    newCats[index] = newCats[index + direction];
    newCats[index + direction] = temp;
    setCategories(newCats);
  };

  const handleExportData = () => {
    const data = { categories, logs, payments };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mazdoori_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Backup File Downloaded!');
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.categories) setCategories(json.categories);
        if (json.logs) setLogs(json.logs);
        if (json.payments) setPayments(json.payments);
        showToast('Data Restored Successfully!');
      } catch (err) {
        showToast('Invalid Backup File', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
     if(window.confirm('WARNING: This will permanently delete ALL data, categories, and payments. Are you sure?')) {
         if(window.confirm('FINAL WARNING: This cannot be undone. Clear all data?')) {
             setLogs([]);
             setPayments([]);
             setCategories(DEFAULT_CATEGORIES);
             showToast('Database wiped successfully.', 'success');
         }
     }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6 pb-20 w-full box-border">
      
      {/* SYNC MODULE */}
      <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-xl shadow-lg w-full box-border">
        <h3 className="font-bold text-sm text-emerald-400 mb-3 border-b border-emerald-500/30 pb-2">Data Sync & Backup</h3>
        <p className="text-xs text-slate-300 mb-4">Securely download your database to transfer it to another device.</p>
        <div className="flex gap-2 w-full">
          <button onClick={handleExportData} className="flex-1 bg-slate-900 border border-emerald-500/50 hover:bg-emerald-900/50 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2">
            <DownloadCloud size={18}/> Export Backup
          </button>
          <label className="flex-1 bg-slate-900 border border-blue-500/50 hover:bg-blue-900/50 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 cursor-pointer">
            <UploadCloud size={18}/> Restore Data
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg w-full box-border">
        <h3 className="font-bold text-sm text-slate-300 mb-3 border-b border-slate-800 pb-2">Add New Category</h3>
        <div className="space-y-3 w-full">
          <input type="text" placeholder="Category Name" value={newName} onChange={e=>setNewName(e.target.value)} className="w-full box-border bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-blue-500" />
          <div className="flex gap-2 w-full">
            <select value={newGroup} onChange={e=>setNewGroup(e.target.value)} className="flex-1 min-w-0 box-border bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm outline-none">
              <option value="Labour">Labour</option>
              <option value="Transport">Transport</option>
              <option value="Suzuki">Suzuki</option>
            </select>
            <input type="number" inputMode="numeric" placeholder="Rate" value={newRate} onChange={e=>setNewRate(e.target.value)} className="w-24 shrink-0 box-border bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-blue-500" />
          </div>
          <button onClick={addCategory} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2">
            <Plus size={18}/> Add Category
          </button>
        </div>
      </div>

      <div className="space-y-2 w-full box-border">
        <h3 className="font-bold text-sm text-slate-300">Manage Categories</h3>
        {categories.map((c, i) => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3 w-full box-border">
            <div className="flex flex-col gap-1 shrink-0">
              <button onClick={() => moveCategory(i, -1)} disabled={i === 0} className="text-slate-500 hover:text-white disabled:opacity-30"><ArrowUp size={16}/></button>
              <button onClick={() => moveCategory(i, 1)} disabled={i === categories.length - 1} className="text-slate-500 hover:text-white disabled:opacity-30"><ArrowDown size={16}/></button>
            </div>
            
            <div className="flex-1 min-w-0 space-y-2">
              <input type="text" value={c.name} onChange={e => setCategories(categories.map(cat => cat.id === c.id ? { ...cat, name: e.target.value } : cat))} className="w-full box-border bg-transparent font-bold text-white border-b border-slate-700 focus:border-blue-500 outline-none pb-1 truncate" />
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest shrink-0">{c.group}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-slate-500">Rs.</span>
                  <input type="number" inputMode="numeric" value={c.rate} onChange={e => setCategories(categories.map(cat => cat.id === c.id ? { ...cat, rate: Number(e.target.value) } : cat))} className="w-14 box-border bg-slate-950 border border-slate-700 rounded px-1 text-right text-sm font-bold text-amber-400 outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            <button onClick={() => deleteCategory(c.id)} className="text-red-500/70 hover:text-red-500 bg-red-500/10 p-2 rounded-lg shrink-0">
              <Trash2 size={18}/>
            </button>
          </div>
        ))}
        
        <div className="pt-8">
           <button onClick={handleClearAllData} className="w-full border border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-colors">
              <Trash size={18}/> Factory Reset Database
           </button>
        </div>
      </div>
    </div>
  );
}
