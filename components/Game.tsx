
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Word, GameAnswer, ValidationResult } from '../types.ts';
import { generateVocabWord, validateUserAnswer, playWordPronunciation, getWordHint } from '../services/geminiService.ts';

const Game: React.FC = () => {
  const location = useLocation();
  const [word, setWord] = useState<Word | null>(null);
  const [answer, setAnswer] = useState<GameAnswer>({ wordId: '', definition: '', synonyms: '', antonyms: '', sentence: '' });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [score, setScore] = useState(0);

  const startNewWord = async (specificWord?: Word) => {
    setLoading(true);
    setResult(null);
    setHint(null);
    setAnswer({ wordId: '', definition: '', synonyms: '', antonyms: '', sentence: '' });
    try {
      if (specificWord) {
        setWord(specificWord);
        setAnswer(prev => ({ ...prev, wordId: specificWord.id }));
      } else {
        const profileStr = localStorage.getItem('vocabHero_activeProfile');
        const level = profileStr ? JSON.parse(profileStr).level : 5;
        const newWord = await generateVocabWord(level);
        setWord(newWord);
        setAnswer(prev => ({ ...prev, wordId: newWord.id }));
      }
      setTimeLeft(120);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    const state = location.state as { reviewWord?: Word } | null;
    startNewWord(state?.reviewWord);
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !result && word) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, result, word]);

  const handleSpeak = async () => {
    if (!word || speaking) return;
    setSpeaking(true);
    try { await playWordPronunciation(word.word); } finally { setSpeaking(false); }
  };

  const handleGetHint = async () => {
    if (!word || hintLoading || hint) return;
    setHintLoading(true);
    try { setHint(await getWordHint(word.word, word.part_of_speech)); } finally { setHintLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word) return;
    setValidating(true);
    try {
      const validation = await validateUserAnswer(word, answer);
      setResult(validation);
      setScore(prev => prev + validation.score);
    } catch (e) { console.error(e); } finally { setValidating(false); }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center p-8">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-bounce mb-8">
        <span className="material-symbols-outlined text-4xl text-primary">auto_awesome</span>
      </div>
      <h2 className="text-4xl font-bold text-text-main dark:text-white uppercase tracking-tight font-display">Summoning Challenge</h2>
      <p className="text-text-muted mt-2 text-lg font-semibold font-sans">Scanning vocabulary bank...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-in slide-in-from-bottom-8 duration-500 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="w-full bg-gray-200 dark:bg-gray-800 h-3 rounded-full overflow-hidden shadow-inner border border-white/50">
            <div className={`h-full transition-all duration-1000 ${timeLeft < 30 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${(timeLeft / 120) * 100}%` }}/>
          </div>

          <div className="bg-white dark:bg-surface-dark rounded-[40px] p-10 shadow-2xl border border-gray-100 dark:border-gray-800 relative">
            {result && (
              <div className="absolute inset-0 bg-white/98 dark:bg-surface-dark/98 z-30 flex flex-col items-center justify-center p-12 text-center rounded-[40px]">
                <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 shadow-xl ${result.score > 70 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                   <span className="text-5xl font-bold font-display">{result.score}%</span>
                </div>
                <h2 className="text-4xl font-bold mb-4 text-text-main dark:text-white uppercase tracking-tight font-display">{result.score > 70 ? 'HEROIC!' : 'KEEP GOING!'}</h2>
                <p className="text-lg text-text-muted mb-10 max-w-sm font-semibold italic">{result.feedback}</p>
                <button onClick={() => startNewWord()} className="w-full max-w-xs py-5 bg-primary text-black font-bold text-lg rounded-2xl shadow-xl hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-widest">NEXT WORD</button>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
               <div className="flex gap-3">
                 <span className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest">{word?.part_of_speech}</span>
               </div>
               <button onClick={handleGetHint} disabled={hintLoading || !!hint} className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 hover:opacity-80 transition-opacity disabled:text-text-muted">
                 <span className="material-symbols-outlined text-lg">lightbulb</span>
                 {hintLoading ? 'Thinking...' : hint ? 'Revealed' : 'Get Hint'}
               </button>
            </div>

            {hint && (
              <div className="mb-10 p-6 bg-primary/5 border border-primary/20 rounded-[28px] animate-in slide-in-from-top-4">
                <p className="text-lg font-semibold italic text-primary-dark dark:text-primary">"{hint}"</p>
              </div>
            )}

            <div className="mb-12">
              <div className="flex items-center gap-6 mb-2">
                <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-text-main dark:text-white capitalize font-display">{word?.word}</h1>
                <button onClick={handleSpeak} className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                  <span className="material-symbols-outlined text-2xl">{speaking ? 'graphic_eq' : 'volume_up'}</span>
                </button>
              </div>
              <p className="text-2xl text-text-muted font-semibold italic font-sans">{word?.phonetic}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] font-display ml-1">Meaning</label>
                <textarea 
                  required
                  placeholder="In your own words hero, what does it mean?"
                  className="w-full p-6 bg-background-light dark:bg-background-dark/30 rounded-[32px] border border-transparent focus:border-primary resize-none h-36 text-xl font-medium outline-none transition-all shadow-inner"
                  value={answer.definition}
                  onChange={e => setAnswer({...answer, definition: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] font-display ml-1">Synonyms</label>
                  <input 
                    type="text" placeholder="Same meaning words..."
                    className="w-full p-5 bg-background-light dark:bg-background-dark/30 rounded-2xl border border-transparent focus:border-primary text-lg font-semibold outline-none transition-all shadow-inner"
                    value={answer.synonyms}
                    onChange={e => setAnswer({...answer, synonyms: e.target.value})}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] font-display ml-1">Antonyms</label>
                  <input 
                    type="text" placeholder="Opposite meaning..."
                    className="w-full p-5 bg-background-light dark:bg-background-dark/30 rounded-2xl border border-transparent focus:border-primary text-lg font-semibold outline-none transition-all shadow-inner"
                    value={answer.antonyms}
                    onChange={e => setAnswer({...answer, antonyms: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] font-display ml-1">Statement Usage</label>
                <textarea 
                  required placeholder="Write a heroic story sentence..."
                  className="w-full p-6 bg-background-light dark:bg-background-dark/30 rounded-[32px] border border-transparent focus:border-primary resize-none h-32 text-xl font-medium italic outline-none transition-all shadow-inner"
                  value={answer.sentence}
                  onChange={e => setAnswer({...answer, sentence: e.target.value})}
                />
              </div>

              <div className="flex justify-end pt-6">
                <button 
                  type="submit" disabled={validating}
                  className="px-14 py-5 bg-primary text-black font-bold text-lg rounded-2xl shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 uppercase tracking-widest"
                >
                  {validating ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">auto_fix_high</span>}
                  {validating ? 'Analyzing...' : 'Submit Hero Answer'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8 sticky top-8">
           <div className="bg-white dark:bg-surface-dark rounded-[40px] p-10 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
             <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted mb-4 font-display">Countdown</h3>
             <div className={`text-7xl font-bold tabular-nums tracking-tighter font-display ${timeLeft < 20 ? 'text-red-500' : 'text-primary'}`}>
               {formatTime(timeLeft)}
             </div>
           </div>

           <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 border border-primary/20 rounded-[40px] p-8">
             <h4 className="font-bold text-lg mb-6 flex items-center gap-3 uppercase tracking-tight font-display">HALL OF HEROES</h4>
             <div className="space-y-6">
               {[
                 { name: 'Alex H.', score: 4500, self: true },
                 { name: 'Sophie T.', score: 4230 },
                 { name: 'Jamie R.', score: 3890 }
               ].map((user, i) => (
                 <div key={i} className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-text-muted font-display">{i+1}</span>
                     <span className={`font-semibold text-lg ${user.self ? 'text-primary' : ''}`}>{user.name}</span>
                   </div>
                   <span className="font-bold text-base font-display">{user.score.toLocaleString()}</span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
