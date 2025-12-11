'use client';

import { Button } from '@/components/ui/button';
import { Music2, Loader2, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
}

interface SpotifyConnectButtonProps {
  onConnectionChange?: (connected: boolean, user?: SpotifyUser) => void;
}

export function SpotifyConnectButton({ onConnectionChange }: SpotifyConnectButtonProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SpotifyUser | null>(null);

  useEffect(() => {
    checkSpotifyStatus();
  }, []);

  const checkSpotifyStatus = async () => {
    try {
      const response = await fetch('/api/spotify/status');
      const data = await response.json();
      setIsConnected(data.connected);
      setUser(data.user || null);
      onConnectionChange?.(data.connected, data.user);
    } catch (err) {
      console.error('Error checking Spotify status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/spotify/callback`;
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-modify-private',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId || '',
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes,
      show_dialog: 'true',
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/spotify/disconnect', { method: 'POST' });
      setIsConnected(false);
      setUser(null);
      onConnectionChange?.(false);
    } catch (err) {
      console.error('Error disconnecting:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Button disabled className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking...
      </Button>
    );
  }

  if (isConnected && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-4 py-2">
          {user.images?.[0]?.url ? (
            <img 
              src={user.images[0].url} 
              alt={user.display_name} 
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <Music2 className="w-5 h-5 text-[#1DB954]" />
          )}
          <span className="text-sm font-medium">{user.display_name}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleDisconnect}
          className="border-destructive/50 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleConnect}
      className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold"
    >
      <Music2 className="mr-2 h-5 w-5" />
      Connect with Spotify
    </Button>
  );
}
