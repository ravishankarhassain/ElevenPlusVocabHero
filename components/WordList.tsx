
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Word } from '../types.ts';
import { generateVocabWord, playWordPronunciation } from '../services/geminiService.ts';

type FilterType = 'all' | 'learning' | 'starred' | 'mastered';

const WordList: React.FC = () => {
  const navigate = useNavigate();
  const [words, setWords] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all' as FilterType);

  useEffect(() => {
    const savedWords = localStorage.getItem('vocabHero_wordBank');
    if (savedWords) {
      setWords(JSON.parse(savedWords));
    }
  }, []);

  const fetchNewWord = async () => {
    setLoading(true);
    try {
      const profileStr = localStorage.getItem('vocabHero_activeProfile');
      const level = profileStr ? JSON.parse(profileStr).level : 5;
      const newWord = await generateVocabWord(level);
      const updated = [newWord, ...words];
      setWords(updated);
      localStorage.setItem('vocabHero_wordBank', JSON.stringify(updated));
      setSelectedWord(newWord);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStar = (e: React.MouseEvent, wordId: string) => {
    e.stopPropagation();
    const updatedWords = words.map(w => w.id === wordId ? { ...w, isStarred: !w.isStarred } : w);
    setWords(updatedWords);
    localStorage.setItem('vocabHero_wordBank', JSON.stringify(updatedWords));
  };

  const handleSpeak = async (e: React.MouseEvent | React.KeyboardEvent, wordStr: string) => {
    e.stopPropagation();
    if (speaking) return;
    setSpeaking(wordStr);
    try {
      await playWordPronunciation(wordStr);
    } catch (e) { console.error(e); } finally { setSpeaking(null); }
  };

  const handleReview = () => {
    if (selectedWord) {
      navigate('/game', { state: { reviewWord: selectedWord } });
    }
  };

  const filteredWords = words
    .filter(w => w.word.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(w => {
      if (filter === 'all') return true;
      if (filter === 'learning') return (w.masteryLevel || 0) < 5 && !w.isStarred;
      if (filter === 'starred') return !!w.isStarred;
      if (filter === 'mastered') return w.masteryLevel === 5;
      return true;
    });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Discovery Modal */}
      {selectedWord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedWord(null)}/>
          <div className="relative w-full max-w-2xl bg-white dark:bg-surface-dark rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800 animate-in zoom-in duration-300 max-h-[90vh]">
            <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] font-display">Word Discovery</h2>
              <button onClick={() => setSelectedWord(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <span className="material-symbols-outlined text-xl text-text-muted">close</span>
              </button>
            </div>

            <div className="p-8 lg:p-12 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/20 rounded-lg text-[10px] font-bold uppercase tracking-widest">{selectedWord.part_of_speech}</span>
                    <span className="px-3 py-1 bg-primary/10 text-primary-dark dark:text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest">Year {selectedWord.level}</span>
                  </div>
                  <h1 className="text-6xl font-bold text-text-main dark:text-white capitalize tracking-tighter font-display">{selectedWord.word}</h1>
                  <p className="text-2xl text-text-muted font-semibold italic font-sans tracking-tight">{selectedWord.phonetic || '/.../'}</p>
                </div>
                <button 
                  onClick={(e) => handleSpeak(e, selectedWord.word)}
                  className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-lg ${speaking === selectedWord.word ? 'bg-primary text-black animate-pulse' : 'bg-primary/10 text-primary hover:bg-primary hover:text-black'}`}
                >
                  <span className="material-symbols-outlined text-3xl">{speaking === selectedWord.word ? 'graphic_eq' : 'volume_up'}</span>
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] font-display">Definition</h4>
                <p className="text-2xl font-semibold leading-relaxed text-text-main dark:text-white">{selectedWord.definition}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-green-50/50 dark:bg-green-900/10 rounded-3xl border border-green-100 dark:border-green-800/20">
                  <h4 className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-widest mb-4">Synonyms</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWord.synonyms.map(s => (
                      <span key={s} className="text-sm font-semibold capitalize bg-white dark:bg-surface-dark px-3 py-1.5 rounded-xl shadow-sm border border-green-50 dark:border-green-800/20 text-green-800 dark:text-green-300">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-red-50/50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-800/20">
                  <h4 className="text-[9px] font-bold text-red-700 dark:text-red-400 uppercase tracking-widest mb-4">Antonyms</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWord.antonyms.map(a => (
                      <span key={a} className="text-sm font-semibold capitalize bg-white dark:bg-surface-dark px-3 py-1.5 rounded-xl shadow-sm border border-red-50 dark:border-red-800/20 text-red-800 dark:text-red-300">{a}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 dark:bg-background-dark/50 rounded-[32px] border-l-4 border-primary shadow-inner">
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Statement Usage</h4>
                <p className="text-2xl font-medium italic text-text-main dark:text-white leading-relaxed">"{selectedWord.example_sentence}"</p>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 dark:border-gray-800 flex gap-4 bg-white dark:bg-surface-dark">
              <button 
                onClick={(e) => toggleStar(e, selectedWord.id)}
                className={`flex-1 py-4 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 border-2 transition-all tracking-widest uppercase ${selectedWord.isStarred ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : 'bg-gray-50 dark:bg-background-dark border-transparent text-text-muted hover:border-yellow-200'}`}
              >
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: selectedWord.isStarred ? "'FILL' 1" : "'FILL' 0" }}>{selectedWord.isStarred ? 'star' : 'star_outline'}</span>
                {selectedWord.isStarred ? 'STARRED' : 'STAR WORD'}
              </button>
              <button 
                onClick={handleReview}
                className="flex-[1.5] py-4 px-8 bg-primary text-black font-bold text-sm rounded-2xl shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-2xl">stadia_controller</span>
                CHALLENGE ME
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Word Bank Header */}
      <header className="px-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="font-display">
          <h1 className="text-5xl font-bold text-text-main dark:text-white tracking-tight">Word Bank</h1>
          <p className="text-text-muted font-semibold text-lg mt-1 font-sans">Browse and master your high-level vocabulary.</p>
        </div>
        <button 
          onClick={fetchNewWord}
          disabled={loading}
          className="w-full md:w-auto px-8 py-5 bg-primary text-black font-bold text-sm rounded-[24px] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 font-display uppercase tracking-widest"
        >
          <span className={`material-symbols-outlined text-2xl ${loading ? 'animate-spin' : ''}`}>{loading ? 'sync' : 'auto_fix_high'}</span>
          {loading ? 'SUMMONING...' : 'NEW WORD'}
        </button>
      </header>

      <div className="px-4 flex flex-col lg:flex-row gap-5 items-center font-sans">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-text-muted">search</span>
          <input 
            type="text" 
            placeholder="Search your hero words..."
            className="w-full pl-14 pr-6 py-5 bg-white dark:bg-surface-dark rounded-[24px] border border-transparent focus:border-primary shadow-sm outline-none font-semibold text-lg transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex bg-gray-100 dark:bg-surface-dark/50 p-2 rounded-[24px] border border-gray-200 dark:border-gray-800 w-full lg:w-auto overflow-x-auto no-scrollbar">
          {['all', 'learning', 'starred', 'mastered'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setFilter(tab as FilterType)}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all tracking-widest uppercase ${filter === tab ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
        {filteredWords.map(w => (
          <div 
            key={w.id}
            onClick={() => setSelectedWord(w)}
            className="group relative p-8 bg-white dark:bg-surface-dark rounded-[40px] cursor-pointer transition-all border border-gray-100 dark:border-gray-800 hover:border-primary/50 hover:-translate-y-2 shadow-sm hover:shadow-2xl flex flex-col justify-between h-80"
          >
            {w.masteryLevel === 5 && (
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary text-black rounded-2xl flex items-center justify-center border-4 border-white dark:border-surface-dark shadow-xl z-10">
                <span className="material-symbols-outlined text-base font-bold">verified</span>
              </div>
            )}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[9px] font-bold uppercase tracking-widest">{w.part_of_speech}</span>
                <button onClick={(e) => toggleStar(e, w.id)} className={`material-symbols-outlined text-xl transition-all ${w.isStarred ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} style={{ fontVariationSettings: w.isStarred ? "'FILL' 1" : "'FILL' 0" }}>star</button>
              </div>
              <h3 className="text-3xl font-bold text-text-main dark:text-white capitalize group-hover:text-primary transition-colors tracking-tight font-display">{w.word}</h3>
              <p className="text-sm text-text-muted line-clamp-3 font-medium leading-relaxed">{w.definition}</p>
            </div>
            <div className="mt-auto pt-6 flex justify-between items-center border-t border-gray-50 dark:border-gray-800/50">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">YEAR {w.level}</span>
              <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-all group-hover:translate-x-1">arrow_forward</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordList;
