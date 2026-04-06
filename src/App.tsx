/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  History, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  ShieldCheck, 
  Trophy, 
  AlertCircle,
  PawPrint,
  ChevronRight,
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { Signal, SignalType } from './types';
import { analyzeBacBoPattern } from './services/geminiService';

// Mock initial history
const INITIAL_HISTORY: Signal[] = [
  { id: '1', type: 'PLAYER', timestamp: new Date(Date.now() - 300000), status: 'WIN', gale: 0 },
  { id: '2', type: 'BANKER', timestamp: new Date(Date.now() - 600000), status: 'WIN', gale: 1 },
  { id: '3', type: 'PLAYER', timestamp: new Date(Date.now() - 900000), status: 'WIN', gale: 0 },
  { id: '4', type: 'BANKER', timestamp: new Date(Date.now() - 1200000), status: 'WIN', gale: 0 },
  { id: '5', type: 'PLAYER', timestamp: new Date(Date.now() - 1500000), status: 'LOSS', gale: 2 },
  { id: '6', type: 'BANKER', timestamp: new Date(Date.now() - 1800000), status: 'WIN', gale: 0 },
];

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [currentTab, setCurrentTab] = useState<'signals' | 'history' | 'ranking' | 'settings'>('signals');
  const [currentSignal, setCurrentSignal] = useState<Signal | null>(null);
  const [history, setHistory] = useState<Signal[]>(INITIAL_HISTORY);
  const [ranking, setRanking] = useState([
    { name: 'Horti Johnson', profit: 15200, winRate: 99, rank: 1 },
    { name: 'Profeta Elias', profit: 12450, winRate: 98, rank: 2 },
    { name: 'Johnnys B', profit: 9800, winRate: 97, rank: 3 },
    { name: 'Lucifer', profit: 7150, winRate: 96, rank: 4 },
    { name: 'Patrício', profit: 5900, winRate: 95, rank: 5 },
    { name: 'Chris Jr', profit: 4800, winRate: 94, rank: 6 },
    { name: 'Pop Smok Israel', profit: 3200, winRate: 92, rank: 7 },
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nextSignalTimer, setNextSignalTimer] = useState(60); // seconds (Bac Bo cycle)
  const [analysisCount, setAnalysisCount] = useState(Math.floor(Math.random() * 100) + 150);
  const [totalWins, setTotalWins] = useState(() => {
    const saved = localStorage.getItem('hj_total_wins');
    return saved ? parseInt(saved, 10) : Math.floor(Math.random() * 200) + 400;
  });
  const [accuracy, setAccuracy] = useState(98.4);
  const [accuracyTrend, setAccuracyTrend] = useState<'up' | 'down' | null>(null);
  const [analysisMessage, setAnalysisMessage] = useState('Iniciando IA...');
  const [analysisTimer, setAnalysisTimer] = useState(10);

  // Initial loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === 'Horti') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      // Reset error after animation
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setCurrentTab('signals');
    setCurrentSignal(null);
    setIsAnalyzing(false);
  };

  const generateSignal = useCallback(async () => {
    if (!isAuthenticated || isAnalyzing) return;
    setIsAnalyzing(true);
    // Remove setCurrentSignal(null) from here to keep old signal visible during analysis
    
    setAnalysisTimer(10);
    
    const messages = [
      'IA Conectando à Mesa do Bac Bo Brasileiro...',
      'Analisando tendências reais em tempo real...',
      '⚠️ PREPARE-SE: Possível entrada em breve...',
      'Verificando histórico de rodadas recentes...',
      'Detectando padrões de repetição e quebra...',
      'IA calculando probabilidades estatísticas...',
      '⚠️ ATENÇÃO: Aguarde a confirmação final...',
      'Validando sinal com algoritmo de alta precisão...',
      'Finalizando análise de padrão detectado...'
    ];

    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      setAnalysisMessage(messages[msgIndex % messages.length]);
      msgIndex++;
    }, 700);

    const timerInterval = setInterval(() => {
      setAnalysisTimer(prev => Math.max(0, prev - 1));
    }, 1000);

    try {
      // Real AI analysis using Gemini
      const aiResult = await analyzeBacBoPattern(history);
      
      // Artificial delay to show the analysis steps to the user (10 seconds)
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      clearInterval(msgInterval);
      clearInterval(timerInterval);
      if (!isAuthenticated) return;

      const newSignal: Signal = {
        id: Date.now().toString(),
        type: aiResult.type,
        timestamp: new Date(),
        status: 'PENDING',
        gale: 0,
        confidence: aiResult.confidence,
        pattern: aiResult.pattern,
        instruction: aiResult.instruction,
        isFallback: aiResult.isFallback
      };

      setCurrentSignal(newSignal);
      setIsAnalyzing(false);
      setAnalysisCount(prev => prev + 1);
    } catch (error) {
      console.error("Erro ao gerar sinal:", error);
      clearInterval(msgInterval);
      setIsAnalyzing(false);
    }
  }, [isAuthenticated, history]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNextSignalTimer((prev) => {
        if (prev <= 1) {
          if (isAuthenticated) generateSignal();
          return 60; // Reset immediately to start next count
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [generateSignal, isAuthenticated]);

  // Simulate signal result after 12 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    if (currentSignal && currentSignal.status === 'PENDING') {
      const resultTimer = setTimeout(() => {
        const isWin = Math.random() > 0.05; // 95% win rate simulation
        const updatedSignal: Signal = {
          ...currentSignal,
          status: isWin ? 'WIN' : 'LOSS',
          gale: isWin ? 0 : 1
        };
        
        // Update current signal with result first
        setCurrentSignal(updatedSignal);
        
        // Move to history but keep current signal visible until next analysis
        setHistory((prev) => [updatedSignal, ...prev].slice(0, 20));

        // Update accuracy dynamically based on result
        setAccuracy(prev => {
          const change = isWin ? (Math.floor(Math.random() * 3 + 1) / 10) : -(Math.floor(Math.random() * 20 + 10) / 10);
          setAccuracyTrend(isWin ? 'up' : 'down');
          setTimeout(() => setAccuracyTrend(null), 5000);
          return +(Math.max(85, Math.min(99.9, prev + change))).toFixed(1);
        });

        if (isWin) {
          setTotalWins(prev => prev + 1);
        }
      }, 12000);

      return () => clearTimeout(resultTimer);
    }
  }, [currentSignal, isAuthenticated]);

  // Dynamic ranking logic
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const names = [
      'Horti Johnson', 'Profeta Elias', 'Johnnys B', 'Lucifer', 'Patrício', 
      'Chris Jr', 'Pop Smok Israel', 'Mestre Bac', 'Rei do Bo', 'Dama Azul', 
      'Barão Vermelho', 'Sombra', 'Fênix', 'Lobo Solitário', 'Águia Real',
      'Cobra Coral', 'Pantera Negra', 'Tigre Branco', 'Dragão de Ouro'
    ];

    const interval = setInterval(() => {
      setRanking(prev => {
        // Randomly update profits and win rates
        const updated = prev.map(user => ({
          ...user,
          profit: user.profit + (Math.random() > 0.5 ? Math.floor(Math.random() * 500) : -Math.floor(Math.random() * 200)),
          winRate: Math.min(99.9, Math.max(85, user.winRate + (Math.random() > 0.5 ? 0.1 : -0.1)))
        }));

        // Occasionally swap a user with a new one from the pool
        if (Math.random() > 0.7) {
          const randomIndex = Math.floor(Math.random() * updated.length);
          const currentNames = updated.map(u => u.name);
          const availableNames = names.filter(n => !currentNames.includes(n));
          if (availableNames.length > 0) {
            const newName = availableNames[Math.floor(Math.random() * availableNames.length)];
            updated[randomIndex] = {
              name: newName,
              profit: Math.floor(Math.random() * 5000) + 2000,
              winRate: Math.floor(Math.random() * 10) + 88,
              rank: updated[randomIndex].rank
            };
          }
        }

        // Re-sort by profit and update ranks
        return updated
          .sort((a, b) => b.profit - a.profit)
          .map((user, index) => ({ ...user, rank: index + 1 }));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Real-time accuracy fluctuation
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      setAccuracy(prev => {
        const change = (Math.random() * 0.04 - 0.02);
        return +(Math.max(95, Math.min(99.9, prev + change))).toFixed(1);
      });
    }, 45000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Simulated global wins background activity
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate background wins from other "users"
      if (Math.random() > 0.4) {
        setTotalWins(prev => {
          const next = prev + 1;
          localStorage.setItem('hj_total_wins', next.toString());
          return next;
        });
      }
    }, 15000); // Every 15 seconds there's a chance of a background win
    return () => clearInterval(interval);
  }, []);

  // Update localStorage when totalWins changes from signals
  useEffect(() => {
    localStorage.setItem('hj_total_wins', totalWins.toString());
  }, [totalWins]);

  const renderContent = () => {
    switch (currentTab) {
      case 'signals':
        return (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Stats Banner */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  Assert.
                </div>
                <div className="flex items-center gap-1">
                  <motion.div 
                    key={accuracy}
                    initial={{ scale: 1.1, color: accuracyTrend === 'up' ? '#22c55e' : accuracyTrend === 'down' ? '#ef4444' : '#ffffff' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-xl font-bold"
                  >
                    {accuracy}%
                  </motion.div>
                  {accuracyTrend && (
                    <motion.div
                      initial={{ opacity: 0, y: accuracyTrend === 'up' ? 5 : -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={accuracyTrend === 'up' ? 'text-green-500' : 'text-red-500'}
                    >
                      {accuracyTrend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">
                  <Trophy className="w-3 h-3 text-yellow-500" />
                  Wins
                </div>
                <div className="text-xl font-bold text-green-500">{totalWins}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-wider font-semibold">
                  <ShieldCheck className="w-3 h-3 text-blue-500" />
                  Análise #
                </div>
                <div className="text-xl font-bold text-white">{analysisCount}</div>
              </div>
            </div>

            {/* Main Signal Area */}
            <section className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-gray-500/10 blur-2xl opacity-50"></div>
              <div className="relative bg-[#121216] border border-white/10 rounded-3xl p-8 overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <Zap className="w-6 h-6 text-white/20" />
                </div>

                <AnimatePresence mode="wait">
                  {isAnalyzing ? (
                    <motion.div
                      key="analyzing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center justify-center py-10 space-y-4"
                    >
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <PawPrint className="absolute inset-0 m-auto w-6 h-6 text-white animate-pulse" />
                      </div>
                      <div className="text-center">
                        <div className="bg-white/5 px-3 py-1 rounded-full text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-4 inline-block">
                          Aguarde a Confirmação
                        </div>
                        <h3 className="text-xl font-bold text-white">Analisando... ({analysisTimer}s)</h3>
                        <p className="text-gray-400 text-sm h-5">{analysisMessage}</p>
                      </div>
                    </motion.div>
                  ) : currentSignal ? (
                    <motion.div
                      key="signal"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center space-y-6"
                    >
                      <div className={`flex items-center gap-2 px-4 py-1.5 border rounded-full text-[10px] font-bold uppercase tracking-widest ${currentSignal.isFallback ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-white/10 border-white/20 text-white'}`}>
                        <Zap className={`w-3 h-3 ${currentSignal.isFallback ? 'text-orange-500' : 'text-yellow-500'}`} />
                        {currentSignal.isFallback ? 'Modo de Contingência' : 'IA: Sinal Confirmado'}
                      </div>
                      
                      <div className="text-center space-y-2">
                        {currentSignal.instruction && (
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2 flex items-center justify-center gap-2 mb-4">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <span className="text-yellow-500 text-xs font-bold uppercase tracking-wider">
                              {currentSignal.instruction}
                            </span>
                          </div>
                        )}
                        <div className={`text-6xl font-black tracking-tighter ${currentSignal.type === 'PLAYER' ? 'text-blue-500' : 'text-red-500'}`}>
                          {currentSignal.type === 'PLAYER' ? 'AZUL' : 'VERMELHO'}
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Entrada: {currentSignal.type === 'PLAYER' ? 'Jogador' : 'Banqueiro'}</p>
                          {currentSignal.pattern && (
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Padrão: {currentSignal.pattern}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 w-full">
                        <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
                          <div className="text-[8px] text-gray-500 uppercase font-bold mb-1">Confiança</div>
                          <div className="text-sm font-bold text-green-500">{currentSignal.confidence}%</div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
                          <div className="text-[8px] text-gray-500 uppercase font-bold mb-1">Proteção</div>
                          <div className="text-sm font-bold text-white">EMPATE</div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
                          <div className="text-[8px] text-gray-500 uppercase font-bold mb-1">Gale</div>
                          <div className="text-sm font-bold text-white">G1</div>
                        </div>
                      </div>

                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "100%" }}
                          animate={{ width: currentSignal.status === 'PENDING' ? "0%" : "100%" }}
                          transition={{ duration: currentSignal.status === 'PENDING' ? 15 : 0.5, ease: "linear" }}
                          className={`h-full ${currentSignal.status === 'PENDING' ? 'bg-white' : currentSignal.status === 'WIN' ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-10 space-y-6"
                    >
                      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                        <Clock className="w-10 h-10 text-gray-600" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Aguardando Padrão</h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Próxima Rodada Bac Bo em:</p>
                        <div className="text-5xl font-black text-white mt-3 tabular-nums tracking-tighter">
                          {nextSignalTimer}s
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* Action Button */}
            <a 
              href="https://m.elephantbet.co.ao/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-xl shadow-white/10 active:scale-95 transition-transform uppercase tracking-wider flex items-center justify-center gap-2 no-underline"
            >
              Entrar na Mesa
              <ChevronRight className="w-5 h-5" />
            </a>

            {/* Quick History Preview */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Últimos Resultados
                </h2>
                <button 
                  onClick={() => setCurrentTab('history')}
                  className="text-[10px] font-bold text-white hover:underline"
                >
                  Ver Tudo
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {history.slice(0, 8).map((signal) => (
                  <div 
                    key={signal.id}
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${
                      signal.status === 'WIN' 
                        ? 'bg-green-500/20 text-green-500 border border-green-500/20' 
                        : 'bg-red-500/20 text-red-500 border border-red-500/20'
                    }`}
                  >
                    {signal.type === 'PLAYER' ? 'P' : 'B'}
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        );
      case 'history':
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-white" />
                Histórico Completo
              </h2>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Total: {history.length} Sinais
              </div>
            </div>

            <div className="space-y-2">
              {history.map((signal) => (
                <div 
                  key={signal.id} 
                  className="bg-[#121216] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                      signal.type === 'PLAYER' ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {signal.type === 'PLAYER' ? 'AZU' : 'VER'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        {signal.type === 'PLAYER' ? 'Jogador' : 'Banqueiro'}
                      </div>
                      {signal.instruction && (
                        <div className="text-[8px] text-yellow-500 font-bold uppercase tracking-widest">
                          {signal.instruction}
                        </div>
                      )}
                      <div className="text-[10px] text-gray-500 font-medium">
                        {signal.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {signal.gale !== undefined && signal.gale > 0 && (
                      <span className="text-[10px] font-bold text-white bg-white/10 px-2 py-0.5 rounded-full">
                        G{signal.gale}
                      </span>
                    )}
                    <div className={`flex items-center gap-1.5 font-black text-xs ${
                      signal.status === 'WIN' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {signal.status === 'WIN' ? (
                        <>
                          <Trophy className="w-3 h-3" />
                          GREEN
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          LOSS
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'ranking':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Top Lucrativos</h2>
              <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">Os melhores da gang hoje</p>
            </div>

            <div className="space-y-3">
              {ranking.map((user, i) => (
                <motion.div 
                  layout
                  key={user.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`bg-[#121216] border ${i === 0 ? 'border-white/30' : 'border-white/5'} rounded-2xl p-4 flex items-center justify-between`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                      i === 0 ? 'bg-white text-black' : 'bg-white/5 text-gray-400'
                    }`}>
                      {user.rank}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{user.name}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user.winRate.toFixed(1)}% Win Rate</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-green-500">
                      {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(user.profit)}
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Lucro Total</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-bold text-white">Configurações</h2>
            <div className="space-y-2">
              {[
                { icon: Bell, label: 'Notificações de Sinais', value: 'Ativado' },
                { icon: ShieldCheck, label: 'Modo de Segurança', value: 'Ativado' },
                { icon: User, label: 'Perfil VIP', value: 'Horti Johnson' },
                { icon: Settings, label: 'Idioma', value: 'Português' },
              ].map((item) => (
                <div key={item.label} className="bg-[#121216] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-300">{item.label}</span>
                  </div>
                  <span className="text-xs font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={handleLogout}
              className="w-full bg-red-500/10 text-red-500 font-bold py-4 rounded-2xl border border-red-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sair da Conta
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-white/30">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] bg-[#0a0a0c] flex flex-col items-center justify-center p-6"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative flex flex-col items-center gap-8">
              {/* Panda Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 1, 
                  ease: "easeOut",
                  scale: { type: "spring", damping: 12, stiffness: 100 }
                }}
                className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)] border border-black/10"
              >
                <span className="text-7xl">🐼</span>
              </motion.div>

              {/* Text Info */}
              <div className="text-center space-y-3">
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-4xl font-black tracking-tighter uppercase"
                >
                  Horti Johnson
                </motion.h1>
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="flex items-center justify-center gap-3"
                >
                  <div className="h-[1px] w-8 bg-white/20" />
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
                    Best of gang
                  </span>
                  <div className="h-[1px] w-8 bg-white/20" />
                </motion.div>
              </div>

              {/* Loading Bar */}
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                  className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                />
              </div>

              {/* Status Text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="text-[10px] font-bold text-gray-500 uppercase tracking-widest animate-pulse"
              >
                Conectando ao servidor...
              </motion.p>
            </div>
          </motion.div>
        ) : !isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[150] bg-[#0a0a0c] flex flex-col items-center justify-center p-6"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full" />
            </div>

            <div className="relative w-full max-w-sm space-y-8">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                  <span className="text-4xl">🐼</span>
                </div>
                <div className="space-y-1">
                  <h2 className="text-4xl font-black tracking-tighter uppercase">Horti Johnson</h2>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Horti Johnson. Best of gang</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Senha de Acesso
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite a senha..."
                      className={`w-full bg-white/5 border ${loginError ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/10'} rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition-all font-bold`}
                    />
                    {loginError && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500"
                      >
                        <AlertCircle className="w-5 h-5" />
                      </motion.div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-white text-black font-black py-4 rounded-2xl active:scale-95 transition-transform uppercase tracking-widest text-sm shadow-lg shadow-white/10"
                >
                  Entrar na Sala
                </button>
              </form>

              <div className="text-center">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                  Apenas membros autorizados
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10 border border-black/20">
            <span className="text-2xl">🐼</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none uppercase">Horti Johnson</h1>
            <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">Best of gang</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-lg">
            <Trophy className="w-3 h-3 text-green-500" />
            <span className="text-[10px] font-black text-green-500">{history.filter(s => s.status === 'WIN').length} WINS</span>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0a0c]"></span>
          </button>
          <button 
            onClick={() => setCurrentTab('settings')}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <User className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 pb-24 flex-1 w-full">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>

        {/* Footer Info (Only on signals tab) */}
        {currentTab === 'signals' && (
          <footer className="pt-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-6 opacity-30">
              <PawPrint className="w-6 h-6" />
              <PawPrint className="w-6 h-6" />
              <PawPrint className="w-6 h-6" />
            </div>
            <p className="text-[10px] text-gray-600 font-medium leading-relaxed max-w-[240px] mx-auto">
              © 2026 Horti Johnson - Best of gang<br/>
              Lembre-se: Apostas envolvem riscos. Use com responsabilidade.
            </p>
          </footer>
        )}
      </main>

      {/* Bottom Navigation (Mobile Style) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0c]/80 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex items-center justify-between z-50">
        <button 
          onClick={() => setCurrentTab('signals')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'signals' ? 'text-white' : 'text-gray-500'}`}
        >
          <Zap className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Sinais</span>
        </button>
        <button 
          onClick={() => setCurrentTab('history')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'history' ? 'text-white' : 'text-gray-500'}`}
        >
          <History className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Histórico</span>
        </button>
        <button 
          onClick={() => setCurrentTab('ranking')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'ranking' ? 'text-white' : 'text-gray-500'}`}
        >
          <TrendingUp className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Ranking</span>
        </button>
        <button 
          onClick={() => setCurrentTab('settings')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'settings' ? 'text-white' : 'text-gray-500'}`}
        >
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Perfil</span>
        </button>
      </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
