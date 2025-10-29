import { NextResponse } from 'next/server';

export async function GET() {
  const contractAddress = process.env.CONTRACT_ADDRESS || 'Coming Soon';
  
  return NextResponse.json({
    contractAddress
  });
}



