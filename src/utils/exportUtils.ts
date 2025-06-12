
import { Note } from '../types/note';

export const exportNotes = (notes: Note[], fileName: string = 'notes.json') => {
  const dataStr = JSON.stringify(notes, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = fileName;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const exportSingleNote = (note: Note) => {
  const fileName = `${note.title.slice(0, 20).replace(/[^a-zA-Z0-9\u0400-\u04FF]/g, '_')}.json`;
  exportNotes([note], fileName);
};

export const importNotes = (file: File): Promise<Note[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const notes = JSON.parse(content);
        resolve(Array.isArray(notes) ? notes : [notes]);
      } catch (error) {
        reject(new Error('Неверный формат файла'));
      }
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
};
