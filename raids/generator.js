const fs = require('fs');
const path = require('path');

// Configuration
const guidesFolder = './raids/guides-src';  // Put .txt files here
const outputFolder = './raids/guides';      // Generated HTML goes here

const guidesList = [];

// Read all .txt files from source folder
fs.readdirSync(guidesFolder).forEach(file => {
    if (file.endsWith('.txt')) {
        const name = file.replace('.txt', '');
        const content = fs.readFileSync(path.join(guidesFolder, file), 'utf-8');
        const html = parseToHTML(content, name);
        fs.writeFileSync(path.join(outputFolder, name + '.html'), html);
        console.log(`Generated: ${name}'.html'`);
        guidesList.push(name);
    }
});

// Create guide-list
const guidesListJson = JSON.stringify(guidesList, null, 2);
fs.writeFileSync(path.join(outputFolder, 'guides-list.json'), guidesListJson);
console.log(`Generated: guides-list.json`);

function parseToHTML(content, guideName) {
    const lines = content.split('\n');
    let html = `<div class="raid-guide">\n`;
    let currentRoom = null;
    let currentSubsection = null;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        if (line === '') continue; // Skip empty lines
        
        // Parse commands
        if (line.startsWith('@title')) {
            const title = line.replace('@title', '').trim();
            html += `    <div class="raid">\n        <h1>${escapeHtml(title)}</h1>\n    </div>\n\n`;
        }
        
        else if (line.startsWith('@room')) {
            // Close previous room if exists
            if (currentRoom) {
                if (currentSubsection) html += `        </div>\n`;
                html += `    </div>\n\n`;
            }
            const roomName = line.replace('@room', '').trim();
            html += `    <div class="room">\n        <h2>${escapeHtml(roomName)}</h2>\n`;
            currentRoom = roomName;
            currentSubsection = null;
        }
        
        else if (line.startsWith('@subsection')) {
            // Close previous subsection if exists
            if (currentSubsection) {
                html += `        </div>\n`;
            }
            const subsectionName = line.replace('@subsection', '').trim();
            html += `        <div class="subsection">\n            <h3>${escapeHtml(subsectionName)}</h3>\n`;
            currentSubsection = subsectionName;
        }
        
        else if (line.startsWith('@text')) {
            const text = line.replace('@text', '').trim();
            html += `            <div>\n                <span>${escapeHtml(text)}</span>\n            </div>\n`;
        }
        
        else if (line.startsWith('@tip')) {
            // Format: @tip:assassin This is the tip text
            const match = line.match(/@tip:(\w+)\s*(.*)/);
            if (match) {
                const tipClass = match[1].toLowerCase();
                const tipText = match[2];
                html += `            <div class="tip ${tipClass}">\n`;
                html += `                <div class="tip-content">\n`;
                html += `                    <span>${escapeHtml(tipText)}</span>\n`;
                html += `                </div>\n            </div>\n`;
            }
        }
    }
    
    // Close any open tags
    if (currentSubsection) {
        html += `        </div>\n`;
    }
    if (currentRoom) {
        html += `    </div>\n`;
    }
    
    html += `</div>\n`;
    return html;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}