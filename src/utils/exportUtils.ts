
import { Note } from '../types/note';

// Интерфейс для Android моста
declare global {
  interface Window {
    Android?: {
      shareText: (text: string) => void;
    };
  }
}

export const exportNotes = async (notes: Note[], fileName: string = 'notes.json') => {
  const dataStr = JSON.stringify(notes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  
  // Проверяем наличие Android моста
  if (window.Android && typeof window.Android.shareText === 'function') {
    try {
      window.Android.shareText(dataStr);
      return;
    } catch (error) {
      console.log('Ошибка Android моста, используем обычный экспорт');
    }
  }
  
  // Проверяем поддержку Web Share API для мобильных устройств
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], fileName)] })) {
    try {
      const file = new File([blob], fileName, { type: 'application/json' });
      await navigator.share({
        title: 'Экспорт заметок',
        text: `Экспорт ${notes.length} заметок`,
        files: [file]
      });
      return;
    } catch (error) {
      // Если пользователь отменил отправку, продолжаем с обычным скачиванием
      if (error instanceof Error && error.name !== 'AbortError') {
        console.log('Ошибка Web Share API, используем обычное скачивание');
      }
    }
  }
  
  // Fallback для обычного скачивания
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', fileName);
  linkElement.click();
};

export const exportSingleNote = async (note: Note) => {
  const fileName = `${note.title.slice(0, 20).replace(/[^a-zA-Z0-9\u0400-\u04FF]/g, '_')}.json`;
  await exportNotes([note], fileName);
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
