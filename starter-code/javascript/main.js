// main.js


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
// main.js

// 4. INITIALIZATION
async function initApp() {
// 1. Check for shared note FIRST
    // If a share link exists, we might want to stop the normal app flow
    const isSharing = checkForSharedNote();
    if (isSharing) return;// Exit init if we are just viewing a shared note
    // 1. Get the data
    // 1. GATEKEEPER: Check if user is logged in before doing anything else
const user = localStorage.getItem('currentUser');
if (!user) {
window.location.href = './starter-code/auth/login.html'; // Adjust path if login.html is in a folder
return;
}
    allNotes = await storage.loadNotes();

    // 2. Clear any "phantom" empty tags immediately
    allNotes.forEach(note => {
        if (note.tags) {
            note.tags = note.tags.filter(tag => tag && tag.trim() !== "");
        }
    });
    storage.saveNotes(allNotes);

    // 3. POPULATE SIDEBAR TAGS
    refreshSidebar();

    // 4. DEFAULT VIEW: All Notes
    const activeNotes = allNotes.filter(n => !n.isArchived);
    ui.renderAllNotes(activeNotes, appState); 

    // 5. ATTACH EVENT LISTENERS
    setupNavigation();
    setupNoteActions();
    setupSearch(); 
    setupNoteSelection();
    setupTagFiltering();
    initSearchNavigation();
    initTagsNavigation()
    
    // 6. DEFAULT HEADER
    ui.updateHeader(appState);

    // --- 7. URL REDIRECT LOGIC ---
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    const tagParam = urlParams.get('tag'); // Catch the tag from settings-panel

    if (tagParam) {
        // A. Handle Tag Redirection
        appState.section = 'tag';
        ui.updateHeader(appState, tagParam);
        
        const taggedNotes = allNotes.filter(n => 
            n.tags.includes(tagParam) && !n.isArchived
        );
        ui.renderAllNotes(taggedNotes, appState);

        // Optional: Highlight the tag in the sidebar as 'active'
        const sidebarTag = document.querySelector(`.nav-item[data-tag="${tagParam}"]`);
        if (sidebarTag) sidebarTag.classList.add('active');

    } else if (view === 'archived') {
        // B. Handle Archived View Redirection
        appState.section = 'archived';
        ui.updateHeader(appState);
        
        const archivedNotes = allNotes.filter(n => n.isArchived === true);
        ui.renderAllNotes(archivedNotes, appState);
        
        // Optional: Highlight the archive button in sidebar
        const archiveNav = document.querySelector('.nav-item[data-view="archived"]');
        if (archiveNav) archiveNav.classList.add('active');
    }    // --- URL REDIRECT LOGIC ENDS HERE ---
}


// 5. SEARCH LOGIC
function setupSearch() {
    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            appState.searchQuery = e.target.value;
            
            // Determine the current tag context so the header knows 
            // what to show if the search query is cleared.
            const activeTag = document.querySelector('.nav-item.active')?.dataset.tag || "";
            
            // Refresh the header title
            ui.updateHeader(appState, activeTag); 

            // Filter base list by current section (All vs Archived)
            const currentViewNotes = allNotes.filter(n => 
                appState.section === 'archived' ? n.isArchived : !n.isArchived
            );

            // Apply search filtering
            const filtered = noteManager.searchNotes(currentViewNotes, appState.searchQuery);
            ui.renderAllNotes(filtered, appState);
        });
    }
}

