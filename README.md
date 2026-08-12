# Sprachblitz

**Learn German from A1 to B2 — free, offline, on any device.**

👉 **[Open the app](https://sprachblitz-app.github.io/sprachblitz-app/)**

![Sprachblitz](og-image.png)

Sprachblitz is a German learning app built around Bruno, a bear whose room fills
with colour as you learn. Every corner of the room is a group of lessons: finish
them and the object lights up and takes its German name. At A2 the scene moves
out to the street, at B1 to the town, at B2 to the working district.

---

## What's inside

**Four levels, one path**
A1 to B2, following the Goethe curriculum: 60+ vocabulary topics, 48 grammar
points, and a lesson path that unlocks as you go.

**The four exam skills**
Hören, Lesen, Schreiben and Sprechen, each with graded exercises. Writing is
checked automatically for content points, register, salutation and common
grammar slips. Speaking uses the browser's speech recognition where available,
with a record-and-compare fallback on Safari.

**Mock exams**
Full practice exams for A1, A2, B1 and B2 in the Goethe format — Hören and Lesen
auto-graded, Schreiben and Sprechen with model answers to check yourself against.

**Daily Blitz**
Five mixed questions a day, with a combo bonus, XP levels and achievements.

**Bruno**
A small daily moment, a journal that unlocks as the room fills, seasons that
change with the real calendar, and light that follows the time of day.

---

## Built with

No framework, no build step. One HTML file, plain JavaScript, Tailwind via CDN.

| Concern | Approach |
| --- | --- |
| Offline & install | Service worker + web app manifest (PWA) |
| Accounts & sync | Firebase Authentication + Firestore |
| Speech | Web Speech API (synthesis and recognition) |
| Hosting | GitHub Pages |

## Install it

- **Android / desktop Chrome or Edge** — tap *Install Sprachblitz* in the app,
  or the install icon in the address bar
- **iPhone / iPad** — Safari → Share → *Add to Home Screen*
- **Mac Safari** — File → *Add to Dock*

Once installed it runs offline, including the German audio.

## Your progress

Progress is stored on your device by default. Sign in with Google or an email
address to sync it across devices. There is also Export / Import in Settings if
you would rather keep a file and no account.

---

## Running it yourself

```bash
git clone https://github.com/Sprachblitz-app/sprachblitz-app.git
cd sprachblitz-app
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Service workers and sign-in need `localhost`
or HTTPS — opening `index.html` directly from the file system will not work.

To enable accounts, put your own Firebase keys in `sb-auth.js`.

## Licence

See [License](License). Exam practice material is original content written in
the Goethe format; it is not affiliated with or endorsed by the Goethe-Institut.
