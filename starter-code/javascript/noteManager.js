// noteManager.js

export class Note {
  constructor(title = "", content = "", tags = []) {
    this.id = Date.now().toString();
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

// --- HELPER FUNCTIONS ---

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
  const tags = notes.flatMap(note => note.tags || []); // Added fallback for safety
  return [...new Set(tags)];
};

// PLACE IT HERE
export const searchNotes = (notes, query) => {
  const q = query.toLowerCase().trim();
  if (!q) return notes; 

  return notes.filter(note => {
    const titleMatch = note.title.toLowerCase().includes(q);
    const contentMatch = note.content.toLowerCase().includes(q);
    const tagMatch = note.tags?.some(tag => tag.toLowerCase().includes(q));
    
    return titleMatch || contentMatch || tagMatch;
  });
};