'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Music,
  Trophy,
  Star,
  Volume2,
  Target,
  Zap,
  X,
  RotateCcw,
} from 'lucide-react';
import type { KaraokeTrack } from '@/lib/spotify';
import { AudioAnalyzer, KaraokeScorer, type PerformanceScore } from '@/lib/audio-analyzer';

interface KaraokeSingModeProps {
  track: KaraokeTrack;
  onClose: () => void;
  onScoreSubmit?: (trackId: string, score: PerformanceScore) => void;
}

type SingState = 'idle' | 'countdown' | 'singing' | 'finished';

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function KaraokeSingMode({ track, onClose, onScoreSubmit }: KaraokeSingModeProps) {
  const [singState, setSingState] = useState<SingState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [visualizationData, setVisualizationData] = useState<number[]>(new Array(32).fill(0));
  const [currentVolume, setCurrentVolume] = useState(0);
  const [isVoiceDetected, setIsVoiceDetected] = useState(false);
  const [finalScore, setFinalScore] = useState<PerformanceScore | null>(null);
  const [showResults, setShowResults] = useState(false);

  const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null);
  const scorerRef = useRef<KaraokeScorer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio analyzer
  const initializeAudio = useCallback(async () => {
    audioAnalyzerRef.current = new AudioAnalyzer();
    scorerRef.current = new KaraokeScorer();
    
    const success = await audioAnalyzerRef.current.initialize();
    setMicPermission(success ? 'granted' : 'denied');
    return success;
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioAnalyzerRef.current) {
        audioAnalyzerRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Animation loop for visualization
  const updateVisualization = useCallback(() => {
    if (audioAnalyzerRef.current && singState === 'singing') {
      const analysis = audioAnalyzerRef.current.analyze();
      const vizData = audioAnalyzerRef.current.getVisualizationData();
      
      setVisualizationData(vizData);
      setCurrentVolume(analysis.volume);
      setIsVoiceDetected(analysis.isVoiceDetected);
      
      if (scorerRef.current) {
        scorerRef.current.addSample(analysis);
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(updateVisualization);
  }, [singState]);

  // Start singing session
  const startSinging = async () => {
    const success = await initializeAudio();
    if (!success) return;

    setSingState('countdown');
    setCountdown(3);

    // Countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          beginPerformance();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const beginPerformance = () => {
    setSingState('singing');
    setElapsedTime(0);
    
    // Start scorer
    scorerRef.current?.start(track.duration_ms);
    
    // Start visualization
    animationFrameRef.current = requestAnimationFrame(updateVisualization);
    
    // Start timer
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);
      
      // Auto-stop after song duration (or 3 minutes max for demo)
      const maxDuration = Math.min(track.duration_ms, 180000);
      if (elapsed >= maxDuration) {
        stopSinging();
      }
    }, 100);

    // Play preview if available
    if (track.preview_url) {
      audioRef.current = new Audio(track.preview_url);
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(console.error);
    }
  };

  const stopSinging = () => {
    setSingState('finished');
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Calculate final score
    const score = scorerRef.current?.calculateScore();
    if (score) {
      setFinalScore(score);
      setShowResults(true);
      onScoreSubmit?.(track.id, score);
    }
  };

  const resetSession = () => {
    setSingState('idle');
    setElapsedTime(0);
    setFinalScore(null);
    setShowResults(false);
    setVisualizationData(new Array(32).fill(0));
    setCurrentVolume(0);
    setIsVoiceDetected(false);
    scorerRef.current?.reset();
    
    if (audioAnalyzerRef.current) {
      audioAnalyzerRef.current.stop();
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S': return 'text-yellow-400';
      case 'A': return 'text-green-400';
      case 'B': return 'text-blue-400';
      case 'C': return 'text-purple-400';
      case 'D': return 'text-orange-400';
      default: return 'text-red-400';
    }
  };

  const getGradeBg = (grade: string) => {
    switch (grade) {
      case 'S': return 'bg-yellow-500/20 border-yellow-500/50';
      case 'A': return 'bg-green-500/20 border-green-500/50';
      case 'B': return 'bg-blue-500/20 border-blue-500/50';
      case 'C': return 'bg-purple-500/20 border-purple-500/50';
      case 'D': return 'bg-orange-500/20 border-orange-500/50';
      default: return 'bg-red-500/20 border-red-500/50';
    }
  };

  const progress = (elapsedTime / Math.min(track.duration_ms, 180000)) * 100;

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="bg-gradient-to-b from-zinc-900 to-black border-zinc-800 max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {track.album.images?.[0]?.url ? (
                <img
                  src={track.album.images[0].url}
                  alt={track.album.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Music className="h-8 w-8 text-zinc-600" />
                </div>
              )}
              <div>
                <DialogTitle className="text-xl">{track.name}</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  {track.artists.map((a) => a.name).join(', ')}
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Countdown */}
          {singState === 'countdown' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-8xl font-bold text-[#1DB954] animate-pulse">
                {countdown}
              </div>
              <p className="text-zinc-400 mt-4">Get ready to sing!</p>
            </div>
          )}

          {/* Idle State */}
          {singState === 'idle' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="w-24 h-24 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
                <Mic className="h-12 w-12 text-[#1DB954]" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Ready to Sing?</h3>
                <p className="text-sm text-zinc-400 max-w-sm">
                  Click start to begin your karaoke performance. We&apos;ll analyze your singing and give you a score!
                </p>
              </div>
              {micPermission === 'denied' && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
                  Microphone access denied. Please enable it in your browser settings.
                </div>
              )}
              <Button
                size="lg"
                className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold px-8"
                onClick={startSinging}
              >
                <Play className="mr-2 h-5 w-5" />
                Start Singing
              </Button>
            </div>
          )}

          {/* Singing State */}
          {singState === 'singing' && (
            <div className="space-y-6">
              {/* Audio Visualization */}
              <div className="h-32 flex items-end justify-center gap-1 bg-zinc-900/50 rounded-lg p-4">
                {visualizationData.map((value, index) => (
                  <div
                    key={index}
                    className="w-2 bg-gradient-to-t from-[#1DB954] to-[#1ed760] rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(4, value)}%` }}
                  />
                ))}
              </div>

              {/* Status Indicators */}
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  {isVoiceDetected ? (
                    <Mic className="h-5 w-5 text-[#1DB954] animate-pulse" />
                  ) : (
                    <MicOff className="h-5 w-5 text-zinc-500" />
                  )}
                  <span className={isVoiceDetected ? 'text-[#1DB954]' : 'text-zinc-500'}>
                    {isVoiceDetected ? 'Singing detected!' : 'Waiting for voice...'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-zinc-400" />
                  <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1DB954] transition-all duration-75"
                      style={{ width: `${currentVolume}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>{formatDuration(elapsedTime)}</span>
                  <span>{formatDuration(Math.min(track.duration_ms, 180000))}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Controls */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopSinging}
                  className="px-8"
                >
                  <Square className="mr-2 h-5 w-5" />
                  Stop & Get Score
                </Button>
              </div>
            </div>
          )}

          {/* Results */}
          {singState === 'finished' && finalScore && (
            <div className="space-y-6">
              {/* Grade */}
              <div className="flex flex-col items-center">
                <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center ${getGradeBg(finalScore.grade)}`}>
                  <span className={`text-6xl font-bold ${getGradeColor(finalScore.grade)}`}>
                    {finalScore.grade}
                  </span>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-3xl font-bold">{finalScore.totalScore}</p>
                  <p className="text-zinc-400">Total Score</p>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 bg-zinc-900/50 border-zinc-800 text-center">
                  <Volume2 className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                  <p className="text-2xl font-bold">{finalScore.volumeConsistency}</p>
                  <p className="text-xs text-zinc-400">Volume Control</p>
                </Card>
                <Card className="p-4 bg-zinc-900/50 border-zinc-800 text-center">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                  <p className="text-2xl font-bold">{finalScore.pitchAccuracy}</p>
                  <p className="text-xs text-zinc-400">Pitch Accuracy</p>
                </Card>
                <Card className="p-4 bg-zinc-900/50 border-zinc-800 text-center">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                  <p className="text-2xl font-bold">{finalScore.engagement}</p>
                  <p className="text-xs text-zinc-400">Engagement</p>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={resetSession}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold"
                  onClick={onClose}
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
