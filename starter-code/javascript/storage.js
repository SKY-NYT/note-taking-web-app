// storage.js

// This is the "key" name in your browser's storage
const NOTES_KEY = 'notes_app_data'; 

/**
 * Loads notes from LocalStorage. 
 * If LocalStorage is empty, it fetches default notes from data.json.
 */
export const loadNotes = async () => {
    let notes = [];
    const savedNotes = localStorage.getItem(NOTES_KEY);
    
    // 1. Check if we have data in LocalStorage first
    // We check for "[]" to ensure we don't skip to fetch if the user just deleted all notes
    if (savedNotes && savedNotes !== "[]") {
        try {
            notes = JSON.parse(savedNotes);
        } catch (e) {
            console.error("LocalStorage data corrupted", e);
        }
    } 

    // 2. If nothing was in LocalStorage, fetch from the JSON file
    if (notes.length === 0) {
        try {
            // Updated path to match your folder structure
            const response = await fetch('./starter-code/javascript/data.json'); 
            if (!response.ok) throw new Error("Could not find data.json");
            
            const data = await response.json();
            notes = data.notes;
        } catch (error) {
            console.error("Critical: Could not load data.json", error);
            return []; // Return empty array so the app doesn't crash
        }
    }

    // 3. ID GENERATION: Ensures every note (even from JSON) has a unique ID
    const notesWithIds = notes.map(note => ({
        ...note,
        id: note.id || crypto.randomUUID()
    }));

    // 4. PERSISTENCE: Save the final version (with IDs) back to LocalStorage
    saveNotes(notesWithIds); 
    
    return notesWithIds;
};

/**
 * Saves the current notes array to LocalStorage
 */
export const saveNotes = (notes) => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};
