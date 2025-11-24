// src/components/HistoryPage/HistoryPage.jsx
import React, { useEffect, useState, useContext, useRef } from 'react'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'

export default function HistoryPage() {
  const { user } = useContext(AuthContext)
  const userId = user?.id

  // mensagens / loading / filtros
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [direction, setDirection] = useState('both') // 'both' | 'sent' | 'received'
  const [error, setError] = useState(null)
  const [openFilter, setOpenFilter] = useState(false)
  const filterRef = useRef(null)

  // paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    if (!userId) return
    // quando usuario muda, buscar e resetar pagina
    setCurrentPage(1)
    fetchMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, direction])

  useEffect(() => {
    const t = setTimeout(() => {
      if (userId) {
        setCurrentPage(1)
        fetchMessages()
      }
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  // Listen for global updates
  useEffect(() => {
    function onUpdated(e) {
      if (!userId) return
      const fromUser = e?.detail?.user
      if (fromUser && fromUser !== userId) return
      setCurrentPage(1)
      fetchMessages()
    }
    window.addEventListener('messages:updated', onUpdated)
    return () => window.removeEventListener('messages:updated', onUpdated)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, direction, search])

  // click outside to close filter
  useEffect(() => {
    function onDoc(e){
      if(filterRef.current && !filterRef.current.contains(e.target)) setOpenFilter(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  function applyLocalFilters(items, { searchTerm, dir }) {
    let out = Array.isArray(items) ? items.slice() : []
    if (dir && dir !== 'both') {
      out = out.filter(m => {
        if (!m.direction) return false
        return dir === 'sent' ? m.direction === 'sent' : m.direction === 'received'
      })
    }
    if (searchTerm && searchTerm.trim() !== '') {
      const q = searchTerm.trim().toLowerCase()
      out = out.filter(m => {
        const a = (m.text || '').toString().toLowerCase()
        const b = (m.response_text || '').toString().toLowerCase()
        return a.includes(q) || b.includes(q)
      })
    }
    return out
  }

 // (substitua a função fetchMessages por esta versão mais robusta)
async function fetchMessages(overrideDirection) {
  setLoading(true)
  setError(null)
  try {
    const dir = overrideDirection !== undefined ? overrideDirection : direction
    const res = await api.getMessagesByUser(userId, { search: search || undefined, direction: dir })

    // normalize response to array
    let arr = Array.isArray(res) ? res.slice() : (res && Array.isArray(res.data) ? res.data.slice() : [])
    if (!Array.isArray(arr)) arr = []

    arr = applyLocalFilters(arr, { searchTerm: search, dir })

    const sorted = arr.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    // reset page to 1 whenever we load a fresh set (calling component logic)
    setCurrentPage(1)
    setMessages(sorted)
  } catch (e) {
    setError('Erro ao buscar mensagens')
    console.error(e)
  } finally {
    setLoading(false)
  }
}


  function formatDateNoSeconds(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // PAGINAÇÃO - índices e fatia para a página atual
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentMessages = messages.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.max(1, Math.ceil(messages.length / itemsPerPage))

  return (
    <div className="pattern-postlogin" style={{ padding: 24, minHeight: '100vh' }}>
      <div className="history-wrapper">
        <div className="history-area">
          <div className="history-title">HISTÓRICO</div>

          <div style={{ width: '100%', maxWidth: 980, marginTop: 12 }}>
            {/* Controls */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="search"
                placeholder="Pesquisar mensagens (texto, resposta)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchMessages() }}
                style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)' }}
                aria-label="Pesquisar mensagens"
              />

              {/* Yellow filter button with dropdown */}
              <div style={{ position: 'relative' }} ref={filterRef}>
                <button
                  onClick={() => setOpenFilter(v => !v)}
                  style={{
                    background: 'var(--ui-yellow, #FFD54A)',
                    color: '#fff',
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontWeight: 800,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer'
                  }}
                  aria-haspopup="true"
                  aria-expanded={openFilter}
                >
                  Filtro: {direction === 'both' ? 'Ambas' : direction === 'sent' ? 'Usuário' : 'Sistema'}
                  <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>

                {openFilter && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'rgba(2,20,42,0.98)', color: '#fff',
                    boxShadow: '0 12px 36px rgba(2,20,42,0.24)', borderRadius: 10, padding: 8, minWidth: 200, zIndex: 200
                  }}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        const newDir = 'both'
                        setDirection(newDir)
                        setOpenFilter(false)
                        fetchMessages(newDir)
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { const newDir = 'both'; setDirection(newDir); setOpenFilter(false); fetchMessages(newDir) } }}
                      style={{ padding: 10, borderRadius: 8, cursor: 'pointer' }}
                    >
                      Ambas
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        const newDir = 'sent'
                        setDirection(newDir)
                        setOpenFilter(false)
                        fetchMessages(newDir)
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { const newDir = 'sent'; setDirection(newDir); setOpenFilter(false); fetchMessages(newDir) } }}
                      style={{ padding: 10, borderRadius: 8, cursor: 'pointer' }}
                    >
                      Usuário
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        const newDir = 'received'
                        setDirection(newDir)
                        setOpenFilter(false)
                        fetchMessages(newDir)
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { const newDir = 'received'; setDirection(newDir); setOpenFilter(false); fetchMessages(newDir) } }}
                      style={{ padding: 10, borderRadius: 8, cursor: 'pointer' }}
                    >
                      Sistema
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Result list */}
            <div>
              {loading && <div style={{ padding: 16 }}>Carregando...</div>}
              {error && <div style={{ color: '#f33', padding: 12 }}>{error}</div>}

              {!loading && messages.length === 0 && <div style={{ padding: 12, color: 'rgba(255,255,255,0.8)' }}>Nenhuma mensagem encontrada.</div>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {currentMessages.map((m) => (
                  <div key={m.id} className="history-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, marginBottom: 6, color: '#fff' }}>
                        {m.direction === 'sent' ? 'Usuário' : 'Sistema'} • {formatDateNoSeconds(m.created_at)}
                      </div>
                      <div style={{ color: '#fff' }}>{m.text}</div>
                      {m.response_text ? <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>{m.response_text}</div> : null}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <div style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>
                        {m.viewed ? 'Visualizada' : 'Não visualizada'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {messages.length > itemsPerPage && (
                <div className="history-pagination" role="navigation" aria-label="Paginação de histórico">
                  <button
                    type="button"
                    className="page-arrow"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M15 6l-6 6 6 6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {[...Array(totalPages)].map((_, idx) => {
                    const page = idx + 1
                    const active = page === currentPage
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`page-num ${active ? '' : 'inactive'}`}
                        aria-current={active ? 'page' : undefined}
                        aria-label={`Página ${page}`}
                      >
                        {page}
                      </button>
                    )
                  })}

                  <button
                    type="button"
                    className="page-arrow"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Próxima página"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M9 6l6 6-6 6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
