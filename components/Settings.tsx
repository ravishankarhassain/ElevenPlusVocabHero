
import React, { useState, useEffect } from 'react';
import { WordCategory, ChildProfile, StudyTask } from '../types';

const WORD_CATEGORIES: WordCategory[] = [
  'Describing Emotion',
  'Giving People Instruction',
  'Persuade people',
  'Delicious Describing',
  'Less Dramatic doing Words',
  'More Dramatic doing Words',
  'General Word Groups',
  'Exciting Words',
  'Sound Onomatopoeia',
  'Intelligent Words'
];

const AVATAR_COLORS = [
  { name: 'Power Red', hex: 'f87171' },
  { name: 'Stark Gold', hex: 'fbbf24' },
  { name: 'Eco Green', hex: '4ade80' },
  { name: 'Sky Blue', hex: '60a5fa' },
  { name: 'Magic Purple', hex: 'a78bfa' },
  { name: 'Deep Pink', hex: 'f472b6' },
  { name: 'Solar Orange', hex: 'fb923c' },
  { name: 'Cool Slate', hex: '94a3b8' },
];

const COLOR_SCHEMES = [
  { name: 'Heroic Red', primary: '#ef4444', dark: '#b91c1c' },
  { name: 'Stark Gold', primary: '#fbbf24', dark: '#d97706' },
  { name: 'Eco Green', primary: '#13ec49', dark: '#0ea332' },
  { name: 'Sky Blue', primary: '#3b82f6', dark: '#1d4ed8' },
  { name: 'Magic Purple', primary: '#a855f7', dark: '#7e22ce' },
];

