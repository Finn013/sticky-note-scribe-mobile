
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AppSettings } from './types/note';
import './App.css';

function App() {
  const [settings] = useLocalStorage<AppSettings>('app-settings', {
    theme: 'light',
    globalFontSize: 'medium',
    sortBy: 'date'
  });

  useEffect(() => {
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply global font size scaling to html element instead of body
    document.documentElement.className = document.documentElement.className.replace(/global-font-\w+/g, '');
    document.documentElement.classList.add(`global-font-${settings.globalFontSize}`);
    
    // Also apply to body for backward compatibility
    document.body.className = document.body.className.replace(/global-font-\w+/g, '');
    document.body.classList.add(`global-font-${settings.globalFontSize}`);
  }, [settings.theme, settings.globalFontSize]);

  // Определяем базовый путь для роутера
  const basename = import.meta.env.PROD ? '/sticky-note-scribe-mobile' : '';

  return (
    <Router basename={basename}>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
