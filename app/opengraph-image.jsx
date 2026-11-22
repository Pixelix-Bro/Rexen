import { ImageResponse } from 'next/og'

export const alt = 'Rexen — Digital Engineering Company'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 80,
        background: '#070707',
        color: '#ffffff',
      }}
    >
      <div style={{ fontSize: 28, letterSpacing: 6, color: 'rgba(255,255,255,0.5)' }}>
        REXEN — DIGITAL ENGINEERING COMPANY
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: 24,
          fontSize: 132,
          fontWeight: 800,
          lineHeight: 0.95,
        }}
      >
        <span>WE BUILD THE</span>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>DIGITAL FUTURE.</span>
      </div>
    </div>,
    size
  )
}
