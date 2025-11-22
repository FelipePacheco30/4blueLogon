import React, { useContext, useEffect, useState } from 'react'
import { ActiveUserContext } from '../../context/ActiveUserContext'
import ChatWindow from '../ChatWindow/ChatWindow'
import MessageInput from '../MessageInput/MessageInput'
import { getMessagesByUser, postMessage } from '../../services/api'

export default function ChatPage() {
  const { state } = useContext(ActiveUserContext)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getMessagesByUser(state.user).then(msgs => {
      setMessages(msgs)
      setLoading(false)
    })
  }, [state.user])

  async function handleSend(text) {
    // disable input handled inside MessageInput via promise
    const result = await postMessage({ user: state.user, text })
    // result has text + response_text
    // update local state: add sent and response immediately
    setMessages(prev => {
      const appended = [
        ...prev,
        { id: result.id, user: result.user, text: result.text, response_text: '', created_at: result.created_at, direction: 'sent' },
        { id: result.id + 0.5, user: result.user, text: result.response_text, response_text: '', created_at: new Date().toISOString(), direction: 'received' }
      ]
      // sort by created_at
      return appended.sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
    })
    return true
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Chat de Atendimento (Usuário {state.user})</h2>

      <div className="bg-white rounded-xl shadow p-4 flex flex-col" style={{ minHeight: 420 }}>
        <ChatWindow messages={messages} loading={loading} />
        <div className="mt-4">
          <MessageInput onSend={handleSend} />
        </div>
      </div>
    </div>
  )
}
