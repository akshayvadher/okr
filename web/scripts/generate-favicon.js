const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48];
const svgPath = path.join(__dirname, '../public/app/favicon.svg');
const icoPath = path.join(__dirname, '../public/app/favicon.ico');

async function generateFavicon() {
    try {
        const images = await Promise.all(
            sizes.map(size =>
                sharp(svgPath)
                    .resize(size, size)
                    .toBuffer()
            )
        );

        // Combine images into ICO
        const icoBuffer = await sharp(images[0])
            .toFormat('ico')
            .toBuffer();

        fs.writeFileSync(icoPath, icoBuffer);
        console.log('Favicon generated successfully!');
    } catch (error) {
        console.error('Error generating favicon:', error);
    }
}

generateFavicon(); 