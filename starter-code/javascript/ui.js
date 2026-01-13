// ui.js
import { exportNotesToJSON, validateAndImportNotes } from './storage.js';

// 1. HELPER: Clear areas before re-rendering
export const clearUI = () => {
    document.querySelector(".content").innerHTML = "";
    document.querySelector(".right-menu").innerHTML = "";
    document.querySelector(".notes-list").innerHTML = "";
};
// 2. HEADER: Updates title and element visibility based on current section & search
export const updateHeader = (state, tagName = "") => {
    const header = document.querySelector(".header");
    const headerTitle = header.querySelector("h1");
    const searchContainer = document.querySelector(".search-container"); 
    const archivedInfo = document.querySelector(".archived-info");
    const tagInfo = document.querySelector(".tag-info");
    const createBtn = document.querySelector(".create-note-desktop");

    // --- NEW TABLET VISIBILITY LOGIC ---
    // 1. Reset visibility so it reappears when we leave the editor
    header.style.display = "flex"; 

    // 2. If we are in the editor on tablet/mobile, hide this header entirely
    if (document.body.classList.contains('show-editor')) {
        header.style.display = "none";
        return; // Stop here; no need to update text if header is hidden
    }
    // ------------------------------------

    // 1. Reset everything to default state
    header.classList.remove("is-searching");
    searchContainer?.classList.remove("active-tablet-search");
    archivedInfo?.classList.add("hidden");
    tagInfo?.classList.add("hidden");
    createBtn?.classList.remove("hidden");

    // 2A. NEW: TAGS INDEX VIEW (Tablet/Mobile Tag List)
    if (state.section === 'tags-index') {
        headerTitle.textContent = "Tags";
        return;
    }

    // ... rest of your existing logic (Section 2B, 3, 4) ...


    // 2B. TABLET SEARCH NAVIGATION LOGIC
    if (state.section === 'search') {
        headerTitle.textContent = "Search";
        header.classList.add("is-searching"); 
        searchContainer?.classList.add("active-tablet-search");
        return; 
    }

    // 3. PRIORITY: Results Title (If user is currently typing)
    if (state.searchQuery && state.searchQuery.trim() !== "") {
        headerTitle.textContent = `Showing results for: "${state.searchQuery}"`;
        return; 
    }

    // 4. FALLBACK: Standard Section Titles
    if (state.section === 'archived') {
        headerTitle.textContent = "Archived Notes";
        archivedInfo?.classList.remove("hidden");
        
    } 
    else if (state.section === 'tag') {
        headerTitle.textContent = tagName ? `Notes Tagged: ${tagName}` : "Tagged Notes";
        if (tagInfo) {
            tagInfo.textContent = `All notes with the tag "${tagName}"`;
            tagInfo.classList.remove("hidden");
        }
    } 
    else {
        headerTitle.textContent = "All Notes";
    }
};
// 3. NOTE LIST: Renders the middle column list of notes
export const renderAllNotes = (notes, state) => {
    const notesList = document.querySelector(".notes-list");
    const emptyState = document.querySelector(".empty-state");
    const emptyText = emptyState.querySelector(".empty-text");
    
    // Always clear the current list first to prevent duplicates
    notesList.innerHTML = "";

    // CONDITION A: No notes found (Search failed or list is empty)
    if (!notes || notes.length === 0) {
        notesList.classList.add("hidden");     // Hide the list container
        emptyState.classList.remove("hidden"); // Show the empty state message
        
        // Context-aware messaging
        if (state.searchQuery) {
            emptyText.textContent = `No notes match "${state.searchQuery}".`;
        } else if (state.section === 'archived') {
            emptyText.textContent = "No notes have been archived yet.";
        } else {
            emptyText.textContent = "You don’t have any notes yet. Start a new note to capture your thoughts.";
        }
    } 
    // CONDITION B: Notes exist
    else {
        notesList.classList.remove("hidden"); // Show the list
        emptyState.classList.add("hidden");    // HIDE the empty state message
        
        // Generate and inject HTML using the template helper in Section 7
        const html = notes.map(note => renderNoteTemplate(note)).join("");
        notesList.innerHTML = html;
    }
};

// ... (Section 3: renderAllNotes is above here)

