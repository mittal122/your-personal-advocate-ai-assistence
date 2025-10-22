
import React, { useState } from 'react';
import { Language, Right, RightCategory } from '../types';
import { UI_STRINGS, RIGHTS_LIBRARY } from '../constants';
import { ChevronDownIcon, ChevronUpIcon } from './Icons';

interface RightsLibraryScreenProps {
  language: Language;
}

// FIX: Explicitly typed AccordionItem as a React.FC to correctly handle the 'key' prop during list rendering.
const AccordionItem: React.FC<{ category: RightCategory; language: Language }> = ({ category, language }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-5 text-left"
      >
        <h3 className="text-xl font-bold text-blue-400">{category.title[language]}</h3>
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>
      {isOpen && (
        <div className="p-5 border-t border-gray-700 space-y-4">
          {category.rights.map((right, index) => (
            <div key={index}>
              <h4 className="font-semibold text-lg">{right.title[language]}</h4>
              <p className="text-gray-300">{right.description[language]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RightsLibraryScreen: React.FC<RightsLibraryScreenProps> = ({ language }) => {
  return (
    <div className="space-y-4">
      {RIGHTS_LIBRARY.map((category, index) => (
        <AccordionItem key={index} category={category} language={language} />
      ))}
    </div>
  );
};

export default RightsLibraryScreen;
