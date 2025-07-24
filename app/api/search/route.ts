import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Get GraphQL query and variables from request body
    const { query, variables } = await req.json();
    
    // Get backend URL from environment variables
    const backendUrl =  process.env.NEXT_PUBLIC_API_GraphQL_URL || '';
    console.log(backendUrl)
    if (!backendUrl) {
      throw new Error('BACKEND_URL environment variable is not defined');
    }

    // Forward request to backend GraphQL endpoint
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any required headers for your backend (e.g., authentication)
      },
      body: JSON.stringify({ query, variables }),
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Backend request failed: ${response.status} ${response.statusText} - ${errorData}`);
    }

    // Return backend response data
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        errors: [{ 
          message: error.message || 'Internal server error' 
        }] 
      },
      { status: 500 }
    );
  }
}