// 3.5 TAG LIST: Renders the tags index for Tablet/Mobile navigation
export const renderTagsList = (tags, onTagClick) => {
    const notesList = document.querySelector(".notes-list");
    const emptyState = document.querySelector(".empty-state");
    
    // Safety check
    if (!notesList) return;

    // 1. Reset the container
    notesList.innerHTML = ""; 
    emptyState?.classList.add("hidden");
    notesList.classList.remove("hidden");

    // 2. Handle empty tags case
    if (tags.length === 0) {
        notesList.innerHTML = `<p class="empty-text">No tags found.</p>`;
        return;
    }

    // 3. Build the tag rows
    const tagsHtml = tags.map(tag => `
        <div class="tag-item-row" data-tag="${tag}">
            <div class="tag-label">
                <svg class="icon"><use href="#icon-tag"></use></svg>
                <span>${tag}</span>
            </div>
            <svg class="icon"><use href="#icon-"></use></svg>
        </div>
        <hr class="meta-divider" />
    `).join("");

    notesList.innerHTML = tagsHtml;

    // 4. Attach click listeners to each row
    notesList.querySelectorAll(".tag-item-row").forEach(row => {
        row.addEventListener("click", () => {
            onTagClick(row.getAttribute("data-tag"));
        });
    });
};

// ... (Section 4: EDITOR follows here)

// 4. EDITOR: Renders the center column editing area
export const clearEditor = () => {
    const contentArea = document.querySelector(".content");
    contentArea.innerHTML = `<div class="empty-editor-state"></div>`;
    clearRightMenu();
};

export const renderNoteEditor = (note, onSave, onCancel) => {
    const contentArea = document.querySelector(".content");
    
    contentArea.innerHTML = `
        <div class="editor-header">
            <input type="text" id="edit-title" value="${note.title}" placeholder="Note Title">
            <div class="editor-meta">
                <div class="meta-row">
                    <svg class="aicon"><use href="#icon-tag"></use></svg>
                    <span>Tags:</span>
                    <input type="text" id="edit-tags" value="${note.tags.join(', ')}" placeholder="Add tags separated by commas">
                </div>
                <div class="meta-row">
                    <svg class="aicon"><use href="#icon-clock"></use></svg>
                    <span>Last Edited:</span>
                    <span class="read-only-date">${new Date(note.lastEdited).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
        <hr class="meta-divider" /><div class="toolbar">
            <button type="button" class="tool-btn" data-command="bold"><b>B</b></button>
            <button type="button" class="tool-btn" data-command="italic"><i>I</i></button>
            <button type="button" class="tool-btn" data-command="insertUnorderedList">• List</button>
        </div>

        <div id="edit-content" contenteditable="true" class="rich-editor">${note.content}</div><hr class="meta-divider" />
        <div class="editor-footer">
            <button class="btn-save">Save Note</button>
            <button class="btn-cancel">Cancel</button>
        </div>
    `;
    // TOOLBAR LOGIC
    contentArea.querySelectorAll(".tool-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const command = btn.getAttribute("data-command");
            document.execCommand(command, false, null);
            document.getElementById("edit-content").focus();
        });
    });

    contentArea.querySelector(".btn-save").addEventListener("click", () => {
        const title = document.getElementById("edit-title").value;
        const content = document.getElementById("edit-content").value;
        const tags = document.getElementById("edit-tags").value
            .split(",")
            .map(t => t.trim())
            .filter(t => t !== "");

        onSave({ title, content, tags });
    });

    contentArea.querySelector(".btn-cancel").addEventListener("click", onCancel);
};
// 4B. Tablet/Mobile version
export const renderTabletNoteEditor = (note, actions) => {
    const contentArea = document.querySelector(".content");
    const archiveIcon = note.isArchived ? "icon-restore.svg" : "icon-archive.svg";
    
    contentArea.innerHTML = `
        <div class="tablet-editor-toolbar">
            <button class="btn-back-to-list">
                <svg class="icon"><use href="#icon-arrow-left"></use></svg>
                <span>Go back</span>
            </button>

            <div class="toolbar-actions">
                <button class="action-icon-btn delete-note">
                    <svg class="icon"><use href="#icon-delete"></use></svg>
                </button>
                <button class="action-icon-btn archive-note">
                    <img src="./starter-code/assets/images/${archiveIcon}" class="icon">
                </button>
                <div class="divider-v"></div>
                <button class="btn-cancel">Cancel</button>
                <button class="btn-save">Save</button>
            </div>
        </div>

        <div class="editor-body-wrapper">
            <input type="text" id="edit-title" value="${note.title}" placeholder="Note Title">
            <div class="meta-row">
                 <svg class="aicon"><use href="#icon-tag"></use></svg>
                 <input type="text" id="edit-tags" value="${note.tags.join(', ')}" placeholder="Add tags...">
            </div>
            <hr class="meta-divider" />
            <textarea id="edit-content" placeholder="Start typing...">${note.content}</textarea>
        </div>
    `;

    // Listeners
    contentArea.querySelector(".btn-back-to-list").addEventListener("click", actions.onBack);
    contentArea.querySelector(".delete-note").addEventListener("click", actions.onDelete);
    contentArea.querySelector(".archive-note").addEventListener("click", actions.onArchive);
    contentArea.querySelector(".btn-cancel").addEventListener("click", actions.onBack);
    contentArea.querySelector(".btn-save").addEventListener("click", () => {
        const updated = {
            title: document.getElementById("edit-title").value,
            content: document.getElementById("edit-content").value,
            tags: document.getElementById("edit-tags").value.split(',').map(t => t.trim()).filter(t => t)
        };
        actions.onSave(updated);
    });
};

