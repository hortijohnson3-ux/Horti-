export type SignalType = 'PLAYER' | 'BANKER' | 'TIE';

export interface Signal {
  id: string;
  type: SignalType;
  timestamp: Date;
  status: 'WIN' | 'LOSS' | 'PENDING';
  gale?: number;
  confidence?: number;
  pattern?: string;
  instruction?: string;
}

export interface AppState {
  currentSignal: Signal | null;
  history: Signal[];
  accuracy: number;
  isAnalyzing: boolean;
  nextSignalTime: number; // seconds
}
