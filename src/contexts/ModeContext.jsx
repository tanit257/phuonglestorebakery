import React, { createContext, useContext, useState, useEffect } from 'react';

// Mode types
export const MODES = {
  REAL: 'real',
  INVOICE: 'invoice',
};

export const MODE_CONFIG = {
  [MODES.REAL]: {
    id: MODES.REAL,
    name: 'Thực tế',
    shortName: 'TT',
    description: 'Quản lý kho hàng và đơn hàng thực tế',
    icon: 'Package',
    color: 'blue',
    bgColor: 'bg-blue-500',
    bgColorLight: 'bg-blue-50',
    bgColorHover: 'hover:bg-blue-600',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-500',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-500',
    shadowColor: 'shadow-blue-500/30',
    ringColor: 'ring-blue-500',
  },
  [MODES.INVOICE]: {
    id: MODES.INVOICE,
    name: 'Hóa đơn',
    shortName: 'HĐ',
    description: 'Quản lý sổ sách và hóa đơn thuế',
    icon: 'FileText',
    color: 'amber',
    bgColor: 'bg-amber-500',
    bgColorLight: 'bg-amber-50',
    bgColorHover: 'hover:bg-amber-600',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-500',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-500',
    shadowColor: 'shadow-amber-500/30',
    ringColor: 'ring-amber-500',
  },
};

const ModeContext = createContext(null);

const STORAGE_KEY = 'phuongle_mode';

export const ModeProvider = ({ children }) => {
  const [mode, setModeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && Object.values(MODES).includes(saved) ? saved : MODES.REAL;
  });

  const [isTransitioning, setIsTransitioning] = useState(false);

  // Save mode to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  // Mode change with transition effect
  const setMode = (newMode) => {
    if (newMode === mode) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setModeState(newMode);
      setIsTransitioning(false);
    }, 150);
  };

  const toggleMode = () => {
    setMode(mode === MODES.REAL ? MODES.INVOICE : MODES.REAL);
  };

  const isRealMode = mode === MODES.REAL;
  const isInvoiceMode = mode === MODES.INVOICE;
  const currentConfig = MODE_CONFIG[mode];

  const value = {
    mode,
    setMode,
    toggleMode,
    isRealMode,
    isInvoiceMode,
    isTransitioning,
    config: currentConfig,
    MODES,
    MODE_CONFIG,
  };

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
};

export default ModeContext;
