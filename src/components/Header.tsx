
import React, { useState } from 'react';
import { Plus, Menu, Share, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { AppSettings } from '../types/note';

interface HeaderProps {
  onCreateNote: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: Partial<AppSettings>) => void;
  onImportNotes: (file: File) => void;
  onExportAllNotes: () => void;
  selectedCount?: number;
  onExportSelected?: () => void;
  onDeleteSelected?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onCreateNote, 
  settings, 
  onSettingsChange, 
  onImportNotes,
  onExportAllNotes,
  selectedCount = 0,
  onExportSelected,
  onDeleteSelected
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
            <span className="hidden sm:inline">Создать</span>
          </Button>
          
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Menu size={16} />
                {selectedCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover">
              <DropdownMenuItem onClick={onCreateNote}>
                <Plus size={16} className="mr-2" />
                Создать заметку
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  🔤 Размер шрифта
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => onSettingsChange({ globalFontSize: 'small' })}
                    className={settings.globalFontSize === 'small' ? 'bg-accent' : ''}
                  >
                    Маленький
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onSettingsChange({ globalFontSize: 'medium' })}
                    className={settings.globalFontSize === 'medium' ? 'bg-accent' : ''}
                  >
                    Средний
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onSettingsChange({ globalFontSize: 'large' })}
                    className={settings.globalFontSize === 'large' ? 'bg-accent' : ''}
                  >
                    Большой
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {settings.theme === 'light' ? '☀️' : '🌙'} Тема
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => onSettingsChange({ theme: 'light' })}
                    className={settings.theme === 'light' ? 'bg-accent' : ''}
                  >
                    ☀️ Светлая
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onSettingsChange({ theme: 'dark' })}
                    className={settings.theme === 'dark' ? 'bg-accent' : ''}
                  >
                    🌙 Тёмная
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  📊 Сортировка
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => onSettingsChange({ sortBy: 'date' })}
                    className={settings.sortBy === 'date' ? 'bg-accent' : ''}
                  >
                    По дате
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onSettingsChange({ sortBy: 'title' })}
                    className={settings.sortBy === 'title' ? 'bg-accent' : ''}
                  >
                    По названию
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
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
              
              {selectedCount > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onExportSelected} className="text-primary">
                    <Share size={16} className="mr-2" />
                    Отправить выбранные ({selectedCount})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDeleteSelected} className="text-destructive">
                    <Trash size={16} className="mr-2" />
                    Удалить выбранные ({selectedCount})
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
