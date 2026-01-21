import React, { useState } from 'react';
import { toPng } from 'html-to-image';

export default function Controls({ previewRef, fileName }) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        const refs = previewRef.current;
        if (!refs) return;

        setIsDownloading(true);

        try {
            const downloadNode = async (node, suffix) => {
                if (!node) return;

                // Settings to ensure correct export even if scaled on mobile
                const options = {
                    cacheBust: false,
                    pixelRatio: 2,
                    width: 400,
                    height: 500,
                    style: {
                        transform: 'none',
                        margin: '0',
                        display: 'flex'
                    }
                };

                try {
                    // Increased delay for images to handle mobile resource constraints
                    await new Promise(r => setTimeout(r, 500));

                    const dataUrl = await toPng(node, options);

                    const link = document.createElement('a');
                    const cleanName = (fileName || 'social-post').replace(/\s+/g, '_');
                    link.download = `${cleanName}${suffix}.png`;
                    link.href = dataUrl;
                    link.click();
                } catch (e) {
                    console.error(`Failed to download ${suffix}`, e);
                }
            };

            if (refs.simple) {
                await downloadNode(refs.simple, '');
            } else {
                console.log("Downloading Slide 1...");
                if (refs.slide1) await downloadNode(refs.slide1, '_slide1');

                // Generous delay between slides
                await new Promise(r => setTimeout(r, 2500));

                if (refs.slide2) {
                    console.log("Downloading Slide 2...");
                    await downloadNode(refs.slide2, '_slide2');
                }
            }

        } catch (err) {
            console.error('Error:', err);
            alert('Error generating images');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div style={{ width: '100%', textAlign: 'center' }}>
            <button
                onClick={handleDownload}
                disabled={isDownloading}
                style={{
                    width: '100%',
                    padding: '16px 32px',
                    background: 'linear-gradient(135deg, var(--accent-color) 0%, #3a968c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--border-radius)',
                    fontSize: '18px',
                    fontWeight: '700',
                    letterSpacing: '0.5px',
                    cursor: isDownloading ? 'wait' : 'pointer',
                    boxShadow: '0 4px 15px rgba(72, 184, 172, 0.4)', // 48b8ac shadow
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    opacity: isDownloading ? 0.8 : 1
                }}
                onMouseEnter={e => !isDownloading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => !isDownloading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
                {isDownloading ? 'Generating...' : `Download ${fileName ? '"' + fileName + '"' : 'Assets'}`}
            </button>
            <p style={{ marginTop: '15px', fontSize: '12px', color: 'var(--text-muted)' }}>
                High Quality PNG • 4:5 Aspect Ratio
            </p>
        </div>
    );
}
