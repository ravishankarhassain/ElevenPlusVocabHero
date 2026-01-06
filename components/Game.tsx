
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Word, GameAnswer, ValidationResult } from '../types';
import { generateVocabWord, validateUserAnswer, playWordPronunciation, getWordHint } from '../services/geminiService';

const Game: React.FC = () => {
  const location = useLocation();
  const [word, setWord] = useState<Word | null>(null);
  const [answer, setAnswer] = useState<GameAnswer>({
    wordId: '',
    definition: '',
    synonyms: '',
    antonyms: '',
    sentence: ''
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [score, setScore] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const startNewWord = async (specificWord?: Word) => {
    setLoading(true);
    setResult(null);
    setHint(null);
    setAnswer({ wordId: '', definition: '', synonyms: '', antonyms: '', sentence: '' });
    
    try {
      if (specificWord) {
        setWord(specificWord);
        setAnswer(prev => ({ ...prev, wordId: specificWord.id }));
        setIsReviewMode(true);
      } else {
        // Try to pick from existing learned, starred, or mastered words first
        const savedWordsStr = localStorage.getItem('vocabHero_wordBank');
        const bank = savedWordsStr ? JSON.parse(savedWordsStr) as Word[] : [];
        
        // Prioritize Starred, then Mastered, then any seen words
        const reviewPool = bank.filter(w => w.isStarred || w.masteryLevel === 5 || (w.masteryLevel !== undefined && w.masteryLevel > 0));
        
        if (reviewPool.length > 0 && Math.random() > 0.3) { // 70% chance to pick from bank if not empty
          const randomIndex = Math.floor(Math.random() * reviewPool.length);
          const picked = reviewPool[randomIndex];
          setWord(picked);
          setAnswer(prev => ({ ...prev, wordId: picked.id }));
          setIsReviewMode(true);
        } else {
          // Generate a brand new word if bank is small or by 30% chance
          const profileStr = localStorage.getItem('vocabHero_activeProfile');
          const level = profileStr ? JSON.parse(profileStr).level : 5;
          const newWord = await generateVocabWord(level);
          
          // Add newly discovered word to the bank
          const updatedBank = [newWord, ...bank];
          localStorage.setItem('vocabHero_wordBank', JSON.stringify(updatedBank));
          
          setWord(newWord);
          setAnswer(prev => ({ ...prev, wordId: newWord.id }));
          setIsReviewMode(false);
        }
      }
      setTimeLeft(120);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const state = location.state as { reviewWord?: Word } | null;
    if (state?.reviewWord) {
      startNewWord(state.reviewWord);
    } else {
      startNewWord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    try {
      await playWordPronunciation(word.word);
    } catch (e) {
      console.error("Audio error", e);
    } finally {
      setSpeaking(false);
    }
  };

  const handleGetHint = async () => {
    if (!word || hintLoading || hint) return;
    setHintLoading(true);
    try {
      const hintText = await getWordHint(word.word, word.part_of_speech);
      setHint(hintText);
    } catch (e) {
      console.error("Hint error", e);
    } finally {
      setHintLoading(false);
    }
  };

  const updateWordBankStats = (wordId: string, validation: ValidationResult) => {
    const savedWordsStr = localStorage.getItem('vocabHero_wordBank');
    if (savedWordsStr) {
      const bank = JSON.parse(savedWordsStr) as Word[];
      const updated = bank.map(w => {
        if (w.id === wordId) {
          // Improve mastery if they did well
          const currentMastery = w.masteryLevel || 0;
          const newMastery = validation.score > 80 ? Math.min(currentMastery + 1, 5) : currentMastery;
          return { ...w, masteryLevel: newMastery };
        }
        return w;
      });
      localStorage.setItem('vocabHero_wordBank', JSON.stringify(updated));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word) return;
    setValidating(true);
    try {
      const validation = await validateUserAnswer(word, answer);
      setResult(validation);
      setScore(prev => prev + validation.score);
      updateWordBankStats(word.id, validation);
    } catch (e) {
      console.error(e);
    } finally {
      setValidating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center p-8">
      <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center animate-bounce mb-6">
        <span className="material-symbols-outlined text-5xl text-primary">auto_awesome</span>
      </div>
      <h2 className="text-3xl font-black text-text-main dark:text-white">Summoning a Challenge...</h2>
      <p className="text-text-muted mt-2 text-lg">Looking through your word bank!</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-in slide-in-from-bottom-8 duration-500 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="w-full bg-gray-200 dark:bg-gray-800 h-4 rounded-full overflow-hidden shadow-inner border-2 border-white dark:border-surface-dark">
            <div 
              className={`h-full transition-all duration-1000 ${timeLeft < 30 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-primary shadow-[0_0_15px_rgba(19,236,73,0.5)]'}`} 
              style={{ width: `${(timeLeft / 120) * 100}%` }}
            />
          </div>

          <div className="bg-white dark:bg-surface-dark rounded-[40px] p-10 shadow-2xl border border-gray-100 dark:border-gray-800 relative">
            {result && (
              <div className="absolute inset-0 bg-white/95 dark:bg-surface-dark/95 z-30 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-300 rounded-[40px]">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-2xl ${result.score > 70 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                   <span className="text-5xl font-black">{result.score}%</span>
                </div>
                <h2 className="text-4xl font-black mb-4 text-text-main dark:text-white">{result.score > 70 ? 'Incredible!' : 'Great Attempt!'}</h2>
                <p className="text-xl text-text-muted mb-10 max-w-md leading-relaxed">{result.feedback}</p>
                <button 
                  onClick={() => startNewWord()} 
                  className="w-full max-w-xs py-5 bg-primary text-black font-black text-xl rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all shadow-primary/30"
                >
                  Next Challenge
                </button>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
               <div className="flex gap-3">
                 <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${isReviewMode ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' : 'bg-green-100 text-green-700 dark:bg-green-900/30'}`}>
                    {isReviewMode ? 'Review Mode' : 'New Discovery'}
                 </span>
                 <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">{word?.part_of_speech}</span>
               </div>
               <button 
                onClick={handleGetHint}
                disabled={hintLoading || !!hint}
                className={`flex items-center gap-2 font-black transition-all px-4 py-2 rounded-xl border-2 ${hint ? 'border-gray-100 text-text-muted cursor-default' : 'border-primary/20 text-primary hover:bg-primary/5 hover:border-primary'}`}
               >
                 <span className="material-symbols-outlined text-xl">{hintLoading ? 'hourglass_top' : 'lightbulb'}</span>
                 {hintLoading ? 'Thinking...' : hint ? 'Hint Revealed' : 'Get Hint'}
               </button>
            </div>

            {hint && (
              <div className="mb-10 p-6 bg-primary/5 border-2 border-primary/20 rounded-3xl animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
                <span className="material-symbols-outlined absolute -right-4 -top-4 text-primary/10 text-7xl">psychology</span>
                <p className="text-lg font-bold italic text-primary-dark dark:text-primary flex items-start gap-4 relative z-10">
                  <span className="bg-primary text-black w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-black not-italic">?</span>
                  "{hint}"
                </p>
              </div>
            )}

            <div className="mb-12">
              <div className="flex items-center gap-8 mb-2">
                <h1 className="text-6xl md:text-7xl font-black tracking-tight text-text-main dark:text-white capitalize">{word?.word}</h1>
                <button 
                  onClick={handleSpeak}
                  disabled={speaking}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${speaking ? 'bg-primary text-black animate-pulse' : 'bg-primary/10 text-primary hover:bg-primary hover:text-black hover:scale-110 active:scale-95'}`}
                >
                  <span className="material-symbols-outlined text-3xl">{speaking ? 'graphic_eq' : 'volume_up'}</span>
                </button>
              </div>
              {word?.phonetic && (
                <p className="text-2xl text-text-muted font-medium italic tracking-wide">{word.phonetic}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em] ml-2">Definition</label>
                <textarea 
                  required
                  placeholder="In your own words, what does it mean?"
                  className="w-full p-6 bg-background-light dark:bg-background-dark rounded-[32px] border-3 border-transparent focus:border-primary focus:ring-0 resize-none h-40 text-xl font-medium transition-all shadow-inner outline-none"
                  value={answer.definition}
                  onChange={e => setAnswer({...answer, definition: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-500 text-sm">add_circle</span> Synonyms
                  </label>
                  <input 
                    type="text"
                    placeholder="Same meaning words..."
                    className="w-full p-5 bg-background-light dark:bg-background-dark rounded-2xl border-2 border-transparent focus:border-primary focus:ring-0 text-lg transition-all outline-none"
                    value={answer.synonyms}
                    onChange={e => setAnswer({...answer, synonyms: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-sm">do_not_disturb_on</span> Antonyms
                  </label>
                  <input 
                    type="text"
                    placeholder="Opposite meaning words..."
                    className="w-full p-5 bg-background-light dark:bg-background-dark rounded-2xl border-2 border-transparent focus:border-primary focus:ring-0 text-lg transition-all outline-none"
                    value={answer.antonyms}
                    onChange={e => setAnswer({...answer, antonyms: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-text-muted uppercase tracking-[0.2em] ml-2">Context Sentence</label>
                <textarea 
                  required
                  placeholder="Write a story sentence using this word..."
                  className="w-full p-5 bg-background-light dark:bg-background-dark rounded-2xl border-2 border-transparent focus:border-primary focus:ring-0 resize-none h-32 text-xl font-medium transition-all outline-none"
                  value={answer.sentence}
                  onChange={e => setAnswer({...answer, sentence: e.target.value})}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => startNewWord()}
                  className="w-full sm:w-auto px-10 py-4 text-text-muted font-black hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
                >
                  Skip Challenge
                </button>
                <button 
                  type="submit" 
                  disabled={validating}
                  className="w-full sm:w-auto px-16 py-5 bg-primary text-black font-black text-xl rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                >
                  {validating ? (
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined">auto_fix_high</span>
                  )}
                  {validating ? 'Analyzing...' : 'Submit Answer'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-8">
           <div className="bg-white dark:bg-surface-dark rounded-[32px] p-8 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-4 text-center">
             <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text-muted">Clock is Ticking</h3>
             <div className={`text-7xl font-black tabular-nums transition-colors duration-500 ${timeLeft < 20 ? 'text-red-500 animate-pulse' : 'text-primary-dark dark:text-primary'}`}>
               {formatTime(timeLeft)}
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="bg-white dark:bg-surface-dark rounded-[32px] p-6 shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col items-center">
               <span className="material-symbols-outlined text-yellow-500 text-4xl mb-2">stars</span>
               <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Session XP</span>
               <span className="text-3xl font-black">{score}</span>
             </div>
             <div className="bg-white dark:bg-surface-dark rounded-[32px] p-6 shadow-lg border border-gray-100 dark:border-gray-800 flex flex-col items-center">
               <span className="material-symbols-outlined text-orange-500 text-4xl mb-2">local_fire_department</span>
               <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Hot Streak</span>
               <span className="text-3xl font-black">5</span>
             </div>
           </div>

           <div className="bg-gradient-to-br from-primary/10 to-blue-500/10 border-2 border-primary/20 rounded-[32px] p-8">
             <h4 className="font-black text-lg mb-6 flex items-center gap-3">
               <span className="material-symbols-outlined text-primary">leaderboard</span>
               Hall of Heroes
             </h4>
             <div className="space-y-6">
               {[
                 { name: 'Alex H.', score: 4500, self: true },
                 { name: 'Sophie T.', score: 4230 },
                 { name: 'Jamie R.', score: 3890 }
               ].map((user, i) => (
                 <div key={i} className={`flex justify-between items-center ${user.self ? 'text-primary-dark dark:text-primary' : 'text-text-main dark:text-white'}`}>
                   <div className="flex items-center gap-3">
                     <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-yellow-400 text-black' : 'bg-gray-100 dark:bg-gray-800 text-text-muted'}`}>{i+1}</span>
                     <span className="font-bold">{user.name}</span>
                   </div>
                   <span className="font-black text-sm">{user.score.toLocaleString()}</span>
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
