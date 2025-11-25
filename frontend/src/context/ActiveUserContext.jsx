import React, { createContext, useReducer, useEffect } from "react";

export const ActiveUserContext = createContext(null);

const STORAGE_KEY = "4blue_active_user";

const initialState = {
  user:
    (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) || "A",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

export function ActiveUserProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, state.user);
      }
    } catch (e) {}
  }, [state.user]);

  return (
    <ActiveUserContext.Provider value={{ state, dispatch }}>
      {children}
    </ActiveUserContext.Provider>
  );
}
