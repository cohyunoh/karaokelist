// Audio analysis utilities for karaoke scoring

export interface AudioAnalysisResult {
  volume: number; // 0-100
  pitch: number; // Hz
  isVoiceDetected: boolean;
}

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private dataArray: Uint8Array | null = null;
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.isInitialized = true;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }

  analyze(): AudioAnalysisResult {
    if (!this.isInitialized || !this.analyser || !this.dataArray) {
      return { volume: 0, pitch: 0, isVoiceDetected: false };
    }

    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i] * this.dataArray[i];
    }
    const rms = Math.sqrt(sum / this.dataArray.length);
    const volume = Math.min(100, (rms / 128) * 100);
    
    // Detect pitch using autocorrelation (simplified)
    const pitch = this.detectPitch();
    
    // Voice is detected if volume is above threshold and pitch is in human range
    const isVoiceDetected = volume > 10 && pitch > 80 && pitch < 1000;
    
    return { volume, pitch, isVoiceDetected };
  }

  private detectPitch(): number {
    if (!this.analyser || !this.audioContext) return 0;
    
    const bufferLength = this.analyser.fftSize;
    const buffer = new Float32Array(bufferLength);
    this.analyser.getFloatTimeDomainData(buffer);
    
    // Simple autocorrelation pitch detection
    let maxCorrelation = 0;
    let bestOffset = -1;
    const minPeriod = Math.floor(this.audioContext.sampleRate / 1000); // 1000 Hz max
    const maxPeriod = Math.floor(this.audioContext.sampleRate / 80); // 80 Hz min
    
    for (let offset = minPeriod; offset < maxPeriod && offset < bufferLength / 2; offset++) {
      let correlation = 0;
      for (let i = 0; i < bufferLength / 2; i++) {
        correlation += Math.abs(buffer[i] - buffer[i + offset]);
      }
      correlation = 1 - correlation / (bufferLength / 2);
      
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestOffset = offset;
      }
    }
    
    if (bestOffset === -1 || maxCorrelation < 0.5) return 0;
    
    return this.audioContext.sampleRate / bestOffset;
  }

  getVisualizationData(): number[] {
    if (!this.analyser || !this.dataArray) return [];
    
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Return a subset for visualization (32 bars)
    const bars = 32;
    const step = Math.floor(this.dataArray.length / bars);
    const result: number[] = [];
    
    for (let i = 0; i < bars; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += this.dataArray[i * step + j];
      }
      result.push(sum / step / 255 * 100);
    }
    
    return result;
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isInitialized = false;
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.stream = null;
    this.dataArray = null;
  }

  getIsInitialized(): boolean {
    return this.isInitialized;
  }
}

// Scoring algorithm for karaoke performance
export interface PerformanceScore {
  totalScore: number;
  volumeConsistency: number;
  pitchAccuracy: number;
  engagement: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export class KaraokeScorer {
  private volumeHistory: number[] = [];
  private pitchHistory: number[] = [];
  private voiceDetectionHistory: boolean[] = [];
  private startTime: number = 0;
  private songDuration: number = 0;

  start(songDurationMs: number): void {
    this.volumeHistory = [];
    this.pitchHistory = [];
    this.voiceDetectionHistory = [];
    this.startTime = Date.now();
    this.songDuration = songDurationMs;
  }

  addSample(analysis: AudioAnalysisResult): void {
    this.volumeHistory.push(analysis.volume);
    if (analysis.pitch > 0) {
      this.pitchHistory.push(analysis.pitch);
    }
    this.voiceDetectionHistory.push(analysis.isVoiceDetected);
  }

  calculateScore(): PerformanceScore {
    if (this.volumeHistory.length === 0) {
      return {
        totalScore: 0,
        volumeConsistency: 0,
        pitchAccuracy: 0,
        engagement: 0,
        grade: 'F',
      };
    }

    // Volume consistency (how steady is the singing)
    const avgVolume = this.volumeHistory.reduce((a, b) => a + b, 0) / this.volumeHistory.length;
    const volumeVariance = this.volumeHistory.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / this.volumeHistory.length;
    const volumeConsistency = Math.max(0, 100 - Math.sqrt(volumeVariance));

    // Pitch accuracy (consistency of pitch when singing)
    let pitchAccuracy = 50; // Default
    if (this.pitchHistory.length > 10) {
      const avgPitch = this.pitchHistory.reduce((a, b) => a + b, 0) / this.pitchHistory.length;
      const pitchVariance = this.pitchHistory.reduce((sum, p) => sum + Math.pow(p - avgPitch, 2), 0) / this.pitchHistory.length;
      // Lower variance = better pitch control
      pitchAccuracy = Math.max(0, Math.min(100, 100 - Math.sqrt(pitchVariance) / 5));
    }

    // Engagement (percentage of time voice was detected)
    const voiceDetectedCount = this.voiceDetectionHistory.filter(v => v).length;
    const engagement = (voiceDetectedCount / this.voiceDetectionHistory.length) * 100;

    // Calculate total score (weighted average)
    const totalScore = Math.round(
      volumeConsistency * 0.3 +
      pitchAccuracy * 0.4 +
      engagement * 0.3
    );

    // Determine grade
    let grade: PerformanceScore['grade'];
    if (totalScore >= 90) grade = 'S';
    else if (totalScore >= 80) grade = 'A';
    else if (totalScore >= 70) grade = 'B';
    else if (totalScore >= 60) grade = 'C';
    else if (totalScore >= 50) grade = 'D';
    else grade = 'F';

    return {
      totalScore,
      volumeConsistency: Math.round(volumeConsistency),
      pitchAccuracy: Math.round(pitchAccuracy),
      engagement: Math.round(engagement),
      grade,
    };
  }

  reset(): void {
    this.volumeHistory = [];
    this.pitchHistory = [];
    this.voiceDetectionHistory = [];
    this.startTime = 0;
    this.songDuration = 0;
  }
}
