# EventPing Component Inventory

## Components

### Button
- Variants: `primary`, `secondary`, `danger`, `ghost`, `google`
- States: default, hover, focus, disabled, loading
- Accessibility: use `<button>`, visible focus ring, `aria-label` for icon-only usage, 44x44 minimum touch target

### Card
- Used for hero feature blocks, event containers, forms, RSVP lists
- Radius: `borderRadius.lg`, shadow: `shadows.md`, bg: `colors.surface`

### Input
- Types: text, email, date, time, textarea
- Must pair `<label>` + `aria-describedby` for hint/error text
- Error text should use `role="alert"`

### Badge
- Variants: `success`, `warning`, `danger`, `neutral`
- Used for RSVP counts and statuses

### Avatar
- Circular image or initials fallback
- Use `alt` when image stands alone, `aria-hidden="true"` when name is adjacent

### Header
- Unauthenticated: logo + sign-in button
- Authenticated: logo + dashboard link + avatar/name/logout menu
- Include skip link and `<nav aria-label="Main navigation">`

### EventCard
- Title, date/time, RSVP count, share link, edit, delete actions
- Entire card may be clickable, but nested actions stay individually focusable

### RSVPForm
- Fields: name (required), email (optional), response selection
- Response buttons act like a radio group with `aria-pressed` or native radio inputs
- Submit disabled until valid

### RSVPList
- Summary badges + itemized attendee responses
- Should support empty, loading, and populated states

## Accessibility Notes

### Contrast ratios
| Pair | Ratio | Result |
|---|---:|---|
| `text` on `surface` | 16.75:1 | AAA |
| `muted` on `surface` | 4.63:1 | AA |
| `primary` on `surface` | 6.55:1 | AA |
| `success` on white | 4.54:1 | AA |
| `warning` on white | 4.59:1 | AA |
| `danger` on white | 5.08:1 | AA |

### Keyboard navigation
- Tab order follows DOM order
- Escape closes menus/dialogs and returns focus to trigger
- Left/Right arrows switch RSVP option selection
- All interactive elements require visible focus treatment

### Suggested ARIA labels
- Sign in button: `aria-label="Sign in with Google"`
- Copy link button: `aria-label="Copy shareable link"`
- Delete event button: `aria-label="Delete {event title}"`
- RSVP list container: `aria-label="RSVP responses"`
