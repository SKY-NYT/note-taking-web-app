// noteManager.js
// ----------------------------
// Core logic for managing notes
// ----------------------------

// ----------------------------
// 1. Generate Unique Note ID
// ----------------------------
// Every note needs a unique identifier
function generateNoteId() {
  return `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`; 
  // timestamp + random number ensures uniqueness
}

// ----------------------------
// 2. Storage Helpers
// ----------------------------

// Save notes array to localStorage
function saveNotesToStorage(notes) {
  localStorage.setItem('notes', JSON.stringify(notes));
}

// Load notes from localStorage
function loadNotesFromStorage() {
  const notes = localStorage.getItem('notes');
  return notes ? JSON.parse(notes) : [];
}

// Test storage in console
function testStorage() {
  console.log('Current notes in storage:', loadNotesFromStorage());
}

// Initialize storage with default notes if empty
function initializeNotes(defaultNotes = []) {
  if (!localStorage.getItem('notes')) {
    saveNotesToStorage(defaultNotes);
    console.log('Initialized notes storage with default notes.');
  }
}

// ----------------------------
// 3. CRUD Operations
// ----------------------------

// Create a new note
// ----------------------------
// Create a new note
// ----------------------------
function createNote(title = 'New Note', content = '', tags = []) {
  // Only title is required now
  if (!title) throw new Error('Title is required');

  const notes = loadNotesFromStorage();
  const newNote = {
    id: generateNoteId(),
    title,
    content,  // can be empty
    tags,
    lastEdited: new Date().toISOString(),
    isArchived: false
  };

  notes.push(newNote);
  saveNotesToStorage(notes);
  return newNote;
}


// Read (get) all notes
function getAllNotes({ includeArchived = false } = {}) {
  const notes = loadNotesFromStorage();
  return includeArchived ? notes : notes.filter(note => !note.isArchived);
}

// Read a single note by ID
function getNoteById(id) {
  const notes = loadNotesFromStorage();
  return notes.find(note => note.id === id) || null;
}

// Edit/update a note
function editNote(id, updatedFields) {
  const notes = loadNotesFromStorage();
  const index = notes.findIndex(note => note.id === id);
  if (index === -1) return null; // note not found

  notes[index] = {
    ...notes[index],
    ...updatedFields,
    lastEdited: new Date().toISOString()
  };

  saveNotesToStorage(notes);
  return notes[index];
}
// REQUIRED BY ui.js
function updateNote(id, updatedFields) {
  return editNote(id, updatedFields);
}
// Delete a note
function deleteNote(id) {
  let notes = loadNotesFromStorage();
  const originalLength = notes.length;
  notes = notes.filter(note => note.id !== id);
  saveNotesToStorage(notes);
  return notes.length < originalLength; // true if a note was deleted
}

// Archive / Unarchive a note
function toggleArchiveNote(id) {
  const notes = loadNotesFromStorage();
  const note = notes.find(note => note.id === id);
  if (!note) return null;

  note.isArchived = !note.isArchived;
  note.lastEdited = new Date().toISOString();
  saveNotesToStorage(notes);
  return note;
}

// ----------------------------
// 4. Search and Filter
// ----------------------------

// Search notes by title, content, or tags
function searchNotes(query, { includeArchived = false } = {}) {
  const notes = getAllNotes({ includeArchived });
  query = query.toLowerCase();
  return notes.filter(note => 
    note.title.toLowerCase().includes(query) ||
    note.content.toLowerCase().includes(query) ||
    note.tags.some(tag => tag.toLowerCase().includes(query))
  );
}

// Filter notes by tag
function filterNotesByTag(tag, { includeArchived = false } = {}) {
  const notes = getAllNotes({ includeArchived });
  return notes.filter(note => note.tags.includes(tag));
}

// ----------------------------
// 5. Utility Helpers
// ----------------------------

// Format note date for display
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString(); // adjust to your preferred format
}

// ----------------------------
// 6. Export / Global Access
// ----------------------------
// For simplicity, attach to window so UI can access these functions
window.NoteManager = {
  generateNoteId,
  saveNotesToStorage,
  loadNotesFromStorage,
  testStorage,
  initializeNotes,
  createNote,
  getAllNotes,
  getNoteById,
  editNote,
  updateNote,
  deleteNote,
  toggleArchiveNote,
  searchNotes,
  filterNotesByTag,
  formatDate
};
