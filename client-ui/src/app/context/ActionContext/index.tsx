"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Action } from "../../../types/LiveSlides";

export type ActionProviderProps<Action> = {
  action: Action;
  setAction: (action: Action) => void;
};

const initialState: ActionProviderProps<any> = {
  action: new Action(),
  setAction: () => {},
};

export const ActionContext = createContext(initialState);

// export function ActionContextProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [action, setAction] = useState<Action | undefined>();

//   useEffect(() => {
//     console.log(`ActionContext - action updated`, action);
//   }, [action]);

//   return (
//     <ActionContext.Provider value={{ action, setAction }}>
//       {children}
//     </ActionContext.Provider>
//   );
// }

export function useActionContext() {
  return useContext(ActionContext);
}
