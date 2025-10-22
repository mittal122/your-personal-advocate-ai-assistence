
import React from 'react';
import { HistoryItem, Language } from '../types';
import { UI_STRINGS } from '../constants';

interface HistoryScreenProps {
  history: HistoryItem[];
  onViewItem: (item: HistoryItem) => void;
  language: Language;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, onViewItem, language }) => {
  if (history.length === 0) {
    // FIX: Use the language prop for UI strings instead of hardcoding 'en'.
    return <p className="text-center text-gray-400 mt-8">{UI_STRINGS.noHistory[language]}</p>;
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div key={item.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
          <div>
            <p className="font-semibold truncate max-w-xs">{item.query}</p>
            <p className="text-sm text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
          </div>
          <button
            onClick={() => onViewItem(item)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {/* FIX: Use the language prop for UI strings instead of hardcoding 'en'. */}
            {UI_STRINGS.view[language]}
          </button>
        </div>
      ))}
    </div>
  );
};

export default HistoryScreen;
