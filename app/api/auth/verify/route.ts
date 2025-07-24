import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  console.log(req.headers.get('Authorization'))
  try {
    // Forward the verification request to backend
    const response = await fetch(`${apiEndpoint}/auth/verify`, {
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
        'Cookie': req.headers.get('Cookie') || ''
      }
    });

    if (!response.ok) {
      throw new Error('Verification failed');
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}