"use client";

import React, { createContext, useContext, useState } from "react";
import { LiveSlidePresentation } from "../../../types/LiveSlides";

export type PresentationProviderProps = {
  presentation: LiveSlidePresentation | undefined;
  setPresentation: (presentation: LiveSlidePresentation) => void;
};

const initialState: PresentationProviderProps = {
  presentation: undefined,
  setPresentation: () => {},
};

const PresentationContext = createContext(initialState);

export function PresentationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [presentation, setPresentation] = useState<
    LiveSlidePresentation | undefined
  >();

  return (
    <PresentationContext.Provider value={{ presentation, setPresentation }}>
      {children}
    </PresentationContext.Provider>
  );
}

export function usePresentationContext() {
  return useContext(PresentationContext);
}