const Settings: React.FC = () => {
  const [view, setView] = useState<'child' | 'parent'>('child');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  
  // New Child Form State
  const [newChildName, setNewChildName] = useState('');
  const [newChildLevel, setNewChildLevel] = useState(4);
  const [newChildCategories, setNewChildCategories] = useState<WordCategory[]>([]);
  
  const [profiles, setProfiles] = useState<ChildProfile[]>(() => {
    const saved = localStorage.getItem('vocabHero_profiles');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'Alex Hero',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Alex&backgroundColor=${AVATAR_COLORS[0].hex}`,
        level: 5,
        selectedCategories: ['Intelligent Words', 'Exciting Words'],
        stats: { masteredWords: 128, totalXp: 4500, streak: 5, accuracy: 88 },
        studyPlan: [
          { id: 't1', task: 'Complete 5 Word Challenges', isCompleted: false },
          { id: 't2', task: 'Master 3 words from "Intelligent Words"', isCompleted: false }
        ]
      }
    ];
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    const saved = localStorage.getItem('vocabHero_activeProfile');
    return saved ? JSON.parse(saved).id : '1';
  });

  const [activeColorScheme, setActiveColorScheme] = useState(() => {
    return localStorage.getItem('vocabHero_colorScheme') || 'Heroic Red';
  });

  useEffect(() => {
    localStorage.setItem('vocabHero_profiles', JSON.stringify(profiles));
    const active = profiles.find(p => p.id === activeProfileId) || profiles[0];
    localStorage.setItem('vocabHero_activeProfile', JSON.stringify(active));
    window.dispatchEvent(new Event('vocabHero_profileUpdated'));
  }, [profiles, activeProfileId]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const changeColorScheme = (schemeName: string) => {
    const scheme = COLOR_SCHEMES.find(s => s.name === schemeName);
    if (scheme) {
      document.documentElement.style.setProperty('--primary-color', scheme.primary);
      document.documentElement.style.setProperty('--primary-dark', scheme.dark);
      setActiveColorScheme(schemeName);
      localStorage.setItem('vocabHero_colorScheme', schemeName);
    }
  };

  const handleUpdateAvatar = (colorHex: string) => {
    const newAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeProfile.name)}&backgroundColor=${colorHex}`;
    setProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, avatar: newAvatar } : p));
  };

  const handleUpdateName = (newName: string) => {
    setProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, name: newName } : p));
  };

  const handleUpdateLevel = (newLevel: number) => {
    setProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, level: newLevel } : p));
  };

  const toggleCategory = (cat: WordCategory) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        const categories = p.selectedCategories.includes(cat)
          ? p.selectedCategories.filter(c => c !== cat)
          : [...p.selectedCategories, cat];
        return { ...p, selectedCategories: categories };
      }
      return p;
    }));
  };

  const addStudyTask = () => {
    if (!newTaskInput.trim()) return;
    const newTask: StudyTask = {
      id: crypto.randomUUID(),
      task: newTaskInput,
      isCompleted: false
    };
    setProfiles(prev => prev.map(p => 
      p.id === activeProfileId ? { ...p, studyPlan: [...(p.studyPlan || []), newTask] } : p
    ));
    setNewTaskInput('');
  };

  const deleteStudyTask = (taskId: string) => {
    setProfiles(prev => prev.map(p => 
      p.id === activeProfileId ? { ...p, studyPlan: p.studyPlan.filter(t => t.id !== taskId) } : p
    ));
  };

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName) return;
    const initialColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)].hex;
    const newProfile: ChildProfile = {
      id: Date.now().toString(),
      name: newChildName,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newChildName)}&backgroundColor=${initialColor}`,
      level: newChildLevel,
      selectedCategories: newChildCategories,
      stats: { masteredWords: 0, totalXp: 0, streak: 0, accuracy: 0 },
      studyPlan: []
    };
    setProfiles([...profiles, newProfile]);
    setActiveProfileId(newProfile.id);
    setIsAddModalOpen(false);
    setNewChildName('');
    setNewChildCategories([]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Add Child Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <header className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-purple-50/50 dark:bg-purple-900/10">
              <div>
                <h2 className="text-2xl font-black text-purple-700 dark:text-purple-400">Add New Student</h2>
                <p className="text-sm text-text-muted font-medium">Create a new 11+ learning profile.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-white dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>
            <form onSubmit={handleAddChild} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-2">Student Full Name</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={newChildName}
                  onChange={e => setNewChildName(e.target.value)}
                  placeholder="e.g. Sarah Jones"
                  className="w-full p-5 bg-gray-50 dark:bg-background-dark rounded-2xl border-2 border-transparent focus:border-purple-500 outline-none text-xl font-bold transition-all"
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-2">Academic Year Group</label>
                <div className="flex gap-4">
                  {[4, 5, 6].map(yr => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setNewChildLevel(yr)}
                      className={`flex-1 py-4 rounded-2xl font-black transition-all border-3 ${newChildLevel === yr ? 'bg-purple-600 border-purple-600 text-white shadow-lg' : 'bg-white dark:bg-background-dark border-gray-100 dark:border-gray-800 text-text-muted hover:border-purple-200'}`}
                    >
                      Year {yr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-2">Initial Curriculum Focus</label>
                <div className="grid grid-cols-2 gap-3">
                  {WORD_CATEGORIES.map(cat => {
                    const isSelected = newChildCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewChildCategories(prev => isSelected ? prev.filter(c => c !== cat) : [...prev, cat])}
                        className={`p-4 rounded-xl text-left text-xs font-bold transition-all border-2 flex items-center gap-3 ${isSelected ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900/20' : 'bg-white dark:bg-background-dark border-gray-50 dark:border-gray-800 text-text-muted'}`}
                      >
                        <span className="material-symbols-outlined text-sm">{isSelected ? 'check_circle' : 'add_circle'}</span>
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-purple-600 text-white font-black text-xl rounded-2xl shadow-xl shadow-purple-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all mt-4">
                Confirm & Create Profile
              </button>
            </form>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-surface-dark p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-text-main dark:text-white">Learning Lab</h1>
          <p className="text-text-muted text-lg mt-1">Personalize student identities and study paths.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-background-dark p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner">
          <button 
            onClick={() => setView('child')}
            className={`px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${view === 'child' ? 'bg-primary text-black shadow-lg scale-105' : 'text-text-muted hover:text-text-main'}`}
          >
            <span className="material-symbols-outlined text-xl">face</span>
            Child Settings
          </button>
          <button 
            onClick={() => setView('parent')}
            className={`px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${view === 'parent' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'text-text-muted hover:text-text-main'}`}
          >
            <span className="material-symbols-outlined text-xl">supervisor_account</span>
            Parent View
          </button>
        </div>
      </header>

      {view === 'child' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Child View Left: Avatar Selection */}
          <div className="bg-white dark:bg-surface-dark rounded-[40px] p-10 shadow-xl border border-gray-100 dark:border-gray-800 space-y-10 flex flex-col items-center">
            <h2 className="text-2xl font-black flex items-center gap-3 self-start">
              <span className="material-symbols-outlined text-primary text-3xl">badge</span>
              Your Initials Badge
            </h2>
            <div className="relative group">
              <img src={activeProfile.avatar} alt="Current Initials Badge" className="w-56 h-56 rounded-full border-[10px] border-primary/10 shadow-2xl transition-all object-cover hover:scale-105 duration-500" />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-black font-black px-6 py-2 rounded-full border-4 border-white dark:border-surface-dark text-2xl shadow-xl">
                YEAR {activeProfile.level}
              </div>
            </div>
            <div className="w-full space-y-4">
              <p className="text-center text-xs font-black text-text-muted uppercase tracking-widest">Choose Your Power Color</p>
              <div className="grid grid-cols-4 gap-4 w-full pt-2">
                {AVATAR_COLORS.map((color, i) => {
                  const url = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeProfile.name)}&backgroundColor=${color.hex}`;
                  const isSelected = activeProfile.avatar === url;
                  return (
                    <button 
                      key={i} 
                      onClick={() => handleUpdateAvatar(color.hex)}
                      title={color.name}
                      className={`aspect-square rounded-2xl overflow-hidden border-4 transition-all hover:scale-110 active:scale-90 bg-white dark:bg-gray-800 ${isSelected ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={url} alt={color.name} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-dark rounded-[40px] p-10 shadow-xl border border-gray-100 dark:border-gray-800 space-y-10">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">palette</span>
              App Aesthetics
            </h2>
            
            <div className="space-y-8">
              <div className="p-8 rounded-[32px] bg-background-light dark:bg-background-dark border-2 border-primary/5">
                <h4 className="font-black text-sm uppercase tracking-[0.2em] text-text-muted mb-6">Accent Color Scheme</h4>
                <div className="flex flex-wrap gap-4">
                  {COLOR_SCHEMES.map(scheme => (
                    <button
                      key={scheme.name}
                      onClick={() => changeColorScheme(scheme.name)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${activeColorScheme === scheme.name ? 'border-primary bg-primary/5 scale-110' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <div className="w-12 h-12 rounded-full shadow-inner" style={{ backgroundColor: scheme.primary }}></div>
                      <span className="text-[10px] font-black uppercase tracking-tighter">{scheme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center p-8 bg-background-light dark:bg-background-dark rounded-[32px] border-2 border-primary/5">
                <div>
                  <h4 className="font-black text-xl">Focus Night Mode</h4>
                  <p className="text-sm text-text-muted font-medium">Dark background for focused study.</p>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={`w-20 h-10 rounded-full p-1.5 transition-all duration-500 flex items-center shadow-inner ${theme === 'dark' ? 'bg-primary justify-end' : 'bg-gray-200 dark:bg-gray-700 justify-start'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center transition-transform">
                    <span className="material-symbols-outlined text-lg text-black">
                      {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500">
          {/* Parent Control View */}
          <section className="bg-white dark:bg-surface-dark rounded-[40px] p-10 shadow-2xl border-4 border-purple-500/10">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-black text-purple-700 dark:text-purple-400 flex items-center gap-4">
                  <span className="material-symbols-outlined text-4xl">supervisor_account</span>
                  Parent Control Panel
                </h2>
                <p className="text-text-muted mt-1 font-medium">Manage student accounts and monitor academic performance.</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="px-8 py-4 bg-purple-600 text-white font-black rounded-2xl flex items-center gap-3 hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 dark:shadow-none hover:scale-105 active:scale-95"
              >
                <span className="material-symbols-outlined">person_add</span>
                Add Child
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {profiles.map(p => (
                <div 
                  key={p.id}
                  onClick={() => setActiveProfileId(p.id)}
                  className={`p-6 rounded-[32px] border-3 transition-all cursor-pointer flex items-center gap-4 group ${activeProfileId === p.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10 shadow-xl scale-[1.02]' : 'border-transparent bg-gray-50 dark:bg-background-dark hover:border-purple-200'}`}
                >
                  <img src={p.avatar} alt={p.name} className="w-20 h-20 rounded-full border-4 border-white dark:border-surface-dark shadow-md object-cover transition-transform group-hover:scale-105" />
                  <div className="flex-1">
                    <h3 className="font-black text-xl leading-tight">{p.name}</h3>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Year {p.level} • {p.stats.masteredWords} Words</p>
                  </div>
                  {activeProfileId === p.id && (
                    <span className="material-symbols-outlined text-purple-600 text-3xl">verified</span>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10 border-t-2 border-gray-100 dark:border-gray-800">
              {/* Left Column: Academic Controls */}
              <div className="lg:col-span-7 space-y-12">
                {/* Child Identity Control */}
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 shadow-sm">
                      <span className="material-symbols-outlined text-3xl">badge</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">Student Name</h3>
                      <p className="text-text-muted font-medium">Update the primary name for this profile.</p>
                    </div>
                  </div>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={activeProfile.name}
                      onChange={e => handleUpdateName(e.target.value)}
                      placeholder="Enter student name..."
                      className="w-full p-6 pr-14 bg-white dark:bg-background-dark rounded-[24px] border-3 border-purple-100 dark:border-gray-800 focus:border-purple-500 hover:border-purple-300 focus:ring-4 focus:ring-purple-500/10 outline-none text-2xl font-black transition-all shadow-sm"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-purple-400 group-hover:text-purple-600 transition-colors pointer-events-none">
                      <span className="material-symbols-outlined text-2xl">edit</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 shadow-sm">
                      <span className="material-symbols-outlined text-3xl">edit_calendar</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">Academic Year</h3>
                      <p className="text-text-muted font-medium">Set the curriculum level for <b>{activeProfile.name}</b>.</p>
                    </div>
                  </div>
                  
                  <div className="flex bg-gray-100 dark:bg-background-dark p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner">
                    {[4, 5, 6].map((year) => (
                      <button 
                        key={year}
                        onClick={() => handleUpdateLevel(year)}
                        className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeProfile.level === year ? 'bg-purple-600 text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                      >
                        Year {year}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 shadow-sm">
                      <span className="material-symbols-outlined text-3xl">auto_fix_high</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">Curriculum Focus</h3>
                      <p className="text-text-muted font-medium">Tailor vocabulary groups for <b>{activeProfile.name}</b>.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {WORD_CATEGORIES.map(cat => {
                      const isSelected = activeProfile.selectedCategories.includes(cat);
                      return (
                        <button 
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`p-6 rounded-3xl border-3 text-left transition-all flex items-center gap-4 group ${isSelected ? 'border-purple-500 bg-purple-600 text-white shadow-xl shadow-purple-600/20' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-background-dark hover:border-purple-300'}`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-purple-50'}`}>
                            <span className={`material-symbols-outlined text-xl ${isSelected ? 'text-white' : 'text-purple-600'}`}>
                              {isSelected ? 'task_alt' : 'bookmark_add'}
                            </span>
                          </div>
                          <span className="font-black text-sm tracking-tight leading-tight">{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Individual Study Plan Manager */}
                <div className="space-y-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 shadow-sm">
                      <span className="material-symbols-outlined text-3xl">event_note</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">Study Plan Manager</h3>
                      <p className="text-text-muted font-medium">Assign specific tasks to <b>{activeProfile.name}</b>.</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-background-dark p-6 rounded-[32px] border-2 border-green-100 dark:border-gray-800">
                    <div className="flex gap-4 mb-6">
                      <input 
                        type="text" 
                        value={newTaskInput}
                        onChange={(e) => setNewTaskInput(e.target.value)}
                        placeholder="Add a new goal (e.g. Master 10 words today)"
                        className="flex-1 p-4 bg-white dark:bg-surface-dark rounded-2xl border-2 border-transparent focus:border-green-500 outline-none font-bold shadow-sm"
                        onKeyDown={(e) => e.key === 'Enter' && addStudyTask()}
                      />
                      <button 
                        onClick={addStudyTask}
                        className="px-6 bg-green-600 text-white font-black rounded-2xl shadow-lg hover:bg-green-700 transition-all"
                      >
                        Add Task
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(activeProfile.studyPlan || []).map(task => (
                        <div key={task.id} className="flex items-center justify-between p-4 bg-white dark:bg-surface-dark rounded-2xl shadow-sm group">
                          <div className="flex items-center gap-4">
                            <span className={`material-symbols-outlined ${task.isCompleted ? 'text-green-500' : 'text-gray-300'}`}>
                              {task.isCompleted ? 'task_alt' : 'circle'}
                            </span>
                            <span className={`font-bold ${task.isCompleted ? 'line-through text-text-muted' : ''}`}>{task.task}</span>
                          </div>
                          <button 
                            onClick={() => deleteStudyTask(task.id)}
                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      ))}
                      {(!activeProfile.studyPlan || activeProfile.studyPlan.length === 0) && (
                        <p className="text-center py-4 text-text-muted italic text-sm">No tasks assigned yet. Add one above!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Individual Progress Report */}
              <div className="lg:col-span-5">
                <div className="bg-gray-50 dark:bg-background-dark rounded-[40px] p-8 border-2 border-purple-100 dark:border-gray-800 sticky top-10">
                  <div className="text-center mb-8">
                    <div className="relative inline-block mb-4">
                      <img src={activeProfile.avatar} alt={activeProfile.name} className="w-24 h-24 rounded-full border-4 border-white dark:border-surface-dark shadow-xl mx-auto" />
                      <div className="absolute -bottom-2 -right-2 bg-primary text-black text-[10px] font-black px-3 py-1 rounded-full border-2 border-white dark:border-surface-dark">YEAR {activeProfile.level}</div>
                    </div>
                    <h3 className="text-2xl font-black">{activeProfile.name}</h3>
                    <p className="text-sm font-bold text-text-muted uppercase tracking-widest mt-1">Student Progress Report</p>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-black text-text-muted">Mastery Accuracy</span>
                        <span className="text-lg font-black text-primary-dark dark:text-primary">{activeProfile.stats.accuracy}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${activeProfile.stats.accuracy}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                        <p className="text-3xl font-black text-purple-600">{activeProfile.stats.masteredWords}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">Words Mastered</p>
                      </div>
                      <div className="p-6 bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                        <p className="text-3xl font-black text-orange-500">{activeProfile.stats.streak}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">Day Streak</p>
                      </div>
                    </div>

                    <div className="p-6 bg-purple-600 text-white rounded-3xl shadow-xl shadow-purple-600/20 text-center">
                      <p className="text-xs font-black uppercase tracking-[0.2em] mb-1">Total Effort Points</p>
                      <p className="text-4xl font-black">{activeProfile.stats.totalXp.toLocaleString()} XP</p>
                    </div>

                    <div className="p-4 flex items-start gap-4 text-xs font-medium text-text-muted bg-white/50 dark:bg-black/20 rounded-2xl italic">
                      <span className="material-symbols-outlined text-purple-400">info</span>
                      This report updates in real-time as {activeProfile.name.split(' ')[0]} completes challenges and learns new vocabulary.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[40px] border-2 border-blue-200 dark:border-blue-900/30 flex gap-6 items-start">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined text-3xl">analytics</span>
              </div>
              <div>
                <h4 className="text-xl font-black text-blue-800 dark:text-blue-300 mb-2 tracking-tight">Data-Driven Insights</h4>
                <p className="text-blue-700/80 dark:text-blue-200/80 font-medium leading-relaxed text-sm">
                  Monitor the Academic Report daily to see which vocabulary areas require more focus for <b>{activeProfile.name}</b>.
                </p>
              </div>
            </div>
            
            <div className="p-8 bg-orange-50 dark:bg-orange-900/10 rounded-[40px] border-2 border-orange-200 dark:border-orange-900/30 flex gap-6 items-start">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600">
                <span className="material-symbols-outlined text-3xl">military_tech</span>
              </div>
              <div>
                <h4 className="text-xl font-black text-orange-800 dark:text-orange-300 mb-2 tracking-tight">Individual Mastery</h4>
                <p className="text-orange-700/80 dark:text-orange-200/80 font-medium leading-relaxed text-sm">
                  Each student follows their own unique path. Customize the Year Group and Focus at any time to match their current 11+ goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
