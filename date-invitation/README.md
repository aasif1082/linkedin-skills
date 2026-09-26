# Will You Go On A Date With Me? ❤️

A small, mobile-first single-page site that asks one very important question,
handles "no" playfully (and respectfully), celebrates the "yes", lets her pick a
date and place, and hands her a ready-made calendar invite.

It's React + TypeScript + Vite. Everything runs in the browser: no backend, no
accounts, no API keys.

## The flow

1. **Invite**: "Hey [name] ❤️ … Will you go on a date with me?" with YES / NO.
2. **NO**: nine playful messages in a row. YES grows a little and NO shrinks a
   little each time, but NO never moves, never goes below a comfortable tap
   size, and always works. After "Okay okay… I'll ask one last time", one more
   NO lands on a gentle "That's okay ❤️, no pressure" screen. She can always
   really say no.
3. **YES**: confetti, hearts, "YAYYYYY! ❤️", then **Pick Our Date →**.
4. **Plan**: a custom calendar (past days disabled, today ringed, selection
   highlighted), an optional time, the place (required) and an optional note.
   **Confirm Date ❤️** stays disabled until a day and a place are filled in.
5. **Confirmation**: the "IT'S A DATE! ❤️" card, plus
   - **Add To My Calendar**: opens Google Calendar with the event pre-filled
   - **Download .ics**: for Apple Calendar, Outlook, Samsung and the rest

If she doesn't pick a time, the event is all-day. If she does, it's a 2-hour
event at that time in her own timezone.

## Personalize it (do this before deploying)

Everything lives in **`src/config.ts`**:

| Setting | What it does | Default |
|---|---|---|
| `GIRLFRIEND_NAME` | "Hey ___ ❤️", "Can't wait for our date, ___." | `Lakshmi` |
| `YOUR_NAME` | Signature at the end of the calendar invite | `Your favourite person` |
| `EVENT_TITLE` | Calendar event title | `Date with ❤️` |
| `DEFAULT_MESSAGE` | Placeholder for her note, and shown on the card if she leaves it empty | `Can't wait ❤️` |
| `EVENT_DESCRIPTION` | Calendar event body (`{signature}` becomes `YOUR_NAME`) | the "It's a date! ❤️ …" text |
| `EVENT_DURATION_HOURS` | Length of the event when she picks a time | `2` |
| `NO_MESSAGES` | The playful replies to NO, in order | the nine from the brief |

You can also change the link-preview text (what WhatsApp or iMessage shows
when you send the link) in the `<meta property="og:…">` tags in `index.html`.

## Run it locally

Needs Node.js 20.19+ (22 LTS recommended).

```bash
cd date-invitation
npm install
npm run dev          # http://localhost:5173
```

To try it on your phone, run `npm run dev -- --host` and open the "Network"
URL it prints while your phone is on the same Wi-Fi.

## Test and build

```bash
npm test             # unit tests for the Google Calendar URL and .ics generation
npm run build        # type-checks, then writes the static site to dist/
npm run preview      # serves dist/ at http://localhost:4173
```

`dist/` is plain static files (about 80 KB gzipped). Any static host can serve it.

## Deploy to Google Cloud

Pick one. **Option A (Cloud Run)** is the simplest if you've never used GCP.

### One-time setup

1. Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install).
2. Sign in and choose (or create) a project:
   ```bash
   gcloud auth login
   gcloud projects create my-date-invite-123    # skip if you already have one
   gcloud config set project my-date-invite-123
   ```
3. Link a billing account to the project in the Cloud Console. All three
   options below fit inside the free tier for a site like this, but GCP still
   requires billing to be turned on.

### Option A: Cloud Run (recommended)

The included `Dockerfile` builds the site and serves it with nginx. Cloud Build
does the Docker build for you, so you don't need Docker installed.

```bash
cd date-invitation
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
gcloud run deploy date-invite \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated
```

It prints a `https://date-invite-….run.app` URL. Send her that. To redeploy
after editing `src/config.ts`, run the same `gcloud run deploy` command again.

Want a nicer URL? `gcloud beta run domain-mappings create --service date-invite --domain date.yourdomain.com --region asia-south1`,
or put Firebase Hosting in front of it.

### Option B: App Engine

```bash
cd date-invitation
npm run build
gcloud app create --region asia-south1     # first time only
gcloud app deploy
gcloud app browse
```

`app.yaml` serves `dist/` as static files. Nothing actually runs on the Python
runtime it names; App Engine just needs a runtime listed.

### Option C: Cloud Storage bucket (cheapest, HTTP only)

```bash
cd date-invitation
npm run build
gcloud storage buckets create gs://my-date-invite-123 --location=asia-south1
gcloud storage cp -r dist/* gs://my-date-invite-123
gcloud storage buckets add-iam-policy-binding gs://my-date-invite-123 \
  --member=allUsers --role=roles/storage.objectViewer
```

Open `https://storage.googleapis.com/my-date-invite-123/index.html`. This works
because the build uses relative paths (`base: './'` in `vite.config.ts`).

## How the calendar invite works

The code is in `src/lib/calendar.ts` and is commented throughout.

- **Google Calendar** uses Google's public event-template link:
  `https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=…&details=…&location=…`.
  It opens the "new event" form in her own Google account, already filled in,
  and she taps Save. No API key or OAuth needed. For the brief's example
  (25 September 2026, "Some Restaurant, Bangalore") the `dates` value is
  `20260925/20260926`: an all-day event, and Google treats the end date as exclusive.
- **.ics** is an RFC 5545 iCalendar file built in the browser and downloaded as
  `our-date.ics`. It uses CRLF line endings, escapes `, ; \` and newlines,
  folds long lines at 75 bytes without splitting emoji, and includes a UID, a
  DTSTAMP and a reminder (the day before for all-day events, two hours before
  for timed ones).

## Project layout

```
src/
  config.ts                  ← personalize here
  App.tsx                    screen state machine
  components/
    InviteScreen.tsx         question + playful NO loop
    CelebrationScreen.tsx    YAYYYYY + confetti
    PlanScreen.tsx           calendar, time, place, note
    Calendar.tsx             month picker (no past dates)
    ConfirmationScreen.tsx   "IT'S A DATE!" card + calendar buttons
    Button.tsx, Card.tsx, FloatingHearts.tsx, Footer.tsx
  lib/
    calendar.ts              Google Calendar URL + .ics generation
    calendar.test.ts         unit tests
    dates.ts                 local calendar-day helpers
    celebrate.ts             confetti bursts
```
