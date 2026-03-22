# Dashboard

## Desktop
```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ EventPing   [Dashboard]                                 [Avatar Name v]     │
├──────────────────────────────────────────────────────────────────────────────┤
│ My Events                                               [ + Create Event ]   │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ Team Lunch — Q2 Planning                             [12 RSVPs]          │ │
│ │ Friday, June 20, 2026 · 12:00 PM                                          │ │
│ │ eventping.app/e/team-lunch-q2                     [Copy link]             │ │
│ │                                                     [Edit] [Delete]       │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ Birthday Party                                        [5 RSVPs]         │ │
│ │ Saturday, July 5, 2026 · 7:00 PM                                          │ │
│ │ eventping.app/e/birthday-party                     [Copy link]            │ │
│ │                                                     [Edit] [Delete]      │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Empty State
```text
My Events

        [ calendar illustration ]
        No events yet
        Create your first event to start collecting RSVPs.
        [ + Create Event ]
```

## Mobile
```text
┌──────────────────────────────┐
│ EventPing       [Avatar v]   │
├──────────────────────────────┤
│ My Events                    │
│ [ + Create Event ]           │
│                              │
│ Team Lunch — Q2 Planning     │
│ Jun 20 · 12:00 PM            │
│ [12 RSVPs]                   │
│ eventping.app/e/team...      │
│ [Copy link] [Edit] [Delete]  │
└──────────────────────────────┘
```

## Accessibility
- Event list: `aria-label="Your events"`
- Delete button: `aria-label="Delete {event title}"`
- Confirmation modal: `role="dialog"`, `aria-modal="true"`
- Loading skeletons: `aria-busy="true"`
