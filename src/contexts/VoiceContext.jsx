import React, { createContext, useContext } from 'react';
import { useVoice } from '../hooks/useVoice';

const VoiceContext = createContext(null);

export const VoiceProvider = ({ children }) => {
  const voiceState = useVoice();

  return (
    <VoiceContext.Provider value={voiceState}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoiceContext = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoiceContext must be used within VoiceProvider');
  }
  return context;
};
