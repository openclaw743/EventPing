type RSVPStatus = 'yes' | 'no' | 'tentative'

interface BadgeProps {
  status: RSVPStatus
}

const config: Record<RSVPStatus, { label: string; classes: string }> = {
  yes: { label: 'Yes', classes: 'bg-green-100 text-green-700' },
  tentative: { label: 'Maybe', classes: 'bg-amber-100 text-amber-700' },
  no: { label: 'No', classes: 'bg-red-100 text-red-600' },
}

export function Badge({ status }: BadgeProps) {
  const { label, classes } = config[status]
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {label}
    </span>
  )
}
