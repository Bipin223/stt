import React, { useState } from 'react'
import GeminiRecorder from './components/GeminiRecorder'

export default function App() {
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

      <footer className="footer">Maile nai ho banako !-- Bipin Rizal♥</footer>
    </div>
  )
}
