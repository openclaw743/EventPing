import { useState } from 'react'
import { Input } from './Input'
import { Button } from './Button'
import { api } from '../lib/api'

type RSVPStatus = 'yes' | 'no' | 'tentative'

interface RSVPFormProps {
  slug: string
  onSuccess: () => void
}

export function RSVPForm({ slug, onSuccess }: RSVPFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<RSVPStatus | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required.'); return }
    if (!status) { setError('Please select a response.'); return }
    setError('')
    setSubmitting(true)
    try {
      await api.post(`/api/events/${slug}/rsvps`, { name: name.trim(), email: email.trim() || undefined, status })
      setName('')
      setEmail('')
      setStatus(null)
      onSuccess()
    } catch (err) {
      setError((err as Error).message || 'Failed to submit RSVP.')
    } finally {
      setSubmitting(false)
    }
  }

  const statusButtons: { value: RSVPStatus; label: string; active: string }[] = [
    { value: 'yes', label: '✓ Yes', active: 'bg-green-500 text-white' },
    { value: 'tentative', label: '~ Maybe', active: 'bg-amber-400 text-white' },
    { value: 'no', label: '✗ No', active: 'bg-red-500 text-white' },
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="rsvp-name"
        label="Your name *"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Jane Doe"
        required
      />
      <Input
        id="rsvp-email"
        label="Email (optional)"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="jane@example.com"
      />

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Your response *</p>
        <div className="flex gap-2">
          {statusButtons.map(btn => (
            <button
              key={btn.value}
              type="button"
              onClick={() => setStatus(btn.value)}
              aria-pressed={status === btn.value}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${status === btn.value ? btn.active + ' border-transparent' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Send RSVP'}
      </Button>
    </form>
  )
}
