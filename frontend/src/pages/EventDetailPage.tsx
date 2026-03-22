import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card } from '../components/Card'
import { RSVPForm } from '../components/RSVPForm'
import { RSVPList, RSVP } from '../components/RSVPList'
import { api } from '../lib/api'

interface EventDetail {
  id: string
  slug: string
  title: string
  date: string
  time: string
  description?: string
}

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const qc = useQueryClient()

  const { data: event, isLoading: loadingEvent, error: eventError } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => api.get<EventDetail>(`/api/events/${slug}`),
    enabled: !!slug,
  })

  const { data: rsvpResult, isLoading: loadingRsvps } = useQuery({
    queryKey: ['rsvps', slug],
    queryFn: () => api.get<{ data: RSVP[]; pagination: unknown }>(`/api/events/${slug}/rsvps`),
    enabled: !!slug,
  })

  const rsvps = rsvpResult?.data ?? []

  const refresh = () => qc.invalidateQueries({ queryKey: ['rsvps', slug] })

  if (loadingEvent) return <p className="p-8 text-center text-muted">Loading…</p>
  if (eventError || !event) return <p className="p-8 text-center text-red-500">Event not found.</p>

  const dateTime = new Date(`${event.date}T${event.time}`)

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* Event info */}
      <Card>
        <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
        <p className="text-muted mt-1">
          {dateTime.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
        </p>
        {event.description && (
          <p className="mt-4 text-slate-700 text-sm whitespace-pre-wrap">{event.description}</p>
        )}
      </Card>

      {/* RSVP form */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">RSVP</h2>
        <RSVPForm slug={slug!} onSuccess={refresh} />
      </Card>

      {/* RSVP list */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Responses ({rsvps.length})
        </h2>
        {loadingRsvps ? <p className="text-sm text-muted">Loading…</p> : <RSVPList rsvps={rsvps} />}
      </Card>
    </main>
  )
}
