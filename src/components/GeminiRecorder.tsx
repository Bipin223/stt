import React, { useEffect, useRef, useState } from 'react'
import { geminiSpeechToText, TranscriptionResult } from '../utils/geminiSpeechToText'

type Status = 'idle' | 'recording' | 'processing' | 'completed' | 'error'

export default function GeminiRecorder(): JSX.Element {
  const [status, setStatus] = useState<Status>('idle')
  const [transcribedText, setTranscribedText] = useState<string>('')
  const [copySuccess, setCopySuccess] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [recordingDuration, setRecordingDuration] = useState<number>(0)
  const [estimatedFileSize, setEstimatedFileSize] = useState<number>(0)
  
  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const mediaStreamRef = useRef<MediaStream | null>(null)
  
  // Visualization refs
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  
  // Recording monitoring refs
  const recordingStartTimeRef = useRef<number>(0)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {})
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }
  }

  const startRecording = async () => {
    try {
      setError('')
      
      // Check if API key is configured
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        setError('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.')
        setStatus('error')
        return
      }
      
      setStatus('recording')
      audioChunksRef.current = []
      setRecordingDuration(0)
      setEstimatedFileSize(0)
      recordingStartTimeRef.current = Date.now()

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      mediaStreamRef.current = stream

      // Setup audio visualization
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume()
      }
      
      const source = audioCtxRef.current.createMediaStreamSource(stream)
      const analyser = audioCtxRef.current.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)
      analyserRef.current = analyser

      // Start visualization
      drawWaveform()

      // Setup MediaRecorder with optimized settings for longer recordings
      // Try different formats for better compatibility
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Use default
          }
        }
      }
      
      console.log(`Using audio format: ${mimeType || 'default'}`);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 64000 // Reduced bitrate to keep file size manageable
      })
      
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          // Update estimated file size
          const totalSize = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0)
          setEstimatedFileSize(totalSize)
        }
      }

      mediaRecorder.onstop = async () => {
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current)
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' })
        console.log(`Final audio file size: ${(audioBlob.size / 1024 / 1024).toFixed(2)}MB, type: ${audioBlob.type}`)
        await transcribeAudio(audioBlob)
      }

      // Start recording with timeslice for better handling of longer recordings
      mediaRecorder.start(1000) // Collect data every 1 second
      
      // Start duration tracking
      durationIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - recordingStartTimeRef.current) / 1000
        setRecordingDuration(elapsed)
        
        // Auto-stop if recording gets too long (5 minutes max to prevent huge files)
        if (elapsed > 300) { // 5 minutes
          stopRecording()
          setError('Recording stopped automatically after 5 minutes to prevent large files.')
        }
      }, 100)

    } catch (err) {
      console.error('Recording error:', err)
      setError(`Could not start recording: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setStatus('error')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setStatus('processing')
    }
    
    // Stop duration tracking
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }
    
    // Stop visualization
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    
    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setStatus('processing')
      const result: TranscriptionResult = await geminiSpeechToText.transcribeAudio(audioBlob)
      
      if (result.text) {
        setTranscribedText(prev => prev ? prev + ' ' + result.text : result.text)
        setStatus('completed')
      } else {
        setError('No speech detected in the audio')
        setStatus('error')
      }
    } catch (err) {
      console.error('Transcription error:', err)
      setError(`Transcription failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setStatus('error')
    }
  }

  const drawWaveform = () => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return
    
    const ctx = canvas.getContext('2d')!
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    let animationTime = 0

    const render = () => {
      rafRef.current = requestAnimationFrame(render)
      animationTime += 0.02
      
      analyser.getByteFrequencyData(dataArray)
      
      // Clear canvas with dark fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerY = canvas.height / 2
      const numBars = 48
      const barWidth = canvas.width / numBars
      
      // Draw vibrant sci-fi waveform
      for (let i = 0; i < numBars; i++) {
        const dataIndex = Math.floor((i / numBars) * bufferLength)
        const amplitude = (dataArray[dataIndex] / 255) * 1.2
        
        // Enhanced pulsing effect
        const pulse = Math.sin(animationTime * 4 + i * 0.15) * 0.2 + 1.0
        const secondaryPulse = Math.cos(animationTime * 2 + i * 0.08) * 0.1 + 1.0
        const height = (amplitude * canvas.height * 0.5 * pulse * secondaryPulse) + 4
        
        const x = i * barWidth + barWidth / 2
        
        // Create futuristic gradient with blue accents
        const gradient = ctx.createLinearGradient(x, centerY - height, x, centerY + height)
        gradient.addColorStop(0, `rgba(59, 130, 246, ${amplitude * 0.6 + 0.2})`)
        gradient.addColorStop(0.2, `rgba(147, 197, 253, ${amplitude * 0.8 + 0.3})`)
        gradient.addColorStop(0.5, `rgba(200, 200, 200, ${amplitude + 0.7})`)
        gradient.addColorStop(0.8, `rgba(147, 197, 253, ${amplitude * 0.8 + 0.3})`)
        gradient.addColorStop(1, `rgba(59, 130, 246, ${amplitude * 0.6 + 0.2})`)
        
        // Draw main bars
        ctx.fillStyle = gradient
        ctx.fillRect(x - barWidth * 0.3, centerY - height, barWidth * 0.6, height * 2)
        
        // Enhanced vibrant glow effect
        ctx.shadowColor = `rgba(59, 130, 246, ${amplitude * 1.2 + 0.3})`
        ctx.shadowBlur = 25
        ctx.fillRect(x - barWidth * 0.2, centerY - height * 0.8, barWidth * 0.4, height * 1.6)
        
        // Additional inner glow
        ctx.shadowColor = `rgba(147, 197, 253, ${amplitude * 0.8 + 0.4})`
        ctx.shadowBlur = 15
        ctx.fillRect(x - barWidth * 0.15, centerY - height * 0.6, barWidth * 0.3, height * 1.2)
        ctx.shadowBlur = 0
        
        // Particle effects for high frequencies
        if (amplitude > 0.7 && i % 2 === 0) {
          const particles = Math.floor(amplitude * 3)
          for (let p = 0; p < particles; p++) {
            const px = x + (Math.random() - 0.5) * barWidth
            const py = centerY + (Math.random() - 0.5) * height * 2
            const size = Math.random() * 1.5 + 0.5
            
            ctx.fillStyle = `rgba(59, 130, 246, ${Math.random() * 0.6 + 0.4})`
            ctx.beginPath()
            ctx.arc(px, py, size, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
      
      // Add blue scanning line effect
      const scanX = (Math.sin(animationTime * 2) * 0.5 + 0.5) * canvas.width
      const scanGradient = ctx.createLinearGradient(scanX - 20, 0, scanX + 20, 0)
      scanGradient.addColorStop(0, 'rgba(59, 130, 246, 0)')
      scanGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)')
      scanGradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
      
      ctx.fillStyle = scanGradient
      ctx.fillRect(scanX - 20, 0, 40, canvas.height)
      
      // Add blue border glow
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'
      ctx.lineWidth = 2
      ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4)
    }
    render()
  }

  const clearAll = () => {
    setTranscribedText('')
    setError('')
    setStatus('idle')
    setRecordingDuration(0)
    setEstimatedFileSize(0)
    setIsEditing(false)
  }

  const copyText = async () => {
    if (!transcribedText.trim()) {
      return
    }

    try {
      await navigator.clipboard.writeText(transcribedText)
      setCopySuccess(true)
      
      setTimeout(() => {
        setCopySuccess(false)
      }, 2000)
      
    } catch (err) {
      console.error('Failed to copy text:', err)
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = transcribedText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        
        setCopySuccess(true)
        setTimeout(() => {
          setCopySuccess(false)
        }, 2000)
        
      } catch (fallbackErr) {
        console.error('Fallback copy also failed:', fallbackErr)
        alert('Copy failed. Please select and copy the text manually.')
      }
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'recording':
        const minutes = Math.floor(recordingDuration / 60)
        const seconds = Math.floor(recordingDuration % 60)
        const fileSizeMB = (estimatedFileSize / 1024 / 1024).toFixed(1)
        return `🎤 Recording... ${minutes}:${seconds.toString().padStart(2, '0')} (${fileSizeMB}MB) - Click "Stop & Transcribe" when done`
      case 'processing':
        return '🤖 Processing your audio...'
      case 'completed':
        return '✅ Transcription completed!'
      case 'error':
        return `❌ Error: ${error}`
      default:
        return '🎙️ Click "Start Recording" to begin (Max: 5 minutes, 20MB)'
    }
  }

  return (
    <div className="recorder">
      <div className="left">
        <div className="panel">
          {status === 'recording' && (
            <div className="recording-indicator">
              <div className="recording-dot"></div>
              Recording
            </div>
          )}
          {status === 'processing' && (
            <div className="processing-indicator">
              <div className="processing-spinner"></div>
              Processing  
            </div>
          )}
          <canvas ref={canvasRef} width={600} height={120} className="wave" />
          <div className="buttons">
            {status === 'idle' && (
              <button className="btn record" onClick={startRecording}>
                🎤 Start Recording
              </button>
            )}
            {status === 'recording' && (
              <button className="btn stop" onClick={stopRecording}>
                ⏹️ Stop & Transcribe
              </button>
            )}
            {(status === 'completed' || status === 'error') && (
              <button className="btn record" onClick={startRecording}>
                🎤 Record Again
              </button>
            )}
            <button className="btn clear" onClick={clearAll}>
              🗑️ Clear
            </button>
          </div>

          <div className="status-message">
            {getStatusMessage()}
          </div>
        </div>
      </div>
      <div className="right">
        <div className="panel transcript">
          <div className="transcript-header">
            <h2>📝 Transcription</h2>
            <div className="transcript-controls">
              {transcribedText && (
                <>
                  <button 
                    className={`edit-btn ${isEditing ? 'active' : ''}`}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? '✅ Done' : '✏️ Edit'}
                  </button>
                  <button 
                    className={`copy-btn ${copySuccess ? 'success' : ''}`}
                    onClick={copyText}
                    disabled={copySuccess}
                  >
                    {copySuccess ? '✅ Copied!' : '📋 Copy Text'}
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="largeText">
            {transcribedText && (
              <div style={{ marginBottom: '16px', opacity: 1 }}>
                {isEditing ? (
                  <textarea
                    value={transcribedText}
                    onChange={(e) => setTranscribedText(e.target.value)}
                    className="edit-textarea"
                    placeholder="Edit your transcription here..."
                    autoFocus
                  />
                ) : (
                  <div className="transcription-text" onClick={() => setIsEditing(true)}>
                    {transcribedText}
                  </div>
                )}
              </div>
            )}
            {!transcribedText && status !== 'error' && (
              <div style={{ opacity: 0.5, textAlign: 'center', marginTop: '60px' }}>
                Your transcribed text will appear here 🎤
              </div>
            )}
            {error && status === 'error' && (
              <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '60px' }}>
                ❌ {error}
                <br />
                <small>Please try recording again or check your API key</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}