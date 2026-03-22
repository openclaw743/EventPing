# Auth States

## Signed out header
```text
┌────────────────────────────────────────────────────────────┐
│ EventPing                               [Sign in with Google]
└────────────────────────────────────────────────────────────┘
```

## Signed in header
```text
┌────────────────────────────────────────────────────────────┐
│ EventPing     [Dashboard]             [Avatar] Alice Chen v │
│                                            └─ [Logout]      │
└────────────────────────────────────────────────────────────┘
```

## Mobile signed out
```text
┌──────────────────────────────┐
│ EventPing         [Sign in]  │
└──────────────────────────────┘
```

## Mobile signed in
```text
┌──────────────────────────────┐
│ EventPing       [Avatar  v]  │
│                Alice Chen    │
│                [Logout]      │
└──────────────────────────────┘
```

## Accessibility
- Header uses `<header role="banner">`
- Nav uses `<nav aria-label="Main navigation">`
- Account menu trigger uses `aria-haspopup="menu"` and `aria-expanded`
- Avatar image uses `alt="Alice Chen"` unless adjacent visible text makes it redundant
