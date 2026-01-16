import * as themes from './themes.js';
import * as storage from './storage.js';
import * as noteManager from './noteManager.js';
import * as ui from './ui.js';

// 1. --- THE GATEKEEPER ---
if (!localStorage.getItem('currentUser')) {
    window.location.href = '/starter-code/auth/login.html';
}

// 2. --- INITIALIZATION ---
async function initSettingsPage() {
    // Apply saved theme/font immediately
    themes.loadSavedSettings();

    // Load the notes and populate the sidebar tags
    const allNotes = await storage.loadNotes();
    const uniqueTags = noteManager.getAllUniqueTags(allNotes);
    ui.renderSidebarTags(uniqueTags);
    
    // Set up tag click listeners for redirection
    setupSettingsTagLinks();

    // UPDATED: Only auto-load panel on Desktop. 
    // On Tablet, we want to see the menu list first.
    if (window.innerWidth > 1024) {
        const lastPanel = localStorage.getItem("lastSettingsPanel") || "color-theme-content";
        showPanel(lastPanel);
    } else {
        hideAllPanels(); // Ensures menu is visible on tablet load
    }
}

// 3. --- PANEL TOGGLE LOGIC ---
const sidebarItems = document.querySelectorAll(".settings-item");
const panels = document.querySelectorAll(".settings-content");
// UPDATED: Added selector for back buttons
const backButtons = document.querySelectorAll('.back-to-menu, .back-btn');

function hideAllPanels() {
    panels.forEach(panel => (panel.style.display = "none"));
    sidebarItems.forEach(item => item.classList.remove("active"));
    // UPDATED: Remove class that hides the menu on tablet
    document.body.classList.remove('setting-selected');
}

function showPanel(panelId) {
    hideAllPanels();
    const panel = document.getElementById(panelId);
    if (panel) {
        // UPDATED: Add class to trigger CSS replacement for tablet
        document.body.classList.add('setting-selected');
        panel.style.display = "block";
        
        const sidebarItem = document.getElementById(panelId.replace("-content", ""));
        if (sidebarItem) sidebarItem.classList.add("active");
    }
    localStorage.setItem("lastSettingsPanel", panelId);
}

// UPDATED: Back button logic to return to menu list on tablet
backButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
            hideAllPanels(); // This removes 'setting-selected' and hides panels
        }
    });
});
// // 4. --- NAVIGATION & TAG LOGIC ---
function setupSettingsTagLinks() {
    const tagSection = document.querySelector('.tags-section');
    if (!tagSection) return;

    tagSection.addEventListener('click', (e) => {
        const tagItem = e.target.closest('.nav-item');
        if (tagItem) {
            const tag = tagItem.dataset.tag;
            window.location.href = `../index.html?tag=${encodeURIComponent(tag)}`;
        }
    });
}


// Attach click listeners to sidebar buttons
sidebarItems.forEach(item => {
    item.addEventListener("click", () => {
        showPanel(`${item.id}-content`);
    });
});

// 5. --- APPLY BUTTONS ---
document.querySelector('.apply-color')?.addEventListener('click', () => {
    const selected = document.querySelector('input[name="color"]:checked');
    if (selected) {
        themes.applyTheme(selected.value);
        alert("Theme updated!");
    }
});

document.querySelector('.apply-font')?.addEventListener('click', () => {
    const selected = document.querySelector('input[name="font"]:checked');
    if (selected) {
        themes.applyFont(selected.value);
        alert("Font updated!");
    }
});

// 6. --- PASSWORD CHANGE LOGIC ---
const savePasswordBtn = document.querySelector('.save-password-btn');
const oldPassInput = document.getElementById('old-password');
const newPassInput = document.getElementById('new-password');
const confirmPassInput = document.getElementById('confirm-password');

savePasswordBtn?.addEventListener('click', () => {
    const oldPass = oldPassInput.value;
    const newPass = newPassInput.value;
    const confirmPass = confirmPassInput.value;

    if (!oldPass || !newPass || !confirmPass) {
        alert("Please fill in all password fields.");
        return;
    }

    if (newPass.length < 8) {
        alert("New password must be at least 8 characters long.");
        return;
    }

    if (newPass !== confirmPass) {
        alert("New passwords do not match!");
        return;
    }

    localStorage.setItem('userPassword', newPass); 
    alert("Password updated successfully!");

    oldPassInput.value = "";
    newPassInput.value = "";
    confirmPassInput.value = "";
});

// Eye-icon toggle for password visibility
document.querySelectorAll('.toggle-password').forEach(eye => {
    eye.addEventListener('click', () => {
        const input = eye.parentElement.querySelector('input');
        const iconUse = eye.querySelector('use');
        
        if (input.type === "password") {
            input.type = "text";
            iconUse.setAttribute('href', '#icon-show-password');
        } else {
            input.type = "password";
            iconUse.setAttribute('href', '#icon-eye-hidden');
        }
    });
});
// ... existing code (Sections 1 through 6) ...

// 7. --- DATA MANAGEMENT (EXPORT/IMPORT) ---
const exportBtn = document.getElementById('export-notes-btn');
const importTrigger = document.getElementById('import-notes-trigger');
const importInput = document.getElementById('import-notes-input');

// EXPORT LOGIC
exportBtn?.addEventListener('click', async () => {
    // Uses the imported storage module to get notes
    const allNotes = await storage.loadNotes();
    
    if (allNotes.length === 0) {
        alert("You have no notes to export.");
        return;
    }

    // Generate JSON file
    const dataStr = JSON.stringify(allNotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and click it to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `notes-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

// IMPORT LOGIC
importTrigger?.addEventListener('click', () => importInput.click());

importInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const importedNotes = JSON.parse(event.target.result);
            
            if (!Array.isArray(importedNotes)) throw new Error("Invalid format");

            if (confirm(`Are you sure? This will add ${importedNotes.length} notes to your collection.`)) {
                const currentNotes = await storage.loadNotes();
                const mergedNotes = [...currentNotes, ...importedNotes];
                
                // Save to localStorage and refresh page
                localStorage.setItem('notes', JSON.stringify(mergedNotes));
                alert("Notes imported successfully!");
                window.location.reload(); 
            }
        } catch (err) {
            alert("Error importing file. Please ensure it is a valid JSON notes backup.");
        }
    };
    reader.readAsText(file);
});

// 8. --- LOGOUT LOGIC ---
const logoutBtn = document.getElementById('logout');
// ... rest of your logout code ...

// 9. --- START THE APP ---
initSettingsPage();