// themes.js

// 1. APPLY THEME
export function applyTheme(theme) {
    const body = document.body;
    body.classList.remove('light-theme', 'dark-theme', 'windows-theme');

    if (theme === 'system') {
        localStorage.removeItem('selectedTheme');
    } else {
        body.classList.add(`${theme}-theme`);
        localStorage.setItem('selectedTheme', theme);
    }
}

// 2. APPLY FONT
export function applyFont(fontFamily) {
    let fontValue = '"Inter", sans-serif'; 
    if (fontFamily === 'serif') {
        fontValue = '"Noto Serif", serif';
    } else if (fontFamily === 'monospace') {
        fontValue = '"Source Code Pro", monospace';
    }
    document.documentElement.style.setProperty('--app-font', fontValue);
    localStorage.setItem('selectedFont', fontFamily);
}

// 3. LOAD SAVED SETTINGS
export function loadSavedSettings() {
    const savedTheme = localStorage.getItem('selectedTheme');
    const savedFont = localStorage.getItem('selectedFont');
    if (savedTheme) applyTheme(savedTheme);
    if (savedFont) applyFont(savedFont);
}