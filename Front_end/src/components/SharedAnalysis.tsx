import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import type { HistoryItem } from '../lib/api'
import { getReadableError } from '../lib/error'

interface SharedAnalysisProps {
    shareId: string
}

export default function SharedAnalysis({ shareId }: SharedAnalysisProps) {
    const [item, setItem] = useState<HistoryItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        api.getSharedItem(shareId)
            .then(data => {
                setItem(data)
                setLoading(false)
            })
            .catch(err => {
                setError(getReadableError(err, 'Shared analysis not found or is private.'))
                setLoading(false)
            })
    }, [shareId])

    if (loading) {
        return (
            <div className="loading-screen" style={{ backgroundColor: '#0f0f11', color: '#fff', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <p>Loading shared analysis...</p>
            </div>
        )
    }

    if (error || !item) {
        return (
            <div className="error-screen" style={{ backgroundColor: '#0f0f11', color: '#fff', height: '100vh', padding: '2rem', textAlign: 'center' }}>
                <h2>Analysis Not Found</h2>
                <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>
                <button onClick={() => window.location.href = '/'} style={{ marginTop: '2rem', padding: '10px 20px', backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Go to AI Summarizer
                </button>
            </div>
        )
    }

    const isImageResult = item.result.startsWith('data:image/')

    return (
        <div style={{ backgroundColor: '#0f0f11', color: '#fff', minHeight: '100vh', padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto 2rem auto', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/ai-summarizer-logo.png" alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '6px' }} />
                    <h1 style={{ fontSize: '20px', margin: 0, fontWeight: 600 }}>Shared Analysis</h1>
                </div>
                <button onClick={() => window.location.href = '/'} style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                    Try AI Summarizer
                </button>
            </header>

            <main style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ backgroundColor: '#1a1a1c', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #2a2a2c' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                        <h3 style={{ color: '#f59e0b', margin: 0, fontSize: '18px' }}>{item.usecase_name}</h3>
                        <span style={{ fontSize: '13px', opacity: 0.5 }}>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ opacity: 0.8, fontSize: '15px', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto', backgroundColor: '#111', padding: '1rem', borderRadius: '8px', border: '1px solid #222' }}>
                        <strong style={{ display: 'block', marginBottom: '8px', opacity: 0.6, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Input Document</strong>
                        {item.input_text}
                    </div>
                </div>

                <div style={{ backgroundColor: '#1a1a1c', borderRadius: '12px', padding: '1.5rem', border: '1px solid #2a2a2c' }}>
                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #2a2a2c', paddingBottom: '1rem', fontSize: '16px', fontWeight: 500 }}>Generated Result</h3>
                    {isImageResult ? (
                        <img src={item.result} alt="AI Generated" style={{ maxWidth: '100%', borderRadius: '8px', display: 'block', margin: '0 auto' }} />
                    ) : (
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '15px', color: '#e5e5e5' }}>
                            {item.result}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
