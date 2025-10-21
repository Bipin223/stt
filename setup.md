# Quick Setup Guide

## 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## 2. Add API Key to Environment

Open the `.env` file in the project root and add your API key:

```
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

## 3. Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 4. Open in Browser

Visit `http://localhost:5173` and start using the app!

## Usage Tips

- Click "Start Recording" to begin
- Speak clearly into your microphone
- Click "Stop & Transcribe" when done
- Wait for Gemini to process your audio
- Use "Copy Text" to copy the transcription
- Select different languages as needed

## Troubleshooting

- Make sure you're using HTTPS or localhost for microphone access
- Check that your API key is valid and has quota
- Ensure your microphone is working and not being used by other apps