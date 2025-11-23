import React, { useContext, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'

export default function LoginPage() {
  const { login, availableUsers } = useContext(AuthContext)
  const [selected, setSelected] = useState(availableUsers[0].id)
  const [submitting, setSubmitting] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 450))
    login(selected)
    setSubmitting(false)
  }

  return (
    <div className="login-split">
      <div className="login-left pattern-login">
        <div className="content">
          <h2 className="bemvindo">Bem-vindo</h2>
          <div className="big-title">Transforme atendimento em resultado.</div>
          <p className="subtitle mt-4">O 4blue Chat entrega respostas personalizadas e histórico — experiência fluida.</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card fade-in">
          <img src="/src/assets/logo-4blue-blue.png" alt="4blue" className="brand-logo" />

          <p className="text-sm small-muted mb-4" style={{opacity:0.95}}>Escolha sua conta para começar</p>

          <form onSubmit={handleLogin} className="w-full space-y-6">
            <div className="user-selection" role="radiogroup" aria-label="Escolha de usuário">
              {availableUsers.map((u) => {
                const isSel = selected === u.id
                return (
                  <div
                    key={u.id}
                    className={`user-tile ${isSel ? 'selected' : ''}`}
                    onClick={() => setSelected(u.id)}
                    aria-checked={isSel}
                    role="radio"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelected(u.id) }}
                  >
                    <div className="user-avatar" aria-hidden>
                      <img src="/src/assets/4icon.png" alt={`Avatar ${u.id}`} />
                    </div>

                    <div className="user-label">{u.name}</div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-enter flex-1" disabled={submitting}>
                {submitting ? 'Entrando...' : 'Entrar'}
              </button>
            </div>

            <div className="text-xs small-muted mt-2" style={{opacity:0.85}}>Ao entrar você concorda com os termos — demonstração.</div>
          </form>
        </div>
      </div>
    </div>
  )
}
