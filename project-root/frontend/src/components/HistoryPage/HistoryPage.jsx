import React, { useContext, useEffect, useState } from 'react'
import { ActiveUserContext } from '../../context/ActiveUserContext'
import { getMessagesByUser } from '../../services/api'

export default function HistoryPage() {
  const { state } = useContext(ActiveUserContext)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getMessagesByUser(state.user)
      .then(setMessages)
      .finally(() => setLoading(false))
  }, [state.user])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Histórico — Usuário {state.user}</h2>

      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <ul className="space-y-3">
            {messages.length === 0 && <li className="text-gray-500">Sem mensagens para este usuário.</li>}
            {messages.map(m => (
              <li key={String(m.id)} className="p-3 border rounded">
                <div className="text-sm font-medium">
                  {m.direction === 'sent' ? 'Enviado' : 'Recebido'} — <span className="text-gray-500">{new Date(m.created_at).toLocaleString()}</span>
                </div>
                <div className="mt-1">{m.text}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