// 5. SIDEBAR: Renders tags (Updated for multi-page support)
export const renderSidebarTags = (tags) => {
    const tagsSection = document.querySelector(".tags-section");
    if (!tagsSection) return;

    // Check if we are currently in the settings page to adjust the link path
    const isSettingsPage = window.location.pathname.includes('settings.html');
    const basePath = isSettingsPage ? "../index.html" : "./index.html";

    tagsSection.innerHTML = `
        <p class="section-title">Tags</p>
        ${tags.map(tag => `
            <div class="nav-item" data-view="tag" data-tag="${tag}">
                <a href="${basePath}?tag=${encodeURIComponent(tag)}" class="nav-link-wrapper" style="text-decoration: none; color: inherit; display: flex; align-items: center; width: 100%;">
                    <svg class="icon"><use href="#icon-tag"></use></svg>
                    <span>${tag}</span>
                </a>
            </div>
        `).join('')}
    `;
};

// 6. ACTIONS: Archive/Delete
export const clearRightMenu = () => {
    const rightMenu = document.querySelector(".right-menu");
    if (rightMenu) rightMenu.innerHTML = "";
};

export const renderNoteActions = (note, onArchive, onDelete) => {
    const rightMenu = document.querySelector(".right-menu");
    const archiveText = note.isArchived ? "Restore Note" : "Archive Note";
    const archiveIcon = note.isArchived ? "icon-restore.svg" : "icon-archive.svg";

    rightMenu.innerHTML = `
        <div class="actions-column">
            <button class="action-btn archive-btn" title="${archiveText}">
                <img src="./starter-code/assets/images/${archiveIcon}" alt="">
                <span>${archiveText}</span>
            </button>
            <button class="action-btn delete-btn" title="Delete Note">
                <svg class="icon"><use href="#icon-delete"></use></svg>
                <span>Delete Note</span>
            </button>
        </div>
    `;

    rightMenu.querySelector(".archive-btn").addEventListener("click", onArchive);
    rightMenu.querySelector(".delete-btn").addEventListener("click", onDelete);
};

// 7. TEMPLATE
const renderNoteTemplate = (note) => {
    return `
        <div class="note-item" data-id="${note.id}">
            <h4>${note.title || "Untitled Note"}</h4>
            <div class="note-tags-wrapper">
                ${note.tags.map(t => `<span class="note-tag">${t}</span>`).join("")}
            </div>
            <small class="note-date">${new Date(note.lastEdited).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            })}</small>
        </div>
        <hr class="meta-divider" />
    `;
};
// 8. DATA MANAGEMENT: Export/Import functionality
export const setupExportImportListeners = (noteManager) => {
    const exportBtn = document.getElementById('export-notes-btn');
    const importInput = document.getElementById('import-notes-input');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            // Note: In your main.js we passed a bridge object, so we access .notes
            const allNotes = noteManager.notes; 
            exportNotesToJSON(allNotes);
        });
    }

    if (importInput) {
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const imported = validateAndImportNotes(event.target.result);
                if (imported) {
                    if (confirm("Import these notes? Existing notes will be kept.")) {
                        // Merge notes
                        const combinedNotes = [...noteManager.notes, ...imported];
                        
                        // Update the bridge object (which updates allNotes in main.js)
                        noteManager.notes = combinedNotes;
                        
                        // Save and Refresh
                        
                        saveNotes(combinedNotes);
                        window.location.reload(); 
                    }
                } else {
                    alert("Invalid JSON file.");
                }
            };
            reader.readAsText(file);
        });
    }
};