// ui.js

// ---------- SELECT ELEMENTS ----------
const createNoteBtnDesktop = document.querySelector('.create-note-desktop');
const createNoteBtnMobile = document.querySelector('.create-note-mobile');

const emptyState = document.querySelector('.empty-state');
const notesList = document.querySelector('.notes-list');
const contentArea = document.querySelector('.content');
const tagsSection = document.querySelector('.tags-section');
const rightMenu = document.querySelector('.right-menu');


// ---------- INITIAL STATE ----------
function initUI() {
  const notes = NoteManager.getAllNotes();

  if (!notes || notes.length === 0) {
    showEmptyState();
    return;
  }

  renderNotes(notes);

  //  Restore open editor after refresh
  const activeNoteId = localStorage.getItem('activeNoteId');
  if (activeNoteId) {
    const note = NoteManager.getNoteById(activeNoteId);
    if (note) openNote(note);
  }
}


// ---------- SHOW EMPTY STATE ----------
function showEmptyState() {
  emptyState.classList.remove('hidden');
  notesList.classList.add('hidden');
  contentArea.innerHTML = '';
  tagsSection.innerHTML = '';
}

// ---------- RENDER NOTES ----------
function renderNotes(notes) {
  notesList.innerHTML = '';
  notesList.classList.remove('hidden');
  emptyState.classList.add('hidden');

  notes.forEach(note => addNoteToList(note));
  renderTags(notes);
}


// ---------- ADD SINGLE NOTE ----------
function addNoteToList(note) {
  const noteEl = document.createElement('div');
  noteEl.className = 'note-item';
  noteEl.dataset.id = note.id;

  // --- TITLE ---
  const titleEl = document.createElement('h4');
  titleEl.textContent = note.title;

  // --- TAGS ---
  const tagsWrapper = document.createElement('div');
  tagsWrapper.className = 'note-tags-wrapper';

  note.tags?.forEach(tag => {
    const tagEl = document.createElement('span');
    tagEl.className = 'note-tag';
    tagEl.textContent = tag;
    tagsWrapper.appendChild(tagEl);
  });

  // --- DATE ---
  const dateEl = document.createElement('small');
  dateEl.className = 'note-date';
  dateEl.textContent = note.lastEdited
    ? new Date(note.lastEdited).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'Not yet saved';

  // Append all to note element
  noteEl.append(titleEl, tagsWrapper, dateEl);

  // Click opens note in editor
  noteEl.addEventListener('click', () => openNote(note));

  const divider = document.createElement('hr');
  divider.className = 'divider';

  notesList.append(noteEl, divider);
}



// ---------- SAVE NOTE ----------
function saveNote(note, titleInput, textarea, tagInput) {
  const updatedTitle = titleInput.value.trim() || 'Untitled Note';
  const updatedContent = textarea.value.trim();
  const updatedTags = tagInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);

  NoteManager.updateNote(note.id, {
    title: updatedTitle,
    content: updatedContent,
    tags: updatedTags,
    lastEdited: Date.now()
  });

  const notes = NoteManager.getAllNotes();
  renderNotes(notes);

  const updatedNote = notes.find(n => n.id === note.id);
  openNote(updatedNote);
}

// ---------- CANCEL EDIT ----------
function cancelEdit() {
  localStorage.removeItem('activeNoteId');
  contentArea.innerHTML = '';
  rightMenu.innerHTML = ''; // ✅ CLEAR ACTIONS

  const notes = NoteManager.getAllNotes();
  if (!notes || notes.length === 0) {
    showEmptyState();
  }
}


