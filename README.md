# 🎤 Enhanced Speech-to-Text App

A modern, feature-rich speech-to-text application powered by Google's Gemini 2.0 Flash model. Record your voice and get AI-powered transcription with automatic language detection, text editing capabilities, and extended recording support.

## ✨ Features

- 🤖 **AI-Powered Transcription**: Uses Google Gemini 2.0 Flash for accurate speech recognition
- 🌍 **Auto Language Detection**: Automatically detects any language being spoken
- ✏️ **Text Editing**: Click to edit transcribed text with full editing capabilities
- ⏱️ **Extended Recording**: Support for recordings up to 5 minutes with real-time monitoring
- 📊 **Real-time Stats**: Live duration and file size tracking during recording
- 💻 **Coding-Optimized**: Enhanced recognition for programming terminology
- 📋 **Smart Copy**: Copy functionality that preserves text for continued editing
- 🎨 **Modern UI**: Beautiful dark/light theme with animated waveform visualization
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🔒 **Privacy-First**: All processing happens client-side, audio sent only to Gemini API

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

## 🚀 Quick Deploy

Ready to deploy your app? Check out our comprehensive deployment guide:

**[📖 View Deployment Guide](DEPLOYMENT.md)**

### Recommended: Vercel (1-Click Deploy)
1. Push to GitHub
2. Connect to Vercel
3. Add `VITE_GEMINI_API_KEY` environment variable
4. Deploy! 🎉

## 📱 How to Use

1. **Start Recording**: Click "🎤 Start Recording" to begin capturing audio
2. **Monitor Progress**: Watch real-time duration and file size during recording
3. **Stop & Transcribe**: Click "⏹️ Stop & Transcribe" when done (up to 5 minutes)
4. **Auto Language Detection**: The app automatically detects the language spoken
5. **Edit Text**: Click on transcribed text to edit it directly
6. **Copy Text**: Use "📋 Copy Text" - text remains available for further editing
7. **Record Again**: Click "🎤 Record Again" for new transcriptions

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

## 🌍 Language Support

- **Auto-Detection**: Automatically detects any language being spoken
- **Multi-Language**: Supports all languages that Gemini 2.0 Flash can process
- **Coding Terms**: Enhanced recognition for programming terminology in any language
- **Mixed Languages**: Can handle multiple languages in the same recording

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