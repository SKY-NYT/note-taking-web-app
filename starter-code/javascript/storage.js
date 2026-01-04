// storage.js
const STORAGE_KEY = 'notes-app-data';

/* ------------------ ID Generator ------------------ */
function generateId() {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/* ------------------ Initialize Storage ------------------ */
function initStorage(initialData) {
  if (!localStorage.getItem(STORAGE_KEY)) {
    const notesWithIds = initialData.notes.map(note => ({
      id: generateId(),
      ...note
    }));

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ notes: notesWithIds })
    );
  }
}

/* ------------------ Get All Notes ------------------ */
function getNotes() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  return data ? data.notes : [];
}

/* ------------------ Save Notes ------------------ */
function saveNotes(notes) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ notes })
  );
}

/* ------------------ CRUD Operations ------------------ */
function addNote(note) {
  const notes = getNotes();

  notes.unshift({
    id: generateId(),
    lastEdited: new Date().toISOString(),
    isArchived: false,
    ...note
  });

  saveNotes(notes);
}

function updateNote(id, updates) {
  const notes = getNotes().map(note =>
    note.id === id
      ? { ...note, ...updates, lastEdited: new Date().toISOString() }
      : note
  );

  saveNotes(notes);
}

function deleteNote(id) {
  const notes = getNotes().filter(note => note.id !== id);
  saveNotes(notes);
}

function archiveNote(id, archived = true) {
  updateNote(id, { isArchived: archived });
}
