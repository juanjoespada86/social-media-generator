import React, { useState } from 'react';

const sectionStyle = {
    marginBottom: '24px'
};

const labelStyle = {
    display: 'block',
    marginBottom: '10px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const inputStyle = {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--text-main)',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit'
};

const radioLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    padding: '12px 20px',
    backgroundColor: 'var(--bg-input)',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    flex: 1,
    transition: 'all 0.2s'
};

export default function Editor({
    settings,
    updateSettings
}) {
    const [isProcessing, setIsProcessing] = useState(false);

    // Resize image to max 1080px width (sufficient for 800x1000 render) to prevent mobile crash
    const resizeImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 1080;

                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress slightly to save memory
                    resolve(canvas.toDataURL('image/jpeg', 0.9));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsProcessing(true);
            try {
                const resizedDataUrl = await resizeImage(file);
                updateSettings('image', resizedDataUrl);
            } catch (err) {
                console.error("Error resizing image", err);
                alert("Error processing image. Try a smaller file.");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div style={{
            flex: 1,
            padding: '30px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-color)'
        }}>
            <h2 style={{ marginBottom: '30px', fontWeight: '700' }}>Create Post</h2>

            {/* Format Selection */}
            <div style={sectionStyle}>
                <label style={labelStyle}>Format</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {[
                        { id: 'simple', label: 'Simple (1 Slide)' },
                        { id: 'double', label: 'Doble (2 Slides)' },
                        { id: 'breaking_exn', label: 'Última Hora EXN' },
                        { id: 'breaking_exd', label: 'Última Hora EXD' }
                    ].map(option => (
                        <label key={option.id} style={{
                            ...radioLabelStyle,
                            borderColor: settings.format === option.id ? 'var(--accent-color)' : 'var(--border-color)',
                            background: settings.format === option.id ? 'rgba(72, 184, 172, 0.1)' : 'var(--bg-input)',
                            justifyContent: 'center'
                        }}>
                            <input
                                type="radio"
                                name="format"
                                value={option.id}
                                checked={settings.format === option.id}
                                onChange={(e) => updateSettings('format', e.target.value)}
                                style={{ marginRight: '8px' }}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>
            </div>

            {/* Image Upload */}
            <div style={sectionStyle}>
                <label style={labelStyle}>Background Image</label>
                <div style={{
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'inline-block',
                    width: '100%'
                }}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isProcessing}
                        style={{
                            ...inputStyle,
                            padding: '12px',
                            fileSelectorButton: {
                                marginRight: '20px',
                                border: 'none',
                                background: isProcessing ? '#666' : 'var(--accent-color)',
                                padding: '10px 20px',
                                borderRadius: '4px',
                                color: 'white',
                                cursor: isProcessing ? 'wait' : 'pointer'
                            }
                        }}
                    />
                </div>
                {isProcessing && <p style={{ color: 'var(--accent-color)', fontSize: '12px', marginTop: '5px' }}>Optimizing image...</p>}
                <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Supported: JPG, PNG. Image will replace the background.
                </p>
            </div>

            {/* Title */}
            <div style={sectionStyle}>
                <label style={labelStyle}>Headline (Titular)</label>
                <input
                    type="text"
                    value={settings.title}
                    onChange={(e) => updateSettings('title', e.target.value)}
                    placeholder="Enter the main headline..."
                    style={inputStyle}
                />
            </div>

            {/* Body Text (Only for Double) */}
            {settings.format === 'double' && (
                <div style={sectionStyle}>
                    <label style={labelStyle}>Description (Slide 2)</label>
                    <textarea
                        value={settings.body}
                        onChange={(e) => updateSettings('body', e.target.value)}
                        placeholder="Enter the detailed description..."
                        style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }}
                    />
                </div>
            )}
        </div>
    );
}
