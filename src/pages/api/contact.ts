/**
 * POST /api/contact — the portfolio's "contact.php".
 * Runs on the small Node server (the rest of the site is static HTML).
 * Validates the form, limits abuse, then emails the message through SMTP.
 *
 * Configuration (environment variables, see .env.example):
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS — the mailbox that sends
 *   CONTACT_TO   — where messages arrive (default: ask@lucasmarfaing.pro)
 *   CONTACT_FROM — sender shown in the email (default: SMTP_USER)
 */
import type { APIRoute } from 'astro';
import nodemailer, { type Transporter } from 'nodemailer';

export const prerender = false;

const LIMITS = { name: 100, email: 200, type: 60, message: 5000 };
const MAX_PER_HOUR = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limit: max 5 messages per hour per visitor IP
const hits = new Map<string, number[]>();
const isRateLimited = (ip: string) => {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return recent.length > MAX_PER_HOUR;
};

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const env = (key: string) => process.env[key]?.trim() ?? '';

let transport: Transporter | undefined;
const getTransport = () => {
  transport ??= nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port: Number(env('SMTP_PORT') || 465),
    secure: (env('SMTP_SECURE') || 'true') !== 'false',
    auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
  });
  return transport;
};

export const POST: APIRoute = async ({ request, clientAddress, site }) => {
  // Only accept submissions coming from the site itself
  const origin = request.headers.get('origin');
  const allowed = [site?.origin, new URL(request.url).origin].filter(Boolean);
  if (origin && !allowed.includes(origin)) return json(403, { ok: false, error: 'origin' });

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return json(400, { ok: false, error: 'format' });
  }
  const field = (key: keyof typeof LIMITS) => String(data.get(key) ?? '').trim().slice(0, LIMITS[key]);
  const name = field('name');
  const email = field('email');
  const type = field('type');
  const message = field('message');

  // Spam trap: bots fill the hidden field. Pretend it worked.
  if (String(data.get('_gotcha') ?? '')) return json(200, { ok: true });

  if (!name || !message || !EMAIL_RE.test(email)) return json(400, { ok: false, error: 'fields' });

  const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? clientAddress;
  if (isRateLimited(ip)) return json(429, { ok: false, error: 'rate' });

  const subject = `[Portfolio] ${type || 'Contact'} — ${name}`.replace(/[\r\n]+/g, ' ');
  const text = `${message}\n\n—\n${name} <${email}>\nType : ${type || '—'}\nIP : ${ip}`;

  if (!env('SMTP_HOST')) {
    if (import.meta.env.DEV) {
      // Local development without SMTP: show the message in the terminal instead of sending it
      console.log(`\n[contact] (dev, not sent)\n${subject}\n${text}\n`);
      return json(200, { ok: true, dev: true });
    }
    console.error('[contact] SMTP_HOST is not set — message not sent');
    return json(500, { ok: false, error: 'config' });
  }

  try {
    await getTransport().sendMail({
      from: { name: 'Portfolio LM-26', address: env('CONTACT_FROM') || env('SMTP_USER') },
      to: env('CONTACT_TO') || 'ask@lucasmarfaing.pro',
      replyTo: { name, address: email },
      subject,
      text,
    });
    return json(200, { ok: true });
  } catch (error) {
    console.error('[contact] sending failed:', error);
    return json(502, { ok: false, error: 'send' });
  }
};
