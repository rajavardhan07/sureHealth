const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    console.log(`Processing: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes('@Component')) {
        return;
    }

    const dirname = path.dirname(filePath);
    const basename = path.basename(filePath, '.ts'); // e.g. admin-layout.component
    const htmlPath = path.join(dirname, basename + '.html');
    const cssPath = path.join(dirname, basename + '.css');

    // Extract template string using regex.
    const templateRegex = /template\s*:\s*`([\s\S]*?)`\s*(,|})/g;
    let matchTpl = templateRegex.exec(content);
    
    let hasTemplate = false;
    if (matchTpl) {
        fs.writeFileSync(htmlPath, matchTpl[1].trim());
        content = content.replace(matchTpl[0], `templateUrl: './${basename}.html'${matchTpl[2]}`);
        hasTemplate = true;
        console.log(`  -> Created ${basename}.html`);
    }

    // Replace styles array. Usually it's styles: [`...`]
    const stylesRegex = /styles\s*:\s*\[\s*`([\s\S]*?)`\s*\]\s*(,|})/g;
    let matchStyles = stylesRegex.exec(content);

    let hasStyles = false;
    if (matchStyles) {
        const cssContent = matchStyles[1].trim();
        if (cssContent.length > 0) {
            fs.writeFileSync(cssPath, cssContent);
            content = content.replace(matchStyles[0], `styleUrl: './${basename}.css'${matchStyles[2]}`);
            console.log(`  -> Created ${basename}.css`);
        } else {
            content = content.replace(matchStyles[0], matchStyles[2] === ',' ? '' : '}');
        }
        hasStyles = true;
    }

    if (hasTemplate || hasStyles) {
        fs.writeFileSync(filePath, content);
        console.log(`  -> Updated ${basename}.ts`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.component.ts')) {
            processFile(fullPath);
        }
    }
}

const featuresDir = path.join(__dirname, 'src', 'app', 'features');
walkDir(featuresDir);
console.log('Done!');
