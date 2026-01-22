import React, { useState } from 'react';

export default function Controls({ previewRef, fileName }) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!previewRef.current) return;

        setIsExporting(true);

        try {
            const results = await previewRef.current.generateImages();
            for (const { dataUrl, suffix } of results) {
                const link = document.createElement('a');
                link.download = `${fileName}_${suffix}.png`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                // Safari needs a tiny gap between downloads
                await new Promise(r => setTimeout(r, 300));
            }
        } catch (err) {
            console.error('Export failed:', err);
            alert('Error exportando imagen. Intenta de nuevo.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <button
                onClick={handleExport}
                disabled={isExporting}
                style={{
                    backgroundColor: '#ff4b2b', // Distinct orange-red for verification
                    color: 'white',
                    padding: '16px 40px',
                    borderRadius: 'var(--border-radius-sm)',
                    border: 'none',
                    fontWeight: '900',
                    fontSize: '18px',
                    boxShadow: '0 4px 15px rgba(255, 75, 43, 0.4)',
                    width: '100%',
                    maxWidth: '400px',
                    transition: 'all 0.2s',
                    opacity: isExporting ? 0.7 : 1,
                    cursor: isExporting ? 'wait' : 'pointer'
                }}
            >
                {isExporting ? 'PROCESANDO...' : 'DESCARGAR CREATIVIDADES V2'}
            </button>
        </div>
    );
}
