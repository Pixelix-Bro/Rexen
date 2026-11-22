import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ============================================
// CONFIGURATION
// ============================================

const ALLOWED_SERVICES = [
  'Website',
  'CRM & ERP',
  'SaaS platform',
  'AI & Automation',
  'Mobile app',
  'UI/UX design',
  'Something else',
]

const LIMITS = {
  name: 100,
  email: 200,
  phone: 60,
  message: 3000,
}

const RATE_LIMIT = {
  max: 5,
  windowMs: 10 * 60 * 1000,
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_BODY_SIZE = 32 * 1024
const TELEGRAM_TIMEOUT = 10000

// ============================================
// RESPONSE HELPERS
// ============================================

function response(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

// ============================================
// RATE LIMIT
// ============================================

// Note: In-memory rate limiting is best-effort only.
// Use Redis/Upstash for reliable production rate limiting
// across multiple Vercel serverless instances.

const hits = new Map()

function isRateLimited(ip) {
  const now = Date.now()

  const recent = (hits.get(ip) || []).filter((time) => now - time < RATE_LIMIT.windowMs)

  if (recent.length >= RATE_LIMIT.max) {
    hits.set(ip, recent)
    return true
  }

  recent.push(now)
  hits.set(ip, recent)

  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.some((time) => now - time < RATE_LIMIT.windowMs)) {
        hits.delete(key)
      }
    }
  }

  return false
}

// ============================================
// SECURITY
// ============================================

