
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from '../components/Header';
import NoteCard from '../components/NoteCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Note, AppSettings } from '../types/note';
import { exportNotes, importNotes } from '../utils/exportUtils';
import { toast } from '@/hooks/use-toast';

const defaultSettings: AppSettings = {
  theme: 'light',
  globalFontSize: 'medium',
  sortBy: 'date',
};

const Index = () => {
  const [notes, setNotes] = useLocalStorage<Note[]>('sticky-notes', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('app-settings', defaultSettings);

  useEffect(() => {
    document.documentElement.className = settings.theme;
  }, [settings.theme]);

  const createNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      title: '',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: '#ffffff',
      fontSize: settings.globalFontSize,
      isSelected: false,
    };
    setNotes([newNote, ...notes]);
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    toast({
      title: "Заметка удалена",
      description: "Заметка была успешно удалена",
    });
  };

  const toggleSelectNote = (id: string) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, isSelected: !note.isSelected } : note
    ));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  const handleImportNotes = async (file: File) => {
    try {
      const importedNotes = await importNotes(file);
      const notesWithNewIds = importedNotes.map(note => ({
        ...note,
        id: uuidv4(),
        createdAt: note.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSelected: false,
      }));
      setNotes([...notesWithNewIds, ...notes]);
      toast({
        title: "Импорт завершён",
        description: `Импортировано заметок: ${importedNotes.length}`,
      });
    } catch (error) {
      toast({
        title: "Ошибка импорта",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive",
      });
    }
  };

  const handleExportAllNotes = () => {
    exportNotes(notes);
    toast({
      title: "Экспорт завершён",
      description: "Все заметки экспортированы в JSON файл",
    });
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (settings.sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return a.title.localeCompare(b.title, 'ru', { sensitivity: 'base' });
    }
  });

  const selectedCount = notes.filter(note => note.isSelected).length;

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCreateNote={createNote}
        settings={settings}
        onSettingsChange={updateSettings}
        onImportNotes={handleImportNotes}
        onExportAllNotes={handleExportAllNotes}
      />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {selectedCount > 0 && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary">
              Выбрано заметок: {selectedCount}
            </p>
          </div>
        )}
        
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Пока нет заметок
            </h2>
            <p className="text-muted-foreground mb-6">
              Создайте свою первую заметку, нажав кнопку "Создать"
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sortedNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={updateNote}
                onDelete={deleteNote}
                onToggleSelect={toggleSelectNote}
                globalFontSize={settings.globalFontSize}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
