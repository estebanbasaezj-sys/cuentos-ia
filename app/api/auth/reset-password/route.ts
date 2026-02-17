import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import db, { initializeDb } from '@/lib/db';
import { resetPasswordSchema } from '@/lib/validators';

export async function POST(req: Request) {
  try {
    await initializeDb();
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Datos invalidos' },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    const reset = await db.get<{ id: string; user_id: string; expires_at: string; used: number }>(
      'SELECT id, user_id, expires_at, used FROM password_resets WHERE token = ?',
      token
    );

    if (!reset) {
      return NextResponse.json({ error: 'Codigo invalido o expirado' }, { status: 400 });
    }

    if (reset.used) {
      return NextResponse.json({ error: 'Este codigo ya fue utilizado' }, { status: 400 });
    }

    if (new Date(reset.expires_at) < new Date()) {
      return NextResponse.json({ error: 'El codigo ha expirado. Solicita uno nuevo.' }, { status: 400 });
    }

    // Hash new password and update user
    const passwordHash = await hash(password, 12);
    await db.run('UPDATE users SET password_hash = ?, updated_at = datetime(?) WHERE id = ?',
      passwordHash, new Date().toISOString(), reset.user_id
    );

    // Mark token as used
    await db.run('UPDATE password_resets SET used = 1 WHERE id = ?', reset.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
