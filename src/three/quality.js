import { createContext, useContext } from 'react';

/** Highest device-pixel ratio any canvas renders at. */
export const MAX_DPR = 1.5;

export const QualityContext = createContext('high');
/** 'high' once the device has shown it keeps up; 'low' at first and whenever it falls behind (see Adaptive). */
export const useQuality = () => useContext(QualityContext);
