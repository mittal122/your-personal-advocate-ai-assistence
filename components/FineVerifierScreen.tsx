import React, { useState, useMemo } from 'react';
import { Language, Fine } from '../types';
import { UI_STRINGS, FINE_DATA } from '../constants';
import useTextToSpeech from '../hooks/useTextToSpeech';
import { SpeakerWaveIcon, StopCircleIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

interface FineVerifierScreenProps {
  language: Language;
}

const FineVerifierScreen: React.FC<FineVerifierScreenProps> = ({ language }) => {
  const [selectedState, setSelectedState] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { speak, stop, isSpeaking, currentlySpeakingId } = useTextToSpeech(language);

  const states = Object.keys(FINE_DATA);

  const filteredFines = useMemo(() => {
    if (!selectedState) return [];
    return FINE_DATA[selectedState].filter(fine =>
      fine.offense[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.offense['en'].toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedState, searchTerm, language]);
  
  const FineCard: React.FC<{ fine: Fine }> = ({ fine }) => {
    const [isProcedureVisible, setIsProcedureVisible] = useState(false);
    const fineId = `${selectedState}-${fine.section}`;
    const textToRead = `
      ${UI_STRINGS.offense[language]}: ${fine.offense[language]}.
      ${UI_STRINGS.lawSection[language]}: ${fine.section}.
      ${UI_STRINGS.fineAmount[language]}: ${fine.fine}.
      ${UI_STRINGS.paymentProcedure[language]}: ${fine.procedure[language]}.
    `;

    const handleSpeak = () => {
        if (isSpeaking && currentlySpeakingId === fineId) {
            stop();
        } else {
            speak(textToRead, fineId);
        }
    };
    
    return (
      <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 flex flex-col space-y-4">
          {/* Main Info */}
          <div>
              <h3 className="text-xl font-bold text-blue-400">{fine.offense[language]}</h3>
              <p><span className="font-semibold text-gray-400">{UI_STRINGS.lawSection[language]}:</span> {fine.section}</p>
              <p><span className="font-semibold text-gray-400">{UI_STRINGS.fineAmount[language]}:</span> {fine.fine}</p>
          </div>

          {/* Collapsible Procedure */}
          {isProcedureVisible && (
              <div className="pt-3 border-t border-gray-700">
                  <p className="font-semibold text-gray-400 mb-1">{UI_STRINGS.paymentProcedure[language]}:</p>
                  <p className="text-gray-300">{fine.procedure[language]}</p>
              </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center space-x-4 pt-3 border-t border-gray-700">
              <button 
                  onClick={() => setIsProcedureVisible(!isProcedureVisible)}
                  className="flex items-center space-x-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                  {isProcedureVisible ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                  <span>
                      {isProcedureVisible ? UI_STRINGS.hideProcedure[language] : UI_STRINGS.showProcedure[language]}
                  </span>
              </button>

              <button 
                onClick={handleSpeak}
                className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-colors py-1 px-3 rounded-full bg-gray-700 hover:bg-gray-600"
              >
                {isSpeaking && currentlySpeakingId === fineId ? <StopCircleIcon /> : <SpeakerWaveIcon />}
                <span>{isSpeaking && currentlySpeakingId === fineId ? UI_STRINGS.stopReading[language] : UI_STRINGS.readAloud[language]}</span>
              </button>
          </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{UI_STRINGS.selectState[language]}</option>
          {states.map(state => <option key={state} value={state}>{state}</option>)}
        </select>
        <input
          type="text"
          placeholder={UI_STRINGS.searchOffense[language]}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!selectedState}
        />
      </div>

      <div className="space-y-4">
        {selectedState && filteredFines.length > 0 && filteredFines.map((fine, index) => (
          <FineCard key={index} fine={fine} />
        ))}
        {selectedState && filteredFines.length === 0 && (
          <p className="text-center text-gray-400 mt-8">{UI_STRINGS.noFinesFound[language]}</p>
        )}
      </div>
    </div>
  );
};

export default FineVerifierScreen;