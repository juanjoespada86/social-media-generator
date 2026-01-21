import { useState, useRef } from 'react'
import './index.css'
import Editor from './components/Editor/Editor'
import Preview from './components/Preview/Preview'
import Controls from './components/Controls/Controls'

function App() {
  const [settings, setSettings] = useState({
    format: 'simple', // 'simple' | 'double'
    image: null,
    title: '',
    body: ''
  });

  const previewRef = useRef(null);

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(circle at 50% 0%, #232b33 0%, var(--bg-page) 80%)'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(21, 26, 31, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <img src="/logo.png" alt="Logo" style={{ height: '40px' }} />
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '0.5px' }}>
            Social Media <span style={{ color: 'var(--accent-color)' }}>Generator</span>
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CEX Vibe Coding Tool</p>
        </div>
      </header>

      {/* Main Layout */}
      <main style={{
        flex: 1,
        padding: '40px',
        maxWidth: '1600px',
        margin: '0 auto',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'minmax(400px, 1fr) 1.5fr', // Editor | Preview
        gap: '60px',
        alignItems: 'start'
      }}>

        {/* Editor Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Editor settings={settings} updateSettings={updateSettings} />
        </div>

        {/* Preview Column */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px',
          position: 'sticky',
          top: '120px'
        }}>
          <div style={{
            padding: '40px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <Preview ref={previewRef} settings={settings} />
          </div>

          <Controls previewRef={previewRef} fileName={settings.title || 'social-post'} />
        </div>
      </main>
    </div>
  )
}

export default App