function getIp(req) {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

function isSameOrigin(req) {
  const origin = req.headers.get('origin')

  // Contact API browser requests should include Origin.
  if (!origin) return false

  try {
    const originUrl = new URL(origin)
    const host = req.headers.get('host')

    if (!host) return false

    // Explicitly allowed origins, useful for custom domains.
    const allowedOrigins = (process.env.CONTACT_ALLOWED_ORIGINS || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    if (allowedOrigins.includes(originUrl.origin)) {
      return true
    }

    return originUrl.host === host
  } catch {
    return false
  }
}

function clean(value, max) {
  if (typeof value !== 'string') return ''

  return value.replace(/\0/g, '').trim().slice(0, max)
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function validate(data) {
  const errors = {}

  if (data.name.length < 2) {
    errors.name = 'Please enter your name.'
  }

  if (!EMAIL_RE.test(data.email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (data.message.length < 10) {
    errors.message = 'Message must contain at least 10 characters.'
  }

  return errors
}

// ============================================
// TELEGRAM MESSAGE
// ============================================

function buildText(data, meta) {
  const lines = [
    '<b>NEW PROJECT REQUEST</b>',
    '━━━━━━━━━━━━━━━━━━',
    '',
    `<b>Name:</b> ${escapeHtml(data.name)}`,
    `<b>Email:</b> ${escapeHtml(data.email)}`,
    data.phone ? `<b>Phone / Telegram:</b> ${escapeHtml(data.phone)}` : null,
    '',
    data.services.length
      ? `<b>Services:</b>\n${data.services.map((service) => `• ${escapeHtml(service)}`).join('\n')}`
      : null,
    '',
    '<b>Project details:</b>',
    escapeHtml(data.message),
    '',
    '━━━━━━━━━━━━━━━━━━',
    `<b>Time:</b> ${escapeHtml(meta.time)}`,
    `<b>IP:</b> ${escapeHtml(meta.ip)}`,
    '',
    '<i>Sent from REXEN website</i>',
  ]

  return lines.filter((line) => line !== null).join('\n')
}

// ============================================
// TELEGRAM API
// ============================================

async function sendToTelegram(token, chatId, message) {
  const controller = new AbortController()

  const timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT)

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
      cache: 'no-store',
    })

    const result = await res.json().catch(() => null)

    if (!res.ok || !result?.ok) {
      throw new Error(
        `Telegram API ${res.status}: ${result?.description || 'Unknown Telegram error'}`
      )
    }

    return {
      chatId,
      success: true,
      messageId: result.result?.message_id,
    }
  } finally {
    clearTimeout(timeout)
  }
}

// ============================================
// POST /api/contact
// ============================================

export async function POST(req) {
  try {
    // 1. Environment configuration

    const token = process.env.TELEGRAM_BOT_TOKEN

    const chatIds = [
      ...new Set(
        (process.env.TELEGRAM_CHAT_ID || '')
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      ),
    ]

    if (!token || chatIds.length === 0) {
      console.error('[REXEN CONTACT] Telegram configuration missing')

      return response({ ok: false, error: 'Service temporarily unavailable.' }, 503)
    }

    // 2. Origin protection

    if (!isSameOrigin(req)) {
      return response({ ok: false, error: 'Forbidden request.' }, 403)
    }

    // 3. Request size protection

    const contentLength = Number(req.headers.get('content-length') || 0)

    if (contentLength > MAX_BODY_SIZE) {
      return response({ ok: false, error: 'Request is too large.' }, 413)
    }

    // 4. Rate limiting

    const ip = getIp(req)

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Too many requests. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '600',
          },
        }
      )
    }

    // 5. Parse JSON

    let body

    try {
      body = await req.json()
    } catch {
      return response({ ok: false, error: 'Invalid request data.' }, 400)
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return response({ ok: false, error: 'Invalid request data.' }, 400)
    }

    // 6. Honeypot

    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return response({ ok: true })
    }

    // 7. Sanitize input

    const data = {
      name: clean(body.name, LIMITS.name),
      email: clean(body.email, LIMITS.email),
      phone: clean(body.phone, LIMITS.phone),
      message: clean(body.message, LIMITS.message),

      services: Array.isArray(body.services)
        ? [
            ...new Set(
              body.services
                .filter((item) => typeof item === 'string')
                .filter((item) => ALLOWED_SERVICES.includes(item))
            ),
          ].slice(0, ALLOWED_SERVICES.length)
        : [],
    }

    // 8. Validation

    const errors = validate(data)

    if (Object.keys(errors).length > 0) {
      return response(
        {
          ok: false,
          error: 'Validation failed.',
          errors,
        },
        400
      )
    }

    // 9. Build message

    const meta = {
      ip,
      time:
        new Date().toLocaleString('en-GB', {
          timeZone: 'Asia/Tashkent',
        }) + ' (Tashkent)',
    }

    const message = buildText(data, meta)

    // 10. Send to all Telegram chats

    const results = await Promise.allSettled(
      chatIds.map((chatId) => sendToTelegram(token, chatId, message))
    )

    const successful = results.filter((result) => result.status === 'fulfilled')

    const failed = results.filter((result) => result.status === 'rejected')

    // Log detailed errors only on the server.

    failed.forEach((result) => {
      console.error('[REXEN TELEGRAM ERROR]', result.reason?.message || 'Unknown error')
    })

    // 11. At least one successful delivery

    if (successful.length === 0) {
      console.error('[REXEN CONTACT] Message delivery failed in all chats')

      return response(
        {
          ok: false,
          error: 'Message delivery failed. Please try again.',
        },
        502
      )
    }

    // 12. Success

    console.info(`[REXEN CONTACT] Delivered to ${successful.length}/${chatIds.length} chats`)

    return response({
      ok: true,
      message: 'Your request has been sent successfully.',
    })
  } catch (error) {
    console.error('[REXEN CONTACT FATAL]', error?.name, error?.message)

    return response(
      {
        ok: false,
        error: 'Something went wrong. Please try again later.',
      },
      500
    )
  }
}

// ============================================
// GET /api/contact
// ============================================

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Method not allowed.',
    },
    {
      status: 405,
      headers: {
        Allow: 'POST',
        'Cache-Control': 'no-store',
      },
    }
  )
}
