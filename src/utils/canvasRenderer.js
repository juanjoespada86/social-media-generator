// Cache for assets to prevent reloading on every draw
const assetCache = {
    fontsLoaded: false,
    images: {}
};

export const drawGenericPost = async (config) => {
    const {
        templateAsset,
        bgImage,
        textConfig, // { title: string, body: string }
        canvasWidth = 600,
        canvasHeight = 750
    } = config;

    // 1. Initialize Fonts (Once)
    if (!assetCache.fontsLoaded) {
        try {
            await document.fonts.ready;
            await Promise.all([
                document.fonts.load('bold 48px Roboto'),
                document.fonts.load('bold 30px Roboto')
            ]);
            await new Promise(r => setTimeout(r, 50));
            assetCache.fontsLoaded = true;
        } catch (e) {
            console.warn('Font load check warning:', e);
        }
    }

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // Clear
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Helper to load images with caching
    const loadImage = async (src) => {
        if (!src) return null;

        // Don't cache blobs (user uploads) aggressively as they are ephemeral
        if (src.startsWith('blob:')) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = src;
            return new Promise(resolve => {
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
            });
        }

        if (assetCache.images[src]) return assetCache.images[src];

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        const loadedImg = await new Promise(resolve => {
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
        });

        if (loadedImg) assetCache.images[src] = loadedImg;
        return loadedImg;
    };

    // 2. Background Image
    if (bgImage) {
        const img = await loadImage(bgImage);
        if (img) {
            const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width - img.width * scale) / 2;
            const y = (canvas.height - img.height * scale) / 2;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
    } else {
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 3. Template Overlay
    if (templateAsset) {
        const overlay = await loadImage(templateAsset);
        if (overlay) {
            ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
        }
    }

    // 4. Text
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    const wrapText = (text, x, y, maxWidth, lineHeight, fontSize, isBottomUp) => {
        if (!text) return;
        ctx.font = `bold ${fontSize}px Roboto, sans-serif`;

        const words = text.split(/\s+/);
        let line = '';
        const lines = [];

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                lines.push(line.trim());
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());

        if (isBottomUp) {
            for (let i = 0; i < lines.length; i++) {
                // y is the baseline of the LAST line
                const lineY = y - (lines.length - 1 - i) * lineHeight;
                ctx.fillText(lines[i], x, lineY);
            }
        } else {
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], x, y + i * lineHeight);
            }
        }
    };

    // Render Title (Simple / Breaking / Slide 1)
    if (textConfig.title) {
        // Defaults for Simple/Breaking
        // x: 60, y: 590, maxWidth: 480, size: 48, lineHeight: 62, bottomUp: true
        const x = textConfig.titleX ?? 60;
        const y = textConfig.titleY ?? 590;
        const size = textConfig.titleSize ?? 48;
        const leading = textConfig.titleLeading ?? 62;
        wrapText(textConfig.title, x, y, 480, leading, size, true);
    }

    // Render Body (Slide 2)
    if (textConfig.body) {
        // Defaults for Slide 2
        const x = 60;
        const y = canvas.height / 2;
        wrapText(textConfig.body, x, y, 480, 42, 30, false);
    }

    return canvas.toDataURL('image/png', 1.0);
};
