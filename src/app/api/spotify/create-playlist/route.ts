import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated with Spotify' }, { status: 401 });
  }

  try {
    const { name, description, trackUris } = await request.json();

    // Get user ID first
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();

    // Create playlist
    const createResponse = await fetch(
      `https://api.spotify.com/v1/users/${userData.id}/playlists`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || 'Created with Karaoke List Generator',
          public: false,
        }),
      }
    );

    if (!createResponse.ok) {
      throw new Error('Failed to create playlist');
    }

    const playlistData = await createResponse.json();

    // Add tracks to playlist (in batches of 100)
    const batchSize = 100;
    for (let i = 0; i < trackUris.length; i += batchSize) {
      const batch = trackUris.slice(i, i + batchSize);
      
      await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: batch,
        }),
      });
    }

    return NextResponse.json({ 
      success: true, 
      playlist: {
        id: playlistData.id,
        name: playlistData.name,
        external_url: playlistData.external_urls?.spotify,
      }
    });
  } catch (err) {
    console.error('Error creating playlist:', err);
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}
