import { Badge } from './Badge'

export interface RSVP {
  id: string
  name: string
  email?: string
  status: 'yes' | 'no' | 'tentative'
}

interface RSVPListProps {
  rsvps: RSVP[]
}

export function RSVPList({ rsvps }: RSVPListProps) {
  if (rsvps.length === 0) {
    return <p className="text-sm text-muted">No RSVPs yet. Be the first!</p>
  }

  return (
    <ul className="divide-y divide-slate-100">
      {rsvps.map(r => (
        <li key={r.id} className="flex items-center justify-between py-2 gap-4">
          <div>
            <span className="font-medium text-slate-900 text-sm">{r.name}</span>
            {r.email && <span className="ml-2 text-xs text-muted">{r.email}</span>}
          </div>
          <Badge status={r.status} />
        </li>
      ))}
    </ul>
  )
}
