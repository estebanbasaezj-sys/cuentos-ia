import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';
import db, { initializeDb } from '@/lib/db';
import { forgotPasswordSchema } from '@/lib/validators';

export async function POST(req: Request) {
  try {
    await initializeDb();
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Datos invalidos' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const user = await db.get<{ id: string; name: string; provider: string }>(
      'SELECT id, name, provider FROM users WHERE email = ?',
      email
    );

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    // Only allow reset for credentials users
    if (user.provider !== 'credentials') {
      return NextResponse.json({ ok: true });
    }

    // Invalidate previous tokens for this user
    await db.run(
      "UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0",
      user.id
    );

    // Generate a 6-digit code (easier to type than a UUID)
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    await db.run(
      'INSERT INTO password_resets (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      uuid(), user.id, code, expiresAt
    );

    // In development, log the code to the console
    console.log(`\n========================================`);
    console.log(`  CODIGO DE RECUPERACION`);
    console.log(`  Email: ${email}`);
    console.log(`  Codigo: ${code}`);
    console.log(`  Expira en 15 minutos`);
    console.log(`========================================\n`);

    // TODO: In production, send email with the code
    // await sendEmail(email, 'Recuperar contraseña', `Tu código es: ${code}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
