import React, { useState, useEffect, useRef } from 'react';
import { Language, Message, HistoryItem, GroundingChunk } from '../types';
import { UI_STRINGS } from '../constants';
import { generateAdvocateResponse } from '../services/geminiService';
import Loader from './Loader';
import useTextToSpeech from '../hooks/useTextToSpeech';
import useSpeechToText from '../hooks/useSpeechToText';
import { MicrophoneIcon, PaperAirplaneIcon, SpeakerWaveIcon, StopCircleIcon, ChatBubbleOvalLeftEllipsisIcon, CheckCircleIcon, XCircleIcon } from './Icons';

interface AdvocateScreenProps {
  language: Language;
  addHistoryItem: (item: HistoryItem) => void;
  historyItem: HistoryItem | null;
  clearHistoryItem: () => void;
}

interface ParsedResponse {
    whatToSay: string;
    whatToDo: string;
    whatNotToDo: string;
}

const AdvocateScreen: React.FC<AdvocateScreenProps> = ({ language, addHistoryItem, historyItem, clearHistoryItem }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { speak, stop, isSpeaking, currentlySpeakingId } = useTextToSpeech(language);
  const { isListening, transcript, startListening, stopListening } = useSpeechToText(language);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isViewingHistory = useRef(!!historyItem);
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (historyItem && isViewingHistory.current) {
      setMessages([
        { id: `${historyItem.id}-q`, sender: 'user', text: historyItem.query },
        { id: `${historyItem.id}-a`, sender: 'ai', text: historyItem.response, sources: historyItem.sources },
      ]);
    }
    return () => {
      // Cleanup when component unmounts or historyItem changes
      if (isViewingHistory.current) {
        clearHistoryItem();
      }
    };
  }, [historyItem, clearHistoryItem]);

  // Effect to reset chat on language change for a better UX
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    
    // Don't reset if we are viewing a specific history item
    if (isViewingHistory.current) {
        return;
    }
    
    // Reset state for the new language
    setMessages([]);
    setInput('');
    setError(null);
    stop(); // from useTextToSpeech
    if (isListening) {
        stopListening(); // from useSpeechToText
    }

  }, [language]); // This effect depends only on language changes

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setInput(transcript);
  }, [transcript]);
  
  const handleSend = async () => {
    if (isListening) {
      stopListening();
    }
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const { text, sources } = await generateAdvocateResponse(currentInput, language);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text, sources: sources || [] };
      setMessages(prev => [...prev, aiMessage]);
      
      const newHistoryItem: HistoryItem = {
        id: aiMessage.id,
        timestamp: Date.now(),
        query: currentInput,
        response: text,
        sources: sources || [],
      };
      addHistoryItem(newHistoryItem);

    } catch (err) {
      setError(UI_STRINGS.errorOccurred[language]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isLoading) return;
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const parseResponse = (text: string): ParsedResponse => {
    const whatToSay = text.split('### What to Do')[0].replace('### What to Say (Politely)', '').trim();
    const whatToDo = text.split('### What NOT to Do')[0].split('### What to Do (Your Actions)')[1]?.trim() || '';
    const whatNotToDo = text.split('### What NOT to Do')[1]?.trim() || '';
    return { whatToSay, whatToDo, whatNotToDo };
  };

  const AiMessageContent = ({ text, sources, messageId }: { text: string; sources?: GroundingChunk[]; messageId: string }) => {
      const parsed = parseResponse(text);
      
      const handleSpeak = (textToSpeak: string) => {
        if (isSpeaking && currentlySpeakingId === messageId) {
            stop();
        } else {
            speak(textToSpeak, messageId);
        }
      };

      const AdviceCard: React.FC<{title: string; content: string; icon: React.ReactNode; titleColorClass: string; borderColorClass: string}> = ({ title, content, icon, titleColorClass, borderColorClass }) => {
        if (!content) return null;

        const bulletPoints = content.split('\n').map(line => line.trim().replace(/^- /, '')).filter(line => line);

        return (
            <div className={`bg-gray-800/50 rounded-lg p-4 border-l-4 ${borderColorClass}`}>
                <div className="flex items-center mb-3">
                    {icon}
                    <h3 className={`font-semibold text-lg ml-2 ${titleColorClass}`}>{title}</h3>
                </div>
                <ul className="space-y-2 text-gray-200">
                    {bulletPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                           <span className="mr-3 mt-1.5 text-gray-500 flex-shrink-0">&#8226;</span>
                           <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
      };

      return (
          <div className="space-y-4">
              <AdviceCard 
                  title={UI_STRINGS.whatToSay[language]}
                  content={parsed.whatToSay}
                  icon={<ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 text-blue-300" />}
                  titleColorClass="text-blue-300"
                  borderColorClass="border-blue-500"
              />
              <AdviceCard 
                  title={UI_STRINGS.whatToDo[language]}
                  content={parsed.whatToDo}
                  icon={<CheckCircleIcon className="h-6 w-6 text-green-300" />}
                  titleColorClass="text-green-300"
                  borderColorClass="border-green-500"
              />
              <AdviceCard 
                  title={UI_STRINGS.whatNotToDo[language]}
                  content={parsed.whatNotToDo}
                  icon={<XCircleIcon className="h-6 w-6 text-red-300" />}
                  titleColorClass="text-red-300"
                  borderColorClass="border-red-500"
              />

              {sources && sources.length > 0 && (
                  <div>
                      <h3 className="font-semibold text-lg text-gray-400 mb-2 mt-4">{UI_STRINGS.officialSources[language]}</h3>
                      <ul className="list-disc list-inside space-y-1">
                          {sources.map((source, index) => (
                              <li key={index}>
                                  <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                      {source.web.title || source.web.uri}
                                  </a>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}
               <button 
                  onClick={() => handleSpeak(text)}
                  className="mt-4 flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-colors py-1 px-3 rounded-full bg-gray-700 hover:bg-gray-600"
                >
                 {isSpeaking && currentlySpeakingId === messageId ? <StopCircleIcon /> : <SpeakerWaveIcon />}
                 <span>{isSpeaking && currentlySpeakingId === messageId ? UI_STRINGS.stopReading[language] : UI_STRINGS.readAloud[language]}</span>
               </button>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-140px)]">
      {isViewingHistory.current && (
        <div className="bg-yellow-900/50 text-yellow-300 p-2 text-center text-sm rounded-md mb-4 border border-yellow-700">
          {UI_STRINGS.viewingHistory[language]}
        </div>
      )}
      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-2xl max-w-sm md:max-w-md ${msg.sender === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
              {msg.sender === 'ai' ? <AiMessageContent text={msg.text} sources={msg.sources} messageId={msg.id} /> : <p>{msg.text}</p>}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-4 rounded-2xl max-w-sm md:max-w-md bg-gray-700 rounded-bl-none flex items-center space-x-3">
               <Loader />
               <span>{UI_STRINGS.gettingAdvice[language]}</span>
            </div>
          </div>
        )}
        {error && <div className="text-red-400 text-center">{error}</div>}
        <div ref={messagesEndRef} />
      </div>
      {!isViewingHistory.current && (
        <div className="mt-4 pt-2 border-t border-gray-700 flex items-center space-x-2">
            <button
              onClick={handleMicClick}
              disabled={isLoading}
              className={`p-3 rounded-full transition-colors disabled:opacity-50 ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
                <MicrophoneIcon />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? 'Listening...' : UI_STRINGS.describeSituation[language]}
              className="flex-grow p-3 bg-gray-800 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 transition-colors">
                <PaperAirplaneIcon />
            </button>
        </div>
      )}
    </div>
  );
};

export default AdvocateScreen;