import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  console.log(req.headers.get('Authorization'))
  try {
    // Forward the logout request to backend
    const response = await fetch(`${apiEndpoint}/auth/disconnect`, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
        'Cookie': req.headers.get('Cookie') || ''
      }
    });

    // Clear client-side cookies
    const res = response.ok
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: 'Logout failed' }, { status: 400 });

    // Clear the authToken cookie
    res.cookies.set('authToken', '', {
      expires: new Date(0),
      path: '/',
    });

    return res;
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}