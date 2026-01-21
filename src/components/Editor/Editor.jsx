import React from 'react';

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
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateSettings('image', reader.result);
            };
            reader.readAsDataURL(file);
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
                <div style={{ display: 'flex', gap: '15px' }}>
                    <label style={{
                        ...radioLabelStyle,
                        borderColor: settings.format === 'simple' ? 'var(--accent-color)' : 'var(--border-color)',
                        background: settings.format === 'simple' ? 'rgba(72, 184, 172, 0.1)' : 'var(--bg-input)'
                    }}>
                        <input
                            type="radio"
                            name="format"
                            value="simple"
                            checked={settings.format === 'simple'}
                            onChange={(e) => updateSettings('format', e.target.value)}
                        />
                        Format 1 (Single)
                    </label>
                    <label style={{
                        ...radioLabelStyle,
                        borderColor: settings.format === 'double' ? 'var(--accent-color)' : 'var(--border-color)',
                        background: settings.format === 'double' ? 'rgba(72, 184, 172, 0.1)' : 'var(--bg-input)'
                    }}>
                        <input
                            type="radio"
                            name="format"
                            value="double"
                            checked={settings.format === 'double'}
                            onChange={(e) => updateSettings('format', e.target.value)}
                        />
                        Format 2 (Double)
                    </label>
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
                        style={{
                            ...inputStyle,
                            padding: '12px',
                            fileSelectorButton: {
                                marginRight: '20px',
                                border: 'none',
                                background: 'var(--accent-color)',
                                padding: '10px 20px',
                                borderRadius: '4px',
                                color: 'white',
                                cursor: 'pointer'
                            }
                        }}
                    />
                </div>
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
