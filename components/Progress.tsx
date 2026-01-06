
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChildProfile } from '../types';

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
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-black">Your Learning Journey</h1>
        <p className="text-text-muted">See how much you've grown this week, {profile.name.split(' ')[0]}!</p>
      </header>

      <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row gap-8 items-center">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-8 border-primary/20 p-2 bg-gray-50">
              <img src={profile.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-black font-black px-4 py-1 rounded-full border-4 border-white dark:border-surface-dark">
              LVL {profile.level}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black">Vocab Wizard</h2>
            <p className="text-text-muted">Master of Year {profile.level} Words</p>
          </div>
        </div>
        <div className="flex-1 w-full space-y-4">
           <div className="flex justify-between items-end">
             <div className="space-y-1">
               <span className="text-sm font-bold uppercase tracking-widest text-text-muted">XP Progress</span>
               <p className="text-2xl font-black">{profile.stats.totalXp.toLocaleString()} / 5,000 XP</p>
             </div>
             <span className="text-primary font-bold">500 XP to Level 6</span>
           </div>
           <div className="h-6 w-full bg-gray-100 dark:bg-background-dark rounded-full overflow-hidden p-1 shadow-inner">
             <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '90%' }} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Activity This Week</h3>
            <span className="text-text-muted text-sm font-bold uppercase">Words Mastered</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(19, 236, 73, 0.05)'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
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
           <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
             <h3 className="text-xl font-bold mb-6">Skill Breakdown</h3>
             <div className="space-y-6">
                {[
                  { label: 'Synonyms', value: 92, color: 'bg-green-500' },
                  { label: 'Antonyms', value: 78, color: 'bg-orange-500' },
                  { label: 'Sentence Construction', value: 85, color: 'bg-blue-50' },
                  { label: 'Definitions', value: 95, color: 'bg-purple-500' }
                ].map(skill => (
                  <div key={skill.label} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span>{skill.label}</span>
                      <span>{skill.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-background-dark rounded-full overflow-hidden">
                      <div className={`h-full ${skill.color} rounded-full`} style={{ width: `${skill.value}%` }} />
                    </div>
                  </div>
                ))}
             </div>
           </div>

           <div className="bg-primary/5 border-2 border-primary/20 rounded-3xl p-8 flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-black mb-4 shadow-lg shadow-primary/20">
               <span className="material-symbols-outlined text-3xl">military_tech</span>
             </div>
             <h4 className="text-lg font-black mb-2">Weekly Quest</h4>
             <p className="text-sm text-text-muted mb-6">Master 20 words to unlock the "Dictionary Destroyer" badge!</p>
             <div className="w-full bg-gray-200 dark:bg-background-dark h-3 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-primary rounded-full" style={{ width: '65%' }} />
             </div>
             <p className="text-xs font-bold text-primary-dark dark:text-primary uppercase tracking-widest">13 / 20 Completed</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
