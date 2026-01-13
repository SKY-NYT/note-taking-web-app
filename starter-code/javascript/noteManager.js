// noteManager.js

export class Note {
  constructor(title = "", content = "", tags = []) {
    // Better than Date.now() for preventing duplicates
    this.id = crypto.randomUUID(); 
    this.title = title;
    this.content = content;
    this.tags = tags;
    this.isArchived = false;
    this.lastEdited = new Date().toISOString();
  }

  toggleArchive() {
    this.isArchived = !this.isArchived;
    this.lastEdited = new Date().toISOString();
  }

  update(title, content, tags) {
    this.title = title;
    this.content = content;
    this.tags = tags;
    this.lastEdited = new Date().toISOString();
  }
}

// --- ADD THE MANAGER CLASS HERE ---
export class NoteManager {
  constructor() {
    // Load notes from local storage or start with an empty array
    const savedNotes = localStorage.getItem('notes');
    this.notes = savedNotes ? JSON.parse(savedNotes) : [];
  }

  // This is the function you were asking about
  addNote(noteData) {
    const newNote = {
      id: crypto.randomUUID(), // Using the better ID method from your Note class
      title: noteData.title || 'Untitled',
      content: noteData.content || '',
      tags: noteData.tags || [], // Changed 'category' to 'tags' to match your Note class
      lastEdited: new Date().toISOString(),
      isArchived: false
    };

    this.notes.push(newNote);
    this.saveToStorage();
    return newNote;
  }

  getNotesByTag(tag) {
    if (tag === 'All') return this.notes;
    // Since tags is an array, we use .includes()
    return this.notes.filter(note => note.tags.includes(tag));
  }

  getUniqueTags() {
    // This looks through every note and collects all unique tags
    const allTags = this.notes.flatMap(note => note.tags || []);
    return ['All', ...new Set(allTags)];
  }

  // --- END OF NEW METHODS ---
  saveToStorage() {
    localStorage.setItem('notes', JSON.stringify(this.notes));
  }
}
// --- HELPER FUNCTIONS ---
export const generateShareLink = (note) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const payload = {
        t: note.title,
        c: note.content
    };
    // Encode to Base64 to keep the URL clean
    const encodedData = btoa(encodeURIComponent(JSON.stringify(payload)));
    return `${baseUrl}?share=${encodedData}`;
};

export const getFilteredNotes = (notes, view, activeTag = null) => {
  if (view === 'archived') {
    return notes.filter(n => n.isArchived);
  }
  if (view === 'tag' && activeTag) {
    return notes.filter(n => n.tags.includes(activeTag) && !n.isArchived);
  }
  return notes.filter(n => !n.isArchived);
};

export const getAllUniqueTags = (notes) => {
  // Flatmap combines all tag arrays and then Set removes duplicates
  const tags = notes.flatMap(note => note.tags || []); 
  return [...new Set(tags)];
};

export const searchNotes = (notes, query) => {
  const q = query.toLowerCase().trim();
  if (!q) return notes; 

  return notes.filter(note => {
    // Adding || "" prevents errors if title or content are missing
    const titleMatch = (note.title || "").toLowerCase().includes(q);
    const contentMatch = (note.content || "").toLowerCase().includes(q);
    const tagMatch = note.tags?.some(tag => tag.toLowerCase().includes(q));
    
    return titleMatch || contentMatch || tagMatch;
  });
};

// ... existing searchNotes function ...

// --- UI RENDERING HELPERS ---

export const renderSidebarCategories = (noteManager) => {
    const tagsSection = document.querySelector('.tags-section');
    if (!tagsSection) return; // Safety check

    // We use getUniqueTags() because that is what is inside your NoteManager class
    const tags = noteManager.getUniqueTags();

    tagsSection.innerHTML = '<h3 class="tags-title">Tags</h3>'; 
    
    tags.forEach(tag => {
        const tagItem = document.createElement('div');
        tagItem.className = 'nav-item';
        tagItem.innerHTML = `
            <svg class="nav-icon"><use href="#icon-tag"></use></svg>
            <span>${tag}</span>
        `;
        
        // Link the click to your Manager's filter method
        tagItem.onclick = () => {
            const filtered = noteManager.getNotesByTag(tag);
            // Assuming you have a function named renderNotesList elsewhere
            if (typeof renderNotesList === 'function') {
                renderNotesList(filtered);
            }
        };
        tagsSection.appendChild(tagItem);
    });
};