interface EmptyStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  title = 'No events yet',
  description = "You haven't created any events. Get started below!",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">📅</div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-muted mt-1 max-w-xs">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
