import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceContext } from '../../contexts/VoiceContext';

export const VoiceButton = ({ onResult }) => {
  const {
    isListening,
    isProcessing,
    startListening,
    stopListening,
    isSupported,
  } = useVoiceContext();
  
  if (!isSupported) return null;
  
  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  return (
    <>
      {/* Mobile: Floating button */}
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className={`
          lg:hidden fixed bottom-6 right-4 z-40
          w-16 h-16 rounded-full shadow-2xl
          flex items-center justify-center
          transition-all duration-300
          ${isListening
            ? 'bg-rose-500 voice-pulse scale-110'
            : isProcessing
              ? 'bg-amber-500'
              : 'bg-gradient-to-br from-violet-500 to-purple-600 hover:scale-110 hover:shadow-violet-500/30'
          }
        `}
        title={isListening ? 'Dừng nghe' : 'Bấm để nói'}
      >
        {isProcessing ? (
          <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
        ) : isListening ? (
          <MicOff size={28} className="text-white" />
        ) : (
          <Mic size={28} className="text-white" />
        )}
      </button>

      {/* Desktop: Fixed button in sidebar */}
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className={`
          hidden lg:flex fixed bottom-8 right-8 z-50
          w-20 h-20 rounded-2xl shadow-2xl
          items-center justify-center
          transition-all duration-300
          ${isListening
            ? 'bg-rose-500 voice-pulse scale-110'
            : isProcessing
              ? 'bg-amber-500'
              : 'bg-gradient-to-br from-violet-500 to-purple-600 hover:scale-110 hover:shadow-violet-500/50'
          }
        `}
        title={isListening ? 'Dừng nghe' : 'Bấm để nói'}
      >
        {isProcessing ? (
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        ) : isListening ? (
          <MicOff size={32} className="text-white" />
        ) : (
          <Mic size={32} className="text-white" />
        )}
      </button>
    </>
  );
};

export default VoiceButton;
