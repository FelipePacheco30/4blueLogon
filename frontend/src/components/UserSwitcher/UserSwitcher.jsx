import React, { useContext } from 'react';
import { ActiveUserContext } from '../../context/ActiveUserContext';

export default function UserSwitcher() {
  const { state, dispatch } = useContext(ActiveUserContext);
  const active = state?.user || 'A';

  function setUser(u) {
    dispatch({ type: 'SET_USER', payload: u });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        aria-pressed={active === 'A'}
        onClick={() => setUser('A')}
        className={`rounded-full px-3 py-1 text-sm font-semibold transition-shadow
                    ${active === 'A' ? 'bg-white text-blue-deep shadow' : 'bg-transparent text-white/90 border border-white/10'}`}
      >
        Usuário A
      </button>
      <button
        aria-pressed={active === 'B'}
        onClick={() => setUser('B')}
        className={`rounded-full px-3 py-1 text-sm font-semibold transition-shadow
                    ${active === 'B' ? 'bg-white text-blue-deep shadow' : 'bg-transparent text-white/90 border border-white/10'}`}
      >
        Usuário B
      </button>
    </div>
  );
}
