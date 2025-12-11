'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Music, ListMusic, Check } from 'lucide-react';
import type { SpotifyPlaylist } from '@/lib/spotify';

interface PlaylistSelectorProps {
  onPlaylistsSelected: (playlistIds: string[]) => void;
  isProcessing?: boolean;
}

export function PlaylistSelector({ onPlaylistsSelected, isProcessing = false }: PlaylistSelectorProps) {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/spotify/playlists');
      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }
      const data = await response.json();
      setPlaylists(data.items || []);
    } catch (err) {
      setError('Failed to load playlists. Please try reconnecting to Spotify.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlaylist = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === playlists.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(playlists.map(p => p.id)));
    }
  };

  const handleGenerate = () => {
    onPlaylistsSelected(Array.from(selectedIds));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#1DB954] mb-4" />
        <p className="text-muted-foreground">Loading your playlists...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchPlaylists} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="text-center py-12">
        <ListMusic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No playlists found in your Spotify account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Select Playlists</h3>
          <p className="text-sm text-muted-foreground">
            Choose which playlists to analyze for karaoke songs
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={selectAll}>
          {selectedIds.size === playlists.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      <ScrollArea className="h-[400px] rounded-lg border border-border">
        <div className="p-4 space-y-2">
          {playlists.map((playlist) => (
            <Card
              key={playlist.id}
              className={`p-3 cursor-pointer transition-all hover:bg-secondary/50 ${
                selectedIds.has(playlist.id) ? 'ring-2 ring-[#1DB954] bg-[#1DB954]/10' : ''
              }`}
              onClick={() => togglePlaylist(playlist.id)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {playlist.images?.[0]?.url ? (
                    <img
                      src={playlist.images[0].url}
                      alt={playlist.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center">
                      <Music className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  {selectedIds.has(playlist.id) && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#1DB954] rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-black" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{playlist.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {playlist.tracks.total} tracks • {playlist.owner.display_name}
                  </p>
                </div>
                <Checkbox
                  checked={selectedIds.has(playlist.id)}
                  onCheckedChange={() => togglePlaylist(playlist.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="data-[state=checked]:bg-[#1DB954] data-[state=checked]:border-[#1DB954]"
                />
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          {selectedIds.size} playlist{selectedIds.size !== 1 ? 's' : ''} selected
        </p>
        <Button
          onClick={handleGenerate}
          disabled={selectedIds.size === 0 || isProcessing}
          className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Music className="mr-2 h-4 w-4" />
              Generate Karaoke List
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
