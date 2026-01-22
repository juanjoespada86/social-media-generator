import React, { useState } from 'react';
import html2canvas from 'html2canvas';

export default function Controls({ previewRef, fileName }) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        const refs = previewRef.current;
        if (!refs) return;

        setIsDownloading(true);

        try {
            const downloadNode = async (node, suffix) => {
                if (!node) return;

                try {
                    // Slight delay to ensure DOM stability
                    await new Promise(r => setTimeout(r, 500));

                    const canvas = await html2canvas(node, {
                        useCORS: true,
                        allowTaint: true, // Allow cross-origin images if CORS is set
                        scale: 1.5, // Reduced from 2 to save RAM on iOS
                        width: 400,
                        height: 500,
                        backgroundColor: null,
                        logging: false,
                        onclone: (clonedDoc, element) => {
                            element.style.transform = 'none';
                            element.style.margin = '0';
                            element.style.display = 'flex';
                        }
                    });

                    // Modern Export Strategy: Blob -> Share or ObjectURL
                    canvas.toBlob(async (blob) => {
                        if (!blob) throw new Error('Canvas blob generation failed');

                        const safeFileName = `${(fileName || 'social-post').replace(/\s+/g, '_')}${suffix}.png`;
                        const file = new File([blob], safeFileName, { type: 'image/png' });

                        // Strategy 1: Mobile native share (Best for iOS)
                        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                            try {
                                await navigator.share({
                                    files: [file],
                                    title: 'Post Generated',
                                    text: 'Here is your new social media post!'
                                });
                                return; // Success, exit
                            } catch (shareError) {
                                console.warn('Share API failed, falling back to download', shareError);
                                // Fallback if user cancelled share or it failed
                            }
                        }

                        // Strategy 2: URL.createObjectURL (Better than Data URI for Safari)
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.download = safeFileName;
                        link.href = url;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        // Cleanup
                        setTimeout(() => URL.revokeObjectURL(url), 1000); // Wait a bit for iOS

                    }, 'image/png');

                } catch (e) {
                    console.error(`Failed to download ${suffix}`, e);
                }
            };

            if (refs.simple) {
                await downloadNode(refs.simple, '');
            } else {
                console.log("Downloading Slide 1...");
                if (refs.slide1) await downloadNode(refs.slide1, '_slide1');

                // Delay between slides to prevent race conditions on mobile
                await new Promise(r => setTimeout(r, 2000));

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
