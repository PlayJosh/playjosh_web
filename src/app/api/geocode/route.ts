import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Using OpenStreetMap's Nominatim service (free and doesn't require an API key)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json();

    if (!data.address) {
      throw new Error('No address found for the given coordinates');
    }

    const { address } = data;
    
    // Extract relevant address components
    const locationData = {
      city: address.city || address.town || address.village || address.hamlet,
      state: address.state,
      country: address.country,
      display_name: data.display_name
    };

    return NextResponse.json(locationData);
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get location data' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
