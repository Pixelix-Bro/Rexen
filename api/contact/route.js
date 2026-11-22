import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* =========================================
   SOZLAMALAR
========================================= */

// Contact.jsx dagi SERVICES bilan bir xil bo'lishi kerak
const ALLOWED_SERVICES = [
  'Website',
  'CRM & ERP',
  'SaaS platform',
  'AI & Automation',
  'Mobile app',
  'UI/UX design',
  'Something else',
]

const LIMITS = { name: 100, email: 200, phone: 60, message: 3000 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 } // 10 daqiqada 5 ta so'rov

/* =========================================
   RATE LIMIT (xotirada)
   Eslatma: serverless (Vercel) da instansiyalar orasida bo'lishilmaydi.
   Jiddiy himoya uchun Upstash Redis / Vercel KV ishlating.
========================================= */

const hits = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT.windowMs)
  if (recent.length >= RATE_LIMIT.max) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)

  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < RATE_LIMIT.windowMs)) hits.delete(key)
    }
  }
  return false
}

function getIp(req) {
  const fwd = req.headers.get('x-forwarded-for')
  return (fwd ? fwd.split(',')[0].trim() : req.headers.get('x-real-ip')) || 'unknown'
}

/* =========================================
   YORDAMCHILAR
========================================= */

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function validate(data) {
  const errors = {}
  if (data.name.length < 2) errors.name = 'Please enter your name.'
  if (!EMAIL_RE.test(data.email)) errors.email = 'Please enter a valid email address.'
  if (data.message.length < 10) errors.message = 'Message is too short.'
  return errors
}

// Boshqa saytdan yuborilgan so'rovlarni to'sadi
function isSameOrigin(req) {
  const origin = req.headers.get('origin')
  if (!origin) return true
  try {
    return new URL(origin).host === req.headers.get('host')
  } catch {
    return false
  }
}

/* =========================================
   TELEGRAM
========================================= */

function buildText(d, meta) {
  return [
    '<b>🆕 New project request</b>',
    '',
    `<b>Name:</b> ${escapeHtml(d.name)}`,
    `<b>Email:</b> ${escapeHtml(d.email)}`,
    d.phone ? `<b>Phone / Telegram:</b> ${escapeHtml(d.phone)}` : null,
    d.services.length ? `<b>Needs:</b> ${escapeHtml(d.services.join(', '))}` : null,
    '',
    `<b>Message:</b>\n${escapeHtml(d.message)}`,
    '',
    `<i>${escapeHtml(meta.time)} · ${escapeHtml(meta.ip)}</i>`,
  ]
    .filter((line) => line !== null)
    .join('\n')
}

async function sendToChat(token, chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    // Telegram sababni o'zi yozadi: "chat not found", "Unauthorized" va h.k.
    const info = await res.json().catch(() => ({}))
    throw new Error(
      `Telegram ${res.status}: ${info.description || 'unknown error'} (chat ${chatId})`
    )
  }
}

/* =========================================
   POST /api/contact
========================================= */

export async function POST(req) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  // Bir nechta chat ID ni vergul bilan yozish mumkin: "123456,-1001234567890"
  const chatIds = (process.env.TELEGRAM_CHAT_ID || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  if (!token || chatIds.length === 0) {
    console.error("[contact] TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID .env.local da yo'q")
    return NextResponse.json({ error: 'Server is not configured' }, { status: 500 })
  }

  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const ip = getIp(req)
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '600' } }
    )
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Honeypot: bot to'ldirgan bo'lsa, jimgina "muvaffaqiyatli" deymiz
  if (typeof body?.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  const data = {
    name: clean(body?.name, LIMITS.name),
    email: clean(body?.email, LIMITS.email),
    phone: clean(body?.phone, LIMITS.phone),
    message: clean(body?.message, LIMITS.message),
    services: Array.isArray(body?.services)
      ? [...new Set(body.services)].filter((s) => ALLOWED_SERVICES.includes(s))
      : [],
  }

  const errors = validate(data)
  if (Object.keys(errors).length) {
    return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 })
  }

  const meta = {
    ip,
    time: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Tashkent' }) + ' (Tashkent)',
  }
  const text = buildText(data, meta)

  const results = await Promise.allSettled(chatIds.map((id) => sendToChat(token, id, text)))
  results.forEach((r) => r.status === 'rejected' && console.error('[contact]', r.reason.message))

  // Kamida bitta chatga yetib borsa, muvaffaqiyatli hisoblanadi
  if (!results.some((r) => r.status === 'fulfilled')) {
    return NextResponse.json({ error: 'Could not deliver message' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}

export function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'POST' } }
  )
}
