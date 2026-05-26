import React, { createContext, useContext, useState } from 'react';

export type PlanMode = 'exclusive' | 'shared';

interface PlanModeContextValue {
  planMode: PlanMode;
  setPlanMode: (mode: PlanMode) => void;
}

const PlanModeContext = createContext<PlanModeContextValue>({
  planMode: 'exclusive',
  setPlanMode: () => {},
});

export const PlanModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [planMode, setPlanMode] = useState<PlanMode>('shared');
  return (
    <PlanModeContext.Provider value={{ planMode, setPlanMode }}>
      {children}
    </PlanModeContext.Provider>
  );
};

export const usePlanMode = () => useContext(PlanModeContext);
