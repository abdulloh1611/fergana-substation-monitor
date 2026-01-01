
import React from 'react';
import { UserRole, Language } from '../types';

interface Props {
  role: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  lang?: Language;
}

const translations = {
  en: { dashboard: "Dashboard", diary: "Daily Diary", mgmt: "Infrastructure", reports: "Reports", logout: "Sign Out" },
  uz: { dashboard: "Panel", diary: "Kundalik", mgmt: "Tizim", reports: "Hisobot", logout: "Chiqish" },
  ru: { dashboard: "Панель", diary: "Дневник", mgmt: "Система", reports: "Отчеты", logout: "Выход" },
  cr: { dashboard: "Tablo", diary: "Jounal", mgmt: "Jesyon", reports: "Rapò", logout: "Soti" }
};

export const Sidebar: React.FC<Props> = ({ role, activeTab, onTabChange, onLogout, lang = 'uz' }) => {
  const t = translations[lang] || translations.uz;
  
  const tabs = [
    { id: 'dashboard', label: t.dashboard, icon: 'fa-gauge-high', roles: [UserRole.ADMIN] },
    { id: 'entry', label: t.diary, icon: 'fa-book-open', roles: [UserRole.OPERATOR] }, 
    { id: 'admin', label: t.mgmt, icon: 'fa-shield-halved', roles: [UserRole.ADMIN] },
    { id: 'reports', label: t.reports, icon: 'fa-file-excel', roles: [UserRole.ADMIN] },
  ];

  const visibleTabs = tabs.filter(tab => tab.roles.includes(role));

  return (
    <div className="flex flex-col w-64 md:w-72 bg-slate-950 text-white h-screen shadow-2xl z-[1000] border-r border-white/5">
      <div className="p-8 md:p-10">
        <div className="flex items-center gap-4">
          <div className="bg-amber-400 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/10">
            <i className="fa-solid fa-bolt text-slate-950 text-xl"></i>
          </div>
          <div>
            <span className="font-black text-xl tracking-tighter text-white block leading-none">FSM</span>
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1">Fergana Grid</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-6 py-4">
        <div className="text-[9px] font-black text-slate-800 uppercase tracking-[0.3em] mb-8 ml-4">Monitoring Center</div>
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl mb-3 transition-all group ${
              activeTab === tab.id 
              ? 'bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/10' 
              : 'text-slate-500 hover:text-white hover:bg-white/5 font-black'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab === tab.id ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 text-slate-500 group-hover:bg-slate-800 group-hover:text-white'}`}>
              <i className={`fa-solid ${tab.icon} text-base`}></i>
            </div>
            <span className="text-xs uppercase tracking-[0.1em]">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-8 border-t border-white/5">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-5 py-4 text-slate-500 hover:text-rose-400 transition-all font-black text-xs uppercase tracking-widest group"
        >
          <div className="w-10 h-10 bg-slate-900 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-rose-500/10 group-hover:text-rose-500 transition-all">
            <i className="fa-solid fa-right-from-bracket"></i>
          </div>
          {t.logout}
        </button>
        <div className="mt-8 text-center">
          <p className="text-[7px] font-black text-slate-800 uppercase tracking-[0.3em]">Region 47 - System v2.5</p>
        </div>
      </div>
    </div>
  );
};
