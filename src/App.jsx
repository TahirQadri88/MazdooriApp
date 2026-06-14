import React, { useState, useEffect, useMemo } from 'react';
import {
  Home as HomeIcon, PlusSquare, FileText, Settings, Check,
  ArrowUp, ArrowDown, Trash2, Plus,
  Image as ImageIcon, Share2, RefreshCw, DownloadCloud, UploadCloud, Info, Lock, FileDown, CalendarDays,
  Truck, User, MapPin, Package, ChevronDown, Clock, CheckCircle, XCircle, AlertCircle,
  DollarSign, Users, LogOut, Navigation, BarChart2, ClipboardList,
  Search, X
} from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, collection, onSnapshot, 
  updateDoc, deleteDoc, writeBatch 
} from 'firebase/firestore';

// --- FIREBASE CONFIGURATION ---
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

// ==========================================
// RIDES & DISPATCH MODULE — CONSTANTS
// ==========================================
const KARACHI_AREAS = [
  // --- Central / Saddar ---
  { name: 'Saddar', fromShop: 2, fromWarehouse: 12 },
  { name: 'Regal Chowk', fromShop: 1, fromWarehouse: 13 },
  { name: 'Bolton Market', fromShop: 1, fromWarehouse: 13 },
  { name: 'Jodia Bazaar', fromShop: 1.5, fromWarehouse: 13 },
  { name: 'Empress Market', fromShop: 2, fromWarehouse: 12 },
  { name: 'Burns Road', fromShop: 1.5, fromWarehouse: 13 },
  { name: 'Garden / Soldier Bazar', fromShop: 2, fromWarehouse: 13 },
  { name: 'Jamshed Road', fromShop: 5, fromWarehouse: 12 },
  { name: 'Jamshed Quarters', fromShop: 5, fromWarehouse: 12 },
  { name: 'Karachi Cantt', fromShop: 5, fromWarehouse: 14 },
  { name: 'Lines Area', fromShop: 3, fromWarehouse: 14 },
  { name: 'Ranchore Line', fromShop: 3, fromWarehouse: 14 },
  { name: 'Kharadar / Old Town', fromShop: 2, fromWarehouse: 14 },
  { name: 'Lea Market', fromShop: 2, fromWarehouse: 13 },
  { name: 'Lyari', fromShop: 3, fromWarehouse: 14 },
  // --- PECHS / Tariq Road / Bahadurabad ---
  { name: 'Tariq Road', fromShop: 8, fromWarehouse: 8 },
  { name: 'Bahadurabad', fromShop: 11, fromWarehouse: 4 },
  { name: 'PECHS', fromShop: 9, fromWarehouse: 8 },
  { name: 'Shahrah-e-Faisal', fromShop: 10, fromWarehouse: 9 },
  { name: 'Gulberg', fromShop: 11, fromWarehouse: 7 },
  { name: 'Rashid Minhas Road', fromShop: 10, fromWarehouse: 7 },
  { name: 'Drigh Road', fromShop: 12, fromWarehouse: 10 },
  { name: 'Karachi Airport', fromShop: 14, fromWarehouse: 12 },
  // --- Gulshan / Johar ---
  { name: 'Gulshan-e-Iqbal', fromShop: 14, fromWarehouse: 2 },
  { name: 'Gulshan Block 2', fromShop: 13, fromWarehouse: 2 },
  { name: 'Gulshan Block 3', fromShop: 13, fromWarehouse: 2 },
  { name: 'Gulshan Block 6', fromShop: 14, fromWarehouse: 2 },
  { name: 'Gulshan Block 7', fromShop: 14, fromWarehouse: 2 },
  { name: 'Gulshan Block 10A', fromShop: 14, fromWarehouse: 2 },
  { name: 'Gulshan Block 13', fromShop: 14, fromWarehouse: 2 },
  { name: 'Gulshan Block 14', fromShop: 15, fromWarehouse: 3 },
  { name: 'Johar More', fromShop: 16, fromWarehouse: 3 },
  { name: 'Johar Chowrangi', fromShop: 16, fromWarehouse: 3 },
  { name: 'Gulistan-e-Jauhar', fromShop: 17, fromWarehouse: 4 },
  { name: 'University Road', fromShop: 13, fromWarehouse: 5 },
  { name: 'Karachi University', fromShop: 14, fromWarehouse: 6 },
  // --- North Karachi / Nazimabad ---
  { name: 'Liaquatabad', fromShop: 7, fromWarehouse: 10 },
  { name: 'Liaquatabad No.10', fromShop: 8, fromWarehouse: 9 },
  { name: 'New Town', fromShop: 7, fromWarehouse: 11 },
  { name: 'Paposh Nagar', fromShop: 9, fromWarehouse: 12 },
  { name: 'Teen Hatti', fromShop: 9, fromWarehouse: 12 },
  { name: 'Nazimabad', fromShop: 8, fromWarehouse: 11 },
  { name: 'North Nazimabad', fromShop: 10, fromWarehouse: 12 },
  { name: 'Federal B Area', fromShop: 12, fromWarehouse: 8 },
  { name: 'Buffer Zone', fromShop: 13, fromWarehouse: 9 },
  { name: 'Sohrab Goth', fromShop: 14, fromWarehouse: 10 },
  { name: 'Nagan Chowrangi', fromShop: 14, fromWarehouse: 11 },
  { name: 'North Karachi', fromShop: 17, fromWarehouse: 14 },
  { name: 'New Karachi', fromShop: 16, fromWarehouse: 15 },
  { name: 'Metroville', fromShop: 16, fromWarehouse: 18 },
  { name: 'Surjani Town', fromShop: 21, fromWarehouse: 18 },
  // --- SITE / West ---
  { name: 'SITE Area', fromShop: 9, fromWarehouse: 18 },
  { name: 'Orangi Town', fromShop: 13, fromWarehouse: 20 },
  { name: 'Baldia Town', fromShop: 11, fromWarehouse: 22 },
  { name: 'Mauripur', fromShop: 10, fromWarehouse: 22 },
  { name: 'Kemari', fromShop: 7, fromWarehouse: 20 },
  { name: 'Manghopir', fromShop: 18, fromWarehouse: 24 },
  // --- Clifton / DHA ---
  { name: 'Clifton', fromShop: 11, fromWarehouse: 18 },
  { name: 'Teen Talwar', fromShop: 10, fromWarehouse: 18 },
  { name: 'Boat Basin', fromShop: 11, fromWarehouse: 19 },
  { name: 'Zamzama', fromShop: 12, fromWarehouse: 19 },
  { name: 'DHA Phase 1', fromShop: 12, fromWarehouse: 19 },
  { name: 'DHA Phase 2', fromShop: 14, fromWarehouse: 20 },
  { name: 'DHA Phase 3', fromShop: 15, fromWarehouse: 21 },
  { name: 'DHA Phase 4', fromShop: 16, fromWarehouse: 22 },
  { name: 'DHA Phase 5', fromShop: 18, fromWarehouse: 23 },
  { name: 'DHA Phase 6', fromShop: 20, fromWarehouse: 24 },
  { name: 'DHA Phase 7', fromShop: 22, fromWarehouse: 26 },
  { name: 'DHA Phase 8', fromShop: 25, fromWarehouse: 28 },
  { name: 'DHA City (Phase 9)', fromShop: 42, fromWarehouse: 40 },
  { name: 'Faisal Cantonment', fromShop: 14, fromWarehouse: 9 },
  // --- East / Malir / Korangi ---
  { name: 'Scheme 33', fromShop: 20, fromWarehouse: 6 },
  { name: 'Safoora', fromShop: 21, fromWarehouse: 7 },
  { name: 'Shah Faisal Colony', fromShop: 17, fromWarehouse: 8 },
  { name: 'Model Colony', fromShop: 17, fromWarehouse: 8 },
  { name: 'Malir', fromShop: 22, fromWarehouse: 9 },
  { name: 'Malir Cantonment', fromShop: 19, fromWarehouse: 10 },
  { name: 'Korangi Causeway', fromShop: 19, fromWarehouse: 10 },
  { name: 'Korangi No. 1', fromShop: 18, fromWarehouse: 10 },
  { name: 'Korangi No. 1.5', fromShop: 19, fromWarehouse: 10 },
  { name: 'Korangi No. 2', fromShop: 19, fromWarehouse: 10 },
  { name: 'Korangi No. 2.5', fromShop: 20, fromWarehouse: 11 },
  { name: 'Korangi No. 3', fromShop: 20, fromWarehouse: 11 },
  { name: 'Korangi No. 3.5', fromShop: 21, fromWarehouse: 11 },
  { name: 'Korangi No. 4', fromShop: 21, fromWarehouse: 11 },
  { name: 'Korangi No. 4.5', fromShop: 22, fromWarehouse: 12 },
  { name: 'Korangi No. 5', fromShop: 22, fromWarehouse: 12 },
  { name: 'Korangi No. 5.5', fromShop: 23, fromWarehouse: 12 },
  { name: 'Korangi No. 6', fromShop: 23, fromWarehouse: 13 },
  { name: 'Korangi Creek', fromShop: 22, fromWarehouse: 13 },
  { name: 'Korangi Industrial Area', fromShop: 21, fromWarehouse: 11 },
  { name: 'Landhi', fromShop: 25, fromWarehouse: 12 },
  { name: 'Gulshan-e-Hadeed', fromShop: 25, fromWarehouse: 16 },
  { name: 'Bin Qasim', fromShop: 28, fromWarehouse: 15 },
  { name: 'Steel Town', fromShop: 29, fromWarehouse: 18 },
  { name: 'Port Qasim', fromShop: 30, fromWarehouse: 18 },
  // --- Landhi / Cattle Colony ---
  { name: 'Bhains Colony / Cattle Colony Landhi', fromShop: 26, fromWarehouse: 13 },
  { name: 'Babar Market Landhi', fromShop: 25, fromWarehouse: 12 },
  { name: 'Khurram Abad Landhi', fromShop: 27, fromWarehouse: 14 },
  { name: 'Saudabad', fromShop: 26, fromWarehouse: 13 },
  { name: 'Quaidabad', fromShop: 27, fromWarehouse: 15 },
  // --- Super Highway / Farm Areas ---
  { name: 'Superhighway (Near)', fromShop: 25, fromWarehouse: 20 },
  { name: 'Jameel Memon Society S/W', fromShop: 30, fromWarehouse: 24 },
  { name: 'Nagori Society', fromShop: 32, fromWarehouse: 26 },
  { name: 'Dumba Goth', fromShop: 33, fromWarehouse: 27 },
  { name: 'Ramzan Piri Highway', fromShop: 35, fromWarehouse: 28 },
  { name: 'Superhighway Far', fromShop: 38, fromWarehouse: 32 },
  // --- Gadap / Farms ---
  { name: 'Gadap Farms Area', fromShop: 35, fromWarehouse: 28 },
  { name: 'Gadap Abdullah Hotel', fromShop: 38, fromWarehouse: 30 },
  { name: 'Gadap Jumani Goth', fromShop: 36, fromWarehouse: 29 },
  { name: 'Gadap Town', fromShop: 37, fromWarehouse: 30 },
  { name: 'Taiser Town / M9', fromShop: 32, fromWarehouse: 26 },
  // --- Far Areas ---
  { name: 'Bahria Town', fromShop: 40, fromWarehouse: 40 },
  { name: 'Hub', fromShop: 48, fromWarehouse: 50 },
  { name: 'Thatta / Gharo', fromShop: 90, fromWarehouse: 88 },
];

const DISPATCH_ORIGINS = {
  shop: { id: 'shop', label: 'Khyber Traders Shop', address: 'Katchi Gali, 2 Marriott Rd, near Denso Hall' },
  warehouse: { id: 'warehouse', label: 'Al Hilal Warehouse', address: 'Near Al Hilal Society, Gulshan' },
  custom: { id: 'custom', label: 'Custom Location', address: '' },
};

const DEFAULT_RIDERS = [
  { id: 'tahir_admin', name: 'Tahir', pin: '7869', type: 'admin', roles: ['admin'], phone: '', active: true },
  { id: 'meraj_001', name: 'Meraj Ali', pin: '1234', type: 'bike', roles: ['rider', 'bykea_manager'], phone: '', active: true },
  { id: 'muzzammil_001', name: 'Muzzammil Sheikh', pin: '1234', type: 'bike', roles: ['rider'], phone: '', active: true },
];

