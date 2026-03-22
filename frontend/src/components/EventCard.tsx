import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from './Card'
import { Button } from './Button'
import { api } from '../lib/api'

export interface Event {
  id: string
  slug: string
  title: string
  date: string
  time: string
  description?: string
  rsvpCount: number
}

interface EventCardProps {
  event: Event
  onDeleted: (slug: string) => void
}

export function EventCard({ event, onDeleted }: EventCardProps) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const eventUrl = `${window.location.origin}/e/${event.slug}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(eventUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await api.delete(`/api/events/${event.slug}`)
      onDeleted(event.slug)
    } catch {
      alert('Failed to delete event.')
      setDeleting(false)
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900">{event.title}</h3>
          <p className="text-sm text-muted mt-1">
            {new Date(`${event.date}T${event.time}`).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {event.rsvpCount} RSVP{event.rsvpCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={copyLink}>
            {copied ? 'Copied!' : 'Copy link'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/events/${event.slug}/edit`)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
