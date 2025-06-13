import React, { useState } from 'react';
import { Copy, Send, QrCode, Delete, Menu, Plus, X, Tag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Note, ListItem } from '../types/note';
import { generateQRCodeURL } from '../utils/qrGenerator';
import { exportSingleNote } from '../utils/exportUtils';
import { toast } from '@/hooks/use-toast';
import { generateUUID } from '../utils/idGenerator';

interface NoteCardProps {
  note: Note;
  onUpdate: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  globalFontSize: string;
}

const colors = [
  '#ffffff', // белый
  '#fef3c7', // желтый
  '#dbeafe', // голубой
  '#dcfce7', // зеленый  
  '#fce7f3', // розовый
  '#f3e8ff', // фиолетовый
  '#fed7d7', // красный
];

const darkColors = [
  '#374151', // темно-серый
  '#92400e', // темно-желтый
  '#1e3a8a', // темно-синий
  '#166534', // темно-зеленый
  '#be185d', // темно-розовый
  '#6b21a8', // темно-фиолетовый
  '#dc2626', // темно-красный
];

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onUpdate, 
  onDelete, 
  onToggleSelect,
  globalFontSize 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [tempTitle, setTempTitle] = useState(note.title);
  const [tempContent, setTempContent] = useState(note.content);
  const [tempTags, setTempTags] = useState(note.tags || []);
  const [newTag, setNewTag] = useState('');
  const [tempListItems, setTempListItems] = useState(note.listItems || []);

  const isDarkTheme = document.documentElement.classList.contains('dark');
  const availableColors = isDarkTheme ? darkColors : colors;

  const handleSave = () => {
    const updatedNote = {
      ...note,
      title: tempTitle || 'Без названия',
      content: tempContent,
      tags: tempTags,
      listItems: note.type === 'list' ? tempListItems : undefined,
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updatedNote);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTitle(note.title);
    setTempContent(note.content);
    setTempTags(note.tags || []);
    setTempListItems(note.listItems || []);
    setIsEditing(false);
  };

  const handleCopy = () => {
    let textToCopy = `${note.title}\n\n`;
    if (note.type === 'list' && note.listItems) {
      textToCopy += note.listItems.map(item => 
        `${item.completed ? '✓' : '○'} ${item.text}`
      ).join('\n');
    } else {
      textToCopy += note.content;
    }
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Скопировано!",
      description: "Заметка скопирована в буфер обмена",
    });
  };

  const handleShare = async () => {
    let shareText = note.content;
    if (note.type === 'list' && note.listItems) {
      shareText = note.listItems.map(item => 
        `${item.completed ? '✓' : '○'} ${item.text}`
      ).join('\n');
    }
    
    const shareData = {
      title: note.title,
      text: shareText,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleColorChange = (color: string) => {
    onUpdate({ ...note, color });
  };

  const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large') => {
    onUpdate({ ...note, fontSize });
  };

  const addTag = () => {
    if (newTag.trim() && !tempTags.includes(newTag.trim())) {
      setTempTags([...tempTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTempTags(tempTags.filter(tag => tag !== tagToRemove));
  };

  const addListItem = () => {
    const newItem: ListItem = {
      id: generateUUID(),
      text: '',
      completed: false,
      order: tempListItems.length
    };
    setTempListItems([...tempListItems, newItem]);
  };

  const updateListItem = (id: string, text: string) => {
    setTempListItems(tempListItems.map(item => 
      item.id === id ? { ...item, text } : item
    ));
  };

  const toggleListItem = (id: string) => {
    const updatedItems = tempListItems.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    
    // Сортируем: незавершенные сверху, завершенные снизу
    const sortedItems = updatedItems.sort((a, b) => {
      if (a.completed === b.completed) return a.order - b.order;
      return a.completed ? 1 : -1;
    });
    
    setTempListItems(sortedItems);
  };

  const deleteListItem = (id: string) => {
    setTempListItems(tempListItems.filter(item => item.id !== id));
  };

  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base', 
    large: 'text-lg'
  }[note.fontSize];

  const handleExportNote = async () => {
    try {
      await exportSingleNote(note);
      toast({
        title: "Экспорт завершён",
        description: "Заметка экспортирована",
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать заметку",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div 
        className={`rounded-lg border shadow-sm transition-all duration-200 hover:shadow-md ${
          note.isSelected ? 'ring-2 ring-primary' : ''
        }`}
        style={{ backgroundColor: note.color }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-white/50 dark:bg-black/30 rounded-t-lg">
          <div className="flex items-center gap-2 flex-1">
            <div className="scale-50">
              <Checkbox
                checked={note.isSelected}
                onCheckedChange={() => onToggleSelect(note.id)}
              />
            </div>
            {isEditing ? (
              <div className="flex-1 space-y-2">
                <Input
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="h-8"
                  placeholder="Название заметки"
                />
                <div className="flex flex-wrap gap-1">
                  {tempTags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 rounded-full text-xs">
                      <Tag size={12} />
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-destructive hover:text-destructive/80">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Новый тег"
                      className="h-6 text-xs w-20"
                    />
                    <Button onClick={addTag} size="sm" className="h-6 w-6 p-0">
                      <Plus size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <h3 
                  className={`font-medium truncate cursor-pointer ${fontSizeClass}`}
                  onClick={() => setIsEditing(true)}
                >
                  {note.title || 'Без названия'}
                </h3>
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {note.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 rounded-full text-xs">
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={handleCopy}>
                <Copy size={16} className="mr-2" />
                Копировать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Send size={16} className="mr-2" />
                Отправить
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowQR(true)}>
                <QrCode size={16} className="mr-2" />
                QR-код
              </DropdownMenuItem>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  🔤 Размер шрифта
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent align="center">
                  <DropdownMenuItem
                    onClick={() => handleFontSizeChange('small')}
                    className={note.fontSize === 'small' ? 'bg-accent' : ''}
                  >
                    Маленький
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFontSizeChange('medium')}
                    className={note.fontSize === 'medium' ? 'bg-accent' : ''}
                  >
                    Средний
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleFontSizeChange('large')}
                    className={note.fontSize === 'large' ? 'bg-accent' : ''}
                  >
                    Большой
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              <DropdownMenuSeparator />
              <div className="px-2 py-1">
                <div className="text-sm text-muted-foreground mb-1">Цвет заметки:</div>
                <div className="flex gap-1 flex-wrap">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded border-2 ${
                        note.color === color ? 'border-primary' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportNote}>
                📤 Экспорт заметки
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(note.id)}
                className="text-destructive"
              >
                <Delete size={16} className="mr-2" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="p-3">
          {isEditing ? (
            <div className="space-y-3">
              {note.type === 'list' ? (
                <div className="space-y-2">
                  {tempListItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleListItem(item.id)}
                      />
                      <Input
                        value={item.text}
                        onChange={(e) => updateListItem(item.id, e.target.value)}
                        className={`flex-1 ${item.completed ? 'line-through opacity-60' : ''}`}
                        placeholder="Пункт списка"
                      />
                      <Button 
                        onClick={() => deleteListItem(item.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                  <Button onClick={addListItem} variant="outline" size="sm" className="w-full">
                    <Plus size={16} className="mr-2" />
                    Добавить пункт
                  </Button>
                </div>
              ) : (
                <Textarea
                  value={tempContent}
                  onChange={(e) => setTempContent(e.target.value)}
                  placeholder="Содержимое заметки..."
                  className={`min-h-[250px] max-h-[500px] resize-y ${fontSizeClass}`}
                  rows={10}
                />
              )}
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm">
                  Сохранить
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className={`whitespace-pre-wrap cursor-pointer min-h-[60px] max-h-[200px] overflow-y-auto ${fontSizeClass}`}
              onClick={() => setIsEditing(true)}
            >
              {note.type === 'list' && note.listItems ? (
                <div className="space-y-1">
                  {note.listItems.map(item => (
                    <div key={item.id} className={`flex items-center gap-2 ${item.completed ? 'opacity-60' : ''}`}>
                      <Check size={16} className={item.completed ? 'text-green-500' : 'text-gray-400'} />
                      <span className={item.completed ? 'line-through' : ''}>{item.text}</span>
                    </div>
                  ))}
                </div>
              ) : (
                note.content || 'Нажмите для редактирования...'
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 pb-2 text-xs text-muted-foreground">
          {note.type === 'list' ? '📋 Список' : '📝 Заметка'} • Создано: {new Date(note.createdAt).toLocaleString('ru')}
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR-код заметки</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <img 
              src={generateQRCodeURL(`${note.title}\n\n${note.content}`)}
              alt="QR Code"
              className="border rounded"
            />
            <p className="text-sm text-muted-foreground text-center">
              Отсканируйте QR-код для просмотра содержимого заметки
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NoteCard;
