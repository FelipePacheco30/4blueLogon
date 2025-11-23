import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import ChatWindow from '../ChatWindow/ChatWindow'
import MessageInput from '../MessageInput/MessageInput'
import { getMessagesByUser, postMessage, markMessagesViewed } from '../../services/api'

export default function ChatPage() {
  const { user } = useContext(AuthContext)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getMessagesByUser(user.id).then(msgs => {
      setMessages(msgs)
      markMessagesViewed(user.id).then(() => {
        getMessagesByUser(user.id).then(refreshed => setMessages(refreshed))
      })
    }).finally(() => setLoading(false))
  }, [user])

  async function handleSend(text) {
    if (!text?.trim()) return
    setIsTyping(true)
    const result = await postMessage({ user: user.id, text })
    await new Promise(r => setTimeout(r, 480))
    setIsTyping(false)

    setMessages(prev => ([
      ...prev,
      { id: result.id, user: result.user, text: result.text, direction: 'sent', created_at: result.created_at, viewed: true },
      { id: `${result.id}-r`, user: result.user, text: result.response_text, direction: 'received', created_at: new Date().toISOString(), viewed: true }
    ]))
  }

  return (
    <div className="chat-wrapper pattern-postlogin">
      <div className="chat-area">
        <div className="chat-page-title">CHAT</div>

        <div className="chat-card">
          <div className="chat-window">
            <ChatWindow messages={messages} loading={loading} />
          </div>

          <div className="chat-input-wrap">
            {isTyping && (
              <div className="text-sm small-muted mb-2"><div className="typing"><span></span><span></span><span></span></div> Respondendo...</div>
            )}
            <MessageInput onSend={handleSend} placeholderWhite />
          </div>
        </div>
      </div>
    </div>
  )
}
