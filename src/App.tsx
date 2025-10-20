import React, { useState } from 'react'
import Recorder from './components/Recorder'

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
        <Recorder />
      </main>

      <footer className="footer">Built with ♥ By Bipin Rizal— Focused on English, Nepali & Hindi</footer>
    </div>
  )
}
