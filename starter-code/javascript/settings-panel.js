import * as themes from './themes.js';


// --- THE GATEKEEPER (Top of file) ---
if (!localStorage.getItem('currentUser')) {
    window.location.href = '/starter-code/auth/login.html';
}
// --- INITIALIZE ---
// Apply saved settings immediately so the page doesn't "flicker"
themes.loadSavedSettings();

// --- PANEL TOGGLE LOGIC ---
const sidebarItems = document.querySelectorAll(".settings-item");
const panels = document.querySelectorAll(".settings-content");

function hideAllPanels() {
  panels.forEach(panel => (panel.style.display = "none"));
  sidebarItems.forEach(item => item.classList.remove("active"));
}

function showPanel(panelId) {
  hideAllPanels();
  const panel = document.getElementById(panelId);
  if (panel) {
    panel.style.display = "block";
    // Highlight the clicked sidebar item
    const sidebarItem = document.getElementById(panelId.replace("-content", ""));
    if (sidebarItem) sidebarItem.classList.add("active");
  }
  localStorage.setItem("lastSettingsPanel", panelId);
}

sidebarItems.forEach(item => {
  item.addEventListener("click", () => {
    showPanel(`${item.id}-content`);
  });
});

// Load the last panel used or default
const lastPanel = localStorage.getItem("lastSettingsPanel") || "color-theme-content";
showPanel(lastPanel);

// --- APPLY BUTTONS ---
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


// --- PASSWORD CHANGE LOGIC ---
const savePasswordBtn = document.querySelector('#change-password-content button');
const oldPassInput = document.getElementById('old-password');
const newPassInput = document.getElementById('new-password');
const confirmPassInput = document.getElementById('confirm-password');

savePasswordBtn?.addEventListener('click', () => {
  const oldPass = oldPassInput.value;
  const newPass = newPassInput.value;
  const confirmPass = confirmPassInput.value;

  // 1. Basic Validation
  if (!oldPass || !newPass || !confirmPass) {
    alert("Please fill in all password fields.");
    return;
  }

  // 2. Length Check (At least 8 characters)
  if (newPass.length < 8) {
    alert("New password must be at least 8 characters long.");
    return;
  }

  // 3. Match Check
  if (newPass !== confirmPass) {
    alert("New passwords do not match!");
    return;
  }

  // 4. "Saving" logic (Simulated)
  // In a real app, you'd send this to a server via fetch()
  localStorage.setItem('userPassword', newPass); 
  
  alert("Password updated successfully!");

  // Clear fields after success
  oldPassInput.value = "";
  newPassInput.value = "";
  confirmPassInput.value = "";
});
document.querySelectorAll('.toggle-password').forEach(eye => {
  eye.addEventListener('click', () => {
    // Find the input within the same wrapper
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

// --- LOGOUT LOGIC (Bottom of file) ---
const logoutBtn = document.getElementById('logout');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = '/starter-code/auth/login.html'; 
    });
}