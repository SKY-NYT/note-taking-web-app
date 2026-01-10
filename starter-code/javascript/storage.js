// storage.js

const NOTES_KEY = 'notes_data';

export const loadNotes = async () => {
  // 1. Check if we already have data in LocalStorage
  const savedNotes = localStorage.getItem(NOTES_KEY);
  
  if (savedNotes) {
    return JSON.parse(savedNotes);
  }

  // 2. If not, fetch from your data.json file
  try {
    const response = await fetch('./data.json'); // Adjust path if needed
    const data = await response.json();
    
    // 3. Save it to LocalStorage so we have it for next time
    saveNotes(data.notes); 
    return data.notes;
  } catch (error) {
    console.error("Failed to load data.json", error);
    return [];
  }
};

export const saveNotes = (notes) => {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};