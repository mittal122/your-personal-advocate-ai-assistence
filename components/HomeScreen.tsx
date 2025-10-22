
import React from 'react';
import { View, Language } from '../types';
import { UI_STRINGS } from '../constants';
import { ShieldCheckIcon, MagnifyingGlassIcon, ClockIcon, BookOpenIcon } from './Icons';

interface HomeScreenProps {
  navigate: (view: View) => void;
  language: Language;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigate, language }) => {
  
  // FIX: Changed icon type from JSX.Element to React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
  const NavButton = ({ icon, text, onClick }: { icon: React.ReactNode; text: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center text-center transition-transform transform hover:scale-105"
    >
      <div className="mb-3">{icon}</div>
      <span className="text-lg font-semibold">{text}</span>
    </button>
  );

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-5">
       <button
        onClick={() => navigate('advocate')}
        className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg p-8 flex flex-col items-center justify-center text-center transition-transform transform hover:scale-105"
      >
        <div className="mb-3"><ShieldCheckIcon className="h-12 w-12"/></div>
        <span className="text-2xl font-bold">{UI_STRINGS.needHelpNow[language]}</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
        <NavButton
          icon={<MagnifyingGlassIcon />}
          text={UI_STRINGS.checkFine[language]}
          onClick={() => navigate('fine_verifier')}
        />
        <NavButton
          icon={<ClockIcon />}
          text={UI_STRINGS.history[language]}
          onClick={() => navigate('history')}
        />
        <NavButton
          icon={<BookOpenIcon />}
          text={UI_STRINGS.knowYourRights[language]}
          onClick={() => navigate('rights_library')}
        />
      </div>
    </div>
  );
};

export default HomeScreen;
