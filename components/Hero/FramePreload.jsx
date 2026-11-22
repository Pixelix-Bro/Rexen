const TOTAL_FRAMES = 120

const SETS = [
  { dir: '/media/frames', media: '(min-width: 769px)' },
  { dir: '/media/frames-sm', media: '(max-width: 768px)' },
]

const file = (i) => `f_${String(i + 1).padStart(3, '0')}.webp`

export default function FramePreload() {
  return SETS.flatMap(({ dir, media }) =>
    Array.from({ length: TOTAL_FRAMES }, (_, i) => (
      <link
        key={`${dir}-${i}`}
        rel="preload"
        as="image"
        type="image/webp"
        href={`${dir}/${file(i)}`}
        media={media}
        fetchPriority={i === 0 ? 'high' : 'low'}
      />
    ))
  )
}
