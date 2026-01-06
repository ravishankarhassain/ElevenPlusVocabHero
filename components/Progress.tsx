
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChildProfile } from '../types.ts';

const data = [
  { name: 'Mon', words: 12 },
  { name: 'Tue', words: 15 },
  { name: 'Wed', words: 8 },
  { name: 'Thu', words: 20 },
  { name: 'Fri', words: 14 },
  { name: 'Sat', words: 25 },
  { name: 'Sun', words: 18 },
];

const Progress: React.FC<{ profile: ChildProfile }> = ({ profile }) => {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 font-sans">
      <header className="font-display">
        <h1 className="text-4xl font-black tracking-tighter uppercase">Your Learning Journey</h1>
        <p className="text-text-muted text-xl font-bold font-sans">See how much you've grown this week, {profile.name.split(' ')[0]}!</p>
      </header>

      <div className="bg-white dark:bg-surface-dark rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row gap-8 items-center">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-[10px] border-primary/20 p-2 bg-gray-50">
              <img src={profile.avatar} alt="avatar" className="w-full h-full rounded-full object-cover shadow-inner" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-black font-black px-4 py-1 rounded-xl border-4 border-white dark:border-surface-dark font-display text-xs shadow-lg">
              LVL {profile.level}
            </div>
          </div>
          <div className="font-display">
            <h2 className="text-3xl font-black tracking-tight uppercase">Vocab Wizard</h2>
            <p className="text-text-muted font-bold text-sm uppercase tracking-widest mt-1">Master of Year {profile.level}</p>
          </div>
        </div>
        <div className="flex-1 w-full space-y-4">
           <div className="flex justify-between items-end font-display">
             <div className="space-y-1">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">XP Progress</span>
               <p className="text-3xl font-black tabular-nums">{profile.stats.totalXp.toLocaleString()} / 5,000 XP</p>
             </div>
             <span className="text-primary font-black text-sm uppercase tracking-widest">500 XP to NEXT LVL</span>
           </div>
           <div className="h-6 w-full bg-gray-100 dark:bg-background-dark rounded-full overflow-hidden p-1 shadow-inner">
             <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(19,236,73,0.3)]" style={{ width: '90%' }} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-[40px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-center mb-8 font-display">
            <h3 className="text-2xl font-black tracking-tight uppercase">Activity This Week</h3>
            <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">Words Mastered</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: 'rgba(19, 236, 73, 0.05)'}}
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontFamily: 'Plus Jakarta Sans'}}
                />
                <Bar dataKey="words" radius={[8, 8, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#13ec49' : '#61896b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
           <div className="bg-white dark:bg-surface-dark rounded-[40px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
             <h3 className="text-2xl font-black mb-6 font-display tracking-tight uppercase">Skill Stats</h3>
             <div className="space-y-6">
                {[
                  { label: 'Synonyms', value: 92, color: 'bg-green-500' },
                  { label: 'Antonyms', value: 78, color: 'bg-orange-500' },
                  { label: 'Sentences', value: 85, color: 'bg-blue-500' },
                  { label: 'Definitions', value: 95, color: 'bg-purple-500' }
                ].map(skill => (
                  <div key={skill.label} className="space-y-2">
                    <div className="flex justify-between text-xs font-black font-display uppercase tracking-widest">
                      <span>{skill.label}</span>
                      <span>{skill.value}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-background-dark rounded-full overflow-hidden shadow-inner">
                      <div className={`h-full ${skill.color} rounded-full transition-all duration-700`} style={{ width: `${skill.value}%` }} />
                    </div>
                  </div>
                ))}
             </div>
           </div>

           <div className="bg-primary/5 border-2 border-primary/20 rounded-[40px] p-8 flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-black mb-4 shadow-xl shadow-primary/20">
               <span className="material-symbols-outlined text-3xl">military_tech</span>
             </div>
             <h4 className="text-xl font-black mb-2 font-display uppercase tracking-tighter">Weekly Quest</h4>
             <p className="text-sm text-text-muted mb-6 font-bold">Master 20 words to unlock the "Dictionary Destroyer" badge!</p>
             <div className="w-full bg-gray-200 dark:bg-background-dark h-3.5 rounded-full overflow-hidden mb-3 p-0.5 shadow-inner">
                <div className="h-full bg-primary rounded-full shadow-md" style={{ width: '65%' }} />
             </div>
             <p className="text-xs font-black text-primary-dark dark:text-primary uppercase tracking-[0.2em] font-display">13 / 20 MASTERED</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
