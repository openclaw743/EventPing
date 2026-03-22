# Event Detail (Public)

## Desktop
```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ EventPing                                                  [Sign in Google] │
├──────────────────────────────────────────────────────────────────────────────┤
│ Team Lunch — Q2 Planning                                                     │
│ Friday, June 20, 2026 · 12:00 PM                                             │
│ We'll be reviewing goals and planning the next sprint.                       │
│ [ Copy share link ]                                                          │
├───────────────────────────────────────┬──────────────────────────────────────┤
│ RSVP Form                             │ RSVP List                            │
│ Name *                                │ Responses (12)                       │
│ [ Alice                            ]  │ [Yes 8] [Tentative 3] [No 1]         │
│ Email (optional)                      │                                      │
│ [ alice@example.com                ]  │ Alice Johnson        [Yes]    2h ago │
│                                       │ Bob Smith            [Maybe]  3h ago │
│ Will you attend?                      │ Carol Lee            [No]     1d ago │
│ [ Yes ] [ Tentative ] [ No ]          │                                      │
│ [ Submit RSVP ]                       │                                      │
└───────────────────────────────────────┴──────────────────────────────────────┘
```

## Mobile
```text
┌──────────────────────────────┐
│ EventPing         [Sign in]  │
├──────────────────────────────┤
│ Team Lunch — Q2 Planning     │
│ Fri Jun 20 · 12:00 PM        │
│ Supporting description       │
│ [ Copy link ]                │
│                              │
│ Your Response                │
│ Name *                       │
│ [ Alice                    ] │
│ Email                        │
│ [ alice@example.com        ] │
│ [ Yes ] [ Maybe ] [ No ]     │
│ [ Submit RSVP ]              │
│                              │
│ Responses (12)               │
│ [Yes 8] [Maybe 3] [No 1]     │
│ Alice Johnson [Yes]          │
│ Bob Smith [Maybe]            │
└──────────────────────────────┘
```

## Accessibility
- Event title is `<h1>`
- RSVP controls grouped with `<fieldset><legend>Will you attend?</legend>`
- Response list uses `<ul role="list">`
- Copy link uses `aria-live="polite"` confirmation
