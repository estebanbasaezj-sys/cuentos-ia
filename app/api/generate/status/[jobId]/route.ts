import { NextResponse } from 'next/server';
import db, { initializeDb } from '@/lib/db';
import type { Story } from '@/types';

export async function GET(req: Request, { params }: { params: { jobId: string } }) {
  try {
    await initializeDb();
    const story = await db.get<Pick<Story, 'status' | 'generation_progress' | 'error_message' | 'title'>>(
      'SELECT status, generation_progress, error_message, title FROM stories WHERE id = ?',
      params.jobId
    );

    if (!story) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      status: story.status,
      progress: story.generation_progress,
      title: story.title,
      error: story.error_message,
    });
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
