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

    const currentOverlay =
        format === 'simple' ? assets.simple :
            format === 'double' ? assets.double1 :
                format === 'breaking_exn' ? assets.breaking_exn :
                    format === 'breaking_exd' ? assets.breaking_exd : assets.simple;

    useImperativeHandle(ref, () => ({
        generateImages: async () => {
            const results = [];
            const bg = image;

            if (format === 'simple') {
                const dataUrl = await drawGenericPost({
                    templateAsset: assets.simple,
                    bgImage: bg,
                    textConfig: { title: title || '' }
                });
                results.push({ dataUrl, suffix: 'simple' });

            } else if (format === 'double') {
                const dataUrl1 = await drawGenericPost({
                    templateAsset: assets.double1,
                    bgImage: bg,
                    textConfig: { title: title || '' }
                });
                results.push({ dataUrl: dataUrl1, suffix: 'pag1' });

                const dataUrl2 = await drawGenericPost({
                    templateAsset: assets.double2,
                    bgImage: bg,
                    textConfig: { body: body || '' }
                });
                results.push({ dataUrl: dataUrl2, suffix: 'pag2' });

            } else if (format === 'breaking_exn') {
                const dataUrl = await drawGenericPost({
                    templateAsset: assets.breaking_exn,
                    bgImage: bg,
                    textConfig: { title: title || '' }
                });
                results.push({ dataUrl, suffix: 'exn' });

            } else if (format === 'breaking_exd') {
                const dataUrl = await drawGenericPost({
                    templateAsset: assets.breaking_exd,
                    bgImage: bg,
                    textConfig: { title: title || '' }
                });
                results.push({ dataUrl, suffix: 'exd' });
            }

            return results;
        }
    }), [settings]);

    return (
        <div id="preview-container" style={{ display: 'flex', gap: '20px', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={slideStyle}>
                {image && <img src={image} style={bgStyle} alt="bg" />}
                <img
                    src={currentOverlay}
                    style={overlayStyle}
                    alt="template"
                    crossOrigin="anonymous"
                />
                <div style={textLayerStyle}>
                    {title ? (
                        <h2 style={{
                            position: 'absolute',
                            bottom: '140px',
                            left: '40px',
                            width: '320px',
                            color: 'white',
                            fontFamily: 'Roboto',
                            fontWeight: 'bold',
                            fontSize: '32px',
                            textAlign: 'left',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            margin: 0
                        }}>
                            {title}
                        </h2>
                    ) : null}
                </div>
            </div>

            {format === 'double' && (
                <div style={slideStyle}>
                    {image && <img src={image} style={bgStyle} alt="bg" />}
                    <img src={assets.double2} style={overlayStyle} alt="template" crossOrigin="anonymous" />
                    <div style={textLayerStyle}>
                        {body ? (
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
                                {body}
                            </p>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
});

export default Preview;
