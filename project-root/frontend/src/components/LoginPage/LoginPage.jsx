import React, { useContext, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'

export default function LoginPage() {
  const { login, availableUsers = [], addAccount } = useContext(AuthContext)

  // selection: existing user id (A/B) or null
  const [selected, setSelected] = useState(availableUsers[0]?.id || null)
  const [submitting, setSubmitting] = useState(false)

  // panels for add/create (visual + minimal functional)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [showCreatePanel, setShowCreatePanel] = useState(false)

  // form states (visual + minimal functional)
  const [addName, setAddName] = useState('')
  const [addPass, setAddPass] = useState('')
  const [createName, setCreateName] = useState('')
  const [createPass, setCreatePass] = useState('')
  const [createConfirm, setCreateConfirm] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    if (!selected) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 450))
    try {
      await login(selected)
    } catch (err) {
      console.warn('login not available or failed (visual)', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Add (quick enter) — creates a new account and logs it in.
  async function handleAddEnter(e) {
    e.preventDefault()
    if (!addName || addName.trim().length < 2) {
      alert('Informe um nome válido para a conta (mínimo 2 caracteres).')
      return
    }

    // create simple id (U + timestamp) — unique for demo
    const id = `U${Date.now()}`
    // flag hasPassword true if a pass was provided (visual only)
    addAccount(id, addName.trim(), { hasPassword: !!addPass })
    // auto-login the created account
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 300))
    try {
      await login(id)
    } catch (err) {
      console.warn('auto-login failed (visual)', err)
    } finally {
      setSubmitting(false)
    }

    // clear visual form state
    setAddName('')
    setAddPass('')
    setShowAddPanel(false)
  }

  // Create account flow (more fields) — creates and logs in the user
  async function handleCreateAccount(e) {
    e.preventDefault()
    if (!createName || createName.trim().length < 2) {
      alert('Informe um nome válido para a conta (mínimo 2 caracteres).')
      return
    }
    if (createPass !== createConfirm) {
      alert('As senhas não conferem (visual).')
      return
    }

    const id = `U${Date.now()}`
    addAccount(id, createName.trim(), { hasPassword: !!createPass })
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 350))
    try {
      await login(id)
    } catch (err) {
      console.warn('auto-login failed (visual)', err)
    } finally {
      setSubmitting(false)
    }

    // reset visual form
    setCreateName('')
    setCreatePass('')
    setCreateConfirm('')
    setShowCreatePanel(false)
    setShowAddPanel(false)
  }

  return (
    <div className="login-split">
      <div className="login-left pattern-login">
        <div className="content">
          {/* preserve original welcome text */}
          <h2 className="bemvindo">Bem-vindo</h2>
          <div className="big-title">Transforme atendimento em resultado.</div>
          <p className="subtitle mt-4">O 4blue Chat entrega respostas personalizadas e histórico — experiência fluida.</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card fade-in">
          <img src="/src/assets/logo-4blue-blue.png" alt="4blue" className="brand-logo" />

          <p className="text-sm small-muted mb-4" style={{ opacity: 0.95 }}>Escolha sua conta para começar</p>

          <form onSubmit={handleLogin} className="w-full space-y-6" aria-label="Form de seleção de usuário">
            <div className="user-selection" role="radiogroup" aria-label="Escolha de usuário">
              {availableUsers.map((u) => {
                const isSel = selected === u.id
                return (
                  <div
                    key={u.id}
                    className={`user-tile ${isSel ? 'selected' : ''}`}
                    onClick={() => {
                      setSelected(u.id)
                      setShowAddPanel(false)
                      setShowCreatePanel(false)
                    }}
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

              {/* Add account visual tile */}
              <div
                className="user-tile add-account"
                role="button"
                aria-pressed={showAddPanel}
                tabIndex={0}
                onClick={() => {
                  setShowAddPanel(v => !v)
                  setShowCreatePanel(false)
                  setSelected(null)
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setShowAddPanel(v => !v); setShowCreatePanel(false); setSelected(null) } }}
                style={{ alignItems: 'center', gap: 8 }}
              >
                <div className="add-account-circle" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="user-label">Adicionar conta</div>
              </div>
            </div>

            <div className="flex gap-2" style={{ width: '100%', justifyContent: 'center' }}>
              {selected && (
                <button type="submit" className="btn-enter flex-1" disabled={submitting} style={{ maxWidth: 360 }}>
                  {submitting ? 'Entrando...' : 'Entrar'}
                </button>
              )}

              {!selected && !showAddPanel && (
                <button type="button" className="btn-enter" disabled style={{ opacity: 0.6, maxWidth: 360 }}>
                  Selecione uma conta
                </button>
              )}
            </div>

            <div className="text-xs small-muted mt-2" style={{ opacity: 0.85 }}>Ao entrar você concorda com os termos — demonstração.</div>
          </form>

          {/* Panels area */}
          <div style={{ width: '100%', marginTop: 12, display: 'flex', justifyContent: 'center' }}>
            {showAddPanel && (
              <form onSubmit={handleAddEnter} className="panel fade-in" aria-label="Painel adicionar conta">
                <input
                  className="input inline"
                  placeholder="Nome da conta"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                />
                <input
                  className="input inline"
                  placeholder="Senha (visual)"
                  type="password"
                  value={addPass}
                  onChange={(e) => setAddPass(e.target.value)}
                />

                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn-enter" style={{ flex: 1 }}>Entrar</button>
                  <button
                    type="button"
                    onClick={() => { setShowCreatePanel(true); setShowAddPanel(false) }}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Criar conta
                  </button>
                </div>
              </form>
            )}

            {showCreatePanel && (
              <form onSubmit={handleCreateAccount} className="panel fade-in" aria-label="Painel criar conta">
                <input
                  className="input inline"
                  placeholder="Nome da conta"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
                <input
                  className="input inline"
                  placeholder="Senha"
                  type="password"
                  value={createPass}
                  onChange={(e) => setCreatePass(e.target.value)}
                />
                <input
                  className="input inline"
                  placeholder="Confirmar senha"
                  type="password"
                  value={createConfirm}
                  onChange={(e) => setCreateConfirm(e.target.value)}
                />

                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn-enter" style={{ flex: 1 }}>Criar conta</button>
                  <button
                    type="button"
                    onClick={() => { setShowCreatePanel(false); setShowAddPanel(true) }}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Voltar
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* footer identical to post-login style */}
          <footer className="app-footer" role="contentinfo" aria-label="Rodapé 4blue" style={{ marginTop: 18 }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
              <div style={{ fontWeight: 700, color: '#fff' }}>4blue</div>
              <div style={{ fontSize: 13, opacity: 0.95, color: '#fff' }}>© {new Date().getFullYear()} 4blue — Atendimento Simulado</div>
              <div style={{ fontSize: 13, opacity: 0.9, color: '#fff' }}>Versão demo</div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
