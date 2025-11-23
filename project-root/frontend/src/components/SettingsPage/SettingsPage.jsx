// src/components/SettingsPage/SettingsPage.jsx
import React, { useContext, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'

export default function SettingsPage() {
  const { user } = useContext(AuthContext)
  const [confirmInput, setConfirmInput] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const activeId = user?.id

  async function handleDeleteHistory() {
    if (!activeId) return setStatus({ type: 'error', text: 'Nenhum usuário ativo.' })
    if (confirmInput !== 'Excluir') {
      return setStatus({ type: 'error', text: `Digite exatamente "Excluir" para confirmar.` })
    }
    setLoading(true)
    setStatus(null)
    try {
      const res = await api.deleteHistory(activeId)
      setStatus({ type: 'success', text: `Histórico do usuário ${activeId} deletado (${res.deleted_count} registros).` })
      setConfirmInput('')
      // notify others
      try {
        window.dispatchEvent(new CustomEvent('messages:updated', { detail: { user: activeId } }))
      } catch (e) {}
    } catch (e) {
      console.error(e)
      setStatus({ type: 'error', text: 'Falha ao deletar histórico.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pattern-postlogin" style={{ padding: 24, minHeight: '100vh' }}>
      <div className="history-wrapper">
        <div className="history-area">
          <div className="history-title">CONFIGURAÇÕES</div>

          <div style={{ width: '100%', maxWidth: 720, marginTop: 12, background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 12 }}>
            <h3 style={{ color: '#fff', marginBottom: 10 }}>Gerenciar conta</h3>
            <p style={{ color: 'rgba(255,255,255,0.85)' }}>
              Nesta tela você pode excluir o histórico de mensagens do usuário ativo. Para confirmar, digite <strong style={{color:'#fff'}}>Excluir</strong> no campo abaixo e clique em "Excluir histórico".
            </p>

            <div style={{ marginTop: 18, display: 'flex', gap: 12, flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  placeholder={`Digite "Excluir" para confirmar`}
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  style={{ padding: 10, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', flex: 1 }}
                />
                <button onClick={handleDeleteHistory} disabled={loading} style={{ background: '#ffd9d9', color: '#b72828', padding: '10px 14px', borderRadius: 8, border: 'none', fontWeight: 700 }}>
                  {loading ? 'Excluindo...' : 'Excluir histórico'}
                </button>
              </div>

              {status && (
                <div style={{ marginTop: 6, color: status.type === 'error' ? '#ffb3b3' : '#bff0c9' }}>
                  {status.text}
                </div>
              )}

              <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.6)' }}>
                Observação: exclusão de histórico remove todos os registros do usuário. Esta operação é irreversível.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
