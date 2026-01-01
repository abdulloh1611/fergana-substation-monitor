
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, Measurement, Substation, Device, Language } from './types';
import { SUBSTATIONS as INITIAL_SUBSTATIONS, DEVICES as INITIAL_DEVICES } from './constants';
import { Sidebar } from './components/Sidebar';
import { VoltageChart } from './components/VoltageChart';
import * as XLSX from 'xlsx';

const translations = {
  en: {
    dashboard: "Dashboard",
    diary: "Daily Diary",
    mgmt: "Management",
    reports: "Reports",
    logout: "Sign Out",
    welcome: "Welcome",
    login: "Authenticate",
    user: "Username",
    pass: "Password",
    save: "Save Log",
    draft: "Save Draft",
    add_sub: "Add Substation",
    add_dev: "Add Device",
    settings: "Settings",
    delete: "Delete",
    export: "Export Excel",
    phases: { a: "Phase A", b: "Phase B", c: "Phase C" },
    grid_health: "Grid Vitals",
    compliance: "Compliance Center",
    unit_name: "Unit Name",
    location: "Location",
    operator_creds: "Operator Credentials",
    device_mgmt: "Device Management",
    new_device: "New Device Name"
  },
  uz: {
    dashboard: "Boshqaruv Paneli",
    diary: "Kunlik Kundalik",
    mgmt: "Boshqaruv",
    reports: "Hisobotlar",
    logout: "Chiqish",
    welcome: "Xush kelibsiz",
    login: "Kirish",
    user: "Foydalanuvchi nomi",
    pass: "Parol",
    save: "Saqlash",
    draft: "Qoralama",
    add_sub: "Podstansiya qo'shish",
    add_dev: "Qurilma qo'shish",
    settings: "Sozlamalar",
    delete: "O'chirish",
    export: "Excel Eksport",
    phases: { a: "A-faza", b: "B-faza", c: "C-faza" },
    grid_health: "Tarmoq holati",
    compliance: "Muvofiq markazi",
    unit_name: "Nomi",
    location: "Joylashuv",
    operator_creds: "Operator ma'lumotlari",
    device_mgmt: "Qurilmalarni boshqarish",
    new_device: "Yangi qurilma nomi"
  },
  ru: {
    dashboard: "Панель",
    diary: "Дневник",
    mgmt: "Управление",
    reports: "Отчеты",
    logout: "Выйти",
    welcome: "Добро пожаловать",
    login: "Авторизация",
    user: "Имя пользователя",
    pass: "Пароль",
    save: "Сохранить",
    draft: "Черновик",
    add_sub: "Добавить подстанцию",
    add_dev: "Добавить устройство",
    settings: "Настройки",
    delete: "Удалить",
    export: "Экспорт Excel",
    phases: { a: "Фаза A", b: "Фаза B", c: "Фаза C" },
    grid_health: "Состояние сети",
    compliance: "Центр отчетности",
    unit_name: "Название",
    location: "Локация",
    operator_creds: "Данные оператора",
    device_mgmt: "Управление устройствами",
    new_device: "Название нового устройства"
  },
  cr: {
    dashboard: "Tablo",
    diary: "Jounal",
    mgmt: "Jesyon",
    reports: "Rapò",
    logout: "Dekonekte",
    welcome: "Byenvini",
    login: "Log-in",
    user: "Non Itilizatè",
    pass: "Modpas",
    save: "Anrejistre",
    draft: "Bouyon",
    add_sub: "Ajoute Estasyon",
    add_dev: "Ajoute Aparèy",
    settings: "Paramèt",
    delete: "Efase",
    export: "Ekspòte Excel",
    phases: { a: "Faz A", b: "Faz B", c: "Faz C" },
    grid_health: "Sante Rezo",
    compliance: "Sant Konfòmite",
    unit_name: "Non Inite",
    location: "Kote",
    operator_creds: "Kredansyèl Operator",
    device_mgmt: "Jesyon Aparèy",
    new_device: "Non nouvo aparèy"
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('uz');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [substations, setSubstations] = useState<Substation[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState<{message: string, type: string, id: number}[]>([]);
  
  const [isSubstationModalOpen, setIsSubstationModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<Substation | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [subForm, setSubForm] = useState({ name: '', location: '', username: '', password: '' });
  const [newDeviceName, setNewDeviceName] = useState('');
  
  const [exportSettings, setExportSettings] = useState({
    substationId: 'all',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryForm, setEntryForm] = useState<{ [deviceId: string]: { a: string, b: string, c: string } }>({});

  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    const savedSubs = localStorage.getItem('fsm_substations');
    const savedDevs = localStorage.getItem('fsm_devices');
    const savedMeasures = localStorage.getItem('fsm_measurements');
    const savedDrafts = localStorage.getItem('fsm_draft_entry');

    if (savedSubs) {
      setSubstations(JSON.parse(savedSubs));
    } else {
      const subsWithCreds = INITIAL_SUBSTATIONS.map(s => ({ 
        ...s, 
        username: s.id, 
        password: 'password123', 
        status: 'active' as const 
      }));
      setSubstations(subsWithCreds);
      localStorage.setItem('fsm_substations', JSON.stringify(subsWithCreds));
    }

    if (savedDevs) {
      setDevices(JSON.parse(savedDevs));
    } else {
      setDevices(INITIAL_DEVICES);
      localStorage.setItem('fsm_devices', JSON.stringify(INITIAL_DEVICES));
    }

    if (savedMeasures) {
      setMeasurements(JSON.parse(savedMeasures));
    } else {
      const initial: Measurement[] = [{ 
        id: '1', 
        deviceId: 'dev-1', 
        phaseA: 218, 
        phaseB: 221, 
        phaseC: 220, 
        timestamp: new Date().toISOString(), 
        operatorId: 'admin' 
      }];
      setMeasurements(initial);
      localStorage.setItem('fsm_measurements', JSON.stringify(initial));
    }

    if (savedDrafts) setEntryForm(JSON.parse(savedDrafts));
  }, []);

  const updateSubstations = (newSubs: Substation[]) => {
    setSubstations(newSubs);
    localStorage.setItem('fsm_substations', JSON.stringify(newSubs));
  };

  const updateDevices = (newDevs: Device[]) => {
    setDevices(newDevs);
    localStorage.setItem('fsm_devices', JSON.stringify(newDevs));
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      const isAdmin = loginForm.username.toLowerCase() === 'admin' && loginForm.password === 'admin';
      const matchedSub = substations.find(s => s.username === loginForm.username && s.password === loginForm.password);

      if (isAdmin || matchedSub) {
        const user: User = {
          id: isAdmin ? 'adm1' : `op-${matchedSub?.id}`,
          login: loginForm.username,
          name: isAdmin ? 'Administrator' : `${matchedSub?.name} Operator`,
          role: isAdmin ? UserRole.ADMIN : UserRole.OPERATOR,
          substationId: matchedSub?.id || 'sub-1'
        };
        setCurrentUser(user);
        setActiveTab(user.role === UserRole.ADMIN ? 'dashboard' : 'entry');
        addToast(`${t.welcome}, ${user.name}`, 'success');
      } else {
        addToast('Kirish ma\'lumotlari xato', 'error');
      }
      setIsLoggingIn(false);
    }, 500);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ username: '', password: '' });
    setShowPassword(false);
    setActiveTab('dashboard'); 
    setIsMobileMenuOpen(false);
    setIsSettingsModalOpen(null);
    setIsSubstationModalOpen(false);
    setIsExportModalOpen(false);
    addToast('Xayr!', 'info');
  };

  const handleAddDevice = () => {
    if (!isSettingsModalOpen || !newDeviceName) return;
    const newDev: Device = {
      id: `dev-${Date.now()}`,
      name: newDeviceName,
      substationId: isSettingsModalOpen.id,
      type: 'Transformer'
    };
    const updated = [...devices, newDev];
    updateDevices(updated);
    setNewDeviceName('');
    addToast('Qurilma qo\'shildi', 'success');
  };

  const handleDeleteDevice = (id: string) => {
    const updated = devices.filter(d => d.id !== id);
    updateDevices(updated);
    addToast('Qurilma o\'chirildi', 'success');
  };

  const handleRenameDevice = (id: string, name: string) => {
    const updated = devices.map(d => d.id === id ? { ...d, name } : d);
    updateDevices(updated);
  };

  const handleDeleteSubstation = (id: string) => {
    if (confirm('Podstansiya o\'chirilsinmi?')) {
      const updatedSubs = substations.filter(s => s.id !== id);
      updateSubstations(updatedSubs);
      const updatedDevs = devices.filter(d => d.substationId !== id);
      updateDevices(updatedDevs);
      addToast('Podstansiya o\'chirildi', 'success');
    }
  };

  const handleSaveAll = () => {
    if (!currentUser) return;
    const newMeasurements: Measurement[] = [];
    Object.keys(entryForm).forEach(deviceId => {
      const vals = entryForm[deviceId];
      if (vals.a && vals.b && vals.c) {
        newMeasurements.push({
          id: Math.random().toString(36).substr(2, 9),
          deviceId,
          phaseA: parseFloat(vals.a),
          phaseB: parseFloat(vals.b),
          phaseC: parseFloat(vals.c),
          timestamp: new Date().toISOString(),
          operatorId: currentUser.login
        });
      }
    });
    if (newMeasurements.length === 0) return addToast('Ma\'lumotlar to\'ldirilmagan', 'error');
    const updated = [...newMeasurements, ...measurements];
    setMeasurements(updated);
    localStorage.setItem('fsm_measurements', JSON.stringify(updated));
    setEntryForm({});
    localStorage.removeItem('fsm_draft_entry');
    addToast('Ma\'lumotlar saqlandi', 'success');
  };

  const executeExport = () => {
    addToast('Tayyorlanmoqda...', 'info');
    let filtered = measurements;
    if (exportSettings.substationId !== 'all') {
      const subDevs = devices.filter(d => d.substationId === exportSettings.substationId).map(d => d.id);
      filtered = filtered.filter(m => subDevs.includes(m.deviceId));
    }
    const start = new Date(exportSettings.startDate).getTime();
    const end = new Date(exportSettings.endDate).getTime() + 86400000;
    filtered = filtered.filter(m => {
      const time = new Date(m.timestamp).getTime();
      return time >= start && time <= end;
    });
    const exportData = filtered.map(m => {
      const dev = devices.find(d => d.id === m.deviceId);
      const sub = substations.find(s => s.id === dev?.substationId);
      return {
        "Sana": new Date(m.timestamp).toISOString().split('T')[0],
        "Podstansiya": sub?.name || 'N/A',
        "Qurilma": dev?.name || 'N/A',
        "A-faza (V)": m.phaseA,
        "B-faza (V)": m.phaseB,
        "C-faza (V)": m.phaseC,
        "Operator": m.operatorId,
        "Vaqti": new Date(m.timestamp).toLocaleTimeString()
      };
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Substation Data");
    XLSX.writeFile(wb, `FSM_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    setIsExportModalOpen(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 blur-[100px] rounded-full"></div>

        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value as Language)}
            className="bg-slate-900 text-white rounded-lg px-3 py-1.5 font-bold outline-none border border-slate-800 text-xs focus:border-amber-500 transition-all"
          >
            <option value="uz">UZ</option>
            <option value="en">EN</option>
            <option value="ru">RU</option>
            <option value="cr">CR</option>
          </select>
        </div>

        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-500 relative z-10">
          <div className="text-center mb-8">
            <div className="bg-amber-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-400/20">
              <i className="fa-solid fa-bolt text-3xl text-slate-950"></i>
            </div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase mb-1">FSM FERGANA</h1>
            <p className="text-slate-500 font-bold uppercase text-[8px] tracking-[0.3em]">Grid Access Control</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.user}</label>
              <div className="relative">
                <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm"></i>
                <input 
                  type="text" 
                  value={loginForm.username} 
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 pl-12 text-base font-bold text-white focus:border-amber-400 outline-none transition-all placeholder:text-slate-700"
                  placeholder="ID Number"
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.pass}</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm"></i>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={loginForm.password} 
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 pl-12 pr-12 text-base font-bold text-white focus:border-amber-400 outline-none transition-all placeholder:text-slate-700"
                  placeholder="••••••••"
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-white text-slate-950 font-black py-4 rounded-xl shadow-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-3 active:scale-[0.98] text-base uppercase tracking-widest"
            >
              {isLoggingIn ? <i className="fa-solid fa-spinner animate-spin"></i> : <><i className="fa-solid fa-shield-check"></i> {t.login}</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const assignedDevices = devices.filter(d => d.substationId === currentUser.substationId);
  const substationName = substations.find(s => s.id === currentUser.substationId)?.name || 'Fergana Hub';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[900] md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <div className={`fixed inset-y-0 left-0 z-[1000] transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar 
          role={currentUser.role} 
          activeTab={activeTab} 
          onTabChange={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }} 
          onLogout={handleLogout} 
          lang={lang} 
        />
      </div>

      <div className="md:hidden flex justify-between items-center p-4 bg-slate-950 text-white shadow-xl sticky top-0 z-[500] border-b border-white/5">
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setIsMobileMenuOpen(true)}
             className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10"
           >
             <i className="fa-solid fa-bars text-xl text-amber-400"></i>
           </button>
           <span className="font-black text-lg tracking-tighter">FSM</span>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-black">
            {currentUser.name[0]}
          </div>
        </div>
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar relative">
        <header className="hidden md:flex justify-between items-center mb-8">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">
              {/* Fix: Explicitly map activeTab to specific string translation keys. Indexed access t[activeTab] could return the 'phases' object, causing a ReactNode error. */}
              {currentUser.role === UserRole.ADMIN 
                ? (activeTab === 'dashboard' ? t.dashboard : 
                   activeTab === 'admin' ? t.mgmt : 
                   activeTab === 'reports' ? t.reports : activeTab) 
                : t.diary}
            </h1>
            <p className="text-slate-400 font-black uppercase text-[8px] tracking-[0.2em] mt-1">{substationName}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-slate-200/50 p-1 rounded-lg">
               {(['uz', 'ru', 'en', 'cr'] as Language[]).map(l => (
                 <button 
                   key={l}
                   onClick={() => setLang(l)}
                   className={`px-2 py-1 rounded-md text-[9px] font-black transition-all ${lang === l ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   {l.toUpperCase()}
                 </button>
               ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-black text-slate-900 text-xs leading-none">{currentUser.name}</div>
                <div className="text-[8px] font-black text-indigo-500 uppercase mt-0.5">{currentUser.role}</div>
              </div>
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-amber-400 font-black text-lg">
                {currentUser.name[0]}
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && currentUser.role === UserRole.ADMIN && (
          <div className="space-y-6 animate-in fade-in duration-500 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <VoltageChart data={measurements.slice(0, 15)} />
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                   <div className="p-4 border-b border-slate-50 bg-slate-50/30">
                    <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Hozirgi ko'rsatkichlar</h3>
                   </div>
                   <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          <th className="px-4 py-3">Stansiya / Qurilma</th>
                          <th className="px-4 py-3 text-rose-500">A (V)</th>
                          <th className="px-4 py-3 text-amber-500">B (V)</th>
                          <th className="px-4 py-3 text-blue-500">C (V)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {measurements.slice(0, 8).map(m => {
                          const dev = devices.find(d => d.id === m.deviceId);
                          const sub = substations.find(s => s.id === dev?.substationId);
                          return (
                            <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50 transition-all">
                              <td className="px-4 py-3">
                                <div className="font-black text-slate-900 text-xs uppercase">{sub?.name}</div>
                                <div className="text-[9px] text-indigo-600 font-black mt-0.5 tracking-tight">{dev?.name}</div>
                              </td>
                              <td className="px-4 py-3 font-mono font-black text-rose-500 text-sm">{m.phaseA.toFixed(1)}</td>
                              <td className="px-4 py-3 font-mono font-black text-amber-500 text-sm">{m.phaseB.toFixed(1)}</td>
                              <td className="px-4 py-3 font-mono font-black text-blue-500 text-sm">{m.phaseC.toFixed(1)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                   </div>
                </div>
              </div>
              <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl h-fit">
                <h3 className="text-amber-400 font-black text-[9px] uppercase tracking-[0.3em] mb-6">{t.grid_health}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <span className="text-slate-500 font-black uppercase text-[10px]">Ro'yxatda</span>
                    <span className="font-black text-xl tracking-tighter">{substations.length} Stansiya</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-black uppercase text-[10px]">Tizim</span>
                    <span className="font-black text-sm text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-lg">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'entry' && (
          <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-6">
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
              <div className="p-6 md:p-8 bg-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center text-white gap-4">
                <div className="space-y-1">
                  <h2 className="font-black text-lg md:text-xl tracking-tight uppercase leading-none">{substationName}</h2>
                  <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest">{new Date(entryDate).toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <input 
                   type="date" 
                   value={entryDate} 
                   onChange={(e) => setEntryDate(e.target.value)} 
                   className="bg-slate-800 text-white rounded-xl px-4 py-2 font-black outline-none border border-slate-700 text-sm w-full md:w-auto focus:border-amber-400 transition-all" 
                />
              </div>
              <div className="p-4 md:p-8 divide-y divide-slate-100">
                {assignedDevices.map(dev => (
                  <div key={dev.id} className="py-6 md:py-10 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-slate-950 w-12 h-12 rounded-xl flex items-center justify-center text-amber-400 text-xl shadow-lg">
                        <i className="fa-solid fa-microchip"></i>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-950 text-lg md:text-xl uppercase tracking-tighter leading-none mb-1">{dev.name}</h4>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">{dev.type}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      {['a', 'b', 'c'].map(p => (
                        <div key={p} className="space-y-1.5">
                          <label className={`text-[9px] font-black uppercase tracking-widest block ml-1 ${p==='a'?'text-rose-600':p==='b'?'text-amber-600':'text-blue-600'}`}>{t.phases[p as keyof typeof t.phases]}</label>
                          <div className="relative group">
                            <input 
                              type="number" 
                              step="0.1" 
                              value={entryForm[dev.id]?.[p as 'a'|'b'|'c'] || ''}
                              onChange={e => setEntryForm({...entryForm, [dev.id]: {...(entryForm[dev.id] || {a:'',b:'',c:''}), [p]: e.target.value}})}
                              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 md:p-5 text-2xl font-mono font-black text-slate-950 focus:border-indigo-400 focus:bg-white outline-none transition-all placeholder:text-slate-200 shadow-inner"
                              placeholder="0.0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-200 text-xl pointer-events-none opacity-50">V</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row gap-4">
                <button 
                   onClick={handleSaveAll} 
                   className="flex-[2] bg-slate-950 text-amber-400 font-black py-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all text-lg uppercase tracking-widest active:scale-95 flex items-center justify-center gap-3"
                >
                  <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
                  {t.save}
                </button>
                <button 
                   onClick={() => { localStorage.setItem('fsm_draft_entry', JSON.stringify(entryForm)); addToast(t.draft, 'info'); }} 
                   className="flex-1 bg-white text-slate-500 font-black py-4 rounded-2xl border-2 border-slate-200 hover:bg-slate-100 transition-all uppercase tracking-widest active:scale-95 text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                  <i className="fa-solid fa-bookmark text-base"></i>
                  {t.draft}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && currentUser.role === UserRole.ADMIN && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Infrastruktura</h2>
                <p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.3em] mt-1">Hududiy podstansiyalar</p>
              </div>
              <button 
                onClick={() => { setSubForm({name:'', location:'', username:'', password:''}); setIsSubstationModalOpen(true); }} 
                className="w-full md:w-auto bg-slate-950 text-white px-6 py-3 rounded-xl font-black shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 text-sm tracking-tight"
              >
                <i className="fa-solid fa-plus-circle text-lg"></i>
                {t.add_sub.toUpperCase()}
              </button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {substations.map(s => (
                <div key={s.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-col hover:shadow-xl transition-all group">
                   <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-6 group-hover:bg-slate-950 group-hover:text-amber-400 transition-colors">
                    <i className="fa-solid fa-tower-observation text-xl"></i>
                   </div>
                   <h3 className="font-black text-lg text-slate-900 mb-1 tracking-tight uppercase leading-tight">{s.name}</h3>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-8">{s.location}</p>
                   <div className="mt-auto flex gap-3">
                    <button 
                       onClick={() => { setSubForm({name: s.name, location: s.location, username: s.username||'', password: s.password||''}); setIsSettingsModalOpen(s); }} 
                       className="flex-1 bg-slate-950 text-white font-black py-3 rounded-xl hover:bg-slate-800 transition-all text-[10px] uppercase shadow-md active:scale-95"
                    >
                      <i className="fa-solid fa-cog mr-2"></i>
                      {t.settings}
                    </button>
                    <button 
                       onClick={() => handleDeleteSubstation(s.id)} 
                       className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center active:scale-90"
                    >
                      <i className="fa-solid fa-trash-can text-sm"></i>
                    </button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && currentUser.role === UserRole.ADMIN && (
          <div className="max-w-xl mx-auto space-y-6 animate-in zoom-in-95 duration-500 pb-10">
            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center flex flex-col items-center group overflow-hidden relative">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center text-5xl mb-8 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                <i className="fa-solid fa-file-excel"></i>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">{t.export}</h2>
              <p className="text-slate-400 font-black mb-10 px-6 leading-relaxed text-sm max-w-sm italic uppercase tracking-tight">
                XLSX Excel hisoboti. Har bir qurilma uchun mustaqil qator va fazalar uchun ustunlar.
              </p>
              <button 
                 onClick={() => setIsExportModalOpen(true)} 
                 className="w-full bg-emerald-600 text-white font-black py-5 rounded-3xl shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all text-xl uppercase tracking-widest flex items-center justify-center gap-4 active:scale-95"
              >
                <i className="fa-solid fa-download text-2xl"></i>
                YUKLASH (.XLSX)
              </button>
            </div>
          </div>
        )}
      </main>

      {(isSubstationModalOpen || isSettingsModalOpen) && (
        <div className="fixed inset-0 z-[3000] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-10 animate-in zoom-in-95 duration-300 relative my-auto">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">{isSettingsModalOpen ? t.settings : t.add_sub}</h2>
              <button 
                 onClick={() => { setIsSubstationModalOpen(false); setIsSettingsModalOpen(null); }} 
                 className="text-slate-300 hover:text-rose-500 transition-colors"
              >
                <i className="fa-solid fa-circle-xmark text-4xl"></i>
              </button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              if (isSettingsModalOpen) {
                const updated = substations.map(s => s.id === isSettingsModalOpen.id ? { ...s, ...subForm } : s);
                updateSubstations(updated);
                setIsSettingsModalOpen(null);
                addToast('Yangilandi', 'success');
              } else {
                const newS: Substation = { 
                  id: `sub-${Date.now()}`, 
                  name: subForm.name, 
                  location: subForm.location, 
                  username: subForm.username||`user_${Date.now()}`, 
                  password: subForm.password||'pass123', 
                  status: 'active' 
                };
                updateSubstations([...substations, newS]);
                setIsSubstationModalOpen(false);
                addToast('Qo\'shildi', 'success');
              }
            }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.unit_name}</label>
                  <input 
                     type="text" 
                     placeholder="Nomi" 
                     value={subForm.name} 
                     onChange={(e) => setSubForm({...subForm, name: e.target.value})} 
                     className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 font-black text-base text-slate-900 focus:border-indigo-400 outline-none transition-all shadow-inner" 
                     required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.location}</label>
                  <input 
                     type="text" 
                     placeholder="Markaz" 
                     value={subForm.location} 
                     onChange={(e) => setSubForm({...subForm, location: e.target.value})} 
                     className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 font-black text-base text-slate-900 focus:border-indigo-400 outline-none transition-all shadow-inner" 
                     required 
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-3xl space-y-6 shadow-xl">
                 <h4 className="text-amber-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">
                   <i className="fa-solid fa-key"></i> {t.operator_creds}
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                     type="text" 
                     placeholder={t.user} 
                     value={subForm.username} 
                     onChange={(e) => setSubForm({...subForm, username: e.target.value})} 
                     className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm font-black outline-none focus:border-amber-400 transition-all placeholder:text-slate-600 shadow-inner" 
                  />
                  <input 
                     type="text" 
                     placeholder={t.pass} 
                     value={subForm.password} 
                     onChange={(e) => setSubForm({...subForm, password: e.target.value})} 
                     className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm font-black outline-none focus:border-amber-400 transition-all placeholder:text-slate-600 shadow-inner" 
                  />
                 </div>
              </div>

              {isSettingsModalOpen && (
                <div className="bg-slate-50 p-6 rounded-2xl space-y-6 border border-slate-100 shadow-inner">
                  <h4 className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">
                    <i className="fa-solid fa-microchip text-slate-900"></i> {t.device_mgmt}
                  </h4>
                  <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {devices.filter(d => d.substationId === isSettingsModalOpen.id).map(dev => (
                      <div key={dev.id} className="flex gap-4 items-center bg-white p-3 rounded-xl shadow-sm border border-slate-100 animate-in slide-in-from-left-4">
                        <input 
                           type="text" 
                           value={dev.name} 
                           onChange={(e) => handleRenameDevice(dev.id, e.target.value)} 
                           className="flex-1 font-black text-indigo-950 text-sm outline-none bg-transparent uppercase tracking-tight" 
                        />
                        <button type="button" onClick={() => handleDeleteDevice(dev.id)} className="text-rose-500 active:scale-90">
                           <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input 
                       type="text" 
                       placeholder={t.new_device} 
                       value={newDeviceName} 
                       onChange={(e) => setNewDeviceName(e.target.value)} 
                       className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-black text-sm text-slate-900 outline-none focus:border-indigo-400 shadow-sm transition-all" 
                    />
                    <button 
                       type="button" 
                       onClick={handleAddDevice} 
                       className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-all"
                    >
                       {t.add_dev}
                    </button>
                  </div>
                </div>
              )}

              <button 
                 type="submit" 
                 className="w-full bg-slate-950 text-amber-400 font-black py-5 rounded-2xl shadow-2xl hover:bg-slate-800 transition-all text-xl uppercase tracking-widest active:scale-95"
              >
                SAQLASH
              </button>
            </form>
          </div>
        </div>
      )}

      {isExportModalOpen && (
        <div className="fixed inset-0 z-[3000] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-8 md:p-10 animate-in zoom-in-95 duration-300 my-auto">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Eksport</h2>
              <button onClick={() => setIsExportModalOpen(false)} className="text-slate-300 hover:text-rose-500 transition-colors">
                 <i className="fa-solid fa-circle-xmark text-4xl"></i>
              </button>
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Stansiya</label>
                <div className="relative">
                  <select 
                     value={exportSettings.substationId} 
                     onChange={(e) => setExportSettings({...exportSettings, substationId: e.target.value})} 
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-sm text-slate-900 outline-none focus:border-emerald-400 cursor-pointer appearance-none shadow-inner"
                  >
                    <option value="all">BARCHA HUDUDIY PODSTANSIYALAR</option>
                    {substations.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-sm"></i>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Boshlash</label>
                  <input 
                     type="date" 
                     value={exportSettings.startDate} 
                     onChange={(e) => setExportSettings({...exportSettings, startDate: e.target.value})} 
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-xs outline-none focus:border-emerald-400 shadow-inner" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tugash</label>
                  <input 
                     type="date" 
                     value={exportSettings.endDate} 
                     onChange={(e) => setExportSettings({...exportSettings, endDate: e.target.value})} 
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-xs outline-none focus:border-emerald-400 shadow-inner" 
                  />
                </div>
              </div>
              <button 
                 onClick={executeExport} 
                 className="w-full bg-emerald-600 text-white font-black py-6 rounded-3xl shadow-2xl hover:bg-emerald-700 transition-all text-xl active:scale-95 uppercase tracking-widest"
              >
                YUKLASH (.XLSX)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
