import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('spotify_access_token')?.value;
  const playlistIds = request.nextUrl.searchParams.get('playlistIds');

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated with Spotify' }, { status: 401 });
  }

  if (!playlistIds) {
    return NextResponse.json({ error: 'No playlist IDs provided' }, { status: 400 });
  }

  try {
    const ids = playlistIds.split(',');
    const allTracks: any[] = [];

    for (const playlistId of ids) {
      let nextUrl: string | null = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;
      
      while (nextUrl) {
        const response: Response = await fetch(nextUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            return NextResponse.json({ error: 'Spotify token expired' }, { status: 401 });
          }
          console.error(`Failed to fetch tracks for playlist ${playlistId}`);
          break;
        }

        const data = await response.json();
        
        // Extract track data and filter out null/local tracks
        const tracks = data.items
          .filter((item: any) => item.track && item.track.id && !item.track.is_local)
          .map((item: any) => item.track);
        
        allTracks.push(...tracks);
        nextUrl = data.next;
      }
    }

    // Remove duplicates based on track ID
    const uniqueTracks = Array.from(
      new Map(allTracks.map(track => [track.id, track])).values()
    );

    return NextResponse.json({ tracks: uniqueTracks });
  } catch (err) {
    console.error('Error fetching tracks:', err);
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
  }
}
