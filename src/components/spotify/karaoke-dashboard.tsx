'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { SpotifyConnectButton } from './spotify-connect-button';
import { PlaylistSelector } from './playlist-selector';
import { KaraokeList } from './karaoke-list';
import { processTracksForKaraoke, type KaraokeTrack, type SpotifyTrack } from '@/lib/spotify';
import { Mic2, Music2, Sparkles, ListMusic, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type ViewState = 'connect' | 'select' | 'processing' | 'results';

export function KaraokeDashboard() {
  const [viewState, setViewState] = useState<ViewState>('connect');
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [karaokeTracks, setKaraokeTracks] = useState<KaraokeTrack[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');

  const handleConnectionChange = (connected: boolean) => {
    setIsSpotifyConnected(connected);
    if (connected) {
      setViewState('select');
    } else {
      setViewState('connect');
    }
  };

  const handlePlaylistsSelected = async (playlistIds: string[]) => {
    setViewState('processing');
    setProcessingProgress(0);
    setProcessingMessage('Fetching tracks from your playlists...');

    try {
      // Fetch tracks
      setProcessingProgress(20);
      const response = await fetch(
        `/api/spotify/tracks?playlistIds=${playlistIds.join(',')}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tracks');
      }

      const data = await response.json();
      const tracks: SpotifyTrack[] = data.tracks;

      setProcessingProgress(50);
      setProcessingMessage(`Analyzing ${tracks.length} tracks for karaoke suitability...`);

      // Simulate processing time for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProcessingProgress(70);

      // Process tracks
      const processed = processTracksForKaraoke(tracks);

      setProcessingProgress(90);
      setProcessingMessage('Finalizing your karaoke list...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      setKaraokeTracks(processed);
      setProcessingProgress(100);
      
      setTimeout(() => {
        setViewState('results');
      }, 300);
    } catch (err) {
      console.error('Error processing playlists:', err);
      setViewState('select');
      alert('Failed to process playlists. Please try again.');
    }
  };

  const handleReset = () => {
    setKaraokeTracks([]);
    setViewState('select');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1DB954]/20 mb-4">
          <Mic2 className="h-8 w-8 text-[#1DB954]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Karaoke List Generator
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Connect your Spotify account and we'll analyze your playlists to create
          the perfect karaoke song list for your next party.
        </p>
      </div>

      {/* Main Content */}
      {viewState === 'connect' && (
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <Music2 className="h-16 w-16 text-[#1DB954] mx-auto" />
              <h2 className="text-2xl font-semibold">Connect Your Spotify</h2>
              <p className="text-muted-foreground">
                Link your Spotify account to access your playlists and discover
                the best karaoke songs from your music library.
              </p>
            </div>

            <SpotifyConnectButton onConnectionChange={handleConnectionChange} />

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-border">
              <div className="text-center p-4">
                <ListMusic className="h-8 w-8 text-[#1DB954] mx-auto mb-2" />
                <h3 className="font-medium mb-1">Select Playlists</h3>
                <p className="text-sm text-muted-foreground">
                  Choose which playlists to analyze
                </p>
              </div>
              <div className="text-center p-4">
                <Sparkles className="h-8 w-8 text-[#1DB954] mx-auto mb-2" />
                <h3 className="font-medium mb-1">Smart Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered karaoke scoring
                </p>
              </div>
              <div className="text-center p-4">
                <Mic2 className="h-8 w-8 text-[#1DB954] mx-auto mb-2" />
                <h3 className="font-medium mb-1">Export & Share</h3>
                <p className="text-sm text-muted-foreground">
                  Save as playlist or download
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {viewState === 'select' && (
        <Card className="max-w-3xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Your Spotify Playlists</h2>
            </div>
            <SpotifyConnectButton onConnectionChange={handleConnectionChange} />
          </div>
          <PlaylistSelector
            onPlaylistsSelected={handlePlaylistsSelected}
            isProcessing={false}
          />
        </Card>
      )}

      {viewState === 'processing' && (
        <Card className="max-w-xl mx-auto p-8">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#1DB954]/20 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-[#1DB954] animate-spin" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Analyzing Your Music</h2>
              <p className="text-muted-foreground">{processingMessage}</p>
            </div>
            <Progress value={processingProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {processingProgress}% complete
            </p>
          </div>
        </Card>
      )}

      {viewState === 'results' && (
        <Card className="max-w-4xl mx-auto p-6">
          <KaraokeList tracks={karaokeTracks} onReset={handleReset} />
        </Card>
      )}
    </div>
  );
}
