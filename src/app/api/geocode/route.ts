import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Missing coordinates' },
      { status: 400 }
    );
  }

  try {
    // Using OpenStreetMap Nominatim with server-side request
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PlayJosh/1.0',
          'Accept-Language': 'en-US,en;q=0.9',
        //   'Referer': 'https://playjosh.com'
        }
      }
    );

    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse response:', text);
      throw new Error('Invalid response from geocoding service');
    }

    if (!response.ok) {
      console.error('Geocoding error:', data);
      throw new Error(data.error?.message || 'Failed to fetch location data');
    }

    // Format the response to only include what we need
    const result = {
      city: data.address?.city || data.address?.town || data.address?.village,
      state: data.address?.state,
      country: data.address?.country
    };

    if (!result.city && !result.state && !result.country) {
      throw new Error('No location data found for coordinates');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error getting location data' },
      { status: 500 }
    );
  }
}