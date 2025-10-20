# Speech to Text App

A simple React + Vite app demonstrating client-side speech-to-text with language detection (English, Nepali, Hindi focus).

Features
- Record audio from microphone
- Live waveform visualization using WebAudio Analyser
- Start / Pause / Resume / Stop / Clear controls
- Auto language detection (franc) and switch recognition language where possible
- Large transcript panel
- Light / Dark theme toggle

Limitations
- Uses Web Speech API: best supported in Chrome / Edge. Firefox/Safari have limited support.
- Language detection uses `franc` on final transcript snippets; short phrases may not be detected reliably.

Run

1. Install dependencies:

```powershell
cd "d:\Speech to Text"
npm install
npm run dev
```

2. Open the printed local URL in Chrome or Edge.

Notes
- If you need server-side STT (higher accuracy, more languages), consider using a cloud STT API and upload recorded audio blobs.
