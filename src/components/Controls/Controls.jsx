import React, { useState } from 'react';
import html2canvas from 'html2canvas';

export default function Controls({ previewRef, fileName }) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        const refs = previewRef.current;
        if (!refs) return;

        setIsDownloading(true);

        try {
            // Helper to generate a File object from a DOM node
            const generateFile = async (node, suffix) => {
                if (!node) return null;

                try {
                    // Slight delay to ensure DOM stability
                    await new Promise(r => setTimeout(r, 500));

                    const canvas = await html2canvas(node, {
                        useCORS: true,
                        allowTaint: true,
                        scale: 1.5, // 1.5x is safe for iOS RAM
                        width: 400,
                        height: 500,
                        backgroundColor: null,
                        logging: false,
                        letterRendering: 1, // Fix for text kerning issues
                        onclone: (clonedDoc, element) => {
                            element.style.transform = 'none';
                            element.style.margin = '0';
                            element.style.display = 'flex';
                            // Ensure fonts rendering is standard
                            element.style.fontVariantLigatures = 'no-common-ligatures';
                        }
                    });

                    return new Promise((resolve) => {
                        canvas.toBlob((blob) => {
                            if (!blob) {
                                console.error('Blob generation failed for', suffix);
                                resolve(null);
                                return;
                            }
                            const safeFileName = `${(fileName || 'social-post').replace(/\s+/g, '_')}${suffix}.png`;
                            const file = new File([blob], safeFileName, { type: 'image/png' });
                            resolve(file);
                        }, 'image/png');
                    });
                } catch (e) {
                    console.error(`Failed to generate file for ${suffix}`, e);
                    return null;
                }
            };

            // 1. Generate all files needed
            const filesToShare = [];

            if (refs.simple) {
                const f = await generateFile(refs.simple, '');
                if (f) filesToShare.push(f);
            } else {
                console.log("Generating Slide 1...");
                const f1 = await generateFile(refs.slide1, '_slide1');
                if (f1) filesToShare.push(f1);

                // Short delay between generations to let GC run
                await new Promise(r => setTimeout(r, 500));

                if (refs.slide2) {
                    console.log("Generating Slide 2...");
                    const f2 = await generateFile(refs.slide2, '_slide2');
                    if (f2) filesToShare.push(f2);
                }
            }

            if (filesToShare.length === 0) throw new Error("No images generated");

            // 2. Try Batch Sharing (Best for iOS)
            if (navigator.share && navigator.canShare && navigator.canShare({ files: filesToShare })) {
                try {
                    await navigator.share({
                        files: filesToShare,
                        title: 'Social Posts',
                        text: 'Here are your generated assets.'
                    });
                    console.log("Shared successfully");
                    return;
                } catch (shareError) {
                    // User cancelled or failed
                    console.warn('Share API cancelled or failed, falling back to download', shareError);
                }
            }

            // 3. Fallback: Download Sequentially (Desktop/Android legacy)
            for (const file of filesToShare) {
                const url = URL.createObjectURL(file);
                const link = document.createElement('a');
                link.download = file.name;
                link.href = url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                await new Promise(r => setTimeout(r, 1000)); // Delay between downloads
                URL.revokeObjectURL(url);
            }

        } catch (err) {
            console.error('Error:', err);
            alert('Error processing images');
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
