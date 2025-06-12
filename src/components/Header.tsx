
import React, { useState } from 'react';
import { Plus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppSettings } from '../types/note';

interface HeaderProps {
  onCreateNote: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: Partial<AppSettings>) => void;
  onImportNotes: (file: File) => void;
  onExportAllNotes: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onCreateNote, 
  settings, 
  onSettingsChange, 
  onImportNotes,
  onExportAllNotes 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportNotes(file);
      event.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-foreground">📝 Заметки</h1>
        
        <div className="flex items-center gap-2">
          <Button onClick={onCreateNote} size="sm" className="gap-2">
            <Plus size={16} />
            Создать
          </Button>
          
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover">
              <DropdownMenuItem onClick={onCreateNote}>
                <Plus size={16} className="mr-2" />
                Создать заметку
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={() => onSettingsChange({ 
                  globalFontSize: settings.globalFontSize === 'small' ? 'medium' : 
                               settings.globalFontSize === 'medium' ? 'large' : 'small' 
                })}
              >
                🔤 Размер шрифта: {
                  settings.globalFontSize === 'small' ? 'Маленький' :
                  settings.globalFontSize === 'medium' ? 'Средний' : 'Большой'
                }
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={() => onSettingsChange({ 
                  theme: settings.theme === 'light' ? 'dark' : 'light' 
                })}
              >
                {settings.theme === 'light' ? '🌙' : '☀️'} Тема: {settings.theme === 'light' ? 'Светлая' : 'Тёмная'}
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={() => onSettingsChange({ 
                  sortBy: settings.sortBy === 'date' ? 'title' : 'date' 
                })}
              >
                📊 Сортировка: {settings.sortBy === 'date' ? 'По дате' : 'По названию'}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={onExportAllNotes}>
                📤 Экспорт всех заметок
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <label className="cursor-pointer">
                  📥 Импорт заметок
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
