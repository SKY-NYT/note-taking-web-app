// main.js

// 1. GATEKEEPER: Check if user is logged in before doing anything else
const user = localStorage.getItem('currentUser');
if (!user) {
window.location.href = './starter-code/auth/login.html'; // Adjust path if login.html is in a folder
}
// 1. IMPORTS
import * as storage from './storage.js';
import * as ui from './ui.js';
import * as noteManager from './noteManager.js'; 
import * as themes from './themes.js'; // Ensure this is imported
import { Note } from './noteManager.js';

// 2. IMMEDIATE THEME LOAD
// This applies the saved font/theme from localStorage before the app renders
themes.loadSavedSettings(); 

// 3. APP STATE
let allNotes = [];

const appState = {
  section: 'all', 
  searchQuery: ''
};

// 4. INITIALIZATION
async function initApp() {
  allNotes = await storage.loadNotes();
  
  const activeNotes = allNotes.filter(n => !n.isArchived);
  ui.renderAllNotes(activeNotes, appState); 
  
  setupNavigation();
  setupNoteActions();
  setupSearch(); 
}

// 5. SEARCH LOGIC
function setupSearch() {
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      appState.searchQuery = e.target.value;
      
      const currentViewNotes = allNotes.filter(n => 
        appState.section === 'archived' ? n.isArchived : !n.isArchived
      );

      const filtered = noteManager.searchNotes(currentViewNotes, appState.searchQuery);
      ui.renderAllNotes(filtered, appState);
    });
  }
}

// 6. NAVIGATION LOGIC
// 6. NAVIGATION LOGIC
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item, .tablet-menu-bar button');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const view = e.currentTarget.dataset.view;
      appState.section = view; 

      // --- THE NEW LOGIC STARTS HERE ---
      // 1. First, filter by the section (All vs Archived)
      const viewNotes = allNotes.filter(n => 
        view === 'archived' ? n.isArchived : !n.isArchived
      );

      // 2. Then, apply the current search query to that section
      const filtered = noteManager.searchNotes(viewNotes, appState.searchQuery);
      
      // 3. Update the UI headers
      ui.toggleArchiveView(view === 'archived');
      
      // 4. Render the results
      ui.renderAllNotes(filtered, appState);
      // --- THE NEW LOGIC ENDS HERE ---
    });
  });
}

// 7. CREATE NOTE LOGIC
// 7. CREATE NOTE LOGIC
// 7. CREATE NOTE LOGIC
function setupNoteActions() {
  const createBtn = document.querySelector('.create-note-desktop');
  const createBtnMobile = document.querySelector('.create-note-mobile');

  const handleCreate = () => {
    const newNote = new Note("", "", []);
    allNotes.unshift(newNote); 
    storage.saveNotes(allNotes);

    // --- ADD THESE TWO LINES HERE ---
    // This clears the search UI and the state so the new note is visible
    if (document.getElementById("searchInput")) document.getElementById("searchInput").value = "";
    appState.searchQuery = "";
    // --------------------------------

    // Now filter and render (searchQuery is now empty, so all notes in this section show)
    const currentView = allNotes.filter(n => 
      appState.section === 'archived' ? n.isArchived : !n.isArchived
    );
    const filtered = noteManager.searchNotes(currentView, appState.searchQuery);
    
    ui.renderAllNotes(filtered, appState);
  };

  if (createBtn) createBtn.addEventListener('click', handleCreate);
  if (createBtnMobile) createBtnMobile.addEventListener('click', handleCreate);
}
// 8. START THE APP
initApp();