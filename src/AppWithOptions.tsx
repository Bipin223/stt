import React, { useState } from 'react'
import GeminiRecorder from './components/GeminiRecorder'

export default function AppWithOptions() {
  const [dark, setDark] = useState(false)

  return (
    <div className={"app " + (dark ? 'dark' : 'light')}>
      <header className="header">
        <h1>Speech to Text</h1>
        <div className="controls">
          <label className="toggle">
            <input type="checkbox" checked={dark} onChange={() => setDark(!dark)} />
            <span className="slider" />
          </label>
        </div>
      </header>

      <main className="main">
        <GeminiRecorder />
      </main>

      <footer className="footer">
        Built with ♥ By Bipin Rizal — Powered by Gemini 2.0 Flash
        <br />
        <small>
          🤖 AI-Powered Speech-to-Text with Click-to-Transcribe
        </small>
      </footer>
    </div>
  )
}
