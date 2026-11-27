/** Supernova burst icon for the running Chat status: a core with eight rays that turns slowly. */
import css from './ChatView.module.css'

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315]

/**
 * Render the decorative running icon; the CSS owns the rotation and respects reduced motion.
 * @returns the burst svg, inheriting the status text color.
 */
export function RunningWhaleTail() {
  return (
    <span className={css.runningIcon} aria-hidden="true">
      <svg className={css.runningNova} width="100%" height="100%" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2.2" fill="currentColor" />
        {RAYS.map(angle => (
          <line
            key={angle}
            x1="8"
            y1="1.6"
            x2="8"
            y2={angle % 90 === 0 ? '4.4' : '3.6'}
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            transform={`rotate(${angle} 8 8)`}
          />
        ))}
      </svg>
    </span>
  )
}
