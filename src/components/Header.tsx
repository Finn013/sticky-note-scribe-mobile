
import React, { useState } from 'react';
import { Plus, Menu, Share, Trash, ChevronDown, Info, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { AppSettings } from '../types/note';
import { toast } from '@/hooks/use-toast';

interface HeaderProps {
  onCreateNote: () => void;
  onCreateList: () => void;
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
  onCreateList,
  settings, 
  onSettingsChange, 
  onImportNotes,
  onExportAllNotes,
  selectedCount = 0,
  onExportSelected,
  onDeleteSelected
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateCode, setUpdateCode] = useState('');

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportNotes(file);
      event.target.value = '';
    }
  };

  const handleForceUpdate = () => {
    if (updateCode === 'Nott_013') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
          });
          window.location.reload();
        });
      } else {
        window.location.reload();
      }
      toast({
        title: "Обновление",
        description: "Приложение обновляется...",
      });
    } else {
      toast({
        title: "Неверный код",
        description: "Введён неправильный код доступа",
        variant: "destructive",
      });
    }
    setUpdateCode('');
    setShowUpdateDialog(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
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
            <DropdownMenuContent align="start" className="w-56 bg-popover">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Plus size={16} className="mr-2" />
                  Создать
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={onCreateNote}>
                    📝 Заметку
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onCreateList}>
                    📋 Список
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
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
                  <DropdownMenuItem
                    onClick={() => onSettingsChange({ sortBy: 'tags' })}
                    className={settings.sortBy === 'tags' ? 'bg-accent' : ''}
                  >
                    По тегам
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
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => setShowUpdateDialog(true)}>
                <RotateCcw size={16} className="mr-2" />
                🔄 Обновить приложение
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setShowInfo(true)}>
                <Info size={16} className="mr-2" />
                ℹ️ Info
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h1 className="text-xl font-bold text-foreground">📝 Заметки</h1>
        
        <div className="flex items-center gap-2">
          <DropdownMenu open={isCreateMenuOpen} onOpenChange={setIsCreateMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus size={16} />
                <span className="hidden sm:inline">Создать</span>
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={onCreateNote}>
                📝 Заметку
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateList}>
                📋 Список
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Info Dialog */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>📝 Информация о приложении</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Технологии:</h3>
              <p className="text-sm">React, TypeScript, Tailwind CSS, Vite, Shadcn/ui</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Языки программирования:</h3>
              <p className="text-sm">TypeScript, JavaScript, HTML, CSS</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Инструменты:</h3>
              <p className="text-sm">Lucide Icons, Radix UI, LocalStorage API</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Разработчик:</h3>
              <p className="text-sm font-medium">Nott_013</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🔄 Обновление приложения</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Введите код доступа для принудительного обновления приложения из интернета:
            </p>
            <Input
              type="password"
              value={updateCode}
              onChange={(e) => setUpdateCode(e.target.value)}
              placeholder="Код доступа"
              onKeyPress={(e) => e.key === 'Enter' && handleForceUpdate()}
            />
            <div className="flex gap-2">
              <Button onClick={handleForceUpdate} className="flex-1">
                Обновить
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowUpdateDialog(false);
                  setUpdateCode('');
                }}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