// 6. NAVIGATION LOGIC
function setupNavigation() {
  // This selector catches both sidebar items and tablet bar buttons
  const navItems = document.querySelectorAll('.nav-item:not([data-tag]), .tablet-menu-bar button');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const view = e.currentTarget.dataset.view;
      
      // --- ACTIVE STATE LOGIC ---
      // Remove 'active' from all nav buttons and sidebar items
      navItems.forEach(nav => nav.classList.remove('active'));
      // Add 'active' to the one clicked
      e.currentTarget.classList.add('active');
      // --------------------------

      // Reset search and update section
      appState.section = view;
      appState.searchQuery = ""; 
      if (document.getElementById("searchInput")) {
          document.getElementById("searchInput").value = "";
      }

      // Update Header
      ui.updateHeader(appState); 

      const viewNotes = allNotes.filter(n => 
        view === 'archived' ? n.isArchived : !n.isArchived
      );

      ui.renderAllNotes(viewNotes, appState);
    });
  });
}
// NEW: Function to handle search navigation on tablet
function initSearchNavigation() {
    const searchBtn = document.getElementById('menu-create-note'); 
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.getElementById('searchInput');

    if (!searchBtn || !searchContainer) return;

    searchBtn.addEventListener('click', () => {
        appState.section = 'search';
        
        // Use the same class name you defined in ui.js
        searchContainer.classList.toggle('active-tablet-search');
        
        if (searchContainer.classList.contains('active-tablet-search')) {
            searchInput.focus();
            // Highlight tablet bar button
            document.querySelectorAll('.tablet-menu-bar button').forEach(b => b.classList.remove('active'));
            searchBtn.classList.add('active');
        } else {
            searchBtn.classList.remove('active');
            appState.section = 'all'; 
        }

        ui.updateHeader(appState);
    });
}

// NEW: Function to handle the Tags button on Tablet/Mobile
function initTagsNavigation() {
    const menuTagsBtn = document.getElementById('menu-tags');

    if (!menuTagsBtn) return;

    menuTagsBtn.addEventListener('click', () => {
        // 1. Set global state
        appState.section = 'tags-index';
        
        // 2. Update Header Title to "Tags"
        ui.updateHeader(appState);
        
        // 3. Get unique tags from allNotes (using your noteManager helper)
        const allTags = noteManager.getAllUniqueTags(allNotes);
        
        // 4. Render the tags list into the middle column
        ui.renderTagsList(allTags, (selectedTag) => {
            // Callback: Runs when a user clicks a tag in the list
            appState.section = 'tag';
            
            // Filter notes by the selected tag
            const filtered = allNotes.filter(n => n.tags.includes(selectedTag) && !n.isArchived);
            
            ui.updateHeader(appState, selectedTag);
            ui.renderAllNotes(filtered, appState);
        });

        // 5. Visual Feedback: Highlight tablet bar button
        document.querySelectorAll('.tablet-menu-bar button').forEach(b => b.classList.remove('active'));
        menuTagsBtn.classList.add('active');
    });
}

function refreshSidebar() {
  const uniqueTags = noteManager.getAllUniqueTags(allNotes);
  ui.renderSidebarTags(uniqueTags);
}

// 7. CREATE NOTE LOGIC
function setupNoteActions() {
  const createBtn = document.querySelector('.create-note-desktop');
  const createBtnMobile = document.querySelector('.create-note-mobile');

  const handleCreate = () => {
    const newNote = new Note("New Note Title", "", []);
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
    refreshSidebar();
    openNoteInEditor(newNote);
  };

  if (createBtn) createBtn.addEventListener('click', handleCreate);
  if (createBtnMobile) createBtnMobile.addEventListener('click', handleCreate);
}


// 8. NOTE SELECTION & EDITOR OPENING LOGIC
// We put this in a separate function so handleCreate can call it too!
// --- SECTION 8: NOTE SELECTION & EDITOR OPENING LOGIC ---

function openNoteInEditor(selectedNote) {
    if (!selectedNote) return;

    // Detect screen size (Desktop is usually >= 1024px)
    const isTabletOrMobile = window.innerWidth < 1024;

    if (isTabletOrMobile) {
        // --- TABLET/MOBILE LOGIC ---
        document.body.classList.add('show-editor');
        
        // Note: Uses the object-based (actions) parameter
        ui.renderTabletNoteEditor(selectedNote, {
            onBack: () => {
                document.body.classList.remove('show-editor');
                ui.clearEditor();
            },
            onSave: (updatedData) => {
                saveNoteData(selectedNote, updatedData);
                document.body.classList.remove('show-editor');
                ui.renderAllNotes(getFilteredNotes(), appState);
                refreshSidebar();
            },
            onDelete: () => {
                if (confirm("Delete this note?")) {
                    deleteNoteData(selectedNote);
                    document.body.classList.remove('show-editor');
                    ui.renderAllNotes(getFilteredNotes(), appState);
                }
            },
            onArchive: () => {
                archiveNoteData(selectedNote);
                document.body.classList.remove('show-editor');
                ui.renderAllNotes(getFilteredNotes(), appState);
            }
        });

    } else {
        // --- DESKTOP LOGIC ---
        ui.renderNoteEditor(
            selectedNote,
            // ON SAVE
            (updatedData) => {
                saveNoteData(selectedNote, updatedData);
                ui.renderAllNotes(getFilteredNotes(), appState);
                refreshSidebar();
                alert("Note saved!");
            },
            // ON CANCEL
            () => {
                ui.clearEditor();
                ui.clearRightMenu();
            }
        );

        ui.renderNoteActions(
            selectedNote,
            () => { archiveNoteData(selectedNote); ui.clearEditor(); ui.clearRightMenu(); ui.renderAllNotes(getFilteredNotes(), appState); },
            () => { 
                if (confirm("Delete this note?")) { 
                    deleteNoteData(selectedNote); 
                    ui.clearEditor(); 
                    ui.clearRightMenu(); 
                    ui.renderAllNotes(getFilteredNotes(), appState);
                } 
            }
        );
    }
}

