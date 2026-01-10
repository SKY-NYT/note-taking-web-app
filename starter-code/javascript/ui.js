// ui.js

// 1. Helper to clear areas before re-rendering
const clearUI = () => {
    document.querySelector(".content").innerHTML = "";
    document.querySelector(".right-menu").innerHTML = "";
    document.querySelector(".notes-list").innerHTML = "";
};

// 2. Exported function to show/hide the archive info
export const toggleArchiveView = (isArchived) => {
    const headerTitle = document.querySelector(".header h1");
    const archiveInfo = document.querySelector(".archived-info");
    const createBtn = document.querySelector(".create-note-desktop");

    headerTitle.textContent = isArchived ? "Archived Notes" : "All Notes";
    if (isArchived) {
        archiveInfo.classList.remove("hidden");
        createBtn.classList.add("hidden");
    } else {
        archiveInfo.classList.add("hidden");
        createBtn.classList.remove("hidden");
    }
};

// 3. UPDATED: Render the actual list with Search Feedback
export const renderAllNotes = (notes, state) => {
    const notesList = document.querySelector(".notes-list");
    const emptyState = document.querySelector(".empty-state");
    const emptyText = emptyState.querySelector(".empty-text");

    if (notes.length === 0) {
        notesList.classList.add("hidden");
        emptyState.classList.remove("hidden");
        
        // Improved logic: specific text for search results
        if (state.searchQuery) {
            emptyText.textContent = `No notes match "${state.searchQuery}".`;
        } else {
            emptyText.textContent = "You don’t have any notes yet.";
        }
    } else {
        emptyState.classList.add("hidden");
        notesList.classList.remove("hidden");
        notesList.innerHTML = notes.map(note => renderNoteTemplate(note)).join("");
    }
};

// 4. Internal template helper (used by renderAllNotes)
const renderNoteTemplate = (note) => {
    return `
        <div class="note-item" data-id="${note.id}">
            <h4>${note.title}</h4>
            <div class="note-tags-wrapper">
                ${note.tags.map(t => `<span class="note-tag">${t}</span>`).join("")}
            </div>
            <small class="note-date">${new Date(note.lastEdited).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })}</small>
        </div>
        <hr class="divider" />
    `;
};