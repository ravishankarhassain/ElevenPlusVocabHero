
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard.tsx';
import WordList from './components/WordList.tsx';
import Game from './components/Game.tsx';
import Progress from './components/Progress.tsx';
import Settings from './components/Settings.tsx';
import { ChildProfile } from './types.ts';

const NavLink: React.FC<{ to: string; icon: string; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const activeClass = isActive 
    ? "bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary shadow-sm" 
    : "hover:bg-gray-100 dark:hover:bg-surface-dark/50 text-text-muted hover:text-text-main dark:hover:text-white";
  
  return (
    <Link to={to} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-display ${activeClass}`}>
      <span className="material-symbols-outlined text-[26px]">{icon}</span>
      <span className="font-semibold text-base whitespace-nowrap">{label}</span>
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode; profile: ChildProfile }> = ({ children, profile }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out, Hero? Your progress is saved!")) {
      alert("Logging out...");
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-sans">
      <aside className="hidden md:flex w-64 lg:w-72 flex-col justify-between border-r border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark p-6 z-50 shrink-0">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4 p-2">
            <div className="relative shrink-0">
              <img 
                src={profile.avatar} 
                alt="Initials Avatar" 
                className="rounded-full h-12 w-12 lg:h-14 lg:w-14 ring-4 ring-primary/10 object-cover shadow-sm" 
              />
              <div className="absolute -bottom-1 -right-1 bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-surface-dark shadow-sm font-display">
                LVL {profile.level}
              </div>
            </div>
            <div className="overflow-hidden">
              <h1 className="text-base lg:text-lg font-bold tracking-tight truncate font-display">{profile.name}</h1>
            </div>
          </div>
          <nav className="flex flex-col gap-1.5">
            <NavLink to="/" icon="grid_view" label="Dashboard" />
            <NavLink to="/list" icon="menu_book" label="Word List" />
            <NavLink to="/game" icon="stadia_controller" label="Play Game" />
            <NavLink to="/progress" icon="analytics" label="Progress" />
            <NavLink to="/settings" icon="settings" label="Settings" />
          </nav>
        </div>

        <div className="flex flex-col gap-4 mt-auto">
          <div className="rounded-3xl bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-green-900/10 dark:to-blue-900/10 p-4 lg:p-5 border border-primary/10">
            <div className="flex items-center justify-between mb-3 font-display">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">local_fire_department</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Hero Streak</span>
              </div>
              <span className="text-primary text-xs lg:text-sm font-bold">{profile.stats.streak} Days</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 lg:h-2 shadow-inner">
              <div className="bg-primary h-full rounded-full shadow-[0_0_8px_rgba(19,236,73,0.3)] transition-all duration-700" style={{width: '70%'}}></div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-4 px-4 py-3 rounded-xl transition-all text-red-500/80 hover:bg-red-50 dark:hover:bg-red-900/10 font-semibold font-display"
          >
            <span className="material-symbols-outlined text-[26px]">logout</span>
            <span className="text-base">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-background-light dark:bg-background-dark scroll-smooth">
        <header className="md:hidden flex justify-between items-center p-4 bg-white dark:bg-surface-dark sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 shadow-sm font-display">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-text-main dark:text-white">
            <span className="material-symbols-outlined text-3xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
          <span className="font-bold text-xl tracking-tight">11+ VOCAB HERO</span>
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-primary/10">
            <img src={profile.avatar} alt="profile" className="w-full h-full object-cover" />
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[73px] bg-background-light dark:bg-background-dark z-50 p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300 font-display">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 font-bold text-xl rounded-2xl bg-white dark:bg-surface-dark shadow-sm">
              <span className="material-symbols-outlined text-primary">grid_view</span> Dashboard
            </Link>
            <Link to="/list" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 font-bold text-xl rounded-2xl bg-white dark:bg-surface-dark shadow-sm">
              <span className="material-symbols-outlined text-primary">menu_book</span> Word List
            </Link>
            <Link to="/game" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 font-bold text-xl rounded-2xl bg-white dark:bg-surface-dark shadow-sm text-primary-dark">
              <span className="material-symbols-outlined">stadia_controller</span> Play Game
            </Link>
            <Link to="/progress" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 font-bold text-xl rounded-2xl bg-white dark:bg-surface-dark shadow-sm">
              <span className="material-symbols-outlined text-primary">analytics</span> Progress
            </Link>
            <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 font-bold text-xl rounded-2xl bg-white dark:bg-surface-dark shadow-sm">
              <span className="material-symbols-outlined text-primary">settings</span> Settings
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-4 p-4 font-bold text-xl rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-500 mt-auto">
              <span className="material-symbols-outlined">logout</span> Logout
            </button>
          </div>
        )}

        <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [activeProfile, setActiveProfile] = useState<ChildProfile>(() => {
    const saved = localStorage.getItem('vocabHero_activeProfile');
    return saved ? JSON.parse(saved) : {
      id: '1',
      name: 'Alex Hero',
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Alex&backgroundColor=f87171",
      level: 5,
      selectedCategories: [],
      stats: { masteredWords: 128, totalXp: 4500, streak: 5, accuracy: 88 },
      studyPlan: []
    };
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('vocabHero_activeProfile');
      if (saved) {
        setActiveProfile(JSON.parse(saved));
      }
    };
    window.addEventListener('vocabHero_profileUpdated', handleStorageChange);
    return () => window.removeEventListener('vocabHero_profileUpdated', handleStorageChange);
  }, []);

  return (
    <HashRouter>
      <Layout profile={activeProfile}>
        <Routes>
          <Route path="/" element={<Dashboard initialProfile={activeProfile} />} />
          <Route path="/list" element={<WordList />} />
          <Route path="/game" element={<Game />} />
          <Route path="/progress" element={<Progress profile={activeProfile} />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
