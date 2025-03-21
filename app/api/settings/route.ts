// app/api/settings/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const settingsData = await request.json();
    const filePath = path.join(process.cwd(), 'public', 'settings.json');
   
    // Formatted output for better readability of the JSON file
    fs.writeFileSync(filePath, JSON.stringify(settingsData, null, 2));
   
    return NextResponse.json({ message: 'Settings saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ message: 'Error saving settings' }, { status: 500 });
  }
}