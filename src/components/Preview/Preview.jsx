import React, { forwardRef, useImperativeHandle } from 'react';
import { drawGenericPost } from '../../utils/canvasRenderer';

// Assets mapping
const assets = {
    simple: '/template_simple.png',
    double1: '/template_double_1.png',
    double2: '/template_double_2.png',
    breaking_exn: '/template_breaking_exn.png',
    breaking_exd: '/template_breaking_exd.png'
};

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

// Image fills the slide
const bgStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 1
};

// Template overlay sits on top
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
    const { format, image, title, body } = settings;

    // Use specific assets later, for now mock
    const currentOverlay =
        format === 'simple' ? assets.simple :
            format === 'double' ? assets.double1 :
                format === 'breaking_exn' ? assets.breaking_exn :
                    format === 'breaking_exd' ? assets.breaking_exd : assets.simple;

    useImperativeHandle(ref, () => ({
        generateImages: async () => {
            const results = [];
            const bg = image ? URL.createObjectURL(image) : null;

            if (format === 'simple') {
                // Template 1
                const dataUrl = await drawGenericPost({
                    templateAsset: assets.simple,
                    bgImage: bg,
                    textConfig: { title: title || 'Titular Aquí' }
                });
                results.push({ dataUrl, suffix: 'simple' });

            } else if (format === 'double') {
                // Template 2 - Slide 1
                const dataUrl1 = await drawGenericPost({
                    templateAsset: assets.double1,
                    bgImage: bg,
                    textConfig: { title: title || 'Titular Aquí' }
                });
                results.push({ dataUrl: dataUrl1, suffix: 'pag1' });

                // Template 2 - Slide 2
                const dataUrl2 = await drawGenericPost({
                    templateAsset: assets.double2,
                    bgImage: bg,
                    textConfig: { body: body || 'Descripción aquí...' }
                });
                results.push({ dataUrl: dataUrl2, suffix: 'pag2' });

            } else if (format === 'breaking_exn') {
                // Ultima Hora EXN
                const dataUrl = await drawGenericPost({
                    templateAsset: assets.breaking_exn,
                    bgImage: bg,
                    // Breaking news often has title lower? Using default for now but robust renderer handles defaults
                    textConfig: { title: title || 'Última Hora EXN' }
                });
                results.push({ dataUrl, suffix: 'exn' });

            } else if (format === 'breaking_exd') {
                // Ultima Hora EXD
                const dataUrl = await drawGenericPost({
                    templateAsset: assets.breaking_exd,
                    bgImage: bg,
                    textConfig: { title: title || 'Última Hora EXD' }
                });
                results.push({ dataUrl, suffix: 'exd' });
            }

            if (bg) URL.revokeObjectURL(bg);
            return results;
        }
    }));

    return (
        <div id="preview-container" style={{ display: 'flex', gap: '20px', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Slide 1  */}
            <div style={slideStyle}>
                {image && <img src={image} style={bgStyle} alt="bg" />}
                <img
                    src={currentOverlay}
                    style={overlayStyle}
                    alt="template"
                    crossOrigin="anonymous"
                />
                <div style={textLayerStyle}>
                    {/* CSS approximation for visual feedback */}
                    <h2 style={{
                        position: 'absolute',
                        bottom: '140px',
                        left: '40px',
                        width: '320px',
                        color: 'white',
                        fontFamily: 'Roboto',
                        fontWeight: 'bold',
                        fontSize: '32px', // scaled down from 48px
                        textAlign: 'left',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        margin: 0
                    }}>
                        {title || 'Titular Previsualización'}
                    </h2>
                </div>
            </div>

            {/* Slide 2 Preview (Only for Double) */}
            {format === 'double' && (
                <div style={slideStyle}>
                    {image && <img src={image} style={bgStyle} alt="bg" />}
                    <img src={assets.double2} style={overlayStyle} alt="template" crossOrigin="anonymous" />
                    <div style={textLayerStyle}>
                        <p style={{
                            position: 'absolute',
                            top: '50%',
                            left: '40px',
                            transform: 'translateY(-50%)',
                            width: '320px',
                            color: 'white',
                            fontFamily: 'Roboto',
                            fontWeight: 'bold',
                            fontSize: '20px',
                            textAlign: 'left',
                            margin: 0
                        }}>
                            {body || 'Descripción...'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
});

export default Preview;
