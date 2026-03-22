# Create Event

## Desktop
```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ EventPing     [Dashboard]                               [Avatar Name v]     │
├──────────────────────────────────────────────────────────────────────────────┤
│                           Create a New Event                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Title *                                                               │  │
│  │ [ Team Lunch                                                        ] │  │
│  │                                                                        │  │
│  │ Date *                          Time *                                 │  │
│  │ [ 2026-06-20 ]                 [ 12:00 ]                               │  │
│  │                                                                        │  │
│  │ Description                                                            │  │
│  │ [ We will review Q2 goals and lunch is provided...                  ] │  │
│  │ [                                                                  ] │  │
│  │                                                                        │  │
│  │ [ Cancel ]                                         [ Create Event ]    │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Mobile
```text
┌──────────────────────────────┐
│ EventPing       [Avatar v]   │
├──────────────────────────────┤
│ Create a New Event           │
│ Title *                      │
│ [ Team Lunch               ] │
│ Date *                       │
│ [ 2026-06-20              ] │
│ Time *                       │
│ [ 12:00                   ] │
│ Description                  │
│ [                          ] │
│ [                          ] │
│ [ Create Event ]             │
│ [ Cancel ]                   │
└──────────────────────────────┘
```

## Accessibility
- Form: `aria-label="Create event"`
- Required fields: `aria-required="true"`
- Errors use `role="alert"`
- Submit button exposes loading via `aria-busy="true"`
