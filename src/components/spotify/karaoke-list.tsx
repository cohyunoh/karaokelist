'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Search,
  Download,
  ListPlus,
  Music,
  Clock,
  Star,
  Loader2,
  ExternalLink,
  ArrowLeft,
  Mic2,
  Mic,
  Trophy,
} from 'lucide-react';
import type { KaraokeTrack } from '@/lib/spotify';
import { KaraokeSingMode } from './karaoke-sing-mode';
import type { PerformanceScore } from '@/lib/audio-analyzer';

interface KaraokeListProps {
  tracks: KaraokeTrack[];
  onReset: () => void;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function KaraokeList({ tracks, onReset }: KaraokeListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [playlistName, setPlaylistName] = useState('My Karaoke Night 🎤');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createdPlaylistUrl, setCreatedPlaylistUrl] = useState<string | null>(null);
  const [singModeTrack, setSingModeTrack] = useState<KaraokeTrack | null>(null);
  const [trackScores, setTrackScores] = useState<Record<string, PerformanceScore>>({});

  const filteredTracks = useMemo(() => {
    return tracks.filter((track) => {
      const matchesSearch =
        searchQuery === '' ||
        track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artists.some((a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesDifficulty =
        difficultyFilter === 'all' || track.difficulty === difficultyFilter;

      return matchesSearch && matchesDifficulty;
    });
  }, [tracks, searchQuery, difficultyFilter]);

  const handleExportCSV = () => {
    const headers = ['Song', 'Artist', 'Album', 'Duration', 'Karaoke Score', 'Difficulty'];
    const rows = filteredTracks.map((track) => [
      track.name,
      track.artists.map((a) => a.name).join(', '),
      track.album.name,
      formatDuration(track.duration_ms),
      track.karaokeScore,
      track.difficulty,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'karaoke-list.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreatePlaylist = async () => {
    setIsCreatingPlaylist(true);
    try {
      const trackUris = filteredTracks.map((track) => `spotify:track:${track.id}`);
      
      const response = await fetch('/api/spotify/create-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playlistName,
          description: `Karaoke playlist with ${filteredTracks.length} songs - Created with Karaoke List Generator`,
          trackUris,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create playlist');
      }

      const data = await response.json();
      setCreatedPlaylistUrl(data.playlist.external_url);
    } catch (err) {
      console.error('Error creating playlist:', err);
      alert('Failed to create playlist. Please try again.');
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const handleScoreSubmit = (trackId: string, score: PerformanceScore) => {
    setTrackScores((prev) => ({ ...prev, [trackId]: score }));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onReset}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Mic2 className="h-6 w-6 text-[#1DB954]" />
              Your Karaoke List
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredTracks.length} songs ready for karaoke night
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold">
                <ListPlus className="mr-2 h-4 w-4" />
                Save to Spotify
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              {createdPlaylistUrl ? (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-[#1DB954]">Playlist Created! 🎉</DialogTitle>
                    <DialogDescription>
                      Your karaoke playlist has been created successfully.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Button
                      className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold"
                      onClick={() => window.open(createdPlaylistUrl, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in Spotify
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateDialog(false);
                        setCreatedPlaylistUrl(null);
                      }}
                    >
                      Close
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>Create Spotify Playlist</DialogTitle>
                    <DialogDescription>
                      Save your karaoke list as a new Spotify playlist.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="playlist-name">Playlist Name</Label>
                      <Input
                        id="playlist-name"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        placeholder="My Karaoke Night"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This will create a new playlist with {filteredTracks.length} songs.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePlaylist}
                      disabled={isCreatingPlaylist || !playlistName.trim()}
                      className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold"
                    >
                      {isCreatingPlaylist ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Playlist'
                      )}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search songs or artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Track List */}
      <ScrollArea className="h-[500px] rounded-lg border border-border">
        <div className="p-4 space-y-2">
          {filteredTracks.length === 0 ? (
            <div className="text-center py-12">
              <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No songs match your filters.</p>
            </div>
          ) : (
            filteredTracks.map((track, index) => (
              <Card
                key={track.id}
                className="p-3 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </div>
                  {track.album.images?.[0]?.url ? (
                    <img
                      src={track.album.images[track.album.images.length - 1]?.url || track.album.images[0].url}
                      alt={track.album.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center">
                      <Music className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artists.map((a) => a.name).join(', ')}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formatDuration(track.duration_ms)}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-[#1DB954]" />
                      <span className="font-medium">{track.karaokeScore}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={getDifficultyColor(track.difficulty)}
                    >
                      {track.difficulty}
                    </Badge>
                    {trackScores[track.id] && (
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-yellow-400" />
                        <span className={`font-bold ${getGradeColor(trackScores[track.id].grade)}`}>
                          {trackScores[track.id].grade}
                        </span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#1DB954] text-[#1DB954] hover:bg-[#1DB954] hover:text-black"
                      onClick={() => setSingModeTrack(track)}
                    >
                      <Mic className="h-4 w-4 mr-1" />
                      Sing
                    </Button>
                  </div>
                </div>
                {/* Mobile info */}
                <div className="flex sm:hidden items-center justify-between gap-3 mt-2 ml-11">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDuration(track.duration_ms)}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 text-[#1DB954]" />
                      {track.karaokeScore}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getDifficultyColor(track.difficulty)}`}
                    >
                      {track.difficulty}
                    </Badge>
                    {trackScores[track.id] && (
                      <span className={`text-xs font-bold ${getGradeColor(trackScores[track.id].grade)}`}>
                        {trackScores[track.id].grade}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#1DB954] text-[#1DB954] hover:bg-[#1DB954] hover:text-black text-xs px-2 py-1 h-7"
                    onClick={() => setSingModeTrack(track)}
                  >
                    <Mic className="h-3 w-3 mr-1" />
                    Sing
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Sing Mode Dialog */}
      {singModeTrack && (
        <KaraokeSingMode
          track={singModeTrack}
          onClose={() => setSingModeTrack(null)}
          onScoreSubmit={handleScoreSubmit}
        />
      )}
    </div>
  );
}
