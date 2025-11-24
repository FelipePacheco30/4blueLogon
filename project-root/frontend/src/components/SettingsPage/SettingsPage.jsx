import React, { useContext, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'

export default function SettingsPage() {
  const { user } = useContext(AuthContext) || {}
  const currentName = user?.name || ''

  // accordion state
  const [openUsername, setOpenUsername] = useState(false)
  const [openPassword, setOpenPassword] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  // username form
  const [usernameCurrent, setUsernameCurrent] = useState('')
  const [usernameNew, setUsernameNew] = useState('')
  const [usernameMsg, setUsernameMsg] = useState(null) // { type: 'success'|'error', text }

  // password form
  const [pwdCurrent, setPwdCurrent] = useState('')
  const [pwdNew, setPwdNew] = useState('')
  const [pwdConfirm, setPwdConfirm] = useState('')
  const [pwdMsg, setPwdMsg] = useState(null)

  // delete history
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)
  const [deleteMsg, setDeleteMsg] = useState(null)

  // simulate submit handlers (UI only)
  function handleUsernameConfirm(e) {
    e.preventDefault()
    setUsernameMsg(null)

    if (!usernameCurrent || !usernameNew) {
      setUsernameMsg({ type: 'error', text: 'Preencha ambos os campos.' })
      return
    }

    if (usernameCurrent !== currentName) {
      setUsernameMsg({ type: 'error', text: 'O nome atual não confere. Verifique.' })
      return
    }

    setUsernameMsg({ type: 'success', text: 'Nome atualizado com sucesso (simulado).' })
    setUsernameCurrent('')
    setUsernameNew('')
  }

  function handlePasswordConfirm(e) {
    e.preventDefault()
    setPwdMsg(null)

    if (!pwdCurrent || !pwdNew || !pwdConfirm) {
      setPwdMsg({ type: 'error', text: 'Preencha todos os campos.' })
      return
    }

    if (pwdNew !== pwdConfirm) {
      setPwdMsg({ type: 'error', text: 'A nova senha e a confirmação não conferem.' })
      return
    }

    if (pwdNew.length < 6) {
      setPwdMsg({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' })
      return
    }

    setPwdMsg({ type: 'success', text: 'Senha alterada com sucesso (simulado).' })
    setPwdCurrent(''); setPwdNew(''); setPwdConfirm('')
  }

  function handleDeleteHistory(e) {
    e.preventDefault()
    setDeleteMsg(null)

    if (!deleteConfirmed) {
      setDeleteMsg({ type: 'error', text: 'Marque a confirmação antes de excluir.' })
      return
    }

    // simulate deletion
    setDeleteMsg({ type: 'success', text: 'Histórico excluído (simulado).' })
    setDeleteConfirmed(false)
  }

  return (
    <div className="pattern-postlogin" style={{ padding: 24, minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 980, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h2 className="history-title" style={{ marginBottom: 4 }}>Configurações</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 0, marginBottom: 12 }}>Gerencie suas informações de conta (UI somente).</p>

        {/* Edit username section */}
        <section className="settings-section" aria-labelledby="edit-username-heading">
          <header
            id="edit-username-heading"
            className="settings-header"
            role="button"
            aria-expanded={openUsername}
            onClick={() => { setOpenUsername(v => !v) }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpenUsername(v => !v) }}
            tabIndex={0}
          >
            <div>
              <div style={{ fontWeight: 800, color: '#fff' }}>Editar nome de usuário</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Digite seu nome atual e o novo nome desejado.</div>
            </div>
            <div className={`chev ${openUsername ? 'open' : ''}`} aria-hidden style={{ color: '#fff' }}>▾</div>
          </header>

          <div className={`settings-body ${openUsername ? 'open' : ''}`}>
            <form onSubmit={handleUsernameConfirm} className="panel" aria-label="Editar nome de usuário - formulário">
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.95)' }}>Nome atual</label>
              <input
                className="input"
                value={usernameCurrent}
                onChange={(e) => setUsernameCurrent(e.target.value)}
                placeholder={currentName || 'Insira seu nome atual'}
                aria-label="Nome atual"
              />

              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.95)' }}>Novo nome</label>
              <input
                className="input"
                value={usernameNew}
                onChange={(e) => setUsernameNew(e.target.value)}
                placeholder="Novo nome"
                aria-label="Novo nome"
              />

              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button type="submit" className="btn-enter" disabled={!usernameCurrent || !usernameNew}>Confirmar</button>
                <button type="button" className="btn-secondary" onClick={() => { setUsernameCurrent(''); setUsernameNew(''); setUsernameMsg(null) }}>Limpar</button>
              </div>

              {usernameMsg && (
                <div style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 8,
                  background: usernameMsg.type === 'success' ? 'rgba(10,120,60,0.12)' : 'rgba(183,40,40,0.08)',
                  color: usernameMsg.type === 'success' ? '#9EE6B9' : '#FFCCCC',
                  fontWeight: 700
                }}>
                  {usernameMsg.text}
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Change password section */}
        <section className="settings-section" aria-labelledby="change-password-heading">
          <header
            id="change-password-heading"
            className="settings-header"
            role="button"
            aria-expanded={openPassword}
            onClick={() => { setOpenPassword(v => !v) }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpenPassword(v => !v) }}
            tabIndex={0}
          >
            <div>
              <div style={{ fontWeight: 800, color: '#fff' }}>Trocar senha</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Insira a senha atual e defina uma nova senha.</div>
            </div>
            <div className={`chev ${openPassword ? 'open' : ''}`} aria-hidden style={{ color: '#fff' }}>▾</div>
          </header>

          <div className={`settings-body ${openPassword ? 'open' : ''}`}>
            <form onSubmit={handlePasswordConfirm} className="panel" aria-label="Trocar senha - formulário">
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.95)' }}>Senha atual</label>
              <input
                type="password"
                className="input"
                value={pwdCurrent}
                onChange={(e) => setPwdCurrent(e.target.value)}
                placeholder="Senha atual"
                aria-label="Senha atual"
              />

              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.95)' }}>Nova senha</label>
              <input
                type="password"
                className="input"
                value={pwdNew}
                onChange={(e) => setPwdNew(e.target.value)}
                placeholder="Nova senha"
                aria-label="Nova senha"
              />

              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.95)' }}>Confirmar nova senha</label>
              <input
                type="password"
                className="input"
                value={pwdConfirm}
                onChange={(e) => setPwdConfirm(e.target.value)}
                placeholder="Confirmar nova senha"
                aria-label="Confirmar nova senha"
              />

              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button type="submit" className="btn-enter" disabled={!pwdCurrent || !pwdNew || !pwdConfirm}>Confirmar</button>
                <button type="button" className="btn-secondary" onClick={() => { setPwdCurrent(''); setPwdNew(''); setPwdConfirm(''); setPwdMsg(null) }}>Limpar</button>
              </div>

              {pwdMsg && (
                <div style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 8,
                  background: pwdMsg.type === 'success' ? 'rgba(10,120,60,0.12)' : 'rgba(183,40,40,0.08)',
                  color: pwdMsg.type === 'success' ? '#9EE6B9' : '#FFCCCC',
                  fontWeight: 700
                }}>
                  {pwdMsg.text}
                </div>
              )}
            </form>
          </div>
        </section>

        {/* Delete history section */}
        <section className="settings-section" aria-labelledby="delete-history-heading">
          <header
            id="delete-history-heading"
            className="settings-header"
            role="button"
            aria-expanded={openDelete}
            onClick={() => { setOpenDelete(v => !v) }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpenDelete(v => !v) }}
            tabIndex={0}
          >
            <div>
              <div style={{ fontWeight: 800, color: '#fff' }}>Excluir histórico</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Remover todas as mensagens do seu histórico (simulado).</div>
            </div>
            <div className={`chev ${openDelete ? 'open' : ''}`} aria-hidden style={{ color: '#fff' }}>▾</div>
          </header>

          <div className={`settings-body ${openDelete ? 'open' : ''}`}>
            <form onSubmit={handleDeleteHistory} className="panel" aria-label="Excluir histórico - confirmação">
              <div className="settings-warning" role="status" aria-live="polite">
                ATENÇÃO — Esta ação removerá todo o histórico de mensagens local (simulado). Não é reversível nesta demonstração.
              </div>

              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.95)' }}>Marque para confirmar</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <input type="checkbox" id="confirmDelete" checked={deleteConfirmed} onChange={(e) => setDeleteConfirmed(e.target.checked)} />
                  <label htmlFor="confirmDelete" style={{ color: 'rgba(255,255,255,0.95)' }}>Confirmo que desejo excluir todo o histórico</label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button type="submit" className="btn-enter" style={{ background: 'var(--ui-yellow)', color: '#fff' }}>Excluir histórico</button>
                <button type="button" className="btn-secondary" onClick={() => { setDeleteConfirmed(false); setDeleteMsg(null) }}>Cancelar</button>
              </div>

              {deleteMsg && (
                <div style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 8,
                  background: deleteMsg.type === 'success' ? 'rgba(10,120,60,0.12)' : 'rgba(183,40,40,0.08)',
                  color: deleteMsg.type === 'success' ? '#9EE6B9' : '#FFCCCC',
                  fontWeight: 700
                }}>
                  {deleteMsg.text}
                </div>
              )}
            </form>
          </div>
        </section>

        <div style={{ height: 24 }} />

        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
          Observação: estas seções são puramente visuais por enquanto — integração com backend será adicionada posteriormente.
        </div>
      </div>
    </div>
  )
}