// HELPER FUNCTIONS to avoid repeating code inside the toggle
function saveNoteData(note, data) {
    note.title = data.title;
    note.content = data.content;
    note.tags = data.tags;
    note.lastEdited = new Date().toISOString();
    storage.saveNotes(allNotes);
}

function deleteNoteData(note) {
    allNotes = allNotes.filter(n => n.id !== note.id);
    storage.saveNotes(allNotes);
}

function archiveNoteData(note) {
    note.isArchived = !note.isArchived;
    storage.saveNotes(allNotes);
    refreshSidebar();
}

function getFilteredNotes() {
    return allNotes.filter(n => appState.section === 'archived' ? n.isArchived : !n.isArchived);
}// main.js

function setupTagFiltering() {
    const sidebar = document.querySelector('.tags-section');
    if (!sidebar) return;

    sidebar.addEventListener('click', (e) => {
        const tagItem = e.target.closest('.nav-item');
        if (!tagItem) return;

        // 1. VISUAL FEEDBACK: Manage active state
        // Remove .active from all sidebar items, then add it to the clicked one
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        tagItem.classList.add('active');

        const tag = tagItem.dataset.tag;
        
        // 2. Update State
        appState.section = 'tag';
        appState.searchQuery = ""; 
        if (document.getElementById("searchInput")) {
            document.getElementById("searchInput").value = "";
        }

        // 3. Update the Dynamic Header
        ui.updateHeader(appState, tag); 

        // 4. Filter and Render
        const taggedNotes = allNotes.filter(n => 
            n.tags.includes(tag) && !n.isArchived
        );
        
        ui.renderAllNotes(taggedNotes, appState);
    });
}
function setupNoteSelection() {
  const notesList = document.querySelector(".notes-list");
  notesList.addEventListener('click', (e) => {
    const noteItem = e.target.closest('.note-item');
    if (!noteItem) return;

    const noteId = noteItem.dataset.id;
    const selectedNote = allNotes.find(n => n.id === noteId);
    openNoteInEditor(selectedNote); // Use the helper function here
  });
}
// 9. START THE APP
initApp();
function checkForSharedNote() {
    const urlParams = new URLSearchParams(window.location.search);
    const shareData = urlParams.get('share');

    if (shareData) {
        try {
            const decoded = JSON.parse(decodeURIComponent(atob(shareData)));
            
            // 1. Visual changes for "Read Only"
            document.body.classList.add('read-only-mode');
            
            // 2. Hide standard UI elements that shouldn't be there for a guest
            const sidebar = document.querySelector('.sidebar-nav');
            const searchBar = document.querySelector('.search-container');
            if (sidebar) sidebar.style.display = 'none';
            if (searchBar) searchBar.style.display = 'none';

            // 3. Render the content into the main area
            // Note: Ensure these IDs exist in your index.html or use ui.js to render a special view
            const contentArea = document.querySelector(".content");
            contentArea.innerHTML = `
                <div class="shared-note-view">
                    <h1>${decoded.t}</h1>
                    <hr />
                    <div class="note-content">${decoded.c}</div>
                    <div class="shared-footer">
                        <a href="index.html" class="btn-primary">Create Your Own Notes</a>
                    </div>
                </div>
            `;
            
            return true; // Signal that we are in sharing mode
        } catch (e) {
            console.error("Link invalid or corrupted", e);
            return false;
        }
    }
    return false;
}