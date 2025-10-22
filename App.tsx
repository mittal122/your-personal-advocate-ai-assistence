
import React, { useState, useCallback } from 'react';
import { Language, View } from './types';
import { HistoryItem } from './types';
import HomeScreen from './components/HomeScreen';
import AdvocateScreen from './components/AdvocateScreen';
import FineVerifierScreen from './components/FineVerifierScreen';
import HistoryScreen from './components/HistoryScreen';
import RightsLibraryScreen from './components/RightsLibraryScreen';
import Header from './components/Header';
import useLocalStorage from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('advocateHistory', []);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

  const navigate = (view: View) => {
    setSelectedHistoryItem(null); // Clear selected history item on navigation
    setCurrentView(view);
  };

  const addHistoryItem = (item: HistoryItem) => {
    setHistory(prevHistory => [item, ...prevHistory]);
  };
  
  const viewHistoryItem = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setCurrentView('advocate');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'advocate':
        return <AdvocateScreen 
                  language={language} 
                  addHistoryItem={addHistoryItem} 
                  historyItem={selectedHistoryItem}
                  clearHistoryItem={() => setSelectedHistoryItem(null)}
                />;
      case 'fine_verifier':
        return <FineVerifierScreen language={language} />;
      case 'history':
        // FIX: Pass language prop to HistoryScreen to fix hardcoded UI strings.
        return <HistoryScreen history={history} onViewItem={viewHistoryItem} language={language} />;
      case 'rights_library':
        return <RightsLibraryScreen language={language} />;
      case 'home':
      default:
        return <HomeScreen navigate={navigate} language={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col max-w-lg mx-auto shadow-2xl shadow-blue-500/20">
      <Header 
        currentView={currentView}
        navigate={navigate}
        language={language}
        setLanguage={setLanguage}
      />
      <main className="flex-grow p-4 md:p-6 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
