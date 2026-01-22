import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';

// Common style for a 4:5 slide
const slideStyle = {
    width: '400px',
    height: '500px',
    minWidth: '400px',
    minHeight: '500px',
    backgroundColor: 'white',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0
};

const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    pointerEvents: 'none'
};

// Text on top of overlay
const textLayerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 20,
    width: '400px',
    height: '500px',
    textAlign: 'center',
    boxSizing: 'border-box'
};

const Preview = forwardRef(({ settings }, ref) => {
    const simpleRef = useRef(null);
    const slide1Ref = useRef(null);
    const slide2Ref = useRef(null);

    // State to hold Base64 strings of assets
    const [assets, setAssets] = useState({
        simple: null,
        double1: null,
        double2: null
    });

    // Pre-load assets as Base64 on mount to ensure mobile export works
    useEffect(() => {
        const loadAsset = async (path) => {
            try {
                const response = await fetch(path);
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch (err) {
                console.error("Failed to load asset:", path, err);
                return path; // Fallback to path if conversion fails
            }
        };

        const loadAll = async () => {
            const [simple, double1, double2] = await Promise.all([
                loadAsset('/template_simple.png'),
                loadAsset('/template_double_1.png'),
                loadAsset('/template_double_2.png')
            ]);
            setAssets({ simple, double1, double2 });
        };

        loadAll();
    }, []);

    // Manual Canvas Rendering to bypass iOS Safari layout bugs
    const drawToCanvas = async (templateAsset, bgImage, title, body = null) => {
        // Ensure Roboto is loaded before measuring
        try {
            // First wait for any pending font loading
            await document.fonts.ready;
            // Specifically load the weights we need
            await Promise.all([
                document.fonts.load('bold 48px Roboto'),
                document.fonts.load('bold 30px Roboto')
            ]);
            // Tiny safety delay for iOS Safari font engine to sync
            await new Promise(r => setTimeout(r, 100));
        } catch (e) {
            console.warn('Font load check failed, continuing with fallbacks', e);
        }

        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 750;
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Background Image (Cover)
        if (bgImage) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = bgImage;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = (err) => {
                    console.error("BG Image load error", err);
                    resolve(); // Still resolve to not block everything
                };
            });

            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width - img.width * scale) / 2;
            const y = (canvas.height - img.height * scale) / 2;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        } else {
            ctx.fillStyle = '#eee';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Draw Template Overlay
        if (templateAsset) {
            const overlay = new Image();
            overlay.crossOrigin = "anonymous";
            overlay.src = templateAsset;
            await new Promise((resolve) => {
                overlay.onload = resolve;
                overlay.onerror = () => resolve();
            });
            ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
        }

        // 3. Draw Text
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;

        const wrapText = (text, x, y, maxWidth, lineHeight, isBottomUp = false) => {
            const words = text.split(/\s+/);
            let line = '';
            const lines = [];

            // Force font context for measurement
            ctx.font = isBottomUp ? 'bold 48px Roboto, sans-serif' : 'bold 30px Roboto, sans-serif';

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    lines.push(line.trim());
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }
            lines.push(line.trim());

            if (isBottomUp) {
                // For bottom-up, the 'y' is the baseline of the LAST line
                for (let i = 0; i < lines.length; i++) {
                    const lineY = y - (lines.length - 1 - i) * lineHeight;
                    ctx.fillText(lines[i], x, lineY);
                }
            } else {
                for (let i = 0; i < lines.length; i++) {
                    ctx.fillText(lines[i], x, y + i * lineHeight);
                }
            }
        };

        if (body) {
            // Slide 2 (Double)
            ctx.font = 'bold 30px Roboto, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            const x = 60;
            const y = canvas.height / 2;
            wrapText(body, x, y, 480, 42, false);
        } else {
            // Slide 1 (Simple or Double)
            ctx.font = 'bold 48px Roboto, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            const x = 60;
            const y = 590; // Fixed y coordinate for the bottom line
            wrapText(title || (templateAsset === assets.simple ? 'Titular Aquí' : 'Titular Impactante CEX'), x, y, 480, 62, true);
        }

        return canvas.toDataURL('image/png', 1.0);
    };

    useImperativeHandle(ref, () => ({
        generateImages: async () => {
            if (settings.format === 'simple') {
                const dataUrl = await drawToCanvas(assets.simple, settings.image, settings.title);
                return [{ dataUrl, suffix: 'simple' }];
            } else {
                const results = [];
                const slide1 = await drawToCanvas(assets.double1, settings.image, settings.title);
                results.push({ dataUrl: slide1, suffix: 'page1' });
                const slide2 = await drawToCanvas(assets.double2, settings.image, null, settings.body);
                results.push({ dataUrl: slide2, suffix: 'page2' });
                return results;
            }
        }
    }));

    // Template 1: CREATIVIDAD 1
    const renderSimple = () => (
        <div ref={simpleRef} style={slideStyle}>
            {/* Layer 1: User Image (Background) */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                {settings.image ? (
                    <img src={settings.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : <div style={{ width: '100%', height: '100%', background: '#eee' }} />}
            </div>

            {/* Layer 2: Template Overlay (Base64) */}
            {assets.simple && (
                <img src={assets.simple} style={overlayStyle} alt="" crossOrigin="anonymous" />
            )}

            <div style={textLayerStyle}>
                <div style={{
                    position: 'absolute',
                    bottom: '105px',
                    left: '40px',
                    width: '320px',
                    textAlign: 'left'
                }}>
                    <h1 style={{
                        fontSize: '32px',
                        color: 'white',
                        fontWeight: 700,
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        lineHeight: '1.2',
                        margin: 0,
                        padding: 0,
                        display: 'block',
                        width: '320px'
                    }}>
                        {settings.title || 'Titular Aquí'}
                    </h1>
                </div>
            </div>
        </div>
    );

    // Template 2 Slide 1
    const renderSlide1 = () => (
        <div ref={slide1Ref} style={slideStyle}>
            {/* Background */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                {settings.image ? (
                    <img src={settings.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : <div style={{ width: '100%', height: '100%', background: '#eee' }} />}
            </div>

            {/* Overlay */}
            {assets.double1 && (
                <img src={assets.double1} style={overlayStyle} alt="" crossOrigin="anonymous" />
            )}

            {/* Text */}
            <div style={textLayerStyle}>
                <div style={{
                    position: 'absolute',
                    bottom: '105px',
                    left: '40px',
                    width: '320px',
                    textAlign: 'left'
                }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        lineHeight: '1.2',
                        color: 'white',
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        width: '320px',
                        margin: 0,
                        padding: 0,
                        display: 'block'
                    }}>
                        {settings.title || 'Titular Impactante CEX'}
                    </h1>
                </div>
            </div>
        </div>
    );

    // Template 2 Slide 2
    const renderSlide2 = () => (
        <div ref={slide2Ref} style={slideStyle}>
            {/* Background */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                {settings.image ? (
                    <img src={settings.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : <div style={{ width: '100%', height: '100%', background: '#eee' }} />}
            </div>

            {/* Overlay */}
            {assets.double2 && (
                <img src={assets.double2} style={overlayStyle} alt="" crossOrigin="anonymous" />
            )}

            {/* Text */}
            <div style={textLayerStyle}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '320px',
                    textAlign: 'left'
                }}>
                    <p style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.4',
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        width: '320px',
                        margin: 0,
                        display: 'block'
                    }}>
                        {settings.body || 'Escribe aquí la descripción de tu servicio o novedad...'}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
            <h2>Preview</h2>

            {!assets.simple ? (
                <div style={{ padding: '20px', color: '#666' }}>Loading assets...</div>
            ) : settings.format === 'simple' ? (
                renderSimple()
            ) : (
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div>
                        <p style={{ textAlign: 'center', marginBottom: '5px', color: '#666' }}>Slide 1</p>
                        {renderSlide1()}
                    </div>
                    <div>
                        <p style={{ textAlign: 'center', marginBottom: '5px', color: '#666' }}>Slide 2</p>
                        {renderSlide2()}
                    </div>
                </div>
            )}
        </div>
    );
});

export default Preview;
