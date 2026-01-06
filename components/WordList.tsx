
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Word } from '../types';
import { generateVocabWord, playWordPronunciation } from '../services/geminiService';

type FilterType = 'all' | 'learning' | 'starred' | 'mastered';

const WordList: React.FC = () => {
  const navigate = useNavigate();
  const [words, setWords] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const savedWords = localStorage.getItem('vocabHero_wordBank');
    if (savedWords) {
      const parsed = JSON.parse(savedWords);
      setWords(parsed);
    } else {
      const initialWords: Word[] = [
        {
          id: '1',
          word: 'Benevolent',
          definition: 'Kind and helpful; showing good will towards others and wanting to do good.',
          part_of_speech: 'Adjective',
          synonyms: ['kind', 'altruistic', 'caring'],
          antonyms: ['malicious', 'unkind', 'spiteful'],
          example_sentence: 'The benevolent queen gave food and warm clothes to the entire village.',
          level: 4,
          phonetic: '/bəˈnev.əl.ənt/',
          masteryLevel: 0,
          isStarred: true
        },
        {
          id: '2',
          word: 'Accumulate',
          definition: 'To gather together or acquire an increasing number or quantity of something.',
          part_of_speech: 'Verb',
          synonyms: ['collect', 'gather', 'amass'],
          antonyms: ['disperse', 'scatter', 'dissipate'],
          example_sentence: 'Dust began to accumulate on the old books in the attic.',
          level: 4,
          phonetic: '/əˈkjuː.mjə.leɪt/',
          masteryLevel: 0,
          isStarred: false
        }
      ];
      setWords(initialWords);
      localStorage.setItem('vocabHero_wordBank', JSON.stringify(initialWords));
    }
  }, []);

  useEffect(() => {
    if (words.length > 0) {
      localStorage.setItem('vocabHero_wordBank', JSON.stringify(words));
    }
  }, [words]);

  const fetchNewWord = async () => {
    setLoading(true);
    try {
      const profileStr = localStorage.getItem('vocabHero_activeProfile');
      const level = profileStr ? JSON.parse(profileStr).level : 5;
      
      const newWord = await generateVocabWord(level);
      setWords(prev => [newWord, ...prev]);
      setSelectedWord(newWord);
      setFilter('all'); 
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStar = (e: React.MouseEvent, wordId: string) => {
    e.stopPropagation();
    const updatedWords = words.map(w => {
      if (w.id === wordId) {
        const updated = { ...w, isStarred: !w.isStarred };
        if (selectedWord?.id === wordId) setSelectedWord(updated);
        return updated;
      }
      return w;
    });
    setWords(updatedWords);
  };

  const handleSpeak = async (e: React.MouseEvent | React.KeyboardEvent, wordStr: string) => {
    e.stopPropagation();
    if (speaking) return;
    setSpeaking(wordStr);
    try {
      await playWordPronunciation(wordStr);
    } catch (e) {
      console.error("Audio error", e);
    } finally {
      setSpeaking(null);
    }
  };

  const markMastered = (wordId: string) => {
    const updatedWords = words.map(w => {
      if (w.id === wordId) {
        const updated = { ...w, masteryLevel: 5 };
        if (selectedWord?.id === wordId) setSelectedWord(updated);
        return updated;
      }
      return w;
    });
    setWords(updatedWords);
  };

  const handleReview = () => {
    if (selectedWord) {
      if (!selectedWord.isStarred) {
        setWords(prev => prev.map(w => w.id === selectedWord.id ? { ...w, isStarred: true } : w));
      }
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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Word Detail Modal Overlay */}
      {selectedWord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300" 
            onClick={() => setSelectedWord(null)}
          />
          <div className="relative w-full max-w-2xl bg-white dark:bg-surface-dark rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-12 duration-500 max-h-[95vh] flex flex-col border border-white/20">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-3xl bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-3xl font-black">auto_awesome</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-text-main dark:text-white uppercase tracking-tight">Word Discovery</h2>
                  <p className="text-sm text-text-muted font-bold">Unlocking Master Vocabulary</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedWord(null)}
                className="w-12 h-12 rounded-full hover:bg-white dark:hover:bg-gray-800 flex items-center justify-center transition-all group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              >
                <span className="material-symbols-outlined text-text-muted group-hover:text-red-500 transition-colors">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 lg:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-10">
              {/* Word & Phonics Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {selectedWord.part_of_speech}
                    </span>
                    <span className="bg-primary text-black px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                      Year {selectedWord.level}
                    </span>
                  </div>
                  <h1 className="text-5xl lg:text-7xl font-black text-text-main dark:text-white capitalize tracking-tighter leading-none">
                    {selectedWord.word}
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <span className="material-symbols-outlined text-text-muted text-sm">record_voice_over</span>
                    </div>
                    <p className="text-2xl text-primary-dark dark:text-primary font-bold italic tracking-wide">
                      {selectedWord.phonetic || '/.../'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={(e) => handleSpeak(e, selectedWord.word)}
                  className={`w-16 h-16 lg:w-24 lg:h-24 rounded-[32px] flex items-center justify-center shadow-2xl transition-all shrink-0 ${speaking === selectedWord.word ? 'bg-primary text-black animate-pulse' : 'bg-primary text-black hover:scale-110 active:scale-95 shadow-primary/30'}`}
                >
                  <span className="material-symbols-outlined text-4xl lg:text-5xl font-black">{speaking === selectedWord.word ? 'graphic_eq' : 'volume_up'}</span>
                </button>
              </div>

              {/* Definition Section */}
              <div className="p-8 bg-gray-50 dark:bg-background-dark/50 rounded-[40px] border-2 border-transparent hover:border-primary/20 transition-all">
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">menu_book</span> The Meaning
                </h4>
                <p className="text-2xl lg:text-3xl font-black text-text-main dark:text-white leading-tight">
                  {selectedWord.definition}
                </p>
              </div>

              {/* Usage Example Section */}
              <section className="relative p-8 lg:p-10 bg-primary/5 dark:bg-primary/10 rounded-[48px] border-l-[12px] border-primary overflow-hidden group">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-2xl font-black">history_edu</span>
                  <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Usage Example</h4>
                </div>
                <p className="text-2xl lg:text-4xl font-black italic text-text-main dark:text-white leading-snug tracking-tight">
                  "{selectedWord.example_sentence.split(new RegExp(`(${selectedWord.word})`, 'gi')).map((part, i) => 
                    part.toLowerCase() === selectedWord.word.toLowerCase() 
                      ? <span key={i} className="text-primary underline decoration-primary/30 underline-offset-8 decoration-4 not-italic">{part}</span> 
                      : part
                  )}"
                </p>
              </section>

              {/* Related Words: Synonyms & Antonyms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-green-50/50 dark:bg-green-900/10 rounded-[32px] border-2 border-green-100 dark:border-green-900/20">
                  <h4 className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">add_circle</span> Synonyms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWord.synonyms.map(s => (
                      <span key={s} className="px-4 py-2 bg-white dark:bg-surface-dark text-text-main dark:text-white rounded-xl text-sm font-black shadow-sm border border-green-100 dark:border-green-900/50 capitalize">
                        {s}
                      </span>
                    ))}
                    {selectedWord.synonyms.length === 0 && <span className="text-text-muted italic text-xs">No synonyms listed</span>}
                  </div>
                </div>
                <div className="p-6 bg-red-50/50 dark:bg-red-900/10 rounded-[32px] border-2 border-red-100 dark:border-red-900/20">
                  <h4 className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">do_not_disturb_on</span> Antonyms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWord.antonyms.map(a => (
                      <span key={a} className="px-4 py-2 bg-white dark:bg-surface-dark text-text-main dark:text-white rounded-xl text-sm font-black shadow-sm border border-red-100 dark:border-red-900/50 capitalize">
                        {a}
                      </span>
                    ))}
                    {selectedWord.antonyms.length === 0 && <span className="text-text-muted italic text-xs">No antonyms listed</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark flex flex-col sm:flex-row gap-4">
              <button 
                onClick={(e) => toggleStar(e, selectedWord.id)}
                className={`flex-1 py-5 px-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 border-3 transition-all ${selectedWord.isStarred ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : 'bg-gray-50 dark:bg-background-dark border-transparent text-text-muted hover:border-yellow-200'}`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: selectedWord.isStarred ? "'FILL' 1" : "'FILL' 0" }}>
                  {selectedWord.isStarred ? 'star' : 'star_outline'}
                </span>
                {selectedWord.isStarred ? 'Reviewing' : 'Star Word'}
              </button>
              
              <button 
                onClick={handleReview}
                className="flex-[1.5] py-5 px-6 bg-primary text-black font-black text-xl rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined text-2xl">stadia_controller</span>
                Begin Challenge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main View Header */}
      <header className="space-y-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-text-main dark:text-white">Word Bank</h1>
            <p className="text-text-muted text-xl mt-1 font-medium">Your personalized arsenal of high-level vocabulary.</p>
          </div>
          <button 
            onClick={fetchNewWord}
            disabled={loading}
            className="w-full md:w-auto px-10 py-6 bg-primary text-black font-black text-2xl rounded-3xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
          >
            <span className={`material-symbols-outlined text-3xl transition-transform group-hover:rotate-180 ${loading ? 'animate-spin' : ''}`}>{loading ? 'sync' : 'auto_fix_high'}</span>
            {loading ? 'Thinking...' : 'Summon Word'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors text-2xl">search</span>
            <input 
              type="text" 
              placeholder="Search your word bank..."
              className="w-full pl-16 pr-6 py-6 bg-white dark:bg-surface-dark rounded-[32px] border-3 border-transparent focus:border-primary shadow-sm focus:ring-8 focus:ring-primary/5 outline-none transition-all text-xl font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-gray-100 dark:bg-surface-dark/50 p-2 rounded-[32px] border border-gray-200 dark:border-gray-800 shadow-inner w-full lg:w-auto overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All', icon: 'grid_view' },
              { id: 'learning', label: 'Practice', icon: 'psychology' },
              { id: 'starred', label: 'Starred', icon: 'grade' },
              { id: 'mastered', label: 'Mastered', icon: 'verified' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setFilter(tab.id as FilterType)}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-black whitespace-nowrap transition-all ${filter === tab.id ? 'bg-white dark:bg-surface-dark text-primary shadow-md scale-105' : 'text-text-muted hover:text-text-main'}`}
              >
                <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Word Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 px-4">
        {filteredWords.map(w => {
          const isMastered = w.masteryLevel === 5;
          const isStarred = w.isStarred;
          
          return (
            <div 
              key={w.id}
              onClick={() => setSelectedWord(w)}
              className="group relative p-8 bg-white dark:bg-surface-dark rounded-[48px] cursor-pointer transition-all border-3 border-transparent hover:border-primary hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/10 flex flex-col justify-between h-80 shadow-sm"
            >
              {isMastered && (
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-primary text-black rounded-2xl flex items-center justify-center border-4 border-background-light dark:border-background-dark shadow-xl z-20">
                  <span className="material-symbols-outlined text-2xl font-black">verified</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                    {w.part_of_speech}
                  </span>
                  <button 
                    onClick={(e) => toggleStar(e, w.id)}
                    className={`material-symbols-outlined transition-all hover:scale-150 active:scale-90 p-1.5 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-900/10 ${isStarred ? 'text-yellow-400 fill-1' : 'text-gray-200 dark:text-gray-700 hover:text-yellow-400'}`}
                    style={{ fontVariationSettings: isStarred ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </button>
                </div>
                
                <div>
                  <h3 className="text-4xl font-black text-text-main dark:text-white capitalize leading-tight group-hover:text-primary transition-colors truncate">
                    {w.word}
                  </h3>
                  <p className="text-sm text-text-muted font-bold italic mt-1 tracking-wide opacity-80">
                    {w.phonetic || '/.../'}
                  </p>
                </div>

                <p className="text-base text-text-muted line-clamp-3 leading-relaxed font-medium">
                  {w.definition}
                </p>
              </div>

              <div className="flex justify-between items-center mt-auto pt-6 border-t border-gray-50 dark:border-gray-800/30">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                  {isMastered ? <span className="text-primary-dark dark:text-primary font-black">MASTERED</span> : `LEVEL ${w.level}`}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 group-hover:bg-primary group-hover:text-black text-text-muted flex items-center justify-center transition-all shadow-inner group-hover:shadow-primary/20">
                  <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredWords.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white dark:bg-surface-dark rounded-[56px] border-4 border-dashed border-gray-100 dark:border-gray-800 space-y-8">
            <div className="w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <span className="material-symbols-outlined text-7xl text-gray-200">search_off</span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-text-main dark:text-white">Word Not Found</h3>
              <p className="text-text-muted mt-3 text-lg font-medium">Keep exploring or clear your search to find more hero vocabulary!</p>
            </div>
            <button 
              onClick={() => setSearchTerm('')} 
              className="px-12 py-5 bg-gray-100 dark:bg-gray-800 rounded-3xl font-black text-xl hover:bg-gray-200 transition-all active:scale-95"
            >
              Show All Words
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordList;
