import { ThunderboltFilled } from '@ant-design/icons'
import { resolveStatus } from '../theme/status'

export function BrandMark({ size = 'md', onClick }) {
  return (
    <span
      className={`vh-brand vh-brand--${size}${onClick ? ' vh-brand--link' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span className="vh-brand__mark">
        <ThunderboltFilled />
      </span>
      <span className="vh-brand__text">HireHost</span>
    </span>
  )
}

export function PageHeader({ eyebrow, title, subtitle, extra, style }) {
  return (
    <div className="vh-page-head" style={style}>
      <div className="vh-page-head__main">
        {eyebrow && <div className="vh-eyebrow">{eyebrow}</div>}
        <h1 className="vh-h2 vh-page-head__title">{title}</h1>
        {subtitle && <p className="vh-page-head__subtitle">{subtitle}</p>}
      </div>
      {extra && <div className="vh-page-head__extra">{extra}</div>}
    </div>
  )
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'left' }) {
  return (
    <div className={`vh-section-head vh-section-head--${align}`}>
      {eyebrow && <div className="vh-eyebrow">{eyebrow}</div>}
      <h2 className="vh-h2">{title}</h2>
      {subtitle && <p className="vh-section-head__subtitle">{subtitle}</p>}
    </div>
  )
}

export function TerminalMockup() {
  return (
    <div className="vh-terminal" aria-hidden="true">
      <div className="vh-terminal__bar">
        <span className="vh-terminal__dot" />
        <span className="vh-terminal__dot" />
        <span className="vh-terminal__dot" />
        <span className="vh-terminal__title">~/hirehost</span>
      </div>
      <div className="vh-terminal__body">
        <div><span className="vh-terminal__prompt">$</span> hirehost deploy ./dist</div>
        <div className="vh-terminal__muted">→ đang tải lên 42 tệp tĩnh...</div>
        <div className="vh-terminal__muted">→ tối ưu assets, nén gzip</div>
        <div className="vh-terminal__ok">✓ deploy hoàn tất trong 3.2s</div>
        <div><span className="vh-terminal__prompt">$</span> curl -I https://demo.bootnode.cloud</div>
        <div className="vh-terminal__ok">HTTP/2 200 · uptime 99.9% · 42ms</div>
        <div className="vh-terminal__cursor">▍</div>
      </div>
    </div>
  )
}

export function StatCard({ label, value, suffix, icon, accent, style }) {
  return (
    <div className="vh-stat" style={style}>
      {icon && <div className="vh-stat__icon">{icon}</div>}
      <div className="vh-stat__value" style={accent ? { color: accent } : undefined}>
        {value}
        {suffix && <span className="vh-stat__suffix">{suffix}</span>}
      </div>
      <div className="vh-stat__label">{label}</div>
    </div>
  )
}

export function StatusTag({ status, type = 'order', label }) {
  const { tone, label: fallback } = resolveStatus(type, status)
  return (
    <span className={`vh-tag vh-tag--${tone}`}>
      <span className="vh-tag__dot" />
      {label || fallback}
    </span>
  )
}
