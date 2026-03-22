# EventPing User Flows

## 1. Create event
```text
Landing / Dashboard
  -> Click "Create Event"
  -> Fill title/date/time/description
  -> Submit
  -> Validation error? show inline errors and remain on form
  -> Success
  -> Redirect to Event Detail with shareable link visible
```

## 2. Share link
```text
Dashboard or Event Detail
  -> Click "Copy link"
  -> URL copied to clipboard
  -> Announce success via aria-live region
  -> User shares through messaging/email externally
```

## 3. RSVP
```text
Visitor opens public event link
  -> Reads event info
  -> Enters name (+ optional email)
  -> Chooses Yes / Tentative / No
  -> Submit RSVP
  -> Error? show inline message
  -> Success state replaces form or confirms below form
  -> RSVP list updates
```

## 4. View dashboard
```text
Authenticated user lands on Dashboard
  -> See event cards or empty state
  -> Choose share/edit/delete per event
  -> Create new event from primary CTA
```

## Flow notes
- Unauthenticated dashboard access redirects to sign-in
- Public event detail remains accessible without auth
- Copy-to-clipboard feedback should be both visual and screen-reader friendly
- Delete requires confirmation dialog with keyboard focus trap
