import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';

// Common style for a 4:5 slide
const slideStyle = {
    width: '400px',
    aspectRatio: '4/5',
    backgroundColor: 'white',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column'
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
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center'
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

    useImperativeHandle(ref, () => ({
        get simple() { return simpleRef.current; },
        get slide1() { return slide1Ref.current; },
        get slide2() { return slide2Ref.current; }
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

            {/* Layer 3: Dynamic Text */}
            <div style={textLayerStyle}>
                <div style={{ flex: 1 }}></div>
                <div style={{
                    padding: '0 40px 105px 40px',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-end',
                    height: '100%',
                }}>
                    <h1 style={{
                        fontSize: '32px',
                        color: 'white',
                        fontWeight: 700,
                        textAlign: 'left',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        lineHeight: 1.2,
                        width: '100%'
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
                <div style={{ flex: 1 }}></div>
                <div style={{
                    padding: '0 40px 105px 40px',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-end',
                    height: '100%',
                }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        lineHeight: 1.2,
                        color: 'white',
                        textAlign: 'left',
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        width: '100%'
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
            <div style={{ ...textLayerStyle, padding: '40px', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px',
                }}>
                    <p style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.5,
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
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
