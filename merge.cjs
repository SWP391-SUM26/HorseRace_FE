const fs = require('fs');
const path = require('path');

const jockeysDir = path.join(__dirname, 'src/features/jockeys');
const jockeyDir = path.join(__dirname, 'src/features/jockey');

// Move and rename root files
const filesToRename = ['api.ts', 'api.test.ts', 'hooks.ts', 'types.ts'];
for (const file of filesToRename) {
    const src = path.join(jockeysDir, file);
    if (fs.existsSync(src)) {
        const destName = file.replace('.ts', '_owner.ts');
        fs.renameSync(src, path.join(jockeyDir, destName));
    }
}

// Move components
const componentsDir = path.join(jockeysDir, 'components');
if (fs.existsSync(componentsDir)) {
    const components = fs.readdirSync(componentsDir);
    for (const file of components) {
        fs.renameSync(path.join(componentsDir, file), path.join(jockeyDir, 'components', file));
    }
}

// Move pages
const pagesDir = path.join(jockeysDir, 'pages');
if (fs.existsSync(pagesDir)) {
    const pages = fs.readdirSync(pagesDir);
    for (const file of pages) {
        fs.renameSync(path.join(pagesDir, file), path.join(jockeyDir, 'pages', file));
    }
}

// Delete jockeys dir
fs.rmSync(jockeysDir, { recursive: true, force: true });

// Update imports in JockeyMarketPage.tsx and MyInvitationsPage.tsx
const pagesToUpdate = ['JockeyMarketPage.tsx', 'MyInvitationsPage.tsx'];
for (const page of pagesToUpdate) {
    const pagePath = path.join(jockeyDir, 'pages', page);
    if (fs.existsSync(pagePath)) {
        let content = fs.readFileSync(pagePath, 'utf8');
        content = content.replace(/from '\.\.\/hooks'/g, "from '../hooks_owner'");
        content = content.replace(/from '\.\.\/types'/g, "from '../types_owner'");
        content = content.replace(/from '\.\.\/api'/g, "from '../api_owner'");
        fs.writeFileSync(pagePath, content);
    }
}

// Also update imports in components
const componentsToUpdate = ['JockeyCard.tsx', 'RaceDetails.tsx', 'UnassignedHorses.tsx'];
for (const comp of componentsToUpdate) {
    const compPath = path.join(jockeyDir, 'components', comp);
    if (fs.existsSync(compPath)) {
        let content = fs.readFileSync(compPath, 'utf8');
        content = content.replace(/from '\.\.\/hooks'/g, "from '../hooks_owner'");
        content = content.replace(/from '\.\.\/types'/g, "from '../types_owner'");
        content = content.replace(/from '\.\.\/api'/g, "from '../api_owner'");
        fs.writeFileSync(compPath, content);
    }
}

// Update imports in hooks_owner.ts
const hooksOwnerPath = path.join(jockeyDir, 'hooks_owner.ts');
if (fs.existsSync(hooksOwnerPath)) {
    let content = fs.readFileSync(hooksOwnerPath, 'utf8');
    content = content.replace(/from '\.\/api'/g, "from './api_owner'");
    fs.writeFileSync(hooksOwnerPath, content);
}

// Update imports in api_owner.ts
const apiOwnerPath = path.join(jockeyDir, 'api_owner.ts');
if (fs.existsSync(apiOwnerPath)) {
    let content = fs.readFileSync(apiOwnerPath, 'utf8');
    content = content.replace(/from '\.\/types'/g, "from './types_owner'");
    fs.writeFileSync(apiOwnerPath, content);
}

console.log("Merge completed!");
