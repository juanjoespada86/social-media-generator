import React, { useState } from 'react';

export default function Controls({ previewRef, fileName }) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!previewRef.current) return;
        setIsExporting(true);

        try {
            const results = await previewRef.current.generateImages();

            // Convert DataURLs to File objects
            const files = await Promise.all(results.map(async ({ dataUrl, suffix }) => {
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                return new File([blob], `${fileName}_${suffix}.png`, { type: 'image/png' });
            }));

            // Try Native Share (iOS/Android)
            if (navigator.canShare && navigator.canShare({ files })) {
                try {
                    await navigator.share({
                        files,
                        title: 'Creatividades Social Media',
                        text: 'Aquí tienes tus creatividades generadas.'
                    });
                } catch (shareErr) {
                    // Ignore user cancellation (AbortError)
                    if (shareErr.name !== 'AbortError') {
                        console.error('Proceso compartir falló:', shareErr);
                        // Fallback purely for technical errors, not user caprice
                        await downloadFiles(files);
                    }
                }
            } else {
                // Fallback for Desktop or unsupported browsers
                await downloadFiles(files);
            }

        } catch (err) {
            console.error('Export failed:', err);
            alert('Error exportando imagen. Intenta de nuevo.');
        } finally {
            setIsExporting(false);
        }
    };

    const downloadFiles = async (files) => {
        for (const file of files) {
            const url = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.download = file.name;
            link.href = url;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);

            // Delay to prevent browser blocking multiple downloads
            await new Promise(r => setTimeout(r, 800));
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
                {isExporting ? 'PROCESANDO...' : 'COMPARTIR / DESCARGAR'}
            </button>
        </div>
    );
}
