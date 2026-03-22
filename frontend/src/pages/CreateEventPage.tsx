import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { Textarea } from '../components/Textarea'
import { Button } from '../components/Button'
import { api } from '../lib/api'

interface EventFormData {
  title: string
  date: string
  time: string
  description: string
}

interface EventFormProps {
  initialData?: EventFormData
  onSubmit: (data: EventFormData) => Promise<void>
  submitLabel: string
}

export function EventForm({ initialData, onSubmit, submitLabel }: EventFormProps) {
  const [form, setForm] = useState<EventFormData>(
    initialData ?? { title: '', date: '', time: '', description: '' },
  )
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const set = (field: keyof EventFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required.'); return }
    if (!form.date) { setError('Date is required.'); return }
    if (!form.time) { setError('Time is required.'); return }
    setError('')
    setSubmitting(true)
    try {
      await onSubmit(form)
    } catch (err) {
      setError((err as Error).message || 'Something went wrong.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input id="title" label="Event title *" value={form.title} onChange={set('title')} placeholder="Summer BBQ" required />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input id="date" label="Date *" type="date" value={form.date} onChange={set('date')} required />
        <Input id="time" label="Time *" type="time" value={form.time} onChange={set('time')} required />
      </div>
      <Textarea id="description" label="Description (optional)" value={form.description} onChange={set('description')} placeholder="Tell guests what to expect…" />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}

interface CreateEventResponse {
  slug: string
}

export default function CreateEventPage() {
  const navigate = useNavigate()

  const handleCreate = async (data: { title: string; date: string; time: string; description: string }) => {
    const res = await api.post<CreateEventResponse>('/api/events', data)
    navigate(`/e/${res.slug}`)
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Create event</h1>
      <Card>
        <EventForm onSubmit={handleCreate} submitLabel="Create event" />
      </Card>
    </main>
  )
}
