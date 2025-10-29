import { NextResponse } from 'next/server';

export async function GET() {
  const contractAddress = 'CCCxGFK1PZh6tSznNwBiZVave3zEGpWHZkS8FCjspump';
  
  return NextResponse.json({
    contractAddress
  });
}



