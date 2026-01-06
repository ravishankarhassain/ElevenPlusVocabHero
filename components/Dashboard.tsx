
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChildProfile } from '../types.ts';

const StatCard: React.FC<{ label: string; value: string | number; subValue: string; icon: string; color: string }> = ({ label, value, subValue, icon, color }) => (
  <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} flex items-center justify-center`}>
        <span className="material-symbols-outlined text-[26px]">{icon}</span>
      </div>
      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-lg font-display uppercase tracking-widest">{subValue}</span>
    </div>
    <p className="text-text-muted text-xs font-semibold mb-1 uppercase tracking-widest">{label}</p>
    <h3 className="text-3xl font-bold font-display tracking-tight">{value}</h3>
  </div>
);

const Dashboard: React.FC<{ initialProfile: ChildProfile }> = ({ initialProfile }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildProfile>(initialProfile);
  const [isPlanOpen, setIsPlanOpen] = useState(false);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const toggleTask = (taskId: string) => {
    if (!profile) return;
    const updatedPlan = (profile.studyPlan || []).map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    const updatedProfile = { ...profile, studyPlan: updatedPlan };
    setProfile(updatedProfile);
    localStorage.setItem('vocabHero_activeProfile', JSON.stringify(updatedProfile));
    
    const profilesSaved = localStorage.getItem('vocabHero_profiles');
    if (profilesSaved) {
      const profiles = JSON.parse(profilesSaved) as ChildProfile[];
      const updatedProfiles = profiles.map(p => p.id === profile.id ? updatedProfile : p);
      localStorage.setItem('vocabHero_profiles', JSON.stringify(updatedProfiles));
    }
    window.dispatchEvent(new Event('vocabHero_profileUpdated'));
  };

  if (!profile) return (
    <div className="flex items-center justify-center h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 animate-in fade-in duration-700">
      {isPlanOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <header className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-green-50/50 dark:bg-green-900/10 font-display">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined">event_available</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">Hero Missions</h2>
                  <p className="text-xs text-text-muted font-semibold uppercase tracking-widest">Year Group assigned</p>
                </div>
              </div>
              <button onClick={() => setIsPlanOpen(false)} className="w-10 h-10 rounded-full hover:bg-white dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {profile.studyPlan?.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${task.isCompleted ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-gray-50 border-transparent dark:bg-background-dark hover:border-green-300'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-green-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'}`}>
                    {task.isCompleted && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                  </div>
                  <span className={`text-lg font-semibold flex-1 ${task.isCompleted ? 'line-through text-text-muted italic' : 'text-text-main dark:text-white'}`}>
                    {task.task}
                  </span>
                </div>
              ))}
              <button 
                onClick={() => setIsPlanOpen(false)}
                className="w-full mt-6 py-4 bg-primary text-black font-bold rounded-2xl shadow-xl hover:scale-[1.01] active:scale-95 transition-all shadow-primary/20 font-display uppercase tracking-widest"
              >
                Close & Start Missions
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 font-display">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight capitalize">Good Morning, {profile.name.split(' ')[0]}! 👋</h1>
          <p className="text-text-muted text-lg mt-1 font-semibold font-sans">You're on a {profile.stats.streak}-day streak! Keep going Hero.</p>
        </div>
        <button 
          onClick={() => setIsPlanOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-surface-light dark:bg-surface-dark border border-primary/20 rounded-2xl font-bold text-xs shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-surface-dark transition-all uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-primary text-xl">calendar_month</span>
          Study Plan
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Words Mastered" value={profile.stats.masteredWords} subValue="+5 Today" icon="school" color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" />
        <StatCard label="Total XP" value={profile.stats.totalXp.toLocaleString()} subValue="+250 XP" icon="bolt" color="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" />
        <StatCard label="Accuracy" value={`${profile.stats.accuracy}%`} subValue="Heroic!" icon="target" color="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-display">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-2xl font-bold tracking-tight uppercase">Hero Sessions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div onClick={() => navigate('/game')} className="group cursor-pointer overflow-hidden rounded-[32px] bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="h-44 bg-cover bg-center relative" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop")'}}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <span className="bg-primary/90 text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">LEVEL 4-6</span>
                  <h3 className="text-white text-2xl font-bold mt-1 tracking-tight">WORD CHALLENGE</h3>
                </div>
              </div>
              <div className="p-5 flex justify-between items-center bg-white dark:bg-surface-dark font-sans">
                <p className="text-sm text-text-muted font-semibold italic">Race the clock hero!</p>
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors shadow-sm">
                  <span className="material-symbols-outlined">play_arrow</span>
                </div>
              </div>
            </div>

            <div onClick={() => navigate('/list')} className="group cursor-pointer overflow-hidden rounded-[32px] bg-surface-light dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="h-44 bg-cover bg-center relative" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop")'}}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-5 left-5">
                  <span className="bg-blue-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">PRACTICE</span>
                  <h3 className="text-white text-2xl font-bold mt-1 tracking-tight">LEARNING MODE</h3>
                </div>
              </div>
              <div className="p-5 flex justify-between items-center bg-white dark:bg-surface-dark font-sans">
                <p className="text-sm text-text-muted font-semibold italic">Browse your word bank.</p>
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors shadow-sm">
                  <span className="material-symbols-outlined">menu_book</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark rounded-[40px] p-8 border border-gray-100 dark:border-gray-800 shadow-lg relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full transition-transform group-hover:scale-125 duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 font-display">
              <span className="material-symbols-outlined text-primary text-xl">lightbulb</span>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Word of the Day</h3>
            </div>
            <h2 className="text-3xl font-bold mb-1 font-display tracking-tight uppercase">Benevolent</h2>
            <p className="text-sm italic text-text-muted mb-6 font-semibold">/bəˈnevələnt/</p>
            <div className="bg-gray-50 dark:bg-background-dark/50 p-6 rounded-3xl mb-8 border border-gray-100 dark:border-gray-800 shadow-inner font-sans">
              <p className="text-lg font-semibold leading-relaxed mb-4">
                <span className="text-primary-dark dark:text-primary uppercase font-display tracking-widest text-[10px] font-bold mr-2">Def:</span> Well meaning and kindly.
              </p>
              <div className="flex items-start gap-3 text-sm text-text-muted italic bg-white dark:bg-surface-dark p-3 rounded-xl border border-gray-50">
                 <span className="material-symbols-outlined text-base">format_quote</span>
                 "A benevolent smile from the teacher."
              </div>
            </div>
            <button onClick={() => navigate('/list')} className="w-full py-4 bg-primary text-black font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all font-display uppercase tracking-widest text-sm">
              Master this word
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
