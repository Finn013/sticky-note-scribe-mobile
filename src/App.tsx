
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

    // Apply global font size scaling to document body
    document.body.className = document.body.className.replace(/global-font-\w+/, '');
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
