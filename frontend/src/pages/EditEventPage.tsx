import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card } from '../components/Card'
import { EventForm } from './CreateEventPage'
import { api } from '../lib/api'

interface EventDetail {
  id: string
  slug: string
  title: string
  date: string
  time: string
  description?: string
}

export default function EditEventPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => api.get<EventDetail>(`/api/events/${slug}`),
    enabled: !!slug,
  })

  const handleEdit = async (data: { title: string; date: string; time: string; description: string }) => {
    const res = await api.put<EventDetail>(`/api/events/${slug}`, data)
    navigate(`/e/${res.slug}`)
  }

  if (isLoading || !event) return <p className="p-8 text-center text-muted">Loading…</p>

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit event</h1>
      <Card>
        <EventForm
          initialData={{
            title: event.title,
            date: event.date,
            time: event.time,
            description: event.description ?? '',
          }}
          onSubmit={handleEdit}
          submitLabel="Save changes"
        />
      </Card>
    </main>
  )
}
