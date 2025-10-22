import React, { useState, useEffect, useRef } from 'react';
import { View, Language } from '../types';
import { UI_STRINGS } from '../constants';
import { ArrowLeftIcon, GlobeAltIcon } from './Icons';

interface HeaderProps {
  currentView: View;
  navigate: (view: View) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, navigate, language, setLanguage }) => {
  const isHomeScreen = currentView === 'home';
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const viewTitles: Record<View, string> = {
    home: UI_STRINGS.appName[language],
    advocate: UI_STRINGS.advocate[language],
    fine_verifier: UI_STRINGS.checkFine[language],
    history: UI_STRINGS.history[language],
    rights_library: UI_STRINGS.knowYourRights[language],
  };
  
  const languages: { code: Language, name: string }[] = [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'हिन्दी' },
      { code: 'gu', name: 'ગુજરાતી' },
  ];

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsLangMenuOpen(false);
  };

  return (
    <header className="bg-gray-800 p-4 shadow-md sticky top-0 z-20 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {!isHomeScreen ? (
          <button onClick={() => navigate('home')} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
            <ArrowLeftIcon />
          </button>
        ) : <div className="w-10"></div>}
         <h1 className="text-xl font-bold text-blue-400">{viewTitles[currentView]}</h1>
      </div>
      
      <div className="relative" ref={langMenuRef}>
         <button 
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center bg-gray-700 rounded-full px-3 py-1.5 hover:bg-gray-600 transition-colors"
         >
            <GlobeAltIcon />
            <span className="ml-2 text-sm font-medium uppercase">{language}</span>
        </button>
        {isLangMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-36 bg-gray-700 rounded-lg shadow-xl border border-gray-600">
                <ul className="py-1">
                    {languages.map(lang => (
                        <li key={lang.code}>
                            <button
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full text-left px-4 py-2 text-sm ${language === lang.code ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-gray-600'}`}
                            >
                                {lang.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;