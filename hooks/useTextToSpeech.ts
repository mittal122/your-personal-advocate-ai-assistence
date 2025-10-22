import { useState, useEffect, useCallback } from 'react';
import { Language } from '../types';

const useTextToSpeech = (language: Language) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  const langCodeMap: Record<Language, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    gu: 'gu-IN',
  };

  const speak = useCallback((text: string, id: string) => {
    if (!window.speechSynthesis) {
      console.error("Browser does not support text-to-speech.");
      return;
    }
    
    // Stop any currently playing utterance before starting a new one
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCodeMap[language];
    
    utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentlySpeakingId(id);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
    };

    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentlySpeakingId(null);
  }, []);

  // Cleanup on unmount or language change
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
    };
  }, [language]);

  return { speak, stop, isSpeaking, currentlySpeakingId };
};

export default useTextToSpeech;