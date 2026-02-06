import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import db, { initializeDb } from '@/lib/db';
import { registerSchema } from '@/lib/validators';

export async function POST(req: Request) {
  try {
    await initializeDb();
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una cuenta con ese correo' }, { status: 409 });
    }

    const id = uuid();
    const passwordHash = await hash(password, 12);

    await db.run(
      'INSERT INTO users (id, email, name, password_hash, provider) VALUES (?, ?, ?, ?, ?)',
      id, email, name, passwordHash, 'credentials'
    );

    return NextResponse.json({ userId: id }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
