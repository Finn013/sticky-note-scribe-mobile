
import React, { useState } from 'react';
import { Copy, Send, QrCode, Delete, Menu } from 'lucide-react';
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
import { Note } from '../types/note';
import { generateQRCodeURL } from '../utils/qrGenerator';
import { exportSingleNote } from '../utils/exportUtils';
import { toast } from '@/hooks/use-toast';

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

  const handleSave = () => {
    const updatedNote = {
      ...note,
      title: tempTitle || 'Без названия',
      content: tempContent,
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updatedNote);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTitle(note.title);
    setTempContent(note.content);
    setIsEditing(false);
  };

  const handleCopy = () => {
    const textToCopy = `${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Скопировано!",
      description: "Заметка скопирована в буфер обмена",
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: note.title,
      text: note.content,
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
        <div className="flex items-center justify-between p-3 border-b bg-white/50 rounded-t-lg">
          <div className="flex items-center gap-2 flex-1">
            <div className="scale-75">
              <Checkbox
                checked={note.isSelected}
                onCheckedChange={() => onToggleSelect(note.id)}
              />
            </div>
            {isEditing ? (
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="flex-1 h-8"
                placeholder="Название заметки"
              />
            ) : (
              <h3 
                className={`font-medium truncate flex-1 cursor-pointer ${fontSizeClass}`}
                onClick={() => setIsEditing(true)}
              >
                {note.title || 'Без названия'}
              </h3>
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
                <DropdownMenuSubContent>
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
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded border-2 ${
                        note.color === color ? 'border-primary' : 'border-gray-300'
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
              <Textarea
                value={tempContent}
                onChange={(e) => setTempContent(e.target.value)}
                placeholder="Содержимое заметки..."
                className={`min-h-[200px] max-h-[400px] resize-y ${fontSizeClass}`}
                rows={8}
              />
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
              {note.content || 'Нажмите для редактирования...'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 pb-2 text-xs text-muted-foreground">
          Создано: {new Date(note.createdAt).toLocaleString('ru')}
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
