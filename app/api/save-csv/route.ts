// app/api/save-csv/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { filePath, content } = await request.json();
   
    if (!filePath || !content) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      );
    }
   
    // Security measure: Prevents path traversal attacks
   // Remove the leading slash before joining paths
    const sanitizedPath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '').replace(/^[\/\\]/, '');
    const fullPath = path.join(process.cwd(), 'public', sanitizedPath);
   
    // Create directory if required
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
   
    fs.writeFileSync(fullPath, content);
   
    return NextResponse.json(
      { message: 'CSV file saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving CSV file:', error);
    return NextResponse.json(
      { message: 'Error saving CSV file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}