import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('spotify_access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ connected: false });
  }

  try {
    // Verify token is still valid by fetching user profile
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ connected: false });
    }

    const userData = await response.json();
    return NextResponse.json({ 
      connected: true,
      user: {
        id: userData.id,
        display_name: userData.display_name,
        email: userData.email,
        images: userData.images,
      }
    });
  } catch (err) {
    return NextResponse.json({ connected: false });
  }
}
