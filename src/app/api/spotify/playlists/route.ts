import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated with Spotify' }, { status: 401 });
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: 'Spotify token expired' }, { status: 401 });
      }
      throw new Error('Failed to fetch playlists');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching playlists:', err);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}
