# Gemini Speech-to-Text App

A modern speech-to-text application powered by Google's Gemini 2.0 Flash model. Record your voice and get AI-powered transcription with support for multiple languages.

## Features

- 🤖 **AI-Powered Transcription**: Uses Google Gemini 2.0 Flash for accurate speech recognition
- 🎙️ **Click-to-Transcribe**: Record audio and transcribe on demand (no live transcription)
- 🌐 **Multi-Language Support**: English, Nepali, and Hindi
- 💻 **Coding-Optimized**: Enhanced recognition for programming terminology
- 📋 **Copy Functionality**: Easy copy-to-clipboard with auto-clear
- 🎨 **Modern UI**: Beautiful dark/light theme with animated waveform visualization
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Setup

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### 2. Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## How to Use

1. **Select Language**: Choose between English, Nepali, or Hindi
2. **Start Recording**: Click "🎤 Start Recording" to begin capturing audio
3. **Stop & Transcribe**: Click "⏹️ Stop & Transcribe" when you're done speaking
4. **Wait for Processing**: The app will send your audio to Gemini 2.0 Flash for transcription
5. **Copy Text**: Use the "📋 Copy Text" button to copy the transcribed text
6. **Clear**: Use "🗑️ Clear" to reset and start over

## Technical Details

### Architecture

- **Frontend**: React + TypeScript + Vite
- **Styling**: Custom CSS with modern design patterns
- **AI Model**: Google Gemini 2.0 Flash (gemini-2.0-flash-exp)
- **Audio Processing**: Web Audio API for visualization, MediaRecorder for capture

### Audio Format

- **Recording Format**: WebM with Opus codec
- **Sample Rate**: 44.1 kHz
- **Features**: Echo cancellation and noise suppression enabled

### API Integration

The app uses the Google Generative AI SDK to communicate with Gemini 2.0 Flash:

- Audio is converted to base64 format
- Sent to Gemini with language-specific prompts
- Responses are processed and enhanced with coding term corrections

## Supported Languages

| Language | Code | Features |
|----------|------|----------|
| English | en-US | Full coding terminology optimization |
| Nepali | ne-NP | Native language support |
| Hindi | hi-IN | Native language support |

## Browser Compatibility

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

**Note**: Requires HTTPS or localhost for microphone access.

## Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Troubleshooting

### Common Issues

1. **"API key not found" error**
   - Make sure you've created a `.env` file with your Gemini API key
   - Restart the development server after adding the API key

2. **Microphone access denied**
   - Ensure you're using HTTPS or localhost
   - Check browser permissions for microphone access

3. **Transcription fails**
   - Verify your Gemini API key is valid and has quota remaining
   - Check browser console for detailed error messages

4. **No audio detected**
   - Ensure your microphone is working
   - Try speaking louder or closer to the microphone
   - Check if other applications are using the microphone

### Performance Tips

- Use Chrome for best performance
- Ensure stable internet connection for API calls
- Keep recordings under 1 minute for faster processing

## License

This project is private and for personal/educational use.

## Credits

Built with ♥ by Bipin Rizal  
Powered by Google Gemini 2.0 Flash