const RIDER_TYPE_META = {
  bike:    { label: 'Private Bike',    color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  rickshaw:{ label: 'Private Rickshaw',color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
  bykea:   { label: 'Bykea / App',     color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',    dot: 'bg-blue-500'    },
};

const DISPATCH_STATUSES = ['sent', 'delivered', 'returned', 'partial'];
const ENTRY_STATUSES    = ['pending', 'finalized', 'rejected'];
const DEFAULT_DISPATCH_SETTINGS = { bikeRate: 55, rickshawRate: 55 };

// --- HELPERS ---
const loadHtml2Canvas = () => new Promise((resolve, reject) => {
  if (window.html2canvas) return resolve(window.html2canvas);
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  s.onload = () => resolve(window.html2canvas);
  s.onerror = reject;
  document.head.appendChild(s);
});

// Timezone safe date string (YYYY-MM-DD)
const getLocalDateStr = (d = new Date()) => {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
};

// Formats YYYY-MM-DD to DD-MMM-YYYY
const fmtDate = (d) => {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day}-${months[parseInt(m, 10) - 1]}-${y}`;
};

const getWeekRange = () => {
  const t = new Date();
  const d = t.getDay() || 7;
  const s = new Date(t); s.setDate(t.getDate() - d + 1);
  const e = new Date(s); e.setDate(s.getDate() + 6);
  return { start: getLocalDateStr(s), end: getLocalDateStr(e) };
};

const getDatePresets = () => {
  const today = new Date();
  const tStr = getLocalDateStr(today);

  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  const yStr = getLocalDateStr(y);

  const week = getWeekRange();

  const mStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const mEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    'Today': { start: tStr, end: tStr },
    'Yesterday': { start: yStr, end: yStr },
    'This Week': week,
    'This Month': { start: getLocalDateStr(mStart), end: getLocalDateStr(mEnd) },
    'All Time': { start: '2024-01-01', end: tStr }
  };
};

// Resolves category info from live list, or falls back to snapshot stored in the log itself.
// This ensures past records survive even if a category is deleted or renamed.
const resolveCat = (log, categories) => {
  const live = categories.find(c => c.id === log.categoryId);
  if (live) return live;
  if (log.categoryName) return { id: log.categoryId, name: log.categoryName, group: log.categoryGroup || 'Labour', order: 9999, rate: 0 };
  return null;
};

// --- MAIN APPLICATION ---
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.slice(1);
    return ['home','entry','reports','rides','admin'].includes(hash) ? hash : 'home';
  });
  const goTab = (tab) => { setActiveTab(tab); window.history.replaceState(null, '', '#' + tab); };
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [prompt, setPrompt] = useState(null);

  // Synced Global Data
  const [categories, setCategories] = useState([]);
  const [logs, setLogs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [backups, setBackups] = useState([]);

  // Rides Module Data
  const [riders, setRiders] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [riderAdvances, setRiderAdvances] = useState([]);
  const [rickshawAreaRates, setRickshawAreaRates] = useState([]);
  const [dispatchSettings, setDispatchSettings] = useState(DEFAULT_DISPATCH_SETTINGS);
  const [ridesUser, setRidesUser] = useState(null); // { id, name, roles, type }

  // Admin Security
  const [adminPass, setAdminPass] = useState('1234');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

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
    
    const unsubAdmin = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'admin'), (d) => {
      if (d.exists() && d.data().password) {
        setAdminPass(d.data().password);
      }
    });

    const unsubBackups = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'backups'), (s) => {
      const data = s.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setBackups(data.sort((a, b) => b.timestamp - a.timestamp));
    });

    const unsubRiders = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'riders'), (s) => {
      const data = s.docs.map(d => ({ ...d.data(), id: d.id }));
      setRiders(data.length ? data : DEFAULT_RIDERS);
    });

    const unsubDispatches = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'dispatches'), (s) => {
      setDispatches(s.docs.map(d => ({ ...d.data(), id: d.id })));
    });

    const unsubDispSettings = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'dispatch'), (d) => {
      if (d.exists()) setDispatchSettings({ ...DEFAULT_DISPATCH_SETTINGS, ...d.data() });
    });

    const unsubAdvances = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'riderAdvances'), (s) => {
      setRiderAdvances(s.docs.map(d => ({ ...d.data(), id: d.id })));
    });

    const unsubRickRates = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'rickshawAreaRates'), (s) => {
      setRickshawAreaRates(s.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => (a.area || '').localeCompare(b.area || '')));
    });

    return () => { unsubCats(); unsubLogs(); unsubPays(); unsubAdmin(); unsubBackups(); unsubRiders(); unsubDispatches(); unsubDispSettings(); unsubAdvances(); unsubRickRates(); };
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
          date, categoryId: cid,
          categoryName: cat.name, categoryGroup: cat.group,
          qty: q, total: q * cat.rate
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
      <header className="bg-blue-700 text-white p-4 sticky top-0 z-40 shadow-md">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-black leading-tight tracking-tight uppercase">Mazdoori Calculator</h1>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Khyber Traders System</p>
            <a href="https://animalhealth.pk" target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-blue-200 hover:text-white uppercase tracking-widest mt-0.5 block transition-colors">animalhealth.pk</a>
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
        
        {activeTab === 'admin' && !isAdminUnlocked && (
           <AdminAuthView correctPass={adminPass} onUnlock={() => setIsAdminUnlocked(true)} showToast={showToast} />
        )}
        {activeTab === 'admin' && isAdminUnlocked && (
           <AdminView categories={categories} logs={logs} payments={payments} adminPass={adminPass} showToast={showToast} backups={backups} riders={riders} dispatches={dispatches} riderAdvances={riderAdvances} rickshawAreaRates={rickshawAreaRates} />
        )}
        {activeTab === 'rides' && (
          <RidesGate
            ridesUser={ridesUser} setRidesUser={setRidesUser}
            riders={riders} dispatches={dispatches} riderAdvances={riderAdvances}
            rickshawAreaRates={rickshawAreaRates}
            dispatchSettings={dispatchSettings}
            showToast={showToast}
          />
        )}
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t-2 border-slate-200 p-3 z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex justify-around">
          <NavItem icon={<HomeIcon size={22} />} label="Home" active={activeTab === 'home'} onClick={() => goTab('home')} />
          <NavItem icon={<PlusSquare size={22} />} label="Entry" active={activeTab === 'entry'} onClick={() => goTab('entry')} />
          <NavItem icon={<FileText size={22} />} label="Reports" active={activeTab === 'reports'} onClick={() => goTab('reports')} />
          <NavItem icon={<Truck size={22} />} label="Rides" active={activeTab === 'rides'} onClick={() => goTab('rides')} />
          <NavItem icon={<Settings size={22} />} label="Admin" active={activeTab === 'admin'} onClick={() => goTab('admin')} />
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
  const { totals, displayRange } = useMemo(() => {
    const range = getWeekRange();
    const dRange = `${fmtDate(range.start)} to ${fmtDate(range.end)}`;
    const weekLogs = logs.filter(l => l.date >= range.start && l.date <= range.end);
    
    let labTrans = 0;
    let suzuki = 0;

    weekLogs.forEach(l => {
      const c = resolveCat(l, categories);
      if (!c) return;
      if (c.group === 'Labour' || c.group === 'Transport') {
        labTrans += l.total;
      } else if (c.group === 'Suzuki') {
        suzuki += l.total;
      }
    });

    return { 
      totals: { labTrans, suzuki, grand: labTrans + suzuki },
      displayRange: dRange 
    };
  }, [logs, categories]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="bg-white border-2 border-blue-100 p-6 rounded-[2.5rem] shadow-sm text-center">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">This Week’s Mazdoori Expense</h2>
        <div className="text-[11px] font-black text-blue-500 mb-4">{displayRange}</div>
        
        <div className="text-5xl font-black text-blue-700 break-words">Rs.{totals.grand.toLocaleString()}</div>
        
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
  const [date, setDate] = useState(getLocalDateStr());
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
  const presets = getDatePresets();

  const filteredLogs = logs.filter(l => l.date >= range.start && l.date <= range.end);
  const filteredPays = payments.filter(p => p.date >= range.start && p.date <= range.end);
  const displayString = `${fmtDate(range.start)} to ${fmtDate(range.end)}`;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-white p-1.5 rounded-2xl border-2 border-slate-200 shadow-sm flex overflow-x-auto hide-scrollbar">
        {['summary', 'ledger', 'payments', 'export'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 px-4 text-[10px] font-black rounded-xl uppercase whitespace-nowrap transition-all ${tab === t ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>{t}</button>
        ))}
      </div>
      
      <div className="bg-white p-3 rounded-2xl border-2 border-slate-100 space-y-3 shadow-sm">
        {/* QUICK DATE FILTERS */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {Object.entries(presets).map(([label, val]) => (
            <button 
              key={label}
              onClick={() => setRange(val)}
              className={`shrink-0 px-3 py-2 text-[9px] font-black uppercase rounded-lg border-2 transition-all flex items-center gap-1 ${
                range.start === val.start && range.end === val.end 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              <CalendarDays size={12}/> {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
              <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Start</label>
              <input type="date" value={range.start} onChange={e => setRange({...range, start: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-xs outline-none focus:border-blue-500" />
          </div>
          <div className="flex-1">
              <label className="text-[8px] font-black text-slate-400 uppercase ml-1">End</label>
              <input type="date" value={range.end} onChange={e => setRange({...range, end: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-xs outline-none focus:border-blue-500" />
          </div>
        </div>
      </div>

      {tab === 'summary' && <SummaryCards filteredLogs={filteredLogs} categories={categories} />}
      {tab === 'ledger' && <LedgerSection filteredLogs={filteredLogs} categories={categories} showToast={showToast} range={range} />}
      {tab === 'payments' && <PaymentsSection filteredPays={filteredPays} showToast={showToast} />}
      {tab === 'export' && <ExportSection filteredLogs={filteredLogs} categories={categories} range={range} displayString={displayString} showToast={showToast} />}
    </div>
  );
}

function SummaryCards({ filteredLogs, categories }) {
  const totals = useMemo(() => {
    let labTrans = 0, suz = 0;
    filteredLogs.forEach(l => {
      const c = resolveCat(l, categories);
      if (!c) return;
      if (c.group === 'Suzuki') suz += l.total;
      else labTrans += l.total; // Combines Labour + Transport
    });
    return { labTrans, suz, grand: labTrans + suz };
  }, [filteredLogs, categories]);

  return (
    <div className="space-y-3 pb-10">
      <div className="bg-blue-50 border-2 border-blue-200 p-5 rounded-3xl flex justify-between items-center shadow-sm">
        <span className="text-xs font-black text-blue-800 uppercase tracking-widest">Subtotal (Lab + Tpt)</span>
        <span className="text-2xl font-black text-blue-700">Rs.{totals.labTrans.toLocaleString()}</span>
      </div>
      <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-3xl flex justify-between items-center shadow-sm">
        <span className="text-xs font-black text-amber-800 uppercase tracking-widest">Suzuki Freight</span>
        <span className="text-2xl font-black text-amber-600">Rs.{totals.suz.toLocaleString()}</span>
      </div>
      <div className="bg-blue-700 p-6 rounded-[2.5rem] flex justify-between items-center shadow-xl">
        <span className="text-sm font-black text-white uppercase tracking-widest">Grand Total</span>
        <span className="text-4xl font-black text-white">Rs.{totals.grand.toLocaleString()}</span>
      </div>
    </div>
  );
}

function LedgerSection({ filteredLogs, categories, showToast, range }) {
  // Chronological sorting (oldest to newest)
  const dates = [...new Set(filteredLogs.map(l => l.date))].sort((a, b) => a.localeCompare(b));
  // Build active list: live categories + ghost entries for deleted/changed ones
  const activeCatIds = [...new Set(filteredLogs.map(l => l.categoryId))];
  const active = activeCatIds.map(cid => {
    const live = categories.find(c => c.id === cid);
    if (live) return live;
    const snap = filteredLogs.find(l => l.categoryId === cid && l.categoryName);
    return snap
      ? { id: cid, name: snap.categoryName, group: snap.categoryGroup || 'Labour', order: 9999, rate: 0 }
      : { id: cid, name: `[${cid}]`, group: 'Labour', order: 9999, rate: 0 };
  }).sort((a, b) => {
    const GROUP_ORDER = { Labour: 0, Transport: 1, Suzuki: 2 };
    const ga = GROUP_ORDER[a.group] ?? 3;
    const gb = GROUP_ORDER[b.group] ?? 3;
    if (ga !== gb) return ga - gb;
    return (a.order ?? 9999) - (b.order ?? 9999);
  });

  // Deletion logic
  const deleteDay = async (date) => {
    if (!window.confirm(`Delete ALL records for ${fmtDate(date)}?`)) return;
    const batch = writeBatch(db);
    const dayLogs = filteredLogs.filter(l => l.date === date);
    dayLogs.forEach(l => {
      batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'logs', l.id));
    });
    await batch.commit();
    showToast(`Cleared ${fmtDate(date)}`);
  };

  const deletePeriod = async () => {
    if (filteredLogs.length === 0) {
       showToast("No records to delete", "error");
       return;
    }
    if (!window.confirm(`WARNING: Delete ALL records from ${fmtDate(range.start)} to ${fmtDate(range.end)}?\n\nThis cannot be undone! Proceed?`)) return;
    
    // Chunking to respect Firestore 500 limit per batch
    const chunks = [];
    for (let i=0; i<filteredLogs.length; i+=400) {
       chunks.push(filteredLogs.slice(i, i+400));
    }
    
    for (const chunk of chunks) {
       const batch = writeBatch(db);
       chunk.forEach(l => {
         batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'logs', l.id));
       });
       await batch.commit();
    }
    
    showToast("Period records deleted");
  };

  // Compute Period Totals for Footer
  let periodLabTrans = 0;
  let periodSuzuki = 0;
  let periodGrand = 0;
  const colSums = {};
  active.forEach(c => colSums[c.id] = 0);

  const rowsData = dates.map(d => {
    const dayLogs = filteredLogs.filter(l => l.date === d);
    let dayLabTrans = 0, daySuzuki = 0;
    
    active.forEach(c => {
        const qty = dayLogs.find(l => l.categoryId === c.id)?.qty || 0;
        colSums[c.id] += qty;
    });

    dayLogs.forEach(l => {
        const grp = resolveCat(l, categories)?.group;
        if (grp === 'Suzuki') daySuzuki += l.total;
        else dayLabTrans += l.total;
    });
    
    const dayTotal = dayLabTrans + daySuzuki;
    
    periodLabTrans += dayLabTrans;
    periodSuzuki += daySuzuki;
    periodGrand += dayTotal;

    return { d, dayLabTrans, daySuzuki, dayTotal };
  });

  const exportCSV = () => {
    if (dates.length === 0) return;
    
    const headers = [
      'Date', 
      ...active.map(c => `"${c.name} (Qty)"`), 
      '"Labour (Rs)"', 
      '"Transport (Rs)"', 
      '"Subtotal: Labour+Transport (Rs)"', 
      '"Suzuki Freight (Rs)"', 
      '"Daily Grand Total (Rs)"'
    ];
    
    let sumLab = 0, sumTpt = 0, sumSuz = 0, sumGrand = 0;
    
    const rows = dates.map(d => {
      const dayLogs = filteredLogs.filter(l => l.date === d);
      let dayLab = 0, dayTpt = 0, daySuz = 0;
      
      const row = [fmtDate(d)];
      
      active.forEach(c => {
        const qty = dayLogs.find(l => l.categoryId === c.id)?.qty || 0;
        row.push(qty);
      });
      
      dayLogs.forEach(l => {
        const grp = resolveCat(l, categories)?.group;
        if (grp === 'Labour') dayLab += l.total;
        else if (grp === 'Transport') dayTpt += l.total;
        else if (grp === 'Suzuki') daySuz += l.total;
      });
      
      const daySubtotal = dayLab + dayTpt;
      const dayTotal = daySubtotal + daySuz;
      
      sumLab += dayLab;
      sumTpt += dayTpt;
      sumSuz += daySuz;
      sumGrand += dayTotal;
      
      row.push(dayLab, dayTpt, daySubtotal, daySuz, dayTotal);
      return row.join(',');
    });
    
    const summaryRow = ['"PERIOD TOTAL"'];
    active.forEach(c => summaryRow.push(colSums[c.id])); 
    summaryRow.push(sumLab, sumTpt, sumLab + sumTpt, sumSuz, sumGrand);
    rows.push(summaryRow.join(','));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Khyber_Detailed_Ledger_${getLocalDateStr()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-3 pb-10">
      <div className="flex justify-between items-center">
        <button onClick={deletePeriod} className="bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors shadow-sm">
          <Trash2 size={14}/> Delete Period
        </button>
        <button onClick={exportCSV} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-2 border-emerald-200 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors shadow-sm">
          <FileDown size={16}/> Download Detailed CSV
        </button>
      </div>
      <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-left text-[11px] whitespace-nowrap">
          <thead className="bg-slate-100 text-slate-600 font-black uppercase">
            <tr>
              <th className="p-4 border-r-2 border-white">Date</th>
              {active.map(c => <th key={c.id} className="p-4 text-center border-r-2 border-white">{c.name}</th>)}
              <th className="p-4 text-right border-r-2 border-white bg-blue-100/50">L+T Subtotal</th>
              <th className="p-4 text-right border-r-2 border-white bg-amber-100/50">Suzuki</th>
              <th className="p-4 text-right">Grand Total</th>
              <th className="p-4 text-center border-l-2 border-white text-red-400">Act</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-50">
            {rowsData.map(row => (
              <tr key={row.d} className="hover:bg-blue-50 group">
                <td className="p-4 font-black text-slate-900 border-r-2 border-slate-50">{fmtDate(row.d)}</td>
                {active.map(c => <td key={c.id} className="p-4 text-center text-slate-500 border-r-2 border-slate-50">{filteredLogs.find(l => l.date === row.d && l.categoryId === c.id)?.qty || '-'}</td>)}
                <td className="p-4 text-right font-black text-indigo-700 bg-slate-50 border-r-2 border-white">Rs.{row.dayLabTrans.toLocaleString()}</td>
                <td className="p-4 text-right font-black text-amber-600 bg-slate-50 border-r-2 border-white">Rs.{row.daySuzuki.toLocaleString()}</td>
                <td className="p-4 text-right font-black text-blue-700 bg-blue-50/50">Rs.{row.dayTotal.toLocaleString()}</td>
                <td className="p-4 text-center border-l-2 border-white bg-slate-50">
                   <button onClick={() => deleteDay(row.d)} className="text-red-300 hover:text-red-600 transition-colors p-1">
                      <Trash2 size={16}/>
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
          {dates.length > 0 && (
            <tfoot className="bg-blue-700 font-black text-white uppercase text-[10px] tracking-widest">
              <tr>
                <td className="p-4 border-r-2 border-blue-600">Period Total</td>
                {active.map(c => <td key={c.id} className="p-4 text-center border-r-2 border-blue-600">{colSums[c.id]}</td>)}
                <td className="p-4 text-right border-r-2 border-blue-600">Rs.{periodLabTrans.toLocaleString()}</td>
                <td className="p-4 text-right border-r-2 border-blue-600">Rs.{periodSuzuki.toLocaleString()}</td>
                <td className="p-4 text-right">Rs.{periodGrand.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
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
      name: n, amount: Number(a), date: getLocalDateStr()
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
  
  const activeCatIds = [...new Set(filteredLogs.map(l => l.categoryId))];
  const items = activeCatIds.map(cid => {
    const c = resolveCat(filteredLogs.find(l => l.categoryId === cid), categories);
    if (!c) return null;
    const l = filteredLogs.filter(x => x.categoryId === cid);
    return { ...c, qty: l.reduce((s, x) => s + x.qty, 0), total: l.reduce((s, x) => s + x.total, 0) };
  }).filter(Boolean).sort((a, b) => (a.order || 9999) - (b.order || 9999));

  const labTransTotal = items.filter(i => i.group !== 'Suzuki').reduce((s, x) => s + x.total, 0);
  const suzukiTotal = items.filter(i => i.group === 'Suzuki').reduce((s, x) => s + x.total, 0);
  const grand = labTransTotal + suzukiTotal;

  const download = async () => {
    if (!items.length) { showToast("No data for this date range", "error"); return; }
    setWorking(true);
    showToast("Baking 4:5 Image...");
    const h2c = await loadHtml2Canvas();
    const node = document.getElementById('hd-export-node');
    node.style.display = 'flex';
    // Fixed layout for exact 1080x1350 capturing
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
    text += `\n*Subtotal (Labour+Transport): Rs.${labTransTotal.toLocaleString()}*`;
    text += `\n*Suzuki Freight: Rs.${suzukiTotal.toLocaleString()}*`;
    text += `\n\n✅ *GRAND TOTAL: Rs.${grand.toLocaleString()}*`;
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
      
      {/* PERFECTED HD EXPORT FRAME (Fixed Size, Compacted to prevent Cut-off) */}
      <div id="hd-export-node" className="bg-white text-slate-900 p-10 flex-col justify-between fixed top-0 left-[-9999px]" style={{ display: 'none', width: '1080px', height: '1350px', boxSizing: 'border-box', fontFamily: 'sans-serif' }}>
        
        {/* HEADER */}
        <div className="flex justify-between items-start border-b-[8px] border-blue-700 pb-6 shrink-0">
            <div>
                <h1 className="text-6xl font-black text-blue-700 uppercase tracking-tighter leading-none">KHYBER TRADERS</h1>
                <p className="text-2xl font-bold text-slate-400 uppercase mt-3 tracking-[0.3em]">Mazdoori Report Summary</p>
            </div>
            <div className="text-right">
                <div className="text-xl font-black text-slate-300 uppercase tracking-widest">Date Range</div>
                <div className="text-2xl font-black text-blue-700 mt-1">{displayString}</div>
            </div>
        </div>

        {/* TABLE WRAPPER - More compact rows */}
        <div className="flex-1 my-6 bg-slate-50 rounded-[2.5rem] p-8 border-4 border-slate-100 overflow-hidden flex flex-col justify-start">
          <table className="w-full text-[22px]">
            <thead className="text-slate-400 border-b-4 border-slate-200 uppercase tracking-[0.1em] font-black">
                <tr><th className="pb-4 text-left">Item Name</th><th className="pb-4 text-center">Qty</th><th className="pb-4 text-right">Total Rs.</th></tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {items.map(a => (
                <tr key={a.id}>
                    <td className="py-2.5 font-black text-slate-800 uppercase leading-tight">{a.name}</td>
                    <td className="py-2.5 text-center font-bold text-slate-400">{a.qty}</td>
                    <td className="py-2.5 text-right font-black text-blue-700">Rs.{a.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER - Grouped tightly */}
        <div className="shrink-0 space-y-5">
            {/* Subtotal & Suzuki Breakdowns */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-100 p-6 rounded-[1.5rem] flex justify-between items-center">
                    <span className="text-xl font-black text-slate-500 uppercase tracking-widest">Subtotal (Lab+Tpt)</span>
                    <span className="text-3xl font-black text-indigo-700">Rs.{labTransTotal.toLocaleString()}</span>
                </div>
                <div className="bg-slate-100 p-6 rounded-[1.5rem] flex justify-between items-center">
                    <span className="text-xl font-black text-slate-500 uppercase tracking-widest">Suzuki Freight</span>
                    <span className="text-3xl font-black text-amber-600">Rs.{suzukiTotal.toLocaleString()}</span>
                </div>
            </div>

            {/* Grand Total */}
            <div className="bg-blue-700 p-8 rounded-[2rem] flex justify-between items-center shadow-2xl">
              <div className="text-[2.5rem] font-black uppercase text-white tracking-widest">Grand Total</div>
              <div className="text-[6rem] font-black text-white leading-none">Rs.{grand.toLocaleString()}</div>
            </div>

            <div className="flex justify-between items-center px-4 pt-1">
                <div className="text-lg font-black text-slate-300 uppercase tracking-[0.4em]">Mazdoori Calculator App</div>
                <div className="text-lg font-black text-blue-400 uppercase tracking-widest">Dev: Muhammad Tahir Qadri</div>
            </div>
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
function AdminView({ categories, showToast, logs, payments, adminPass, backups, riders, dispatches, riderAdvances, rickshawAreaRates }) {
  const [n, setN] = useState('');
  const [g, setG] = useState('Labour');
  const [r, setR] = useState('');
  const [orphanMap, setOrphanMap] = useState({});

  // Logs with unknown categoryId AND no categoryName snapshot
  const orphanedIds = useMemo(() => {
    const ids = new Set();
    logs.forEach(l => {
      if (!categories.find(c => c.id === l.categoryId) && !l.categoryName) ids.add(l.categoryId);
    });
    return [...ids];
  }, [logs, categories]);
  
  // Password Change State
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const add = async () => {
    if(!n || !r) return;
    const id = Date.now().toString();
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', id), { name: n, group: g, rate: Number(r), order: categories.length });
    setN(''); setR('');
    showToast("Added to Shared List");
  };

  const moveWithinGroup = async (grpCats, index, dir) => {
    const a = grpCats[index];
    const b = grpCats[index + dir];
    const batch = writeBatch(db);
    batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'categories', a.id), { order: b.order ?? 9999 });
    batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'categories', b.id), { order: a.order ?? 9999 });
    await batch.commit();
  };

  const edit = async (id, field, val) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', id), { [field]: field === 'rate' ? Number(val) : val });
  };

  const updatePassword = async () => {
    if (oldPass !== adminPass) {
        showToast("Old Password Incorrect", "error");
        return;
    }
    if (!newPass) {
        showToast("Enter a new password", "error");
        return;
    }
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'admin'), { password: newPass });
    setOldPass('');
    setNewPass('');
    showToast("Admin Password Updated Globally");
  };

  const exportJSON = () => {
    const data = JSON.stringify({ categories, logs, payments });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Khyber_Backup_${getLocalDateStr()}.json`;
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

  const restoreDefaults = async () => {
    if (!window.confirm("This restores the original 15 default categories (IDs 1–15). Any NEW categories you added (e.g. F.C 1ST FLOOR) will be KEPT. Historical data will reconnect. Continue?")) return;
    const batch = writeBatch(db);
    // Only overwrite the 15 default IDs — leave all other categories (e.g. custom ones) untouched
    DEFAULT_CATEGORIES.forEach(c => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'categories', c.id), c));
    await batch.commit();
    showToast("Default Categories Restored — Historical Data Reconnected!");
  };

  const fixOrphanedLogs = async () => {
    const mappings = Object.entries(orphanMap).filter(([_, newId]) => newId);
    if (mappings.length === 0) { showToast("Select a category for each row", "error"); return; }
    if (!window.confirm(`Remap ${mappings.length} unknown ID(s)? All affected log entries will be updated.`)) return;

    const batch = writeBatch(db);
    let count = 0;
    for (const [oldId, newId] of mappings) {
      const targetCat = categories.find(c => c.id === newId);
      if (!targetCat) continue;
      logs.filter(l => l.categoryId === oldId && !l.categoryName).forEach(l => {
        batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'logs', l.id));
        batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'logs', `${l.date}_${newId}`), {
          date: l.date, categoryId: newId,
          categoryName: targetCat.name, categoryGroup: targetCat.group,
          qty: l.qty, total: l.qty * targetCat.rate
        });
        count++;
      });
    }
    await batch.commit();
    setOrphanMap({});
    showToast(`Fixed ${count} log entries!`);
  };

  const createBackup = async () => {
    const ts = Date.now();
    const backupId = `backup_${ts}`;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'backups', backupId), {
      createdAt: getLocalDateStr(),
      timestamp: ts,
      label: `Backup ${fmtDate(getLocalDateStr())}`,
      categories,
      logs,
      payments,
      riders: riders || [],
      dispatches: dispatches || [],
      riderAdvances: riderAdvances || [],
      rickshawAreaRates: rickshawAreaRates || [],
    });
    showToast("Cloud Backup Created!");
  };

  const restoreFromBackup = async (backup) => {
    if (!window.confirm(`Restore from backup dated ${fmtDate(backup.createdAt)}?\n\nThis will overwrite categories, logs, payments, riders, dispatches, advances, and rickshaw rates with the backup data.`)) return;
    const batch = writeBatch(db);
    if (backup.categories) backup.categories.forEach(c => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'categories', c.id), c));
    if (backup.logs) backup.logs.forEach(l => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'logs', l.id), l));
    if (backup.payments) backup.payments.forEach(p => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'payments', p.id), p));
    if (backup.riders) backup.riders.forEach(r => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'riders', r.id), r));
    if (backup.dispatches) backup.dispatches.forEach(d => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'dispatches', d.id), d));
    if (backup.riderAdvances) backup.riderAdvances.forEach(a => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'riderAdvances', a.id), a));
    if (backup.rickshawAreaRates) backup.rickshawAreaRates.forEach(r => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'rickshawAreaRates', r.id), r));
    await batch.commit();
    showToast("Backup Restored!");
  };

  const deleteBackup = async (backupId) => {
    if (!window.confirm("Delete this backup permanently?")) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'backups', backupId));
    showToast("Backup Deleted");
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      
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

      {/* RESTORE DEFAULT CATEGORIES */}
      <div className="bg-amber-50 p-5 rounded-3xl border-2 border-amber-200 space-y-3 shadow-sm">
        <h3 className="font-black text-amber-700 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2"><RefreshCw size={14}/> Recover Historical Data</h3>
        <p className="text-[10px] text-amber-600 font-bold leading-relaxed">If old data is missing, tap below to restore original category IDs (1–15). All previous logs will reconnect instantly.</p>
        <button onClick={restoreDefaults} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs">Restore Default Categories</button>
      </div>

      {/* FIX ORPHANED LOGS */}
      {orphanedIds.length > 0 && (
        <div className="bg-red-50 p-5 rounded-3xl border-2 border-red-200 space-y-3 shadow-sm">
          <h3 className="font-black text-red-700 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2"><Info size={14}/> Fix Orphaned Logs ({orphanedIds.length} unknown {orphanedIds.length === 1 ? 'ID' : 'IDs'})</h3>
          <p className="text-[10px] text-red-600 font-bold leading-relaxed">These entries have old timestamp IDs with no category name. Assign each to the correct category — logs will be remapped and names will be saved.</p>
          <div className="space-y-2">
            {orphanedIds.map(oldId => {
              const cnt = logs.filter(l => l.categoryId === oldId && !l.categoryName).length;
              return (
                <div key={oldId} className="bg-white p-3 rounded-xl border border-red-100 space-y-1">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unknown ID · {cnt} {cnt === 1 ? 'entry' : 'entries'}</div>
                  <select
                    value={orphanMap[oldId] || ''}
                    onChange={e => setOrphanMap(prev => ({ ...prev, [oldId]: e.target.value }))}
                    className="w-full bg-slate-50 border-2 border-slate-100 p-2 rounded-lg text-blue-700 font-black text-xs outline-none"
                  >
                    <option value="">— Select Correct Category —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.group})</option>)}
                  </select>
                </div>
              );
            })}
          </div>
          <button onClick={fixOrphanedLogs} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs">Fix Orphaned Logs</button>
        </div>
      )}

      {/* CLOUD BACKUP MANAGER */}
      <div className="bg-white p-5 rounded-3xl border-2 border-emerald-100 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b-2 border-slate-50 pb-2">
          <h3 className="font-black text-emerald-700 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2"><UploadCloud size={14}/> Cloud Backups (Firestore)</h3>
          <button onClick={createBackup} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black px-3 py-2 rounded-xl uppercase tracking-widest transition-all active:scale-95">+ Backup Now</button>
        </div>
        {backups.length === 0 ? (
          <p className="text-[10px] text-slate-400 font-bold text-center py-2">No cloud backups yet. Tap "Backup Now" to create one.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {backups.map(b => (
              <div key={b.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <div className="text-[10px] font-black text-slate-800 uppercase">{fmtDate(b.createdAt)}</div>
                  <div className="text-[9px] text-slate-400 font-bold">{b.categories?.length || 0} cats · {b.logs?.length || 0} logs · {b.payments?.length || 0} pays</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => restoreFromBackup(b)} className="bg-blue-100 text-blue-700 text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-blue-200 transition-colors">Restore</button>
                  <button onClick={() => deleteBackup(b.id)} className="text-red-300 hover:text-red-600 transition-colors p-1"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LOCAL JSON BACKUP */}
      <div className="grid grid-cols-2 gap-3">
         <button onClick={exportJSON} className="bg-white py-4 rounded-2xl border-2 border-emerald-100 text-[10px] font-black text-emerald-700 flex justify-center items-center gap-2 uppercase tracking-widest shadow-sm"><DownloadCloud size={18}/> Export JSON</button>
         <label className="bg-white py-4 rounded-2xl border-2 border-blue-100 text-[10px] font-black text-blue-700 flex justify-center items-center gap-2 uppercase tracking-widest shadow-sm cursor-pointer"><UploadCloud size={18}/> Import JSON<input type="file" onChange={importJSON} className="hidden" /></label>
      </div>

      {/* LIST OF ITEMS GROUPED BY TYPE WITH MOVE/DELETE/EDIT */}
      <div className="space-y-4">
        <h3 className="font-black text-slate-400 uppercase text-[10px] px-2 tracking-[0.2em]">Manage Cloud Items</h3>
        {['Labour', 'Transport', 'Suzuki'].map(grpName => {
          const grpCats = categories.filter(c => c.group === grpName).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
          if (grpCats.length === 0) return null;
          const grpColors = { Labour: 'bg-blue-600', Transport: 'bg-indigo-600', Suzuki: 'bg-amber-500' };
          return (
            <div key={grpName} className="space-y-2">
              <div className={`text-[9px] font-black text-white ${grpColors[grpName]} px-3 py-1.5 rounded-lg uppercase tracking-widest inline-block`}>{grpName}</div>
              {grpCats.map((c, i) => (
                <div key={c.id} className="bg-white p-4 rounded-2xl border-2 border-slate-50 flex items-center gap-4 shadow-sm hover:border-blue-100 transition-colors">
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => moveWithinGroup(grpCats, i, -1)} disabled={i === 0} className="text-slate-300 hover:text-blue-600 disabled:opacity-10 transition-colors"><ArrowUp size={18}/></button>
                    <button onClick={() => moveWithinGroup(grpCats, i, 1)} disabled={i === grpCats.length - 1} className="text-slate-300 hover:text-blue-600 disabled:opacity-10 transition-colors"><ArrowDown size={18}/></button>
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
          );
        })}
      </div>

      {/* SECURITY PASSWORD CONTROLS - FIXED AT BOTTOM */}
      <div className="bg-white p-6 rounded-3xl border-2 border-rose-100 space-y-4 shadow-sm mt-8">
        <h3 className="font-black text-rose-500 uppercase text-[10px] tracking-[0.2em] border-b-2 border-rose-50 pb-2 flex items-center gap-2"><Lock size={14}/> Change Admin Password</h3>
        <input type="password" placeholder="Old Password" value={oldPass} onChange={e=>setOldPass(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl text-slate-900 font-bold outline-none focus:border-rose-500" />
        <div className="flex gap-2">
          <input type="password" placeholder="New Password" value={newPass} onChange={e=>setNewPass(e.target.value)} className="flex-1 bg-slate-50 border-2 border-slate-100 p-3 rounded-xl text-slate-900 font-bold outline-none focus:border-rose-500" />
          <button onClick={updatePassword} className="bg-rose-500 hover:bg-rose-600 px-6 rounded-xl text-white font-black uppercase text-xs tracking-widest transition-colors">Save</button>
        </div>
      </div>

    </div>
  );
}

// ==========================================
// RIDES & DISPATCH MODULE
// ==========================================

// Gate: shows PIN login or authenticated rides view
function RidesGate({ ridesUser, setRidesUser, riders, dispatches, riderAdvances, rickshawAreaRates, dispatchSettings, showToast }) {
  if (!ridesUser) {
    return <RidesPinLogin riders={riders} onLogin={setRidesUser} showToast={showToast} />;
  }
  const isAdmin = ridesUser.roles.includes('admin');
  const isRickshawUser = ridesUser.type === 'rickshaw';
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className={`flex justify-between items-center ${isRickshawUser ? 'flex-row-reverse' : ''}`}>
        <div className={isRickshawUser ? 'text-right' : ''}>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isRickshawUser ? 'لاگ ان' : 'Logged in as'}</span>
          <div className="font-black text-blue-700 uppercase text-sm">{ridesUser.name}</div>
        </div>
        <button onClick={() => setRidesUser(null)} className="flex items-center gap-1 text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest">
          <LogOut size={12} /> {isRickshawUser ? 'خارج' : 'Logout'}
        </button>
      </div>
      {isAdmin
        ? <AdminRidesView dispatches={dispatches} riders={riders} riderAdvances={riderAdvances} rickshawAreaRates={rickshawAreaRates} dispatchSettings={dispatchSettings} showToast={showToast} ridesUser={ridesUser} />
        : <RiderView dispatches={dispatches} riders={riders} riderAdvances={riderAdvances} rickshawAreaRates={rickshawAreaRates} dispatchSettings={dispatchSettings} showToast={showToast} ridesUser={ridesUser} />
      }
    </div>
  );
}

// PIN Login screen
function RidesPinLogin({ riders, onLogin, showToast }) {
  const [selected, setSelected] = useState(null);
  const [pin, setPin] = useState('');

  const check = () => {
    if (!selected) return;
    if (pin === selected.pin) {
      onLogin(selected);
      showToast(`Welcome, ${selected.name}`);
    } else {
      showToast('Wrong PIN', 'error');
      setPin('');
    }
  };

  if (!selected) {
    return (
      <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300 mt-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Truck size={32} className="text-blue-700" />
          </div>
          <h2 className="font-black text-xl text-slate-900 uppercase">Rides & Dispatch</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select your name to continue</p>
        </div>
        <div className="space-y-2">
          {riders.filter(r => r.active !== false).map(r => (
            <button key={r.id} onClick={() => setSelected(r)}
              className="w-full bg-white border-2 border-slate-100 hover:border-blue-400 p-4 rounded-2xl flex items-center gap-4 shadow-sm transition-all active:scale-95">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-black text-slate-900 uppercase">{r.name}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {r.roles?.includes('admin') ? 'Admin' : r.type === 'rickshaw' ? 'Rickshaw Rider' : r.roles?.includes('bykea_manager') ? 'Rider + Bykea Manager' : 'Bike Rider'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-300 bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm text-center space-y-6 mt-4">
      <button onClick={() => { setSelected(null); setPin(''); }} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">← Back</button>
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
        <Lock size={28} className="text-blue-700" />
      </div>
      <div>
        <h2 className="text-lg font-black text-slate-900 uppercase">{selected.name}</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enter PIN</p>
      </div>
      <input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={e => setPin(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && check()}
        placeholder="••••"
        className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl text-center font-black text-3xl tracking-[0.5em] outline-none focus:border-blue-600 text-blue-700" />
      <button onClick={check} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest">
        Unlock
      </button>
    </div>
  );
}

function buildRiderReport({ riderName, tripList, advEntries, totalFare, fareRcvd, totalAdv, netPayable }) {
  const today = getLocalDateStr();
  const sep = '─────────────────────────';
  const sorted = [...tripList].sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const tripLines = sorted.map((d, i) => {
    const st = d.fareReceived ? '✅' : '⏳';
    let line = `${i + 1}. ${d.partyName} | ${d.toArea} | ${d.distanceKm || 0}km | Rs.${(d.finalFare || 0).toLocaleString()} | ${st} | ${fmtDate(d.date)}`;
    if (d.codAmount > 0) line += ` | COD Rs.${d.codAmount.toLocaleString()} ${d.codCollected ? '✅' : '⏳'}`;
    return line;
  }).join('\n');

  const advLines = advEntries.length > 0
    ? [...advEntries].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(a =>
        `${a.type === 'payment' ? '✅' : '💰'} Rs.${(a.amount || 0).toLocaleString()} | ${fmtDate(a.date)} | ${a.note || (a.type === 'payment' ? 'Payment' : 'Advance')}`
      ).join('\n')
    : 'No entries';

  const parts = [
    `📋 ${riderName.toUpperCase()} — Khyber Traders`,
    `Date: ${fmtDate(today)} | Trips: ${tripList.length}`,
    sep,
    tripLines || 'No trips',
    sep,
    `Fare: Rs.${totalFare.toLocaleString()} | With Rider: Rs.${fareRcvd.toLocaleString()} | Pending: Rs.${(totalFare - fareRcvd).toLocaleString()}`,
    `Advance/Paid: Rs.${totalAdv.toLocaleString()} | *NET PAYABLE: Rs.${netPayable.toLocaleString()}*`,
  ];
  if (advEntries.length > 0) {
    parts.push(sep, `Ledger:`, advLines);
  }
  return parts.join('\n');
}

// Rider view: only their own trips
function RiderPayDash({ dispatches, ridesUser, riderAdvances }) {
  const myPending      = dispatches.filter(d => d.riderId === ridesUser.id && d.entryStatus === 'pending').sort((a,b) => b.createdAt - a.createdAt);
  const myFin          = dispatches.filter(d => d.riderId === ridesUser.id && d.entryStatus === 'finalized');
  const unpaid         = myFin.filter(d => !d.fareReceived);
  const paid           = myFin.filter(d => d.fareReceived);
  const totalEarned    = myFin.reduce((s, d) => s + (d.finalFare || 0), 0);
  const alreadyWithMe  = paid.reduce((s, d) => s + (d.finalFare || 0), 0);
  const unpaidTotal    = unpaid.reduce((s, d) => s + (d.finalFare || 0), 0);
  const myAdvances     = (riderAdvances || []).filter(a => a.riderId === ridesUser.id).sort((a,b) => (b.date||'').localeCompare(a.date||''));
  const advance        = myAdvances.reduce((s, a) => s + (a.amount || 0), 0);
  const adminOwes      = totalEarned - alreadyWithMe - advance;
  const isRickshaw     = ridesUser.type === 'rickshaw';
  const t = (en, ur) => isRickshaw ? ur : en;

  const [period, setPeriod] = useState('all');
  const todayStr   = getLocalDateStr();
  const weekStart  = getWeekRange().start;
  const monthStart = todayStr.slice(0, 7) + '-01';
  const periodTrips   = myFin.filter(d => {
    if (period === 'today') return d.date === todayStr;
    if (period === 'week')  return d.date >= weekStart;
    if (period === 'month') return d.date >= monthStart;
    return true;
  });
  const periodUnpaid      = periodTrips.filter(d => !d.fareReceived);
  const periodPaid        = periodTrips.filter(d => d.fareReceived);
  const periodUnpaidTotal = periodUnpaid.reduce((s, d) => s + (d.finalFare || 0), 0);

  const lbl = 'text-[8px] font-black uppercase tracking-widest';

  return (
    <div className="space-y-4 pb-10">
      {/* Balance card */}
      <div className={`p-5 rounded-3xl border-2 shadow-sm text-center ${adminOwes > 0 ? 'bg-blue-50 border-blue-200' : adminOwes < 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
        {isRickshaw && (
          <div className="text-base font-black text-slate-600 mb-2" style={{fontFamily:"'Noto Nastaliq Urdu', serif"}}>{ridesUser.name}</div>
        )}
        {adminOwes === 0 ? (
          <div className="py-1">
            <div className="text-3xl mb-1">✓</div>
            <div className="font-black text-lg text-emerald-700" style={isRickshaw ? {fontFamily:"'Noto Nastaliq Urdu', serif"} : {}}>
              {t('All Settled', 'حساب صاف')}
            </div>
            <div className="text-[9px] font-bold text-emerald-500 mt-1">
              {t('No outstanding balance', 'کوئی باقی رقم نہیں')}
            </div>
          </div>
        ) : (
          <>
            <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${adminOwes > 0 ? 'text-blue-600' : 'text-amber-600'}`}>
              {adminOwes > 0 ? t('Admin Owes You', 'ادارے کا واجب الادا') : t('You Owe Admin', 'آپ کے ذمے')}
            </div>
            <div className={`text-4xl font-black ${adminOwes > 0 ? 'text-blue-700' : 'text-amber-700'}`}>
              Rs.{Math.abs(adminOwes).toLocaleString()}
            </div>
            {advance > 0 && (
              <div className="text-[9px] font-bold text-slate-500 mt-1">
                {t('Advance deducted:', 'ایڈوانس کٹا:')} Rs.{advance.toLocaleString()}
              </div>
            )}
          </>
        )}
      </div>

      {/* Share report */}
      {myFin.length > 0 && (
        <button onClick={() => {
          const text = buildRiderReport({
            riderName: ridesUser.name,
            tripList: myFin,
            advEntries: myAdvances,
            totalFare: totalEarned,
            fareRcvd: alreadyWithMe,
            totalAdv: advance,
            netPayable: adminOwes,
          });
          if (navigator.share) navigator.share({ title: `My Pay Report — ${ridesUser.name}`, text });
          else { navigator.clipboard.writeText(text); }
        }}
          className="w-full bg-slate-700 hover:bg-slate-800 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
          <Share2 size={14}/> {t('Share My Report', 'رپورٹ شیئر کریں')}
        </button>
      )}

      {/* Date period filter */}
      {myFin.length > 0 && (
        <div className="flex gap-1.5">
          {[['all', t('All','سب')],['month', t('Month','ماہ')],['week', t('Week','ہفتہ')],['today', t('Today','آج')]].map(([k,l]) => (
            <button key={k} onClick={() => setPeriod(k)}
              className={`flex-1 py-2 text-[9px] font-black rounded-xl border-2 tracking-widest transition-all ${period === k ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-slate-200 text-slate-500'}`}>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Pending submissions */}
      {myPending.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-black text-amber-700 flex items-center gap-1 text-sm" style={isRickshaw ? {fontFamily:"'Noto Nastaliq Urdu', serif"} : {}}>
              <Clock size={14}/> {t('Pending Review', 'جائزے میں — ابھی تصدیق نہیں')}
            </span>
            <span className="text-[10px] font-black text-amber-600 bg-amber-200 px-2 py-0.5 rounded-full">
              {myPending.length} {t('entries', 'اندراج')}
            </span>
          </div>
          {myPending.map(d => (
            <div key={d.id} className="bg-white border-2 border-amber-100 rounded-2xl p-3 flex justify-between items-center">
              <div>
                <div className="font-black text-slate-800 text-sm" style={{fontFamily:"'Noto Nastaliq Urdu', serif"}}>{URDU_AREA_NAMES[d.toArea] || d.toArea}</div>
                <div className="text-[9px] font-bold text-amber-500">
                  {d.tripCount > 1 ? `${d.tripCount} رائڈز` : '۱ رائڈ'} · {fmtDate(d.date)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-amber-700">Rs.{(d.finalFare||0).toLocaleString()}</div>
                <div className="text-[8px] font-black text-amber-400 uppercase">{t('Pending', 'انتظار')}</div>
              </div>
            </div>
          ))}
          <div className="text-[9px] text-amber-600 font-bold text-center pt-1" style={isRickshaw ? {fontFamily:"'Noto Nastaliq Urdu', serif"} : {}}>
            {t('Will be included after admin approval', 'ادارے کی تصدیق کے بعد کرایہ شامل ہوگا')}
          </div>
        </div>
      )}

      {/* Breakdown */}
      {(totalEarned > 0 || alreadyWithMe > 0 || advance > 0) && <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border-2 border-slate-100 p-3 rounded-2xl text-center shadow-sm">
          <div className={`${lbl} text-slate-600 mb-1`}>{t('Total Earned', 'کل کرایہ')}</div>
          <div className="font-black text-slate-700 text-sm">Rs.{totalEarned.toLocaleString()}</div>
          <div className="text-[8px] text-slate-500 font-bold mt-0.5">{myFin.length} {t('trips', 'رائڈز')}</div>
        </div>
        <div className="bg-emerald-50 border-2 border-emerald-100 p-3 rounded-2xl text-center shadow-sm">
          <div className={`${lbl} text-emerald-600 mb-1`}>{t('Collected', 'گاہک سے وصول')}</div>
          <div className="font-black text-emerald-700 text-sm">Rs.{alreadyWithMe.toLocaleString()}</div>
          <div className="text-[8px] text-emerald-500 font-bold mt-0.5">{paid.length} {t('trips', 'رائڈز')}</div>
        </div>
        <div className="bg-amber-50 border-2 border-amber-100 p-3 rounded-2xl text-center shadow-sm">
          <div className={`${lbl} text-amber-600 mb-1`}>{t('Advance', 'ایڈوانس')}</div>
          <div className="font-black text-amber-700 text-sm">Rs.{advance.toLocaleString()}</div>
        </div>
      </div>}

      {/* Unpaid trips */}
      {periodUnpaid.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <div className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
              <AlertCircle size={12}/> {t(`Pending Payment (${periodUnpaid.length} trips)`, `باقی ادائیگی (${periodUnpaid.length} رائڈز)`)}
            </div>
            <div className="font-black text-red-600 text-sm">Rs.{periodUnpaidTotal.toLocaleString()}</div>
          </div>
          {periodUnpaid.map(d => (
            <div key={d.id} className="bg-white border-2 border-red-100 rounded-2xl p-3 flex justify-between items-center">
              <div>
                <div className="font-black text-slate-800 text-sm">{URDU_AREA_NAMES[d.toArea] || d.partyName || d.toArea}</div>
                <div className="text-[9px] font-bold text-red-400">{fmtDate(d.date)}</div>
              </div>
              <div className="font-black text-red-600">Rs.{(d.finalFare||0).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {/* Paid trips */}
      {periodPaid.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
              <CheckCircle size={12}/> {t(`Fare Collected (${periodPaid.length} trips)`, `کرایہ وصول (${periodPaid.length} رائڈز)`)}
            </div>
            <div className="font-black text-emerald-600 text-sm">Rs.{periodPaid.reduce((s,d)=>s+(d.finalFare||0),0).toLocaleString()}</div>
          </div>
          {periodPaid.map(d => (
            <div key={d.id} className="bg-white border-2 border-emerald-100 rounded-2xl p-3 flex justify-between items-center opacity-75">
              <div>
                <div className="font-black text-slate-800 text-sm">{URDU_AREA_NAMES[d.toArea] || d.partyName || d.toArea}</div>
                <div className="text-[9px] font-bold text-emerald-500">{fmtDate(d.date)}</div>
              </div>
              <div className="font-black text-emerald-600">Rs.{(d.finalFare||0).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {periodTrips.length === 0 && myFin.length > 0 && (
        <div className="text-center text-amber-500 text-sm font-bold py-4">
          {t('No trips in this period', 'اس مدت میں کوئی رائڈ نہیں')}
        </div>
      )}
      {myFin.length === 0 && (
        <div className="text-center text-amber-500 text-sm font-bold py-6">
          {t('No finalized trips yet', 'ابھی کوئی تصدیق شدہ رائڈ نہیں')}
        </div>
      )}

      {/* Advances + Payments ledger */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {t(`Payment Ledger (${myAdvances.length})`, `حساب کتاب (${myAdvances.length})`)}
          </div>
          <div className="font-black text-slate-700 text-sm">{t('Total:', 'کل:')} Rs.{advance.toLocaleString()}</div>
        </div>
        {myAdvances.length === 0 && (
          <div className="text-[10px] text-slate-500 font-bold px-1">{t('No entries recorded', 'کوئی اندراج نہیں')}</div>
        )}
        {myAdvances.map(a => {
          const isPayment = a.type === 'payment';
          return (
            <div key={a.id} className={`border-2 rounded-2xl p-3 flex justify-between items-center ${isPayment ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-100'}`}>
              <div>
                <div className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${isPayment ? 'text-blue-500' : 'text-amber-500'}`}>
                  {isPayment ? `✅ ${t('Payment', 'ادائیگی')}` : `💰 ${t('Advance', 'ایڈوانس')}`}
                </div>
                <div className={`font-black text-sm ${isPayment ? 'text-blue-800' : 'text-amber-800'}`}>
                  {a.note || (isPayment ? t('Payment', 'ادائیگی') : t('Advance', 'ایڈوانس'))}
                </div>
                <div className={`text-[9px] font-bold ${isPayment ? 'text-blue-400' : 'text-amber-400'}`}>{fmtDate(a.date)}</div>
              </div>
              <div className={`font-black ${isPayment ? 'text-blue-700' : 'text-amber-700'}`}>Rs.{(a.amount||0).toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const CAT_ORDER = ['Regular Route','Landhi','Super Highway','Gadap','Saddar','Goods Transport','Gulshan','Korangi','DHA','Gulberg','دیگر'];

const URDU_AREA_NAMES = {
  'Bhains Colony':'بھینس کالونی','Khurram Abad — Landhi':'خرم آباد — لانڈھی',
  'Army Land — Landhi':'آرمی لینڈ — لانڈھی','Navy Land — Landhi':'نیوی لینڈ — لانڈھی',
  'Babar Market — Landhi':'بابر مارکیٹ — لانڈھی',
  'Jameel Memon Society (S/W)':'جمیل میمن سوسائٹی','52 Acre Scheme (S/W)':'۵۲ ایکڑ اسکیم',
  'Nagori Society (S/W)':'ناگوری سوسائٹی','Areesha Cattle Society (S/W)':'عریشہ کیٹل سوسائٹی',
  'Karachi Dairy & Cattle City (S/W)':'کراچی ڈیری کیٹل سٹی','Dumba Goth (S/W)':'ڈمبہ گوٹھ',
  'Ramzan Piri (S/W)':'رمضان پیری','Solangi Stop (S/W)':'سولنگی اسٹاپ','Hashim Goth (S/W)':'ہاشم گوٹھ',
  'Abdullah Hotel — Gadap':'عبداللہ ہوٹل — گڈاپ','TOMCL — Organic Meat Co. Gadap':'TOMCL — گڈاپ',
  'Jumani Goth — Gadap':'جمانی گوٹھ — گڈاپ','GFA Farms — Gadap':'GFA فارمز — گڈاپ',
  'Piyala Hotel — Gulberg':'پیالہ ہوٹل — گلبرگ','Orangi Town':'اورنگی ٹاؤن',
  'Cantt Train Station — Saddar':'ریلوے اسٹیشن — صدر','Daewoo Terminal — Saddar':'ڈائیو ٹرمینل — صدر',
  'Shalimar Terminal — Saddar':'شالیمار ٹرمینل — صدر','Faisal Movers — Saddar':'فیصل موورز — صدر',
  'Intercity Bus Terminal — Saddar':'انٹرسٹی بس — صدر',
  'Kharadar Transport Area':'کھارادر ٹرانسپورٹ','Maripur / Hawksbay':'ماری پور / ہاکس بے',
  'DHA Phase 1':'ڈی ایچ اے فیز ۱','DHA Phase 2':'ڈی ایچ اے فیز ۲','DHA Phase 3':'ڈی ایچ اے فیز ۳',
  'DHA Phase 4':'ڈی ایچ اے فیز ۴','DHA Phase 5':'ڈی ایچ اے فیز ۵','DHA Phase 6':'ڈی ایچ اے فیز ۶',
  'DHA Phase 7':'ڈی ایچ اے فیز ۷','DHA Phase 8':'ڈی ایچ اے فیز ۸','DHA City (Phase 9)':'ڈی ایچ اے سٹی (فیز ۹)',
  'R17 Warehouse → Khyber Shop (Stock Transfer)':'R17 گودام → خیبر دکان',
  'Sohrab Goth Bus Adda → R17 Warehouse':'سہراب گوٹھ بس اڈہ → R17 گودام',
  'Naval Colony':'نیول کالونی','Mach Goth':'ماچھ گوٹھ','Mangopir':'منگھوپیر',
  'Gulshan Block 1':'گلشن بلاک ۱','Gulshan Block 2':'گلشن بلاک ۲','Gulshan Block 3':'گلشن بلاک ۳',
  'Gulshan Block 4':'گلشن بلاک ۴','Gulshan Block 5':'گلشن بلاک ۵','Gulshan Block 6':'گلشن بلاک ۶',
  'Gulshan Block 7':'گلشن بلاک ۷','Gulshan Block 8':'گلشن بلاک ۸','Gulshan Block 9':'گلشن بلاک ۹',
  'Gulshan Block 10':'گلشن بلاک ۱۰','Gulshan Block 11':'گلشن بلاک ۱۱','Gulshan Block 12':'گلشن بلاک ۱۲',
  'Gulshan Block 13':'گلشن بلاک ۱۳','Gulshan Block 14':'گلشن بلاک ۱۴','Gulshan Block 15':'گلشن بلاک ۱۵',
  'Gulshan Block 16':'گلشن بلاک ۱۶','Gulshan Block 17':'گلشن بلاک ۱۷','Gulshan Block 18':'گلشن بلاک ۱۸',
  'Gulshan Block 19':'گلشن بلاک ۱۹','Gulshan Block 20':'گلشن بلاک ۲۰','Gulshan Block 21':'گلشن بلاک ۲۱',
  'Korangi No. 1':'کورنگی نمبر ۱','Korangi No. 2':'کورنگی نمبر ۲','Korangi No. 3':'کورنگی نمبر ۳',
  'Korangi No. 4':'کورنگی نمبر ۴','Korangi No. 5':'کورنگی نمبر ۵','Korangi No. 6':'کورنگی نمبر ۶',
  'Korangi Industrial Area':'کورنگی صنعتی علاقہ','Korangi Causeway':'کورنگی کاز وے','Korangi Creek':'کورنگی کریک',
};

const AREA_DISTANCES = {
  'Bhains Colony':22,'Khurram Abad — Landhi':20,'Army Land — Landhi':21,'Navy Land — Landhi':21,'Babar Market — Landhi':19,
  'Jameel Memon Society (S/W)':35,'52 Acre Scheme (S/W)':36,'Nagori Society (S/W)':37,'Areesha Cattle Society (S/W)':38,
  'Karachi Dairy & Cattle City (S/W)':38,'Dumba Goth (S/W)':33,'Ramzan Piri (S/W)':34,'Solangi Stop (S/W)':34,'Hashim Goth (S/W)':32,
  'Abdullah Hotel — Gadap':42,'TOMCL — Organic Meat Co. Gadap':44,'Jumani Goth — Gadap':45,'GFA Farms — Gadap':46,
  'Piyala Hotel — Gulberg':12,'Orangi Town':8,
  'Cantt Train Station — Saddar':18,'Daewoo Terminal — Saddar':18,'Shalimar Terminal — Saddar':17,
  'Faisal Movers — Saddar':17,'Intercity Bus Terminal — Saddar':18,
  'Kharadar Transport Area':20,'Maripur / Hawksbay':25,
  'DHA Phase 1':28,'DHA Phase 2':30,'DHA Phase 3':32,'DHA Phase 4':33,
  'DHA Phase 5':35,'DHA Phase 6':36,'DHA Phase 7':38,'DHA Phase 8':40,'DHA City (Phase 9)':48,
  'R17 Warehouse → Khyber Shop (Stock Transfer)':5,'Sohrab Goth Bus Adda → R17 Warehouse':8,
  'Naval Colony':10,'Mach Goth':6,'Mangopir':9,
  'Gulshan Block 1':14,'Gulshan Block 2':14,'Gulshan Block 3':14,'Gulshan Block 4':15,'Gulshan Block 5':15,
  'Gulshan Block 6':15,'Gulshan Block 7':16,'Gulshan Block 8':16,'Gulshan Block 9':16,'Gulshan Block 10':16,
  'Gulshan Block 11':16,'Gulshan Block 12':16,'Gulshan Block 13':16,'Gulshan Block 14':16,'Gulshan Block 15':16,
  'Gulshan Block 16':16,'Gulshan Block 17':17,'Gulshan Block 18':17,'Gulshan Block 19':17,'Gulshan Block 20':17,'Gulshan Block 21':17,
  'Korangi No. 1':22,'Korangi No. 2':22,'Korangi No. 3':23,'Korangi No. 4':23,'Korangi No. 5':24,'Korangi No. 6':24,
  'Korangi Industrial Area':25,'Korangi Causeway':26,'Korangi Creek':27,
};

function RickshawDayEntry({ rickshawAreaRates, ridesUser, showToast, onDone }) {
  const [date, setDate]         = useState(getLocalDateStr());
  const [from, setFrom]         = useState('shop');
  const [basket, setBasket]     = useState([]);
  const [step, setStep]         = useState('pick');
  const [customArea, setCustomArea] = useState('');
  const [customFare, setCustomFare] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch]     = useState('');
  const [openCats, setOpenCats] = useState(() => new Set());

  const toggleCat = (cat) => setOpenCats(prev => {
    const next = new Set(prev);
    next.has(cat) ? next.delete(cat) : next.add(cat);
    return next;
  });

  const tap = (area, fare, notes = '') =>
    setBasket(prev => {
      const ex = prev.find(b => b.area === area);
      return ex ? prev.map(b => b.area === area ? { ...b, count: b.count + 1 } : b)
                : [...prev, { area, fare, notes, count: 1 }];
    });

  const setCount = (area, n) =>
    n <= 0 ? setBasket(prev => prev.filter(b => b.area !== area))
           : setBasket(prev => prev.map(b => b.area === area ? { ...b, count: n } : b));

  const addCustom = () => {
    if (!customArea.trim()) { showToast('علاقہ لکھیں', 'error'); return; }
    tap(customArea.trim(), parseFloat(customFare) || 0);
    setCustomArea(''); setCustomFare('');
  };

  const totalFare  = basket.reduce((s, b) => s + b.fare * b.count, 0);
  const totalTrips = basket.reduce((s, b) => s + b.count, 0);

  const submit = async () => {
    if (!basket.length) { showToast('کوئی علاقہ نہیں چنا', 'error'); return; }
    setSubmitting(true);
    try {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      const batch = writeBatch(db);
      basket.forEach(b => {
        const id = `dispatch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'dispatches', id), {
          date, time: timeStr, from, fromCustom: '',
          toArea: b.area, partyName: '',
          riderType: 'rickshaw', riderId: ridesUser.id, riderName: ridesUser.name,
          rickshawCount: b.count, tripCount: b.count,
          farePerUnit: b.fare, finalFare: b.fare * b.count,
          distanceKm: 0, ratePerKm: 0, suggestedFare: 0,
          loadDescription: '', notes: b.notes || '',
          entryStatus: 'pending', fareReceived: false,
          codAmount: 0, codCollected: false, createdAt: Date.now(),
        });
      });
      await batch.commit();
      showToast(`✓ ${totalTrips} رائڈز جمع ہو گئیں`);
      onDone();
    } catch (e) { showToast('خرابی / Error', 'error'); }
    setSubmitting(false);
  };

  const URDU_CAT = {
    'Super Highway': 'سپر ہائی وے',
    'Gadap': 'گڈاپ',
    'Landhi': 'لانڈھی',
    'Gulberg': 'گلبرگ',
    'Gulshan': 'گلشن',
    'Saddar': 'صدر',
    'Goods Transport': 'ٹرانسپورٹ پر بکنگ',
    'DHA': 'ڈی ایچ اے',
    'Regular Route': 'ریگولر رائڈز',
    'Korangi': 'کورنگی',
    'دیگر': 'دیگر',
  };

  const grouped = rickshawAreaRates.reduce((acc, r) => {
    const key = r.notes || 'دیگر';
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});
  const groups = Object.entries(grouped).sort(([a], [b]) => {
    const ai = CAT_ORDER.indexOf(a); const bi = CAT_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  const searchTerm = search.trim().toLowerCase();
  const searchResults = searchTerm ? rickshawAreaRates.filter(r => r.area.toLowerCase().includes(searchTerm)) : null;
  const lbl = 'text-[9px] font-black text-amber-600 uppercase tracking-widest block mb-1';
  const inp = 'bg-slate-50 border-2 border-slate-100 p-2.5 rounded-xl font-bold text-sm outline-none focus:border-amber-400 text-slate-900';

  const AreaBtn = ({ r }) => {
    const sel = basket.find(b => b.area === r.area);
    const urduName = URDU_AREA_NAMES[r.area];
    return (
      <button type="button"
        onClick={() => tap(r.area, r.farePerRickshaw || 0, r.notes)}
        className={`relative p-3 rounded-2xl border-2 text-right active:scale-95 transition-all shadow-sm ${sel ? 'bg-amber-500 border-amber-600 shadow-amber-200' : 'bg-white border-amber-100 hover:border-amber-300'}`}>
        {sel && (
          <span className="absolute -top-2.5 -left-2.5 w-7 h-7 bg-emerald-500 text-white rounded-full text-xs font-black flex items-center justify-center shadow-lg border-2 border-white">
            {sel.count}
          </span>
        )}
        <div className={`font-black text-xs leading-snug ${sel ? 'text-white' : 'text-slate-800'}`} style={{fontFamily:"'Noto Nastaliq Urdu', serif"}}>
          {urduName || r.area}
        </div>
        {urduName && (
          <div className={`text-[8px] mt-0.5 ${sel ? 'text-amber-200' : 'text-amber-500'}`}>{r.area}</div>
        )}
        <div className={`text-[11px] font-black mt-1 flex items-center justify-end gap-1 ${sel ? 'text-amber-100' : 'text-amber-600'}`} dir="ltr">
          Rs.{(r.farePerRickshaw || 0).toLocaleString()}
          {r.distanceKm > 0 && <span className={`text-[9px] font-bold ${sel ? 'text-amber-200' : 'text-blue-400'}`}>{r.distanceKm}km</span>}
        </div>
      </button>
    );
  };

  // ── Review screen ──────────────────────────────
  if (step === 'review') return (
    <div className="space-y-4 pb-10">
      <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 space-y-4">
        <div className="text-center">
          <div className="text-2xl font-black text-amber-700" style={{fontFamily:"'Noto Nastaliq Urdu', serif"}}>جائزہ</div>
          <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-0.5">Review Before Submit</div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-white rounded-2xl p-3 border-2 border-amber-100">
            <div className={`${lbl} mb-1`}>تاریخ</div>
            <div className="font-black text-slate-800">{fmtDate(date)}</div>
          </div>
          <div className="bg-white rounded-2xl p-3 border-2 border-amber-100">
            <div className={`${lbl} mb-1`}>رکشہ والا</div>
            <div className="font-black text-slate-800 truncate text-sm">{ridesUser.name}</div>
          </div>
        </div>
        <div className="space-y-2">
          {basket.map(b => (
            <div key={b.area} className="bg-white border-2 border-amber-100 rounded-2xl p-3 flex justify-between items-center">
              <div>
                <div className="font-black text-slate-800 text-sm">{b.area}</div>
                <div className="text-[9px] font-bold text-amber-600">{b.count === 1 ? '1 رائڈ' : `${b.count} رائڈز`} × Rs.{b.fare.toLocaleString()}</div>
              </div>
              <div className="font-black text-amber-700 text-sm">Rs.{(b.fare * b.count).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div className="bg-amber-600 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <div className="text-[9px] font-black text-amber-100 uppercase">کل / Total</div>
            <div className="text-[9px] font-bold text-amber-200">{totalTrips === 1 ? '1 رائڈ' : `${totalTrips} رائڈز`}</div>
          </div>
          <div className="text-2xl font-black text-white">Rs.{totalFare.toLocaleString()}</div>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setStep('pick')}
          className="flex-1 bg-slate-100 text-slate-700 font-black py-4 rounded-2xl text-sm uppercase tracking-widest active:scale-95 transition-all">
          واپس →
        </button>
        <button onClick={submit} disabled={submitting}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
          {submitting ? <RefreshCw size={16} className="animate-spin"/> : <Check size={16}/>}
          {submitting ? '...' : 'جمع کریں'}
        </button>
      </div>
    </div>
  );

  // ── Area picker screen ─────────────────────────
  return (
    <div className="space-y-4 pb-10">
      {/* Date + From */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>تاریخ / Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`w-full ${inp}`} />
        </div>
        <div>
          <label className={lbl}>روانگی / From</label>
          <div className="flex gap-1">
            {[['shop','🏪 دکان'],['warehouse','🏭 گودام']].map(([v, l]) => (
              <button key={v} onClick={() => setFrom(v)}
                className={`flex-1 py-2.5 text-[10px] font-black rounded-xl border-2 transition-all ${from === v ? 'bg-amber-500 border-amber-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section header */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-lg font-black text-amber-800" style={{fontFamily:"'Noto Nastaliq Urdu', serif"}}>علاقہ کا انتخاب کریں</div>
          <div className="text-[9px] font-bold text-amber-500">ایک بار ٹیپ = ایک رائڈ</div>
        </div>
        {basket.length > 0 && (
          <div className="text-right">
            <div className="text-[9px] font-black text-emerald-700">{totalTrips === 1 ? '1 رائڈ' : `${totalTrips} رائڈز`}</div>
            <div className="font-black text-emerald-700 text-sm">Rs.{totalFare.toLocaleString()}</div>
          </div>
        )}
      </div>

      {/* Search bar */}
      <div className="relative" dir="rtl">
        <Search size={15} className="absolute right-3 top-3.5 text-amber-400 pointer-events-none"/>
        <input
          type="text"
          dir="rtl"
          placeholder="علاقہ تلاش کریں..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border-2 border-amber-200 pr-9 pl-9 p-3 rounded-2xl font-bold text-sm outline-none focus:border-amber-400 text-slate-900"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16}/>
          </button>
        )}
      </div>

      {/* Area buttons */}
      {rickshawAreaRates.length === 0 ? (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-center space-y-1">
          <div className="text-sm font-black text-amber-700" style={{fontFamily:"'Noto Nastaliq Urdu', serif"}}>کوئی علاقہ نہیں</div>
          <div className="text-[9px] text-amber-600 font-bold">Admin → Settings → رکشہ کرایہ میں علاقے شامل کریں</div>
        </div>
      ) : searchTerm ? (
        searchResults.length === 0 ? (
          <div className="text-center py-8 space-y-1">
            <div className="text-slate-400 font-black text-sm">{search} — کوئی علاقہ نہیں ملا</div>
            <div className="text-[9px] text-slate-300 font-bold">نیچے "الگ علاقہ" میں شامل کریں</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {searchResults.map(r => <AreaBtn key={r.id} r={r}/>)}
          </div>
        )
      ) : groups.map(([cat, areas]) => {
        const catRides = basket.filter(b => areas.find(a => a.area === b.area)).reduce((s, b) => s + b.count, 0);
        const isOpen = openCats.has(cat);
        return (
          <div key={cat} className="border-2 border-slate-100 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleCat(cat)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${isOpen ? 'bg-amber-50' : 'bg-white'}`}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-sm font-black text-slate-800" style={{fontFamily:"'Noto Nastaliq Urdu', serif"}}>
                  {URDU_CAT[cat] || cat}
                </div>
                <div className="text-[8px] font-bold text-amber-400 shrink-0">{areas.length} علاقے</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {catRides > 0 && (
                  <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                    {catRides} رائڈز
                  </span>
                )}
                <ChevronDown size={16} className={`text-amber-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}/>
              </div>
            </button>
            {isOpen && (
              <div className="p-2 grid grid-cols-2 gap-2 border-t-2 border-slate-100 bg-slate-50">
                {areas.map(r => <AreaBtn key={r.id} r={r}/>)}
              </div>
            )}
          </div>
        );
      })}

      {/* Custom area */}
      <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-3 space-y-2">
        <div className="text-sm font-black text-slate-600" style={{fontFamily:"'Noto Nastaliq Urdu', serif"}}>+ الگ علاقہ</div>
        <div className="text-[9px] font-bold text-amber-500">فہرست میں نہ ہو تو یہاں لکھیں</div>
        <div className="flex gap-2">
          <input placeholder="علاقہ کا نام..." value={customArea} onChange={e => setCustomArea(e.target.value)}
            className={`flex-1 ${inp}`} />
          <input type="number" placeholder="Rs." value={customFare} onChange={e => setCustomFare(e.target.value)}
            className={`w-20 ${inp}`} />
          <button onClick={addCustom}
            className="bg-amber-500 text-white font-black px-4 py-2 rounded-xl text-base active:scale-95 transition-all">+</button>
        </div>
      </div>

      {/* Basket */}
      {basket.length > 0 && (
        <div className="bg-white border-2 border-emerald-300 rounded-3xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-emerald-800" style={{fontFamily:"'Noto Nastaliq Urdu', serif"}}>چنے ہوئے علاقے</span>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {totalTrips === 1 ? '1 رائڈ' : `${totalTrips} رائڈز`} · Rs.{totalFare.toLocaleString()}
            </span>
          </div>
          {basket.map(b => (
            <div key={b.area} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
              <div className="flex-1 min-w-0">
                <div className="font-black text-slate-800 text-xs truncate">{b.area}</div>
                <div className="text-[9px] font-bold text-emerald-600">Rs.{b.fare.toLocaleString()} / رائڈ</div>
              </div>
              <button onClick={() => setCount(b.area, b.count - 1)}
                className="w-9 h-9 bg-white border-2 border-slate-200 rounded-xl font-black text-slate-700 flex items-center justify-center active:scale-95 transition-all text-xl">−</button>
              <span className="w-7 text-center font-black text-slate-800">{b.count}</span>
              <button onClick={() => setCount(b.area, b.count + 1)}
                className="w-9 h-9 bg-amber-500 border-2 border-amber-500 rounded-xl font-black text-white flex items-center justify-center active:scale-95 transition-all text-xl">+</button>
              <div className="font-black text-emerald-700 text-sm w-16 text-right">Rs.{(b.fare * b.count).toLocaleString()}</div>
              <button onClick={() => setBasket(prev => prev.filter(x => x.area !== b.area))}
                className="text-red-300 hover:text-red-500 p-0.5 transition-colors"><Trash2 size={13}/></button>
            </div>
          ))}
          <button onClick={() => setStep('review')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl text-base active:scale-95 transition-all flex items-center justify-center gap-2"
            style={{fontFamily:"'Noto Nastaliq Urdu', serif"}}>
            <Check size={20}/> جائزہ لیں — Rs.{totalFare.toLocaleString()}
          </button>
        </div>
      )}
    </div>
  );
}

function RiderView({ dispatches, riders, riderAdvances, rickshawAreaRates, dispatchSettings, showToast, ridesUser }) {
  const [tab, setTab] = useState('mypay');
  const myDispatches = dispatches.filter(d => d.riderId === ridesUser.id).sort((a, b) => b.createdAt - a.createdAt);
  const isBykea = ridesUser.roles?.includes('bykea_manager');
  const isRickshaw = ridesUser.type === 'rickshaw';

  return (
    <div className="space-y-4" dir={isRickshaw ? 'rtl' : undefined}>
      <div className="bg-white p-1 rounded-2xl border-2 border-slate-100 flex shadow-sm">
        <button onClick={() => setTab('mypay')} className={`flex-1 py-2.5 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all ${tab === 'mypay' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>
          {isRickshaw ? 'میرا کرایہ' : 'My Pay'}
        </button>
        <button onClick={() => setTab('new')} className={`flex-1 py-2.5 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all ${tab === 'new' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>
          {isRickshaw ? 'نئی رائڈ' : 'New Trip'}
        </button>
        {isBykea && <button onClick={() => setTab('bykea')} className={`flex-1 py-2.5 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all ${tab === 'bykea' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>Bykea</button>}
        <button onClick={() => setTab('history')} className={`flex-1 py-2.5 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all ${tab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>
          {isRickshaw ? 'میری رائڈز' : 'My Trips'}
        </button>
      </div>
      {tab === 'mypay'   && <RiderPayDash dispatches={dispatches} ridesUser={ridesUser} riderAdvances={riderAdvances} />}
      {tab === 'new'     && (ridesUser.type === 'rickshaw'
        ? <RickshawDayEntry rickshawAreaRates={rickshawAreaRates} ridesUser={ridesUser} showToast={showToast} onDone={() => setTab('mypay')} />
        : <DispatchForm riderType={ridesUser.type || 'bike'} ridesUser={ridesUser} dispatchSettings={dispatchSettings} rickshawAreaRates={rickshawAreaRates} showToast={showToast} onDone={() => setTab('history')} />)}
      {tab === 'bykea'   && isBykea && <DispatchForm riderType="bykea" ridesUser={ridesUser} dispatchSettings={dispatchSettings} rickshawAreaRates={rickshawAreaRates} showToast={showToast} onDone={() => setTab('history')} />}
      {tab === 'history' && <DispatchList dispatches={myDispatches} riders={riders} ridesUser={ridesUser} isAdmin={false} showToast={showToast} />}
    </div>
  );
}

// Admin Rides view: full access
function RiderPayables({ dispatches, riders, riderAdvances, showToast }) {
  const [range, setRange] = useState('all');
  const today = getLocalDateStr();
  const weekStart = getWeekRange().start;
  const monthStart = today.slice(0, 7) + '-01';

  const fin = dispatches.filter(d => {
    if (d.entryStatus !== 'finalized') return false;
    if (range === 'today') return d.date === today;
    if (range === 'week')  return d.date >= weekStart;
    if (range === 'month') return d.date >= monthStart;
    return true;
  });

  const nonAdmins = riders.filter(r => !r.roles?.includes('admin'));

  const riderStats = nonAdmins.map(r => {
    const trips       = fin.filter(d => d.riderId === r.id);
    const advEntries  = (riderAdvances || []).filter(a => a.riderId === r.id);
    const totalFare   = trips.reduce((s, d) => s + (d.finalFare || 0), 0);
    const fareRcvd    = trips.filter(d => d.fareReceived).reduce((s, d) => s + (d.finalFare || 0), 0);
    const totalAdv    = advEntries.reduce((s, a) => s + (a.amount || 0), 0);
    const netPayable  = totalFare - fareRcvd - totalAdv;
    return { rider: r, trips: trips.length, tripList: trips, totalFare, fareRcvd, totalAdv, advEntries, netPayable };
  }).filter(s => s.trips > 0 || s.totalAdv > 0);

  const grandTotal   = riderStats.reduce((s, r) => s + r.totalFare, 0);
  const grandRcvd    = riderStats.reduce((s, r) => s + r.fareRcvd, 0);
  const grandAdv     = riderStats.reduce((s, r) => s + r.totalAdv, 0);
  const grandPayable = riderStats.reduce((s, r) => s + r.netPayable, 0);

  const shareReport = () => {
    const lines = riderStats.map(s =>
      `👤 ${s.rider.name}\n  Trips: ${s.trips} | Fare: Rs.${s.totalFare.toLocaleString()}\n  Received: Rs.${s.fareRcvd.toLocaleString()} | Advance: Rs.${s.totalAdv.toLocaleString()}\n  Net Payable: Rs.${s.netPayable.toLocaleString()}`
    ).join('\n\n');
    const text = `💳 Rider Payables — Khyber Traders\n📅 Period: ${range.toUpperCase()}\n\n${lines}\n\n━━━━━━━━━━━━━━\n💰 Grand Total Fare: Rs.${grandTotal.toLocaleString()}\n✅ Total Received: Rs.${grandRcvd.toLocaleString()}\n📤 Total Advance: Rs.${grandAdv.toLocaleString()}\n🔴 Net to Pay: Rs.${grandPayable.toLocaleString()}`;
    if (navigator.share) navigator.share({ text });
    else { navigator.clipboard.writeText(text); showToast('Copied to clipboard'); }
  };

  const lbl = 'text-[8px] font-black text-amber-600 uppercase tracking-widest';

  return (
    <div className="space-y-4 pb-10">
      {/* Range filter */}
      <div className="flex gap-2">
        {[['all','All Time'],['month','This Month'],['week','This Week'],['today','Today']].map(([k,l]) => (
          <button key={k} onClick={() => setRange(k)}
            className={`flex-1 py-2 text-[9px] font-black rounded-xl border-2 uppercase tracking-widest transition-all ${range === k ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-slate-200 text-slate-500'}`}>{l}</button>
        ))}
      </div>

      {/* Grand totals */}
      <div className="bg-white p-4 rounded-2xl border-2 border-blue-100 shadow-sm">
        <div className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2"><DollarSign size={13}/> Summary</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 p-3 rounded-xl text-center"><div className={lbl}>Total Fare</div><div className="font-black text-slate-700">Rs.{grandTotal.toLocaleString()}</div></div>
          <div className="bg-emerald-50 p-3 rounded-xl text-center"><div className={`${lbl} text-emerald-600`}>Fare Received</div><div className="font-black text-emerald-700">Rs.{grandRcvd.toLocaleString()}</div></div>
          <div className="bg-amber-50 p-3 rounded-xl text-center"><div className={`${lbl} text-amber-600`}>Total Advance</div><div className="font-black text-amber-700">Rs.{grandAdv.toLocaleString()}</div></div>
          <div className="bg-red-50 p-3 rounded-xl text-center"><div className={`${lbl} text-red-500`}>Net to Pay</div><div className="font-black text-red-600 text-lg">Rs.{grandPayable.toLocaleString()}</div></div>
        </div>
      </div>

      {riderStats.length === 0 && <div className="text-center text-slate-400 text-sm font-bold py-10">No finalized trips in this period</div>}

      {riderStats.map(s => (
        <RiderPayCard key={s.rider.id} s={s} showToast={showToast} lbl={lbl} />
      ))}

      {riderStats.length > 0 && (
        <button onClick={shareReport}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-95 transition-all">
          <Share2 size={16}/> Share Payables Report
        </button>
      )}
    </div>
  );
}

function RiderPayCard({ s, showToast, lbl }) {
  const [advAmount, setAdvAmount] = useState('');
  const [advNote, setAdvNote]     = useState('');
  const [advDate, setAdvDate]     = useState(getLocalDateStr());
  const [showAdv, setShowAdv]     = useState(false);
  const [showPay, setShowPay]     = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate]     = useState(getLocalDateStr());
  const [payNote, setPayNote]     = useState('');

  const recordPayment = async () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) { showToast('Enter a valid amount', 'error'); return; }
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'riderAdvances', `pay_${Date.now()}`), {
      riderId: s.rider.id, riderName: s.rider.name,
      amount: amt, note: payNote.trim() || 'Salary Payment',
      date: payDate, type: 'payment',
      createdAt: Date.now(),
    });
    setShowPay(false); setPayAmount(''); setPayNote('');
    showToast('Payment recorded');
  };

  const addAdvance = async () => {
    const amt = parseFloat(advAmount);
    if (!amt || amt <= 0) { showToast('Enter a valid amount', 'error'); return; }
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'riderAdvances', `adv_${Date.now()}`), {
      riderId: s.rider.id, riderName: s.rider.name,
      amount: amt, note: advNote.trim() || 'Advance', date: advDate,
      createdAt: Date.now(),
    });
    setAdvAmount(''); setAdvNote('');
    showToast('Advance added');
  };

  const delAdvance = async (id) => {
    if (!window.confirm('Delete this advance entry?')) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'riderAdvances', id));
    showToast('Advance deleted');
  };

  const inp = "bg-slate-50 border-2 border-slate-100 p-2.5 rounded-xl font-bold text-sm outline-none focus:border-blue-400 text-slate-900";

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-black text-slate-900 uppercase">{s.rider.name}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {s.trips} trip{s.trips !== 1 ? 's' : ''} · {s.rider.type === 'rickshaw' ? '🟡 Rickshaw' : '🟢 Bike'}
            </div>
          </div>
          <div className={`text-sm font-black ${s.netPayable > 0 ? 'text-red-600' : s.netPayable < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
            {s.netPayable > 0 ? `Pay Rs.${s.netPayable.toLocaleString()}` : s.netPayable < 0 ? `Overpaid Rs.${Math.abs(s.netPayable).toLocaleString()}` : 'Settled ✓'}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-50 p-2 rounded-xl"><div className={lbl}>Fare</div><div className="font-black text-slate-700">Rs.{s.totalFare.toLocaleString()}</div></div>
          <div className="bg-emerald-50 p-2 rounded-xl"><div className={`${lbl} text-emerald-600`}>Received</div><div className="font-black text-emerald-700">Rs.{s.fareRcvd.toLocaleString()}</div></div>
          <div className="bg-amber-50 p-2 rounded-xl"><div className={`${lbl} text-amber-600`}>Advance</div><div className="font-black text-amber-700">Rs.{s.totalAdv.toLocaleString()}</div></div>
        </div>

        {/* Net bar */}
        <div className={`p-3 rounded-xl border-2 text-center font-black text-sm ${s.netPayable > 0 ? 'bg-red-50 border-red-200 text-red-700' : s.netPayable < 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
          {s.netPayable > 0 ? `Net Payable: Rs.${s.netPayable.toLocaleString()}` : s.netPayable < 0 ? `Rider owes back: Rs.${Math.abs(s.netPayable).toLocaleString()}` : 'All settled ✓'}
        </div>

        {/* Pay Rider button — always visible */}
        <button onClick={() => { setShowPay(!showPay); setPayAmount(Math.max(0, s.netPayable).toString()); }}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
          <DollarSign size={14}/> Record Payment to {s.rider.name}
          {s.netPayable > 0 && <span className="bg-blue-600 px-2 py-0.5 rounded-lg">Rs.{s.netPayable.toLocaleString()}</span>}
        </button>

        {/* Share detailed trip report */}
        <button onClick={() => {
          const text = buildRiderReport({
            riderName: s.rider.name,
            tripList: s.tripList || [],
            advEntries: s.advEntries || [],
            totalFare: s.totalFare,
            fareRcvd: s.fareRcvd,
            totalAdv: s.totalAdv,
            netPayable: s.netPayable,
          });
          if (navigator.share) navigator.share({ title: `Payment Report — ${s.rider.name}`, text });
          else { navigator.clipboard.writeText(text); showToast('Report copied to clipboard'); }
        }}
          className="w-full bg-slate-600 hover:bg-slate-700 text-white font-black py-2.5 rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
          <Share2 size={13}/> Share Trip Report
        </button>

        {showPay && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 space-y-2">
            <div className="text-[9px] font-black text-blue-700 uppercase tracking-widest">Record Payment to {s.rider.name}</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Amount (Rs.)</label>
                <input type="number" min="0" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                  className="w-full bg-white border-2 border-blue-200 p-2.5 rounded-xl font-black text-sm outline-none focus:border-blue-500 text-blue-900" />
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Date</label>
                <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)}
                  className="w-full bg-white border-2 border-blue-200 p-2.5 rounded-xl font-black text-sm outline-none focus:border-blue-500 text-slate-900" />
              </div>
            </div>
            <input placeholder="Note (optional)" value={payNote} onChange={e => setPayNote(e.target.value)}
              className="w-full bg-white border-2 border-blue-200 p-2.5 rounded-xl font-bold text-sm outline-none focus:border-blue-500 text-slate-900" />
            <div className="flex gap-2">
              <button onClick={recordPayment}
                className="flex-1 bg-blue-700 text-white font-black py-2.5 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                Confirm Payment
              </button>
              <button onClick={() => setShowPay(false)} className="px-4 bg-slate-100 text-slate-600 font-black py-2.5 rounded-xl text-[10px] uppercase">Cancel</button>
            </div>
          </div>
        )}

        {/* Advances ledger */}
        {/* Advances + Payments ledger toggle */}
        <button onClick={() => setShowAdv(!showAdv)}
          className="w-full flex justify-between items-center py-2 px-3 bg-amber-50 border-2 border-amber-100 rounded-xl text-[9px] font-black text-amber-700 uppercase tracking-widest">
          <span>📋 Ledger ({s.advEntries.length} entries)</span>
          <span>{showAdv ? '▲ Hide' : '▼ Show'}</span>
        </button>

        {showAdv && (
          <div className="space-y-2">
            {/* Add advance form */}
            <div className="bg-amber-50/60 border-2 border-amber-100 rounded-2xl p-3 space-y-2">
              <div className="text-[9px] font-black text-amber-700 uppercase tracking-widest">+ Add Advance</div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" min="0" placeholder="Amount (Rs.)" value={advAmount} onChange={e => setAdvAmount(e.target.value)} className={inp} />
                <input type="date" value={advDate} onChange={e => setAdvDate(e.target.value)} className={inp} />
              </div>
              <input placeholder="Note (e.g. advance for this week)" value={advNote} onChange={e => setAdvNote(e.target.value)} className={`w-full ${inp}`} />
              <button onClick={addAdvance}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-2.5 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                Add Advance
              </button>
            </div>

            {/* Existing entries */}
            {s.advEntries.length === 0 && <div className="text-[10px] text-slate-400 font-bold text-center py-2">No entries yet</div>}
            {[...s.advEntries].sort((a,b) => b.createdAt - a.createdAt).map(a => {
              const isPayment = a.type === 'payment';
              return (
                <div key={a.id} className={`flex items-center justify-between border-2 rounded-xl p-3 ${isPayment ? 'bg-blue-50 border-blue-200' : 'bg-white border-amber-100'}`}>
                  <div>
                    <div className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${isPayment ? 'text-blue-500' : 'text-amber-500'}`}>{isPayment ? '✅ Payment' : '💰 Advance'}</div>
                    <div className="font-black text-slate-800 text-sm">Rs.{(a.amount||0).toLocaleString()}</div>
                    <div className="text-[9px] font-bold text-slate-400">{fmtDate(a.date)} · {a.note}</div>
                  </div>
                  <button onClick={() => delAdvance(a.id)} className="text-red-300 hover:text-red-600 p-1 transition-colors"><Trash2 size={14}/></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ScrollTabs({ tabs, active, onChange }) {
  const ref = React.useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 120, behavior: 'smooth' });
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => scroll(-1)} className="shrink-0 w-7 h-7 flex items-center justify-center bg-white border-2 border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
        <ChevronDown size={14} className="rotate-90" />
      </button>
      <div ref={ref} className="overflow-x-auto hide-scrollbar flex-1">
        <div className="bg-white p-1 rounded-2xl border-2 border-slate-100 flex gap-1 shadow-sm min-w-max">
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => onChange(k)}
              className={`py-2 px-3 text-[9px] font-black rounded-xl uppercase tracking-widest whitespace-nowrap transition-all ${active === k ? 'bg-blue-700 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => scroll(1)} className="shrink-0 w-7 h-7 flex items-center justify-center bg-white border-2 border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
        <ChevronDown size={14} className="-rotate-90" />
      </button>
    </div>
  );
}

function AdminRidesView({ dispatches, riders, riderAdvances, rickshawAreaRates, dispatchSettings, showToast, ridesUser }) {
  const [tab, setTab] = useState('dashboard');
  const TABS = [['dashboard','Dashboard'],['new','New Entry'],['log','Dispatch Log'],['payables','Payables'],['reports','Reports'],['riders','Riders'],['settings','Settings']];

  return (
    <div className="space-y-4">
      <ScrollTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'dashboard' && <AdminDashboard dispatches={dispatches} riders={riders} riderAdvances={riderAdvances} showToast={showToast} />}
      {tab === 'new' && <DispatchForm riderType="all" ridesUser={ridesUser} dispatchSettings={dispatchSettings} riders={riders} rickshawAreaRates={rickshawAreaRates} showToast={showToast} onDone={() => setTab('log')} isAdmin />}
      {tab === 'log' && <DispatchList dispatches={[...dispatches].sort((a,b) => b.createdAt - a.createdAt)} riders={riders} ridesUser={ridesUser} isAdmin showToast={showToast} />}
      {tab === 'payables' && <RiderPayables dispatches={dispatches} riders={riders} riderAdvances={riderAdvances} showToast={showToast} />}
      {tab === 'reports' && <RidesReports dispatches={dispatches} riders={riders} showToast={showToast} />}
      {tab === 'riders' && <RiderProfilesManager riders={riders} dispatches={dispatches} showToast={showToast} />}
      {tab === 'settings' && <RidesSettings dispatchSettings={dispatchSettings} rickshawAreaRates={rickshawAreaRates} showToast={showToast} />}
    </div>
  );
}

// Admin Dashboard
function AdminDashboard({ dispatches, riders, riderAdvances, showToast }) {
  const [range, setRange] = useState('today');
  const today      = getLocalDateStr();
  const weekStart  = getWeekRange().start;
  const monthStart = today.slice(0, 7) + '-01';

  const pending  = dispatches.filter(d => d.entryStatus === 'pending');
  const allFin   = dispatches.filter(d => d.entryStatus === 'finalized');

  const inRange = (d) => {
    if (range === 'today') return d.date === today;
    if (range === 'week')  return d.date >= weekStart;
    if (range === 'month') return d.date >= monthStart;
    return true;
  };

  const fin  = allFin.filter(inRange);
  const all  = dispatches.filter(inRange);

  // Financial
  const totalFare    = fin.reduce((s, d) => s + (d.finalFare || 0), 0);
  const fareRcvd     = fin.filter(d => d.fareReceived).reduce((s, d) => s + (d.finalFare || 0), 0);
  const totalAdv     = (riderAdvances || []).reduce((s, a) => s + (a.amount || 0), 0);
  const netPayable   = totalFare - fareRcvd - totalAdv;

  // COD (all time finalized)
  const totalCOD     = allFin.reduce((s, d) => s + (d.codAmount || 0), 0);
  const collectedCOD = allFin.filter(d => d.codCollected).reduce((s, d) => s + (d.codAmount || 0), 0);
  const pendingCOD   = totalCOD - collectedCOD;

  // Trips breakdown
  const bikeTrips     = fin.filter(d => d.riderType === 'bike').length;
  const rickTrips     = fin.filter(d => d.riderType === 'rickshaw').length;
  const bykeaTrips    = fin.filter(d => d.riderType === 'bykea').length;

  // Per-rider in range
  const nonAdmins = riders.filter(r => !r.roles?.includes('admin'));
  const riderRows = nonAdmins.map(r => {
    const t = fin.filter(d => d.riderId === r.id);
    return { name: r.name, trips: t.length, fare: t.reduce((s, d) => s + (d.finalFare || 0), 0) };
  }).filter(r => r.trips > 0).sort((a, b) => b.fare - a.fare);

  const finalizeAll = async () => {
    if (!window.confirm(`Finalize all ${pending.length} pending entries?`)) return;
    const chunks = [];
    for (let i = 0; i < pending.length; i += 400) chunks.push(pending.slice(i, i + 400));
    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach(d => batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'dispatches', d.id), { entryStatus: 'finalized', finalizedAt: Date.now() }));
      await batch.commit();
    }
    showToast(`${pending.length} entries finalized!`);
  };

  const lbl = 'text-[8px] font-black uppercase tracking-widest';

  return (
    <div className="space-y-4 pb-10">

      {/* Range selector */}
      <div className="flex gap-2">
        {[['today','Today'],['week','This Week'],['month','This Month'],['all','All Time']].map(([k,l]) => (
          <button key={k} onClick={() => setRange(k)}
            className={`flex-1 py-2 text-[9px] font-black rounded-xl border-2 uppercase tracking-widest transition-all ${range === k ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-slate-200 text-slate-500'}`}>{l}</button>
        ))}
      </div>

      {/* Pending action */}
      {pending.length > 0 && (
        <button onClick={finalizeAll} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
          <CheckCircle size={16}/> {pending.length} Pending — Finalize All
        </button>
      )}

      {/* Financial summary */}
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm space-y-3">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><DollarSign size={13}/> Financial Summary</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 p-3 rounded-xl text-center">
            <div className={`${lbl} text-blue-500 mb-1`}>Total Fare</div>
            <div className="font-black text-blue-700 text-base">Rs.{totalFare.toLocaleString()}</div>
            <div className="text-[8px] text-blue-400 font-bold mt-0.5">{fin.length} trips</div>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl text-center">
            <div className={`${lbl} text-emerald-600 mb-1`}>Fare Received</div>
            <div className="font-black text-emerald-700 text-base">Rs.{fareRcvd.toLocaleString()}</div>
            <div className="text-[8px] text-emerald-500 font-bold mt-0.5">from customers</div>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl text-center">
            <div className={`${lbl} text-amber-600 mb-1`}>Advances Paid</div>
            <div className="font-black text-amber-700 text-base">Rs.{totalAdv.toLocaleString()}</div>
            <div className="text-[8px] text-amber-400 font-bold mt-0.5">all time</div>
          </div>
          <div className={`p-3 rounded-xl text-center ${netPayable > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
            <div className={`${lbl} mb-1 ${netPayable > 0 ? 'text-red-500' : 'text-slate-400'}`}>Net Payable</div>
            <div className={`font-black text-base ${netPayable > 0 ? 'text-red-600' : 'text-slate-500'}`}>Rs.{Math.max(0,netPayable).toLocaleString()}</div>
            <div className="text-[8px] text-slate-400 font-bold mt-0.5">to riders</div>
          </div>
        </div>
      </div>

      {/* Trips breakdown */}
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm space-y-3">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Truck size={13}/> Trips Breakdown</div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-slate-50 p-2 rounded-xl">
            <div className={`${lbl} text-slate-400 mb-1`}>Total</div>
            <div className="font-black text-slate-700 text-lg">{fin.length}</div>
          </div>
          <div className="bg-emerald-50 p-2 rounded-xl">
            <div className={`${lbl} text-emerald-600 mb-1`}>Bike</div>
            <div className="font-black text-emerald-700 text-lg">{bikeTrips}</div>
          </div>
          <div className="bg-amber-50 p-2 rounded-xl">
            <div className={`${lbl} text-amber-600 mb-1`}>Rick.</div>
            <div className="font-black text-amber-700 text-lg">{rickTrips}</div>
          </div>
          <div className="bg-blue-50 p-2 rounded-xl">
            <div className={`${lbl} text-blue-500 mb-1`}>Bykea</div>
            <div className="font-black text-blue-700 text-lg">{bykeaTrips}</div>
          </div>
        </div>
        {/* Pending */}
        <div className="flex justify-between items-center bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          <div className={`${lbl} text-amber-600`}>Pending Review</div>
          <div className="font-black text-amber-700 text-sm">{pending.length} trips</div>
        </div>
      </div>

      {/* COD Tracker */}
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm space-y-3">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Package size={13}/> COD Tracker (All Time)</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-50 p-3 rounded-xl">
            <div className={`${lbl} text-slate-400 mb-1`}>Total</div>
            <div className="font-black text-slate-700">Rs.{totalCOD.toLocaleString()}</div>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl">
            <div className={`${lbl} text-emerald-600 mb-1`}>Collected</div>
            <div className="font-black text-emerald-700">Rs.{collectedCOD.toLocaleString()}</div>
          </div>
          <div className="bg-red-50 p-3 rounded-xl">
            <div className={`${lbl} text-red-500 mb-1`}>Pending</div>
            <div className="font-black text-red-600">Rs.{pendingCOD.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Per-rider summary */}
      {riderRows.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm space-y-2">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Users size={13}/> Rider Summary</div>
          {riderRows.map(r => (
            <div key={r.name} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <div className="font-black text-slate-800 text-sm uppercase">{r.name}</div>
                <div className="text-[9px] font-bold text-slate-400">{r.trips} trip{r.trips !== 1 ? 's' : ''}</div>
              </div>
              <div className="font-black text-blue-700">Rs.{r.fare.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Pending */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pending Review</h4>
          {pending.slice(0, 5).map(d => <DispatchCard key={d.id} dispatch={d} isAdmin showToast={showToast} />)}
        </div>
      )}
    </div>
  );
}

// Dispatch Entry Form
function AreaPicker({ value, onChange, inputCls, labelCls, toCustom, setToCustom }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = q.trim()
    ? KARACHI_AREAS.filter(a => a.name.toLowerCase().includes(q.toLowerCase()))
    : KARACHI_AREAS;

  const select = (name) => {
    onChange(name);
    setQ(name === '__custom__' ? '' : name);
    setOpen(false);
  };

  const handleInput = (v) => {
    setQ(v);
    onChange('');
    setOpen(true);
  };

  return (
    <div>
      <label className={labelCls}>To Area</label>
      <div className="relative">
        <input
          value={value && value !== '__custom__' ? value : q}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Type to search area..."
          className={inputCls}
          autoComplete="off"
        />
        {open && (
          <div className="absolute z-50 w-full bg-white border-2 border-blue-200 rounded-2xl shadow-xl mt-1 max-h-52 overflow-y-auto">
            {filtered.map(a => (
              <button key={a.name} type="button" onMouseDown={() => select(a.name)}
                className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-blue-50 border-b border-slate-50 last:border-0">
                {a.name}
                <span className="text-[9px] font-black text-slate-400 ml-2">{a.fromShop}km</span>
              </button>
            ))}
            <button type="button" onMouseDown={() => select('__custom__')}
              className="w-full text-left px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50">
              + Custom area...
            </button>
            {filtered.length === 0 && (
              <div className="px-4 py-3 text-xs text-slate-400 font-bold">No match — use Custom</div>
            )}
          </div>
        )}
      </div>
      {value === '__custom__' && (
        <input className={`${inputCls} mt-2`} placeholder="Enter area..." value={toCustom} onChange={e => setToCustom(e.target.value)} />
      )}
    </div>
  );
}

function DispatchForm({ riderType, ridesUser, dispatchSettings, riders = [], rickshawAreaRates = [], showToast, onDone, isAdmin = false }) {
  const today = getLocalDateStr();
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  const [date, setDate]           = useState(today);
  const [time, setTime]           = useState(timeStr);
  const [from, setFrom]           = useState('shop');
  const [fromCustom, setFromCustom] = useState('');
  const [toArea, setToArea]       = useState('');
  const [toCustom, setToCustom]   = useState('');
  const [partyName, setPartyName] = useState('');
  const [selRiderType, setSelRiderType] = useState(riderType === 'all' ? 'bike' : riderType);
  const [riderId, setRiderId]     = useState(isAdmin ? '' : ridesUser.id);
  const [rickshawCount, setRickshawCount] = useState(1);
  const [loadDesc, setLoadDesc]   = useState('');
  const [distKm, setDistKm]       = useState('');
  const [finalFare, setFinalFare] = useState('');
  const [farePerUnit, setFarePerUnit] = useState('');
  const [codAmount, setCodAmount] = useState('0');
  const [codCollected, setCodCollected] = useState(false);
  const [notes, setNotes]         = useState('');
  const [status, setStatus]       = useState('sent');
  const [saving, setSaving]       = useState(false);
  const [fareReceived, setFareReceived] = useState(false);

  const bikeRate = dispatchSettings.bikeRate || 55;
  const rickshawRate = dispatchSettings.rickshawRate || 55;
  const [ratePerKm, setRatePerKm] = useState(bikeRate);

  // Auto-fill distance when from/toArea changes
  useEffect(() => {
    if (toArea && toArea !== '__custom__') {
      const area = KARACHI_AREAS.find(a => a.name === toArea);
      if (area) {
        const km = from === 'shop' ? area.fromShop : from === 'warehouse' ? area.fromWarehouse : '';
        setDistKm(km.toString());
      }
    }
  }, [from, toArea]);

  // Sync ratePerKm with rider type changes (reset to global default)
  useEffect(() => {
    setRatePerKm(selRiderType === 'rickshaw' ? rickshawRate : bikeRate);
  }, [selRiderType]);

  // Auto-suggest fare
  const km = parseFloat(distKm) || 0;
  const suggested = selRiderType === 'bykea' ? null : Math.round(km * (parseFloat(ratePerKm) || 0));

  useEffect(() => {
    if (selRiderType !== 'bykea' && suggested !== null && !finalFare) {
      if (selRiderType === 'rickshaw') {
        setFarePerUnit(suggested.toString());
        setFinalFare((suggested * rickshawCount).toString());
      } else {
        setFinalFare(suggested.toString());
      }
    }
  }, [suggested, selRiderType]);

  useEffect(() => {
    if (selRiderType === 'rickshaw') {
      const pu = parseFloat(farePerUnit) || 0;
      setFinalFare((pu * rickshawCount).toString());
    }
  }, [farePerUnit, rickshawCount]);

  const save = async () => {
    if (!partyName.trim()) { showToast('Enter party name', 'error'); return; }
    if (!toArea) { showToast('Select delivery area', 'error'); return; }
    if (isAdmin && !riderId) { showToast('Select a rider', 'error'); return; }
    setSaving(true);
    try {
      const id = `disp_${Date.now()}`;
      const resolvedRiderId = isAdmin ? riderId : ridesUser.id;
      const resolvedRider = riders.find(r => r.id === resolvedRiderId) || ridesUser;
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'dispatches', id), {
        date, time, from, fromCustom,
        toArea: toArea === '__custom__' ? toCustom : toArea,
        partyName: partyName.trim(),
        riderType: selRiderType,
        riderId: resolvedRiderId,
        riderName: resolvedRider.name,
        rickshawCount: selRiderType === 'rickshaw' ? rickshawCount : 1,
        loadDescription: loadDesc.trim(),
        distanceKm: parseFloat(distKm) || 0,
        ratePerKm: parseFloat(ratePerKm) || 0,
        suggestedFare: suggested || 0,
        farePerUnit: selRiderType === 'rickshaw' ? (parseFloat(farePerUnit) || 0) : (parseFloat(finalFare) || 0),
        finalFare: parseFloat(finalFare) || 0,
        codAmount: parseFloat(codAmount) || 0,
        codCollected,
        fareReceived,
        notes: notes.trim(),
        status,
        entryStatus: isAdmin ? 'finalized' : 'pending',
        createdBy: ridesUser.id,
        createdAt: Date.now(),
        finalizedAt: isAdmin ? Date.now() : null,
      });
      showToast(isAdmin ? 'Dispatch saved & finalized' : 'Trip submitted for review');
      // Reset
      setPartyName(''); setToArea(''); setToCustom(''); setLoadDesc('');
      setDistKm(''); setFinalFare(''); setFarePerUnit(''); setCodAmount('0');
      setCodCollected(false); setNotes(''); setStatus('sent');
      onDone && onDone();
    } catch (e) { showToast('Error saving', 'error'); }
    setSaving(false);
  };

  const inputCls = "w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none focus:border-blue-500 text-slate-900";
  const labelCls = "text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1";

  return (
    <div className="space-y-3 pb-20">
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 space-y-4 shadow-sm">
        <h3 className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2"><Navigation size={14}/> New Dispatch</h3>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputCls} /></div>
        </div>

        {/* From */}
        <div>
          <label className={labelCls}>From</label>
          <div className="flex gap-2">
            {Object.values(DISPATCH_ORIGINS).map(o => (
              <button key={o.id} onClick={() => setFrom(o.id)}
                className={`flex-1 py-2.5 text-[9px] font-black rounded-xl border-2 uppercase tracking-wide transition-all ${from === o.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                {o.id === 'shop' ? 'Shop' : o.id === 'warehouse' ? 'Warehouse' : 'Custom'}
              </button>
            ))}
          </div>
          {from === 'custom' && <input className={`${inputCls} mt-2`} placeholder="Enter address..." value={fromCustom} onChange={e => setFromCustom(e.target.value)} />}
        </div>

        {/* To Area — rickshaw gets Urdu quick-select panel, others get standard picker */}
        {selRiderType === 'rickshaw' && rickshawAreaRates.length > 0 ? (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-amber-700" style={{fontFamily:"'Noto Nastaliq Urdu', serif"}}>🟡 محفوظ علاقے</span>
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Saved Areas</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {rickshawAreaRates.map(r => (
                <button key={r.id} type="button" onClick={() => {
                  setToArea(r.area); setToCustom('');
                  setFarePerUnit(r.farePerRickshaw.toString());
                  setFinalFare((r.farePerRickshaw * rickshawCount).toString());
                }}
                  className={`p-3 rounded-2xl border-2 text-left transition-all active:scale-95 ${toArea === r.area ? 'bg-amber-500 border-amber-500' : 'bg-white border-amber-200'}`}>
                  <div className={`font-black text-sm ${toArea === r.area ? 'text-white' : 'text-slate-800'}`}>{r.area}</div>
                  <div className={`text-[10px] font-black mt-0.5 ${toArea === r.area ? 'text-amber-100' : 'text-amber-600'}`}>
                    Rs.{(r.farePerRickshaw || 0).toLocaleString()} <span style={{fontFamily:"'Noto Nastaliq Urdu', serif"}}>فی رکشہ</span>
                  </div>
                  {r.notes && <div className={`text-[8px] font-bold mt-0.5 ${toArea === r.area ? 'text-amber-200' : 'text-slate-400'}`}>{r.notes}</div>}
                </button>
              ))}
            </div>
            <div>
              <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                <span>Other / دیگر علاقہ</span>
                {toArea && !rickshawAreaRates.find(r => r.area === toArea) && <span className="text-amber-500">✓ {toArea}</span>}
              </div>
              <AreaPicker value={rickshawAreaRates.find(r => r.area === toArea) ? '' : toArea} onChange={v => { setToArea(v); setToCustom(''); }} inputCls={inputCls} labelCls={''} toCustom={toCustom} setToCustom={setToCustom} />
            </div>
          </div>
        ) : selRiderType === 'rickshaw' ? (
          <div className="space-y-2">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-center">
              <div className="text-[10px] font-black text-amber-700">کوئی محفوظ علاقہ نہیں</div>
              <div className="text-[9px] text-amber-600 font-bold mt-0.5">Settings → رکشہ کرایہ میں علاقے شامل کریں</div>
            </div>
            <AreaPicker value={toArea} onChange={setToArea} inputCls={inputCls} labelCls={labelCls}
              toCustom={toCustom} setToCustom={setToCustom} />
          </div>
        ) : (
          <AreaPicker value={toArea} onChange={setToArea} inputCls={inputCls} labelCls={labelCls}
            toCustom={toCustom} setToCustom={setToCustom} />
        )}

        {/* Party Name */}
        <div>
          <label className={labelCls}>
            {selRiderType === 'rickshaw' ? 'گاہک کا نام · Party Name' : 'Party Name'}
          </label>
          <input value={partyName} onChange={e => setPartyName(e.target.value)}
            placeholder={selRiderType === 'rickshaw' ? 'مثال: حاجی سلیم' : 'e.g. Haji Saleem'} className={inputCls} />
        </div>

        {/* Rider Type */}
        {(riderType === 'all' || isAdmin) && (
          <div>
            <label className={labelCls}>Rider Type</label>
            <div className="flex gap-2">
              {(['bike','bykea','rickshaw']).map(rt => {
                const m = RIDER_TYPE_META[rt];
                return (
                  <button key={rt} onClick={() => setSelRiderType(rt)}
                    className={`flex-1 py-2.5 text-[9px] font-black rounded-xl border-2 uppercase tracking-wide transition-all ${selRiderType === rt ? `${m.bg} ${m.border} ${m.color}` : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                    {rt === 'bike' ? '🟢 Bike' : rt === 'bykea' ? '🔵 Bykea' : '🟡 Rickshaw'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Rider selector (admin only) */}
        {isAdmin && (
          <div>
            <label className={labelCls}>Rider</label>
            <select value={riderId} onChange={e => setRiderId(e.target.value)} className={inputCls}>
              <option value="">— Select Rider —</option>
              {riders.filter(r => !r.roles.includes('admin')).map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Rickshaw count */}
        {selRiderType === 'rickshaw' && (
          <div>
            <label className={labelCls}>
              رکشہ تعداد &nbsp;·&nbsp; Rickshaw Count
            </label>
            <div className="flex gap-2">
              {[1,2,3,4].map(n => (
                <button key={n} onClick={() => setRickshawCount(n)}
                  className={`flex-1 py-3 font-black text-sm rounded-xl border-2 transition-all ${rickshawCount === n ? 'bg-amber-500 border-amber-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                  {n}{n===4?'+':''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Load Description */}
        <div>
          <label className={labelCls}>
            {selRiderType === 'rickshaw' ? 'بوجھ کی تفصیل · Load Description' : 'Load Description'}
          </label>
          <input value={loadDesc} onChange={e => setLoadDesc(e.target.value)} placeholder="e.g. 3 boxes heavy gold" className={inputCls} />
        </div>

        {/* Distance & Fare */}
        {selRiderType !== 'bykea' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={labelCls}>Distance (km)</label>
                <input type="number" value={distKm} onChange={e => setDistKm(e.target.value)} placeholder="km" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Rate/km (Rs.)</label>
                <input type="number" value={ratePerKm} onChange={e => setRatePerKm(e.target.value)} className={`${inputCls} text-amber-700 font-black`} />
              </div>
              <div>
                <label className={labelCls}>Suggested Fare</label>
                <div className="bg-slate-100 border-2 border-slate-200 p-3 rounded-xl font-black text-blue-700 text-sm">
                  {suggested !== null ? `Rs.${suggested}` : '—'}
                </div>
              </div>
            </div>
            {selRiderType === 'rickshaw' && (
              <div>
                <label className={labelCls}>کرایہ فی رکشہ &nbsp;·&nbsp; Fare per Rickshaw (Rs.)</label>
                <input type="number" value={farePerUnit} onChange={e => setFarePerUnit(e.target.value)} className={inputCls} />
              </div>
            )}
            <div>
              <label className={labelCls}>
                {selRiderType === 'rickshaw' ? `کل کرایہ · Total Fare × ${rickshawCount} رکشہ` : 'Final Fare (Rs.)'}
              </label>
              <input type="number" value={finalFare} onChange={e => setFinalFare(e.target.value)} className={`${inputCls} text-blue-700 font-black text-lg`} />
            </div>
          </div>
        ) : (
          <div>
            <label className={labelCls}>Bykea Fare Paid (Rs.)</label>
            <input type="number" value={finalFare} onChange={e => setFinalFare(e.target.value)} placeholder="As per app" className={`${inputCls} text-blue-700 font-black`} />
          </div>
        )}

        {/* Fare Received toggle */}
        <button onClick={() => setFareReceived(!fareReceived)}
          className={`w-full py-3 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all ${fareReceived ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
          {fareReceived ? '✓ Fare Received from Customer' : '⏳ Fare Not Yet Received'}
        </button>

        {/* COD */}
        <div className="space-y-2">
          <div>
            <label className={labelCls}>COD Amount (Rs.)</label>
            <input type="number" value={codAmount} onChange={e => setCodAmount(e.target.value)} className={inputCls} />
          </div>
          {parseFloat(codAmount) > 0 && (
            <button onClick={() => setCodCollected(!codCollected)}
              className={`w-full py-3 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all ${codCollected ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
              COD: {codCollected ? '✓ Collected' : '⏳ Pending Collection'}
            </button>
          )}
        </div>

        {/* Status & Notes */}
        <div>
          <label className={labelCls}>Delivery Status</label>
          <div className="flex gap-1">
            {DISPATCH_STATUSES.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`flex-1 py-2 text-[9px] font-black rounded-lg border transition-all capitalize ${status === s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Notes (optional)</label>
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional info..." className={inputCls} />
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-5 rounded-[2rem] shadow-xl active:scale-95 transition-all tracking-widest uppercase text-base disabled:opacity-50">
        {saving ? 'Saving...' : isAdmin ? 'Save & Finalize' : 'Submit for Review'}
      </button>
    </div>
  );
}

// Dispatch List / History
function DispatchList({ dispatches, riders, ridesUser, isAdmin, showToast }) {
  const [filter, setFilter] = useState('all');
  const today = getLocalDateStr();
  const weekStart = getWeekRange().start;
  const isRickshaw = ridesUser?.type === 'rickshaw';

  const filtered = dispatches.filter(d => {
    if (filter === 'today') return d.date === today;
    if (filter === 'week') return d.date >= weekStart;
    if (filter === 'cod') return d.codAmount > 0 && !d.codCollected && d.entryStatus === 'finalized';
    return true;
  });

  const filterLabels = isRickshaw
    ? [['all','سب'],['today','آج'],['week','اس ہفتے'],['cod','COD باقی']]
    : [['all','All'],['today','Today'],['week','This Week'],['cod','COD Pending']];

  return (
    <div className="space-y-3 pb-10" dir={isRickshaw ? 'rtl' : undefined}>
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {filterLabels.map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`shrink-0 px-3 py-2 text-[9px] font-black uppercase rounded-lg border-2 transition-all ${filter === k ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            {l}
          </button>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-10 text-slate-400 text-sm font-bold">No dispatches found</div>}
      {filtered.map(d => <DispatchCard key={d.id} dispatch={d} isAdmin={isAdmin} ridesUser={ridesUser} showToast={showToast} />)}
    </div>
  );
}

// Dispatch Card
function DispatchCard({ dispatch: d, isAdmin, ridesUser, showToast }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [codDone, setCodDone] = useState(d.codCollected);
  const [fareRcvd, setFareRcvd] = useState(d.fareReceived || false);
  const m = RIDER_TYPE_META[d.riderType] || RIDER_TYPE_META.bike;

  // Edit state (inline)
  const [eParty, setEParty]     = useState(d.partyName);
  const [eLoad, setELoad]       = useState(d.loadDescription || '');
  const [eFare, setEFare]       = useState(d.finalFare?.toString() || '');
  const [eCOD, setECOD]         = useState(d.codAmount?.toString() || '0');
  const [eCODDone, setECODDone] = useState(d.codCollected);
  const [eStatus, setEStatus]   = useState(d.status || 'sent');
  const [eNotes, setENotes]     = useState(d.notes || '');
  const [eDist, setEDist]       = useState(d.distanceKm?.toString() || '');
  const [eRate, setERate]       = useState(d.ratePerKm?.toString() || '');

  const canEdit = isAdmin || (ridesUser?.id === d.riderId && d.entryStatus === 'pending');
  const canDelete = isAdmin || (ridesUser?.id === d.riderId && d.entryStatus === 'pending');

  const toggleCOD = async () => {
    if (!isAdmin) return;
    const next = !codDone;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'dispatches', d.id), { codCollected: next });
    setCodDone(next);
    showToast(next ? 'COD marked collected' : 'COD marked pending');
  };

  const toggleFareReceived = async () => {
    const next = !fareRcvd;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'dispatches', d.id), { fareReceived: next });
    setFareRcvd(next);
    showToast(next ? 'Fare marked received' : 'Fare marked pending');
  };

  const finalize = async () => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'dispatches', d.id), { entryStatus: 'finalized', finalizedAt: Date.now() });
    showToast('Entry finalized');
  };

  const reject = async () => {
    if (!window.confirm('Reject this entry?')) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'dispatches', d.id), { entryStatus: 'rejected' });
    showToast('Entry rejected');
  };

  const remove = async () => {
    if (!window.confirm('Delete this dispatch permanently?')) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'dispatches', d.id));
    showToast('Deleted');
  };

  const saveEdit = async () => {
    const dist = parseFloat(eDist) || 0;
    const rate = parseFloat(eRate) || 0;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'dispatches', d.id), {
      partyName: eParty.trim(),
      loadDescription: eLoad.trim(),
      finalFare: parseFloat(eFare) || 0,
      codAmount: parseFloat(eCOD) || 0,
      codCollected: eCODDone,
      status: eStatus,
      notes: eNotes.trim(),
      distanceKm: dist,
      ratePerKm: rate,
      suggestedFare: rate > 0 ? Math.round(dist * rate) : d.suggestedFare,
    });
    setEditing(false);
    showToast('Trip updated');
  };

  const share = () => {
    const rickInfo = d.riderType === 'rickshaw' ? ` (×${d.rickshawCount})` : '';
    const text =
`🛵 Dispatch — Khyber Traders
📅 ${fmtDate(d.date)} — ${d.time || ''}
👤 ${d.partyName} — ${d.toArea}
🚐 ${m.label}${rickInfo}
📦 ${d.loadDescription || '—'}
📍 Distance: ${d.distanceKm} km
💰 Fare: Rs.${(d.finalFare || 0).toLocaleString()}
💵 COD: Rs.${(d.codAmount || 0).toLocaleString()} — ${d.codCollected ? 'COLLECTED' : 'PENDING'}
📌 Status: ${(d.status||'').toUpperCase()}`;
    if (navigator.share) navigator.share({ text });
    else { navigator.clipboard.writeText(text); showToast('Copied to clipboard'); }
  };

  const isRickshawCard = d.riderType === 'rickshaw';
  const statusColor = d.entryStatus === 'finalized' ? 'text-emerald-600' : d.entryStatus === 'rejected' ? 'text-red-500' : 'text-amber-600';
  const statusUrdu = d.entryStatus === 'finalized' ? 'منظور' : d.entryStatus === 'rejected' ? 'مسترد' : 'انتظار';
  const inp = "w-full bg-slate-50 border-2 border-slate-100 p-2.5 rounded-xl font-bold text-sm outline-none focus:border-blue-500 text-slate-900";
  const urduArea = URDU_AREA_NAMES[d.toArea];

  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${m.border}`}>
      <button onClick={() => { setExpanded(!expanded); setEditing(false); }} className={`w-full p-4 ${isRickshawCard ? 'text-right' : 'text-left'}`}>
        <div className={`flex justify-between items-start ${isRickshawCard ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-start gap-3 min-w-0 ${isRickshawCard ? 'flex-row-reverse' : ''}`}>
            <span className={`w-3 h-3 rounded-full mt-1 shrink-0 ${m.dot}`}></span>
            <div className="min-w-0">
              <div className={`font-black text-slate-900 truncate ${isRickshawCard ? '' : 'uppercase'}`}
                style={isRickshawCard ? {fontFamily:"'Noto Nastaliq Urdu', serif"} : {}}>
                {isRickshawCard ? (urduArea || d.toArea) : (d.partyName || d.toArea)}
              </div>
              {isRickshawCard && urduArea && (
                <div className="text-[8px] text-amber-500 font-bold mt-0.5">{d.toArea}</div>
              )}
              <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                {isRickshawCard
                  ? <>{fmtDate(d.date)}{d.tripCount > 1 ? ` · ${d.tripCount} رائڈز` : ''}</>
                  : <>{d.partyName ? `${d.toArea} · ` : `${d.riderName} · `}{fmtDate(d.date)}{d.tripCount > 1 ? ` · ${d.tripCount} رائڈز` : ''}</>
                }
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[9px] font-black uppercase ${statusColor}`}>{isRickshawCard ? statusUrdu : d.entryStatus}</span>
                {d.codAmount > 0 && <span className={`text-[9px] font-black uppercase ${d.codCollected ? 'text-emerald-600' : 'text-red-500'}`}>COD {d.codCollected ? '✓' : '⏳'}</span>}
                <span className={`text-[9px] font-black uppercase ${d.fareReceived ? 'text-emerald-600' : 'text-orange-500'}`}>
                  {isRickshawCard ? (d.fareReceived ? '✓ وصول' : '⏳ باقی') : (d.fareReceived ? '💰 Fare ✓' : '💰 Fare ⏳')}
                </span>
              </div>
            </div>
          </div>
          <div className={`${isRickshawCard ? 'text-left' : 'text-right'} shrink-0`}>
            <div className="font-black text-blue-700">Rs.{(d.finalFare||0).toLocaleString()}</div>
            {!isRickshawCard && <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{m.label}</div>}
            {isRickshawCard && d.tripCount > 1 && <div className="text-[9px] text-amber-500 font-bold mt-0.5">{d.tripCount} رائڈز</div>}
          </div>
        </div>
      </button>

      {expanded && !editing && (
        <div className="px-4 pb-4 border-t-2 border-slate-50 pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div><span className="font-black text-slate-400 uppercase tracking-widest block">From</span>
              <span className="font-bold text-slate-700">{DISPATCH_ORIGINS[d.from]?.label || d.fromCustom || d.from}</span></div>
            <div><span className="font-black text-slate-400 uppercase tracking-widest block">Rider</span>
              <span className="font-bold text-slate-700">{d.riderName}</span></div>
            <div><span className="font-black text-slate-400 uppercase tracking-widest block">Distance</span>
              <span className="font-bold text-slate-700">{d.distanceKm} km</span></div>
            {d.ratePerKm > 0 && <div><span className="font-black text-slate-400 uppercase tracking-widest block">Rate/km</span>
              <span className="font-bold text-slate-700">Rs.{d.ratePerKm}</span></div>}
            <div><span className="font-black text-slate-400 uppercase tracking-widest block">Status</span>
              <span className="font-bold text-slate-700 capitalize">{d.status}</span></div>
            {d.riderType === 'rickshaw' && <div><span className="font-black text-slate-400 uppercase tracking-widest block">Rickshaws</span>
              <span className="font-bold text-slate-700">{d.rickshawCount} × Rs.{d.farePerUnit}</span></div>}
            {d.codAmount > 0 && <div><span className="font-black text-slate-400 uppercase tracking-widest block">COD</span>
              <span className="font-bold text-slate-700">Rs.{d.codAmount?.toLocaleString()}</span></div>}
          </div>
          {d.loadDescription && <div className="text-[10px]"><span className="font-black text-slate-400 uppercase tracking-widest block">Load</span><span className="font-bold text-slate-700">{d.loadDescription}</span></div>}
          {d.notes && <div className="text-[10px]"><span className="font-black text-slate-400 uppercase tracking-widest block">Notes</span><span className="font-bold text-slate-700">{d.notes}</span></div>}

          {/* Fare Received toggle */}
          <button onClick={toggleFareReceived}
            className={`w-full py-2.5 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all ${fareRcvd ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-orange-50 border-orange-200 text-orange-600'}`}>
            {isRickshawCard
              ? (fareRcvd ? '✓ گاہک سے کرایہ وصول' : '⏳ کرایہ ابھی نہیں ملا')
              : (fareRcvd ? '✓ Fare Received from Customer' : '⏳ Fare Not Yet Received')}
          </button>

          <div className="flex gap-2 flex-wrap pt-1">
            <button onClick={share} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-1">
              <Share2 size={12}/> Share
            </button>
            {canEdit && (
              <button onClick={() => setEditing(true)} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-1">
                ✏️ Edit
              </button>
            )}
            {isAdmin && d.entryStatus === 'pending' && (
              <>
                <button onClick={finalize} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-1">
                  <CheckCircle size={12}/> Finalize
                </button>
                <button onClick={reject} className="bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-1">
                  <XCircle size={12}/> Reject
                </button>
              </>
            )}
            {isAdmin && d.codAmount > 0 && (
              <button onClick={toggleCOD} className={`border px-3 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-1 ${codDone ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                <DollarSign size={12}/> {codDone ? 'Mark Pending' : 'Mark Collected'}
              </button>
            )}
            {canDelete && (
              <button onClick={remove} className="bg-red-50 text-red-400 border border-red-100 px-3 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-1">
                <Trash2 size={12}/> Delete
              </button>
            )}
          </div>
        </div>
      )}

      {expanded && editing && (
        <div className="px-4 pb-4 border-t-2 border-blue-100 pt-3 space-y-3 bg-blue-50/30">
          <div className="text-[9px] font-black text-blue-700 uppercase tracking-widest">Editing Trip</div>
          <div>
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Party Name</label>
            <input value={eParty} onChange={e=>setEParty(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Load Description</label>
            <input value={eLoad} onChange={e=>setELoad(e.target.value)} className={inp} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Distance km</label>
              <input type="number" value={eDist} onChange={e=>setEDist(e.target.value)} className={inp} />
            </div>
            <div>
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Rate/km</label>
              <input type="number" value={eRate} onChange={e=>setERate(e.target.value)} className={inp} />
            </div>
            <div>
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Final Fare</label>
              <input type="number" value={eFare} onChange={e=>setEFare(e.target.value)} className={`${inp} text-blue-700 font-black`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">COD Amount</label>
              <input type="number" value={eCOD} onChange={e=>setECOD(e.target.value)} className={inp} />
            </div>
            <div>
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">COD Status</label>
              <button onClick={()=>setECODDone(!eCODDone)} className={`w-full py-2.5 rounded-xl border-2 font-black text-[9px] uppercase transition-all ${eCODDone ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                {eCODDone ? '✓ Collected' : '⏳ Pending'}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Delivery Status</label>
            <div className="flex gap-1">
              {DISPATCH_STATUSES.map(s => (
                <button key={s} onClick={()=>setEStatus(s)} className={`flex-1 py-2 text-[8px] font-black rounded-lg border capitalize transition-all ${eStatus===s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-500'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Notes</label>
            <input value={eNotes} onChange={e=>setENotes(e.target.value)} className={inp} />
          </div>
          <div className="flex gap-2">
            <button onClick={saveEdit} className="flex-1 bg-blue-700 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">Save Changes</button>
            <button onClick={()=>setEditing(false)} className="px-5 bg-slate-100 text-slate-600 font-black py-3 rounded-2xl text-[10px] uppercase">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Reports (7 types)
function RidesReports({ dispatches, riders, showToast }) {
  const [tab, setTab] = useState('summary');
  const [range, setRange] = useState(getWeekRange());
  const presets = getDatePresets();
  const fin = dispatches.filter(d => d.entryStatus === 'finalized' && d.date >= range.start && d.date <= range.end);

  const reportTabs = [
    ['summary','Summary'], ['rider','Per Rider'], ['bykea','Bykea'],
    ['area','By Area'], ['cod','COD Recovery'], ['cost','Cost Analysis'],
  ];

  return (
    <div className="space-y-4 pb-10">
      {/* Date Filters */}
      <div className="bg-white p-3 rounded-2xl border-2 border-slate-100 space-y-2 shadow-sm">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {Object.entries(presets).map(([l, v]) => (
            <button key={l} onClick={() => setRange(v)}
              className={`shrink-0 px-3 py-1.5 text-[9px] font-black uppercase rounded-lg border-2 transition-all flex items-center gap-1 ${range.start === v.start && range.end === v.end ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <CalendarDays size={10}/> {l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1"><label className="text-[8px] font-black text-slate-400 uppercase ml-1">Start</label>
            <input type="date" value={range.start} onChange={e => setRange({...range, start: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-xs outline-none focus:border-blue-500" /></div>
          <div className="flex-1"><label className="text-[8px] font-black text-slate-400 uppercase ml-1">End</label>
            <input type="date" value={range.end} onChange={e => setRange({...range, end: e.target.value})} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-xs outline-none focus:border-blue-500" /></div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-1 min-w-max bg-white p-1 rounded-xl border-2 border-slate-100 shadow-sm">
          {reportTabs.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-3 py-2 text-[9px] font-black rounded-lg uppercase tracking-widest whitespace-nowrap transition-all ${tab === k ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {tab === 'summary'  && <ReportSummary fin={fin} range={range} showToast={showToast} />}
      {tab === 'rider'    && <ReportPerRider fin={fin} riders={riders} range={range} showToast={showToast} />}
      {tab === 'bykea'    && <ReportBykea fin={fin} range={range} showToast={showToast} />}
      {tab === 'area'     && <ReportArea fin={fin} range={range} showToast={showToast} />}
      {tab === 'cod'      && <ReportCOD fin={fin} riders={riders} range={range} showToast={showToast} />}
      {tab === 'cost'     && <ReportCost fin={fin} range={range} showToast={showToast} />}
    </div>
  );
}

// Share helper
const shareReport = (text, showToast) => {
  if (navigator.share) navigator.share({ text });
  else { navigator.clipboard.writeText(text); showToast('Report copied to clipboard'); }
};

function ShareBtn({ getText, showToast }) {
  return (
    <button onClick={() => shareReport(getText(), showToast)}
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-95 transition-all">
      <Share2 size={16}/> Share on WhatsApp
    </button>
  );
}

function StatRow({ label, value, sub }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">{label}</span>
      <div className="text-right"><span className="font-black text-slate-900">{value}</span>
        {sub && <span className="text-[9px] font-bold text-slate-400 block">{sub}</span>}
      </div>
    </div>
  );
}

function ReportCard({ title, children }) {
  return (
    <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm">
      <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2"><BarChart2 size={12}/> {title}</h4>
      {children}
    </div>
  );
}

function ReportSummary({ fin, range, showToast }) {
  const totalFare = fin.reduce((s,d) => s + (d.finalFare||0), 0);
  const bikes = fin.filter(d => d.riderType === 'bike');
  const rickshaws = fin.filter(d => d.riderType === 'rickshaw');
  const bykeas = fin.filter(d => d.riderType === 'bykea');
  const totalCOD = fin.reduce((s,d) => s + (d.codAmount||0), 0);
  const collectedCOD = fin.filter(d=>d.codCollected).reduce((s,d) => s+(d.codAmount||0),0);

  const getText = () =>
`🏢 *KHYBER TRADERS — Rides Summary*
📅 ${fmtDate(range.start)} to ${fmtDate(range.end)}

📊 *Overall Summary*
Total Rides: ${fin.length}
Total Freight: Rs.${totalFare.toLocaleString()}

🟢 Bike Rides: ${bikes.length} — Rs.${bikes.reduce((s,d)=>s+(d.finalFare||0),0).toLocaleString()}
🟡 Rickshaw Rides: ${rickshaws.length} — Rs.${rickshaws.reduce((s,d)=>s+(d.finalFare||0),0).toLocaleString()}
🔵 Bykea/App Rides: ${bykeas.length} — Rs.${bykeas.reduce((s,d)=>s+(d.finalFare||0),0).toLocaleString()}

💵 Total COD Out: Rs.${totalCOD.toLocaleString()}
✅ COD Collected: Rs.${collectedCOD.toLocaleString()}
⏳ COD Pending: Rs.${(totalCOD-collectedCOD).toLocaleString()}

_Mazdoori Calculator App — Khyber Traders_`;

  return (
    <div className="space-y-3">
      <ReportCard title="Overall Summary">
        <StatRow label="Total Rides" value={fin.length} />
        <StatRow label="Total Freight" value={`Rs.${totalFare.toLocaleString()}`} />
        <StatRow label="Bike Rides" value={bikes.length} sub={`Rs.${bikes.reduce((s,d)=>s+(d.finalFare||0),0).toLocaleString()}`} />
        <StatRow label="Rickshaw Rides" value={rickshaws.length} sub={`Rs.${rickshaws.reduce((s,d)=>s+(d.finalFare||0),0).toLocaleString()}`} />
        <StatRow label="Bykea/App Rides" value={bykeas.length} sub={`Rs.${bykeas.reduce((s,d)=>s+(d.finalFare||0),0).toLocaleString()}`} />
        <StatRow label="Total COD Out" value={`Rs.${totalCOD.toLocaleString()}`} />
        <StatRow label="COD Collected" value={`Rs.${collectedCOD.toLocaleString()}`} />
        <StatRow label="COD Pending" value={`Rs.${(totalCOD-collectedCOD).toLocaleString()}`} />
      </ReportCard>
      <ShareBtn getText={getText} showToast={showToast} />
    </div>
  );
}

function ReportPerRider({ fin, riders, range, showToast }) {
  const riderIds = [...new Set(fin.map(d => d.riderId))];

  const getText = () => {
    let t = `🏢 *KHYBER TRADERS — Per Rider Report*\n📅 ${fmtDate(range.start)} to ${fmtDate(range.end)}\n\n`;
    riderIds.forEach(rid => {
      const rd = fin.filter(d => d.riderId === rid);
      const r = riders.find(x => x.id === rid);
      const name = r?.name || rd[0]?.riderName || rid;
      const fare = rd.reduce((s,d)=>s+(d.finalFare||0),0);
      const cod = rd.reduce((s,d)=>s+(d.codAmount||0),0);
      const codCol = rd.filter(d=>d.codCollected).reduce((s,d)=>s+(d.codAmount||0),0);
      const km = rd.reduce((s,d)=>s+(d.distanceKm||0),0);
      t += `👤 *${name}*\nTrips: ${rd.length}\nDistance: ${km.toFixed(1)} km\nFreight: Rs.${fare.toLocaleString()}\nCOD Carried: Rs.${cod.toLocaleString()}\nCOD Collected: Rs.${codCol.toLocaleString()}\nCOD Pending: Rs.${(cod-codCol).toLocaleString()}\n\n`;
    });
    t += `_Mazdoori Calculator App — Khyber Traders_`;
    return t;
  };

  return (
    <div className="space-y-3">
      {riderIds.map(rid => {
        const riderDisps = fin.filter(d => d.riderId === rid);
        const r = riders.find(x => x.id === rid);
        const name = r?.name || riderDisps[0]?.riderName || rid;
        const fare = riderDisps.reduce((s,d) => s+(d.finalFare||0), 0);
        const cod = riderDisps.reduce((s,d) => s+(d.codAmount||0), 0);
        const codCollected = riderDisps.filter(d=>d.codCollected).reduce((s,d)=>s+(d.codAmount||0),0);
        const km = riderDisps.reduce((s,d) => s+(d.distanceKm||0), 0);
        return (
          <ReportCard key={rid} title={name}>
            <StatRow label="Trips" value={riderDisps.length} />
            <StatRow label="Total Distance" value={`${km.toFixed(1)} km`} />
            <StatRow label="Total Freight" value={`Rs.${fare.toLocaleString()}`} />
            <StatRow label="COD Carried" value={`Rs.${cod.toLocaleString()}`} />
            <StatRow label="COD Collected" value={`Rs.${codCollected.toLocaleString()}`} />
            <StatRow label="COD Pending" value={`Rs.${(cod-codCollected).toLocaleString()}`} />
          </ReportCard>
        );
      })}
      {riderIds.length === 0 && <p className="text-center text-slate-400 text-sm py-6">No finalized data for this period</p>}
      {riderIds.length > 0 && <ShareBtn getText={getText} showToast={showToast} />}
    </div>
  );
}

function ReportBykea({ fin, range, showToast }) {
  const bykeas = fin.filter(d => d.riderType === 'bykea');
  const total = bykeas.reduce((s,d) => s+(d.finalFare||0), 0);
  const areas = [...new Set(bykeas.map(d=>d.toArea))];

  const getText = () => {
    let t = `🏢 *KHYBER TRADERS — Bykea / App Report*\n📅 ${fmtDate(range.start)} to ${fmtDate(range.end)}\n\n`;
    t += `Total Rides: ${bykeas.length}\nTotal Paid: Rs.${total.toLocaleString()}\nAreas Served: ${areas.length}\n\n`;
    if (bykeas.length > 0) {
      t += `*Trips:*\n`;
      bykeas.forEach(d => { t += `• ${d.partyName} — ${d.toArea}: Rs.${(d.finalFare||0).toLocaleString()} (${fmtDate(d.date)})\n`; });
    }
    t += `\n_Mazdoori Calculator App — Khyber Traders_`;
    return t;
  };

  return (
    <div className="space-y-3">
      <ReportCard title="Bykea / App Report">
        <StatRow label="Total Rides" value={bykeas.length} />
        <StatRow label="Total Paid" value={`Rs.${total.toLocaleString()}`} />
        <StatRow label="Areas Served" value={areas.length} />
      </ReportCard>
      {bykeas.length > 0 && (
        <ReportCard title="Bykea Trips">
          {bykeas.map(d => (
            <div key={d.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
              <div><div className="text-[10px] font-black text-slate-800 uppercase">{d.partyName}</div>
                <div className="text-[9px] text-slate-400 font-bold">{d.toArea} · {fmtDate(d.date)}</div></div>
              <span className="font-black text-blue-700 text-sm">Rs.{(d.finalFare||0).toLocaleString()}</span>
            </div>
          ))}
        </ReportCard>
      )}
      <ShareBtn getText={getText} showToast={showToast} />
    </div>
  );
}

function ReportArea({ fin, range, showToast }) {
  const areaMap = {};
  fin.forEach(d => {
    const a = d.toArea || 'Unknown';
    if (!areaMap[a]) areaMap[a] = { count: 0, fare: 0 };
    areaMap[a].count++;
    areaMap[a].fare += d.finalFare || 0;
  });
  const sorted = Object.entries(areaMap).sort((a,b) => b[1].count - a[1].count);

  const getText = () => {
    let t = `🏢 *KHYBER TRADERS — Area-wise Report*\n📅 ${fmtDate(range.start)} to ${fmtDate(range.end)}\n\n`;
    sorted.forEach(([area, data]) => { t += `📍 ${area}: ${data.count} trip${data.count>1?'s':''} — Rs.${data.fare.toLocaleString()}\n`; });
    t += `\n_Mazdoori Calculator App — Khyber Traders_`;
    return t;
  };

  return (
    <div className="space-y-3">
      <ReportCard title="Area-wise Report">
        {sorted.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No data</p>}
        {sorted.map(([area, data]) => (
          <StatRow key={area} label={area} value={`${data.count} trip${data.count>1?'s':''}`} sub={`Rs.${data.fare.toLocaleString()}`} />
        ))}
      </ReportCard>
      {sorted.length > 0 && <ShareBtn getText={getText} showToast={showToast} />}
    </div>
  );
}

function ReportCOD({ fin, riders, range, showToast }) {
  const codEntries = fin.filter(d => d.codAmount > 0);
  const riderIds = [...new Set(codEntries.map(d=>d.riderId))];

  const getText = () => {
    let t = `🏢 *KHYBER TRADERS — COD Recovery Report*\n📅 ${fmtDate(range.start)} to ${fmtDate(range.end)}\n\n`;
    riderIds.forEach(rid => {
      const rDisps = codEntries.filter(d=>d.riderId===rid);
      const r = riders.find(x=>x.id===rid);
      const name = r?.name || rDisps[0]?.riderName || rid;
      const total = rDisps.reduce((s,d)=>s+(d.codAmount||0),0);
      const collected = rDisps.filter(d=>d.codCollected).reduce((s,d)=>s+(d.codAmount||0),0);
      const pendingTrips = rDisps.filter(d=>!d.codCollected);
      t += `👤 *${name}*\nTotal Carried: Rs.${total.toLocaleString()}\nCollected: Rs.${collected.toLocaleString()}\nOutstanding: Rs.${(total-collected).toLocaleString()}`;
      if (pendingTrips.length > 0) t += `\n⚠️ ${pendingTrips.length} pending trip${pendingTrips.length>1?'s':''}`;
      t += `\n\n`;
    });
    t += `_Mazdoori Calculator App — Khyber Traders_`;
    return t;
  };

  return (
    <div className="space-y-3">
      {riderIds.map(rid => {
        const rDisps = codEntries.filter(d=>d.riderId===rid);
        const r = riders.find(x=>x.id===rid);
        const name = r?.name || rDisps[0]?.riderName || rid;
        const total = rDisps.reduce((s,d)=>s+(d.codAmount||0),0);
        const collected = rDisps.filter(d=>d.codCollected).reduce((s,d)=>s+(d.codAmount||0),0);
        const pending = rDisps.filter(d=>!d.codCollected);
        return (
          <ReportCard key={rid} title={`COD — ${name}`}>
            <StatRow label="Total Carried" value={`Rs.${total.toLocaleString()}`} />
            <StatRow label="Collected" value={`Rs.${collected.toLocaleString()}`} />
            <StatRow label="Outstanding" value={`Rs.${(total-collected).toLocaleString()}`} />
            {pending.length > 0 && <div className="mt-2 text-[9px] font-black text-red-500 uppercase">{pending.length} pending trip{pending.length>1?'s':''}</div>}
          </ReportCard>
        );
      })}
      {riderIds.length === 0 && <p className="text-slate-400 text-sm text-center py-6">No COD entries for this period</p>}
      {riderIds.length > 0 && <ShareBtn getText={getText} showToast={showToast} />}
    </div>
  );
}

function ReportCost({ fin, range, showToast }) {
  const groups = { bike: fin.filter(d=>d.riderType==='bike'), rickshaw: fin.filter(d=>d.riderType==='rickshaw'), bykea: fin.filter(d=>d.riderType==='bykea') };
  const cpk = (arr) => {
    const totalKm = arr.reduce((s,d)=>s+(d.distanceKm||0),0);
    const totalFare = arr.reduce((s,d)=>s+(d.finalFare||0),0);
    return totalKm > 0 ? (totalFare/totalKm).toFixed(1) : '—';
  };

  const getText = () =>
`🏢 *KHYBER TRADERS — Cost Analysis*
📅 ${fmtDate(range.start)} to ${fmtDate(range.end)}

💰 *Cost per km*
🟢 Bike: Rs.${cpk(groups.bike)}/km (${groups.bike.length} trips)
🟡 Rickshaw: Rs.${cpk(groups.rickshaw)}/km (${groups.rickshaw.length} trips)
🔵 Bykea/App: Rs.${cpk(groups.bykea)}/km (${groups.bykea.length} trips)

_Mazdoori Calculator App — Khyber Traders_`;

  return (
    <div className="space-y-3">
      <ReportCard title="Cost Analysis — Rs. per km">
        <StatRow label="Bike" value={`Rs.${cpk(groups.bike)}/km`} sub={`${groups.bike.length} trips`} />
        <StatRow label="Rickshaw" value={`Rs.${cpk(groups.rickshaw)}/km`} sub={`${groups.rickshaw.length} trips`} />
        <StatRow label="Bykea / App" value={`Rs.${cpk(groups.bykea)}/km`} sub={`${groups.bykea.length} trips`} />
      </ReportCard>
      <ShareBtn getText={getText} showToast={showToast} />
    </div>
  );
}

// Rider Profiles Manager
function RiderProfilesManager({ riders, dispatches, showToast }) {
  const [name, setName]     = useState('');
  const [pin, setPin]       = useState('');
  const [type, setType]     = useState('bike');
  const [isBykea, setIsBykea] = useState(false);
  const [phone, setPhone]   = useState('');
  const [notes, setNotes]   = useState('');
  const [rTab, setRTab]     = useState('riders');

  const addRider = async () => {
    if (!name.trim() || !pin.trim()) { showToast('Name and PIN required', 'error'); return; }
    const id = `rider_${Date.now()}`;
    const roles = ['rider'];
    if (isBykea) roles.push('bykea_manager');
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'riders', id), {
      name: name.trim(), pin: pin.trim(), type, roles, phone: phone.trim(), notes: notes.trim(), active: true
    });
    setName(''); setPin(''); setPhone(''); setNotes(''); setIsBykea(false);
    showToast('Rider added');
  };

  const inputCls = "w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl font-bold text-sm outline-none focus:border-blue-500 text-slate-900";

  const nonAdmins = riders.filter(r => !r.roles?.includes('admin'));
  const rickList  = nonAdmins.filter(r => r.type === 'rickshaw');
  const shown     = rTab === 'riders' ? nonAdmins : rickList;

  return (
    <div className="space-y-4 pb-10">
      {/* Sub-tabs */}
      <div className="flex gap-2">
        <button onClick={()=>setRTab('riders')} className={`flex-1 py-2.5 text-[9px] font-black rounded-xl border-2 uppercase tracking-widest transition-all ${rTab==='riders'?'bg-blue-600 border-blue-600 text-white':'bg-white border-slate-200 text-slate-500'}`}>
          🟢 Riders ({nonAdmins.length})
        </button>
        <button onClick={()=>setRTab('rickshaws')} className={`flex-1 py-2.5 text-[9px] font-black rounded-xl border-2 uppercase tracking-widest transition-all ${rTab==='rickshaws'?'bg-amber-500 border-amber-500 text-white':'bg-white border-slate-200 text-slate-500'}`}>
          🟡 Rickshaws ({rickList.length})
        </button>
      </div>

      {/* Add Rider */}
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 space-y-3 shadow-sm">
        <h3 className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2"><Users size={14}/> Add New Rider</h3>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" className={inputCls} />
        <div className="grid grid-cols-2 gap-3">
          <input value={pin} onChange={e=>setPin(e.target.value)} placeholder="PIN (4-6 digits)" inputMode="numeric" maxLength={6} className={inputCls} />
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone number" className={inputCls} />
        </div>
        <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes (e.g. rickshaw reg, area)" className={inputCls} />
        <div className="flex gap-2">
          <button onClick={() => setType('bike')} className={`flex-1 py-2.5 text-[9px] font-black rounded-xl border-2 uppercase ${type==='bike'?'bg-blue-600 border-blue-600 text-white':'bg-slate-50 border-slate-100 text-slate-500'}`}>🟢 Bike</button>
          <button onClick={() => setType('rickshaw')} className={`flex-1 py-2.5 text-[9px] font-black rounded-xl border-2 uppercase ${type==='rickshaw'?'bg-amber-500 border-amber-500 text-white':'bg-slate-50 border-slate-100 text-slate-500'}`}>🟡 Rickshaw</button>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isBykea} onChange={e=>setIsBykea(e.target.checked)} className="w-4 h-4 accent-blue-600" />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Is Bykea Manager</span>
        </label>
        <button onClick={addRider} className="w-full bg-blue-700 text-white font-black py-3 rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs">Add Rider</button>
      </div>

      {/* Rider List filtered by active tab */}
      {shown.length === 0 && (
        <div className="text-center text-slate-400 text-xs font-bold py-8">No {rTab === 'riders' ? 'riders' : 'rickshaws'} yet</div>
      )}
      {shown.map(r => (
        <RiderProfileCard key={r.id} rider={r} dispatches={dispatches} showToast={showToast} />
      ))}
    </div>
  );
}

function RiderProfileCard({ rider: r, dispatches, showToast }) {
  const [editing, setEditing] = useState(false);
  const [eName, setEName]     = useState(r.name);
  const [ePin, setEPin]       = useState(r.pin);
  const [ePhone, setEPhone]   = useState(r.phone || '');
  const [eNotes, setENotes]   = useState(r.notes || '');
  const [eType, setEType]     = useState(r.type || 'bike');
  const [eBykea, setEBykea]   = useState(r.roles?.includes('bykea_manager') || false);

  const rDisps = dispatches.filter(d => d.riderId === r.id && d.entryStatus === 'finalized');

  const saveEdit = async () => {
    if (!eName.trim()) { showToast('Name required', 'error'); return; }
    const roles = ['rider'];
    if (eBykea) roles.push('bykea_manager');
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'riders', r.id), {
      name: eName.trim(),
      pin: ePin.trim(),
      phone: ePhone.trim(),
      notes: eNotes.trim(),
      type: eType,
      roles,
    });
    setEditing(false);
    showToast('Profile updated');
  };

  const removeRider = async () => {
    if (!window.confirm(`Remove ${r.name}?`)) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'riders', r.id));
    showToast('Rider removed');
  };

  const inp = "w-full bg-slate-50 border-2 border-slate-100 p-2.5 rounded-xl font-bold text-sm outline-none focus:border-blue-500 text-slate-900";

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="p-4 flex justify-between items-start">
        <div>
          <div className="font-black text-slate-900 uppercase">{r.name}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            {r.type === 'bike' ? '🟢 Bike' : '🟡 Rickshaw'}{r.roles?.includes('bykea_manager') ? ' · Bykea Manager' : ''}
          </div>
          {r.phone && <div className="text-[9px] font-bold text-blue-500 mt-0.5">{r.phone}</div>}
          {r.notes && <div className="text-[9px] font-bold text-slate-400 mt-0.5 italic">{r.notes}</div>}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setEditing(!editing)} className="bg-blue-50 text-blue-600 border border-blue-100 p-2 rounded-xl text-[9px] font-black">✏️</button>
          <button onClick={removeRider} className="text-red-300 hover:text-red-600 p-2 transition-colors"><Trash2 size={16}/></button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-4 pb-3 text-center">
        <div className="bg-slate-50 p-2 rounded-xl"><div className="text-[8px] font-black text-slate-400 uppercase">Trips</div><div className="font-black text-slate-700">{rDisps.length}</div></div>
        <div className="bg-slate-50 p-2 rounded-xl"><div className="text-[8px] font-black text-slate-400 uppercase">Freight</div><div className="font-black text-slate-700 text-xs">Rs.{rDisps.reduce((s,d)=>s+(d.finalFare||0),0).toLocaleString()}</div></div>
        <div className="bg-slate-50 p-2 rounded-xl"><div className="text-[8px] font-black text-slate-400 uppercase">COD</div><div className="font-black text-slate-700 text-xs">Rs.{rDisps.reduce((s,d)=>s+(d.codAmount||0),0).toLocaleString()}</div></div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="px-4 pb-4 border-t-2 border-blue-100 pt-3 space-y-3 bg-blue-50/30">
          <div className="text-[9px] font-black text-blue-700 uppercase tracking-widest">Edit Profile</div>
          <input value={eName} onChange={e=>setEName(e.target.value)} placeholder="Full Name" className={inp} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">PIN</label>
              <input value={ePin} onChange={e=>setEPin(e.target.value)} placeholder="PIN" inputMode="numeric" maxLength={6} className={inp} />
            </div>
            <div>
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Phone</label>
              <input value={ePhone} onChange={e=>setEPhone(e.target.value)} placeholder="Phone" className={inp} />
            </div>
          </div>
          <div>
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Notes (rickshaw reg, area etc.)</label>
            <input value={eNotes} onChange={e=>setENotes(e.target.value)} placeholder="Notes" className={inp} />
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setEType('bike')} className={`flex-1 py-2 text-[9px] font-black rounded-xl border-2 uppercase ${eType==='bike'?'bg-blue-600 border-blue-600 text-white':'bg-white border-slate-200 text-slate-500'}`}>🟢 Bike</button>
            <button onClick={()=>setEType('rickshaw')} className={`flex-1 py-2 text-[9px] font-black rounded-xl border-2 uppercase ${eType==='rickshaw'?'bg-amber-500 border-amber-500 text-white':'bg-white border-slate-200 text-slate-500'}`}>🟡 Rickshaw</button>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={eBykea} onChange={e=>setEBykea(e.target.checked)} className="w-4 h-4 accent-blue-600" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Bykea Manager</span>
          </label>
          <div className="flex gap-2">
            <button onClick={saveEdit} className="flex-1 bg-blue-700 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest active:scale-95">Save</button>
            <button onClick={()=>setEditing(false)} className="px-5 bg-slate-100 text-slate-600 font-black py-3 rounded-2xl text-[10px] uppercase">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Rides Settings
const RICKSHAW_TEMPLATE_AREAS = [
  // Bhains Colony
  { area: 'Bhains Colony', notes: 'Landhi' },
  // Super Highway
  { area: 'Jameel Memon Society (S/W)', notes: 'Super Highway' },
  { area: '52 Acre Scheme (S/W)', notes: 'Super Highway' },
  { area: 'Nagori Society (S/W)', notes: 'Super Highway' },
  { area: 'Areesha Cattle Society (S/W)', notes: 'Super Highway' },
  { area: 'Karachi Dairy & Cattle City (S/W)', notes: 'Super Highway' },
  { area: 'Dumba Goth (S/W)', notes: 'Super Highway' },
  { area: 'Ramzan Piri (S/W)', notes: 'Super Highway' },
  { area: 'Solangi Stop (S/W)', notes: 'Super Highway' },
  { area: 'Hashim Goth (S/W)', notes: 'Super Highway' },
  // Gadap
  { area: 'Abdullah Hotel — Gadap', notes: 'Gadap' },
  { area: 'TOMCL — Organic Meat Co. Gadap', notes: 'Gadap' },
  { area: 'Jumani Goth — Gadap', notes: 'Gadap' },
  { area: 'GFA Farms — Gadap', notes: 'Gadap' },
  // Landhi
  { area: 'Khurram Abad — Landhi', notes: 'Landhi' },
  { area: 'Army Land — Landhi', notes: 'Landhi' },
  { area: 'Navy Land — Landhi', notes: 'Landhi' },
  { area: 'Babar Market — Landhi', notes: 'Landhi' },
  // Gulberg
  { area: 'Piyala Hotel — Gulberg', notes: 'Gulberg' },
  // Orangi
  { area: 'Orangi Town', notes: 'دیگر' },
  // Saddar
  { area: 'Cantt Train Station — Saddar', notes: 'Saddar' },
  { area: 'Daewoo Terminal — Saddar', notes: 'Saddar' },
  { area: 'Shalimar Terminal — Saddar', notes: 'Saddar' },
  { area: 'Faisal Movers — Saddar', notes: 'Saddar' },
  { area: 'Intercity Bus Terminal — Saddar', notes: 'Saddar' },
  // Goods Transport
  { area: 'Kharadar Transport Area', notes: 'Goods Transport' },
  { area: 'Maripur / Hawksbay', notes: 'Goods Transport' },
  // DHA
  { area: 'DHA Phase 1', notes: 'DHA' },
  { area: 'DHA Phase 2', notes: 'DHA' },
  { area: 'DHA Phase 3', notes: 'DHA' },
  { area: 'DHA Phase 4', notes: 'DHA' },
  { area: 'DHA Phase 5', notes: 'DHA' },
  { area: 'DHA Phase 6', notes: 'DHA' },
  { area: 'DHA Phase 7', notes: 'DHA' },
  { area: 'DHA Phase 8', notes: 'DHA' },
  { area: 'DHA City (Phase 9)', notes: 'DHA' },
  // Regular Routes
  { area: 'R17 Warehouse → Khyber Shop (Stock Transfer)', notes: 'Regular Route' },
  { area: 'Sohrab Goth Bus Adda → R17 Warehouse', notes: 'Regular Route' },
  // Gulshan
  { area: 'Gulshan Block 1', notes: 'Gulshan' },
  { area: 'Gulshan Block 2', notes: 'Gulshan' },
  { area: 'Gulshan Block 3', notes: 'Gulshan' },
  { area: 'Gulshan Block 4', notes: 'Gulshan' },
  { area: 'Gulshan Block 5', notes: 'Gulshan' },
  { area: 'Gulshan Block 6', notes: 'Gulshan' },
  { area: 'Gulshan Block 7', notes: 'Gulshan' },
  { area: 'Gulshan Block 8', notes: 'Gulshan' },
  { area: 'Gulshan Block 9', notes: 'Gulshan' },
  { area: 'Gulshan Block 10', notes: 'Gulshan' },
  { area: 'Gulshan Block 11', notes: 'Gulshan' },
  { area: 'Gulshan Block 12', notes: 'Gulshan' },
  { area: 'Gulshan Block 13', notes: 'Gulshan' },
  { area: 'Gulshan Block 14', notes: 'Gulshan' },
  { area: 'Gulshan Block 15', notes: 'Gulshan' },
  { area: 'Gulshan Block 16', notes: 'Gulshan' },
  { area: 'Gulshan Block 17', notes: 'Gulshan' },
  { area: 'Gulshan Block 18', notes: 'Gulshan' },
  { area: 'Gulshan Block 19', notes: 'Gulshan' },
  { area: 'Gulshan Block 20', notes: 'Gulshan' },
  { area: 'Gulshan Block 21', notes: 'Gulshan' },
  // Korangi
  { area: 'Korangi No. 1', notes: 'Korangi' },
  { area: 'Korangi No. 2', notes: 'Korangi' },
  { area: 'Korangi No. 3', notes: 'Korangi' },
  { area: 'Korangi No. 4', notes: 'Korangi' },
  { area: 'Korangi No. 5', notes: 'Korangi' },
  { area: 'Korangi No. 6', notes: 'Korangi' },
  { area: 'Korangi Industrial Area', notes: 'Korangi' },
  { area: 'Korangi Causeway', notes: 'Korangi' },
  { area: 'Korangi Creek', notes: 'Korangi' },
  // Other
  { area: 'Naval Colony', notes: 'دیگر' },
  { area: 'Mach Goth', notes: 'دیگر' },
  { area: 'Mangopir', notes: 'دیگر' },
];

function RickshawRateRow({ r, showToast }) {
  const [fare, setFare] = useState((r.farePerRickshaw || '').toString());
  const [dist, setDist] = useState((r.distanceKm || '').toString());
  const ref = () => doc(db, 'artifacts', appId, 'public', 'data', 'rickshawAreaRates', r.id);
  const urduName = URDU_AREA_NAMES[r.area];

  const saveFare = async () => {
    const amt = parseFloat(fare) || 0;
    if (amt === (r.farePerRickshaw || 0)) return;
    await updateDoc(ref(), { farePerRickshaw: amt });
    showToast(`${urduName || r.area} — Rs.${amt} محفوظ`);
  };

  const saveDist = async () => {
    const km = parseFloat(dist) || 0;
    if (km === (r.distanceKm || 0)) return;
    await updateDoc(ref(), { distanceKm: km });
    showToast(`${urduName || r.area} — ${km} km محفوظ`);
  };

  const del = async () => {
    if (!window.confirm(`"${urduName || r.area}" حذف کریں؟`)) return;
    await deleteDoc(ref());
  };

  const numInp = (extra) => `bg-slate-50 border-2 p-1.5 rounded-xl font-black text-sm text-right outline-none ${extra}`;

  return (
    <div className="bg-white border-2 border-amber-100 rounded-2xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <button onClick={del} className="text-red-200 hover:text-red-500 p-1 transition-colors shrink-0"><Trash2 size={13}/></button>
        <div className="text-right flex-1 min-w-0 px-2">
          <div className="font-black text-slate-800 text-sm" style={{fontFamily:"'Noto Nastaliq Urdu', serif"}}>{urduName || r.area}</div>
          {urduName && <div className="text-[8px] font-bold text-slate-400 truncate">{r.area}</div>}
        </div>
      </div>
      <div className="flex gap-2" dir="ltr">
        <div className="flex-1">
          <div className="text-[8px] font-black text-amber-600 mb-0.5">کرایہ / Rs.</div>
          <input type="number" value={fare} onChange={e => setFare(e.target.value)}
            onBlur={saveFare} onKeyDown={e => e.key === 'Enter' && e.target.blur()} placeholder="0"
            className={numInp('w-full border-amber-200 text-amber-700 focus:border-amber-500')} />
        </div>
        <div className="w-24">
          <div className="text-[8px] font-black text-blue-500 mb-0.5">مسافت / km</div>
          <input type="number" value={dist} onChange={e => setDist(e.target.value)}
            onBlur={saveDist} onKeyDown={e => e.key === 'Enter' && e.target.blur()} placeholder="0"
            className={numInp('w-full border-blue-200 text-blue-700 focus:border-blue-500')} />
        </div>
      </div>
    </div>
  );
}

function RickshawRatesManager({ rickshawAreaRates, showToast }) {
  const [area, setArea]   = useState('');
  const [fare, setFare]   = useState('');
  const [notes, setNotes] = useState('');
  const [seeding, setSeeding] = useState(false);
  const inp = 'bg-white border-2 border-amber-200 p-2.5 rounded-xl font-bold text-sm outline-none focus:border-amber-400 text-slate-900 w-full';

  const addOne = async () => {
    if (!area.trim()) { showToast('علاقہ درج کریں / Enter area name', 'error'); return; }
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rickshawAreaRates', `rate_${Date.now()}`), {
      area: area.trim(), farePerRickshaw: parseFloat(fare) || 0, notes: notes.trim(), createdAt: Date.now(),
    });
    setArea(''); setFare(''); setNotes('');
    showToast('Area added');
  };

  const seedDefaults = async () => {
    const existingMap = Object.fromEntries(rickshawAreaRates.map(r => [r.area, r]));
    const toAdd = RICKSHAW_TEMPLATE_AREAS.filter(t => !existingMap[t.area]);
    const toUpdate = RICKSHAW_TEMPLATE_AREAS.filter(t => existingMap[t.area] && !existingMap[t.area].distanceKm && AREA_DISTANCES[t.area]);
    if (!toAdd.length && !toUpdate.length) { showToast('تمام علاقے پہلے سے موجود ہیں — کوئی تبدیلی نہیں ہوئی'); return; }
    setSeeding(true);
    const batch = writeBatch(db);
    toAdd.forEach(t => {
      const ref = doc(db, 'artifacts', appId, 'public', 'data', 'rickshawAreaRates', `rate_${Date.now()}_${Math.random().toString(36).slice(2,7)}`);
      batch.set(ref, { area: t.area, farePerRickshaw: 0, notes: t.notes, distanceKm: AREA_DISTANCES[t.area] || 0, createdAt: Date.now() });
    });
    toUpdate.forEach(t => {
      const existing = existingMap[t.area];
      batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'rickshawAreaRates', existing.id), { distanceKm: AREA_DISTANCES[t.area] });
    });
    await batch.commit();
    setSeeding(false);
    const msg = toAdd.length && toUpdate.length ? `${toAdd.length} نئے علاقے + ${toUpdate.length} مسافتیں اپ ڈیٹ — پرانے کرائے محفوظ`
                : toAdd.length ? `${toAdd.length} نئے علاقے شامل ہوئے — پرانے کرائے محفوظ ہیں`
                : `${toUpdate.length} علاقوں کی مسافت اپ ڈیٹ ہوئی`;
    showToast(msg);
  };

  // Group areas by notes category
  const grouped = rickshawAreaRates.reduce((acc, r) => {
    const key = r.notes || 'دیگر / Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});
  const groups = Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b));

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xl font-black text-amber-700" style={{fontFamily:"'Noto Nastaliq Urdu', serif"}}>رکشہ کرایہ</span>
        <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest" dir="ltr">Rickshaw Fixed Rates</span>
      </div>

      {/* Seed button */}
      <button onClick={seedDefaults} disabled={seeding}
        className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
        {seeding ? <RefreshCw size={13} className="animate-spin"/> : <DownloadCloud size={13}/>}
        {seeding ? 'لوڈ ہو رہا ہے...' : 'علاقے لوڈ کریں — Load Default Areas'}
      </button>
      <div className="text-[9px] text-amber-600 font-bold text-center -mt-2">
        صرف نئے علاقے شامل ہوں گے — پرانے کرائے محفوظ رہیں گے
      </div>

      {/* Add custom area */}
      <div className="bg-white border-2 border-amber-100 rounded-2xl p-3 space-y-2">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">+ Custom Area</div>
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Area name" value={area} onChange={e => setArea(e.target.value)} className={inp} />
          <input type="number" placeholder="Fare Rs." value={fare} onChange={e => setFare(e.target.value)} className={inp} />
        </div>
        <div className="flex gap-2">
          <input placeholder="Category / Notes" value={notes} onChange={e => setNotes(e.target.value)} className={`flex-1 ${inp}`} />
          <button onClick={addOne} className="bg-amber-500 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-widest active:scale-95 transition-all">Add</button>
        </div>
      </div>

      {/* Grouped rate list */}
      {groups.length === 0
        ? <div className="text-center text-amber-500 text-[10px] font-bold py-4">
            ابھی کوئی علاقہ نہیں — اوپر "علاقے لوڈ کریں" پر ٹیپ کریں
          </div>
        : groups.map(([category, items]) => (
            <div key={category} className="space-y-1.5">
              <div className="text-[9px] font-black text-amber-700 uppercase tracking-widest px-1 flex items-center gap-2">
                <span>{category}</span>
                <span className="text-amber-400">({items.length})</span>
              </div>
              {items.map(r => <RickshawRateRow key={r.id} r={r} showToast={showToast} />)}
            </div>
          ))
      }

      {groups.length > 0 && (
        <div className="text-[9px] text-amber-500 font-bold text-center pt-1">
          کرایہ بدلنے کے لیے Rs. باکس میں لکھیں اور Enter دبائیں
          <br/>Tap a fare field, type the amount, press Enter to save
        </div>
      )}
    </div>
  );
}

function RidesSettings({ dispatchSettings, rickshawAreaRates, showToast }) {
  const [bikeRate, setBikeRate] = useState(dispatchSettings.bikeRate || 55);
  const [rickshawRate, setRickshawRate] = useState(dispatchSettings.rickshawRate || 55);

  const save = async () => {
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'dispatch'), {
      bikeRate: Number(bikeRate), rickshawRate: Number(rickshawRate)
    });
    showToast('Rates saved');
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 space-y-4 shadow-sm">
        <h3 className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2"><Settings size={14}/> Fare Rates</h3>
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Bike Rate (Rs. per km)</label>
          <input type="number" value={bikeRate} onChange={e=>setBikeRate(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl font-black text-blue-700 text-lg outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Rickshaw Rate (Rs. per km)</label>
          <input type="number" value={rickshawRate} onChange={e=>setRickshawRate(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl font-black text-blue-700 text-lg outline-none focus:border-blue-500" />
        </div>
        <button onClick={save} className="w-full bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs">Save Rates</button>
      </div>

      <RickshawRatesManager rickshawAreaRates={rickshawAreaRates || []} showToast={showToast} />

      <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 text-[10px] font-bold text-slate-500 space-y-1">
        <div className="font-black text-slate-700 uppercase tracking-widest text-[9px] mb-2">Origins</div>
        {Object.values(DISPATCH_ORIGINS).filter(o=>o.id!=='custom').map(o => (
          <div key={o.id}><span className="font-black text-slate-700">{o.label}:</span> {o.address}</div>
        ))}
      </div>
    </div>
  );
}