// ---------- OPEN NOTE ----------
function openNote(note) {
  // Remember which note is currently open
  localStorage.setItem('activeNoteId', note.id);
  contentArea.innerHTML = '';
  // ---------- RIGHT MENU ACTIONS ----------
// ---------- RIGHT MENU ACTIONS ----------
rightMenu.innerHTML = '';


const archiveBtn = document.createElement('button');
archiveBtn.className = 'right-menu-btn archive-btn';

// Add archive icon
const archiveIcon = document.createElement('img');
archiveIcon.src = './starter-code/assets/images/archived.svg'; // your icon path
archiveIcon.alt = 'Archive icon';
archiveIcon.className = 'btn-icon';
archiveBtn.append(archiveIcon, document.createTextNode(note.isArchived ? 'Unarchive' : 'Archive'));
const deleteBtn = document.createElement('button');
deleteBtn.className = 'right-menu-btn delete-btn';

// Add delete icon
const deleteIcon = document.createElement('img');
deleteIcon.src = './starter-code/assets/images/icon-delete.svg'; // your icon path
deleteIcon.alt = 'Delete icon';
deleteIcon.className = 'btn-icon';
deleteBtn.append(deleteIcon, document.createTextNode('Delete'));



rightMenu.append(archiveBtn,deleteBtn);

// DELETE NOTE
deleteBtn.onclick = () => {
  if (!confirm('Delete this note permanently?')) return;

  NoteManager.deleteNote(note.id);
  localStorage.removeItem('activeNoteId');
  rightMenu.innerHTML = '';

  const notes = NoteManager.getAllNotes();
  contentArea.innerHTML = '';

  if (!notes.length) {
    showEmptyState();
  } else {
    renderNotes(notes);
  }
};

// ARCHIVE / UNARCHIVE NOTE
archiveBtn.onclick = () => {
  NoteManager.toggleArchiveNote(note.id);
  localStorage.removeItem('activeNoteId');
  rightMenu.innerHTML = '';

  const notes = NoteManager.getAllNotes();
  contentArea.innerHTML = '';
  renderNotes(notes);
};

  const titleWrapper = document.createElement('div');
  titleWrapper.className = 'editor-title';

  const titleInput = document.createElement('input');
  titleInput.className = 'note-title';
  titleInput.placeholder = 'Enter a title...';
  titleInput.value = note.title || '';

  titleWrapper.append(titleInput);

  const metaWrapper = document.createElement('div');
  metaWrapper.className = 'editor-meta';

  // Tags
  const tagRow = document.createElement('div');
  tagRow.className = 'meta-row';

  const tagInfo = document.createElement('div');
  tagInfo.className = 'meta-info';

  const tagIcon = document.createElement('img');
  tagIcon.src = './starter-code/assets/images/atag.svg';
  tagIcon.alt = 'Tag icon';

  const tagLabel = document.createElement('span');
  tagLabel.textContent = 'Tags';

  tagInfo.append(tagIcon, tagLabel);

  const tagInput = document.createElement('input');
  tagInput.className = 'tag-input';
  tagInput.placeholder = 'Add tags separated by commas (e.g. Work, Planning)';
  tagInput.value = note.tags?.join(', ') || '';

  tagRow.append(tagInfo, tagInput);

  // Time
  const timeRow = document.createElement('div');
  timeRow.className = 'meta-row';

  const timeInfo = document.createElement('div');
  timeInfo.className = 'meta-info';

  const timeIcon = document.createElement('img');
  timeIcon.src = './starter-code/assets/images/icon-clock.svg';
  timeIcon.alt = 'Time icon';

  const timeText = document.createElement('span');
  timeText.className = 'meta-text';
  timeText.textContent = note.lastEdited
    ? `Last edited ${new Date(note.lastEdited).toLocaleString()}`
    : 'Not yet saved';

  timeInfo.append(timeIcon, timeText);
  timeRow.append(timeInfo);

  metaWrapper.append(tagRow, timeRow);

  const dividerTop = document.createElement('div');
  dividerTop.className = 'meta-divider';

  const textarea = document.createElement('textarea');
  textarea.className = 'note-content';
  textarea.placeholder = 'Start typing your note here...';
  textarea.value = note.content || '';

  const dividerBottom = document.createElement('div');
  dividerBottom.className = 'meta-divider';

  const actions = document.createElement('div');
  actions.className = 'editor-actions';


  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn-primary';
  saveBtn.type = 'button';
  saveBtn.textContent = 'Save Note';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn-secondary';
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'Cancel';

  saveBtn.onclick = () => {
  saveNote(note, titleInput, textarea, tagInput);
};

cancelBtn.onclick = () => {
  cancelEdit();
};

  actions.append(saveBtn, cancelBtn);

  contentArea.append(
    titleWrapper,
    metaWrapper,
    dividerTop,
    textarea,
    dividerBottom,
    actions
  );

  textarea.focus();
}

// ---------- CREATE NEW NOTE ----------
function createNote() {
  const note = NoteManager.createNote('New Note', '', []);

  emptyState.classList.add('hidden');
  notesList.classList.remove('hidden');

  renderNotes(NoteManager.getAllNotes()); // Refresh the list
  openNote(note);
}


// ---------- RENDER TAGS ----------
function renderTags(notes) {
  const tagSet = new Set();

  notes.forEach(note => {
    note.tags?.forEach(tag => tagSet.add(tag));
  });

  tagsSection.innerHTML = '';

  tagSet.forEach(tag => {
    const tagEl = document.createElement('div');
    tagEl.className = 'tag-item';

    const tagIcon = document.createElement('img');
    tagIcon.src = './starter-code/assets/images/tag.svg';
    tagIcon.alt = 'Tag Icon';

    const tagName = document.createElement('span');
    tagName.textContent = tag;

    tagEl.append(tagIcon, tagName);
    tagsSection.appendChild(tagEl);
  });
}

// ---------- EVENTS ----------
createNoteBtnDesktop?.addEventListener('click', createNote);
createNoteBtnMobile?.addEventListener('click', createNote);

// ---------- INIT ----------
initUI();
