/**
 * Shared UI primitives — StatCard, Badge, PageHeader, EmptyState,
 * LoadingState, ErrorState, SectionCard, DataTable, ResearchStage.
 * Import from here so all pages share consistent components.
 */
import { AlertCircle, Info, CheckCircle, Clock } from 'lucide-react'

/* ─── StatCard ───────────────────────────────────────────────────────────── */
export function StatCard({ icon: Icon, label, meta, value, pending, trend }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="stat-icon">
          <Icon size={18} color="var(--orange)" />
        </div>
        {pending && (
          <span className="data-label data-label-pending">Pending</span>
        )}
      </div>
      <div className="stat-value">{pending ? '—' : value}</div>
      <div className="stat-label">{label}</div>
      {meta && !pending && <div className="stat-meta">{meta}</div>}
    </div>
  )
}

/* ─── StatusBadge ────────────────────────────────────────────────────────── */
export function StatusBadge({ status }) {
  const MAP = {
    complete:    { cls: 'badge-success', label: 'Complete',     dot: '●' },
    completed:   { cls: 'badge-success', label: 'Complete',     dot: '●' },
    'in-progress':{ cls: 'badge-orange', label: 'In Progress',  dot: '●' },
    progress:    { cls: 'badge-orange',  label: 'In Progress',  dot: '●' },
    pending:     { cls: 'badge-neutral', label: 'Pending',      dot: '○' },
    error:       { cls: 'badge-error',   label: 'Error',        dot: '!' },
    rejected:    { cls: 'badge-error',   label: 'Rejected',     dot: '✕' },
    accepted:    { cls: 'badge-success', label: 'Accepted',     dot: '✓' },
    available:   { cls: 'badge-success', label: 'Available',    dot: '✓' },
    unavailable: { cls: 'badge-neutral', label: 'Not Available',dot: '○' },
  }
  const cfg = MAP[status] || MAP.pending
  return (
    <span className={`badge ${cfg.cls}`}>
      {cfg.dot} {cfg.label}
    </span>
  )
}

/* ─── PageHeader ─────────────────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

/* ─── SectionCard ────────────────────────────────────────────────────────── */
export function SectionCard({ title, subtitle, action, children, noPad }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      {(title || action) && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid var(--border)', gap: 16
        }}>
          <div>
            {title && <div className="section-title">{title}</div>}
            {subtitle && <div className="section-subtitle" style={{ marginTop: 2 }}>{subtitle}</div>}
          </div>
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
      )}
      <div className={noPad ? '' : 'card-pad'}>{children}</div>
    </div>
  )
}

/* ─── EmptyState ─────────────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {Icon ? <Icon size={24} /> : <Info size={24} />}
      </div>
      <div className="empty-title">{title || 'No data available'}</div>
      <div className="empty-body">
        {body || 'Once data is available, it will appear here.'}
      </div>
      {action}
    </div>
  )
}

/* ─── LoadingState ───────────────────────────────────────────────────────── */
export function LoadingState({ rows = 3 }) {
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8, opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  )
}

/* ─── ErrorState ─────────────────────────────────────────────────────────── */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" style={{ background: 'var(--error-bg)', color: 'var(--error)' }}>
        <AlertCircle size={24} />
      </div>
      <div className="empty-title">Something went wrong</div>
      <div className="empty-body">
        {message || 'An error occurred while loading this section.'}
      </div>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

/* ─── ResearchStage ──────────────────────────────────────────────────────── */
export function ResearchStage({ step, label, subtitle, status = 'pending', isLast, onClick }) {
  return (
    <div className="pipeline-step" style={{ paddingBottom: isLast ? 0 : 20, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div className={`pipeline-node ${status}`}>
        {status === 'complete'
          ? <CheckCircle size={16} />
          : status === 'active'
          ? step
          : <Clock size={14} />
        }
      </div>
      <div style={{ paddingTop: 7 }}>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)'
        }}>
          {label}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Alert ──────────────────────────────────────────────────────────────── */
export function Alert({ type = 'info', children }) {
  const MAP = {
    info:    { cls: 'alert-info',    Icon: Info },
    success: { cls: 'alert-success', Icon: CheckCircle },
    warning: { cls: 'alert-warning', Icon: AlertCircle },
    error:   { cls: 'alert-error',   Icon: AlertCircle },
    orange:  { cls: 'alert-orange',  Icon: Info },
  }
  const { cls, Icon } = MAP[type] || MAP.info
  return (
    <div className={`alert ${cls}`}>
      <Icon size={16} style={{ flexShrink: 0, marginTop: 1 }} />
      <div>{children}</div>
    </div>
  )
}

/* ─── DataTable ──────────────────────────────────────────────────────────── */
export function DataTable({ columns, rows, emptyTitle, emptyBody }) {
  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle || 'No records'} body={emptyBody || 'No data to display yet.'} />
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="tbl">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ textAlign: col.align || 'left', width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {columns.map(col => (
                <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── ProgressBar ────────────────────────────────────────────────────────── */
export function ProgressBar({ value, max = 100, label }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>{label}</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pct}%</span>
        </div>
      )}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
