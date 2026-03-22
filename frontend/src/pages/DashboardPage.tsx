import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { EventCard, Event } from '../components/EventCard'
import { EmptyState } from '../components/EmptyState'
import { Button } from '../components/Button'
import { api } from '../lib/api'

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-events'],
    queryFn: () => api.get<Event[]>('/api/events'),
  })

  const [events, setEvents] = useState<Event[] | null>(null)

  const list = events ?? data ?? []

  const handleDeleted = (slug: string) => {
    setEvents((events ?? data ?? []).filter(e => e.slug !== slug))
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My events</h1>
        <Link to="/events/new">
          <Button size="sm">+ New event</Button>
        </Link>
      </div>

      {isLoading && <p className="text-muted">Loading…</p>}
      {error && <p className="text-red-500">Failed to load events.</p>}

      {!isLoading && list.length === 0 && (
        <EmptyState
          action={
            <Link to="/events/new">
              <Button>Create your first event</Button>
            </Link>
          }
        />
      )}

      <div className="flex flex-col gap-4">
        {list.map(ev => (
          <EventCard key={ev.slug} event={ev} onDeleted={handleDeleted} />
        ))}
      </div>
    </main>
  )
}
