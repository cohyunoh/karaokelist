// Spotify API utilities

export const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
export const SPOTIFY_REDIRECT_URI = typeof window !== 'undefined' 
  ? `${window.location.origin}/api/spotify/callback`
  : '';

const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
].join(' ');

export function getSpotifyAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID || '',
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SPOTIFY_SCOPES,
    show_dialog: 'true',
  });
  
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: {
    total: number;
    href: string;
  };
  owner: {
    display_name: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
}

export interface KaraokeTrack extends SpotifyTrack {
  karaokeScore: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  genre?: string;
  era?: string;
}

// Calculate karaoke suitability score
export function calculateKaraokeScore(track: SpotifyTrack): number {
  let score = 0;
  
  // Popularity contributes significantly (0-40 points)
  score += (track.popularity / 100) * 40;
  
  // Track duration sweet spot (2:30 - 4:30 is ideal for karaoke)
  const durationMinutes = track.duration_ms / 60000;
  if (durationMinutes >= 2.5 && durationMinutes <= 4.5) {
    score += 30;
  } else if (durationMinutes >= 2 && durationMinutes <= 5) {
    score += 20;
  } else {
    score += 10;
  }
  
  // Bonus for having a preview (indicates mainstream availability)
  if (track.preview_url) {
    score += 10;
  }
  
  // Random factor for variety (0-20 points)
  score += Math.random() * 20;
  
  return Math.min(100, Math.round(score));
}

// Determine difficulty based on various factors
export function determineDifficulty(track: SpotifyTrack): 'Easy' | 'Medium' | 'Hard' {
  const durationMinutes = track.duration_ms / 60000;
  
  // Longer songs are harder
  if (durationMinutes > 5) return 'Hard';
  if (durationMinutes < 2.5) return 'Easy';
  
  // Less popular songs might be harder to know
  if (track.popularity < 40) return 'Hard';
  if (track.popularity > 70) return 'Easy';
  
  return 'Medium';
}

// Estimate era based on album release (simplified)
export function estimateEra(track: SpotifyTrack): string {
  // This would ideally use the album release date from Spotify API
  // For now, we'll return a placeholder
  return 'Modern';
}

// Process tracks into karaoke-ready format
export function processTracksForKaraoke(tracks: SpotifyTrack[]): KaraokeTrack[] {
  return tracks
    .map(track => ({
      ...track,
      karaokeScore: calculateKaraokeScore(track),
      difficulty: determineDifficulty(track),
      era: estimateEra(track),
    }))
    .sort((a, b) => b.karaokeScore - a.karaokeScore);
}
