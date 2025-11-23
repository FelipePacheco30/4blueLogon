import React, { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import ChatWindow from '../ChatWindow/ChatWindow'
import MessageInput from '../MessageInput/MessageInput'
import { getMessagesByUser, postMessage, markMessagesViewed } from '../../services/api'

export default function ChatPage() {
  const { user } = useContext(AuthContext)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const chatWindowRef = useRef(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    // prime load: fetch + mark viewed then refresh
    getMessagesByUser(user.id)
      .then(msgs => {
        setMessages(msgs)
        return markMessagesViewed(user.id)
      })
      .then(() => {
        // re-sync after mark viewed
        return getMessagesByUser(user.id)
      })
      .then(refreshed => setMessages(refreshed))
      .catch(e => console.error('fetch messages', e))
      .finally(() => setLoading(false))
  }, [user])

  // helper to scroll to bottom
  function scrollToBottom() {
    try {
      if (chatWindowRef.current) {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
      }
    } catch (e) { /* ignore */ }
  }

  async function handleSend(text) {
    if (!text?.trim() || !user?.id) return
    setIsTyping(true)
    try {
      const result = await postMessage({ user: user.id, text })
      // small delay to simulate typing (existing behavior)
      await new Promise(r => setTimeout(r, 480))
      setIsTyping(false)

      // Build user message object
      const userMsg = {
        id: result.id,
        user: result.user,
        text: result.text,
        direction: 'sent',
        created_at: result.created_at || new Date().toISOString(),
        viewed: result.viewed ?? false
      }

      // Build response object (backend returns response_text and maybe response_id)
      const respId = result.response_id || `${result.id}-r`
      const respMsg = {
        id: respId,
        user: result.user,
        text: result.response_text || (result.user === 'A'
          ? 'Obrigado, Usuário A. Em breve nossa equipe retornará.'
          : 'Recebido, Usuário B. Um especialista responderá logo.'),
        response_text: '',
        direction: 'received',
        created_at: new Date().toISOString(),
        viewed: false
      }

      // Append to local messages state (avoid duplicates)
      setMessages(prev => {
        const next = Array.isArray(prev) ? [...prev] : []
        const hasUser = next.some(m => String(m.id) === String(userMsg.id))
        const hasResp = next.some(m => String(m.id) === String(respMsg.id))
        if (!hasUser) next.push(userMsg)
        if (!hasResp) next.push(respMsg)
        return next
      })

      // attempt to mark messages viewed on backend (best-effort)
      markMessagesViewed(user.id).catch(() => {})

      // notify other listeners (HistoryPage) to refresh
      try {
        window.dispatchEvent(new CustomEvent('messages:updated', { detail: { user: user.id } }))
      } catch (e) {
        // fallback for older browsers
        const ev = document.createEvent('Event')
        ev.initEvent('messages:updated', true, true)
        window.dispatchEvent(ev)
      }

      // scroll to bottom after UI update
      setTimeout(scrollToBottom, 80)
    } catch (e) {
      console.error('handleSend error', e)
      setIsTyping(false)
      // optionally surface UI error
    }
  }

  return (
    <div className="chat-wrapper pattern-postlogin">
      <div className="chat-area">
        <div className="chat-page-title">CHAT</div>

        <div className="chat-card">
          <div className="chat-window" ref={chatWindowRef}>
            <ChatWindow messages={messages} loading={loading} />
          </div>

          <div className="chat-input-wrap">
            {isTyping && (
              <div className="text-sm small-muted mb-2">
                <div className="typing"><span></span><span></span><span></span></div> Respondendo...
              </div>
            )}
            <MessageInput onSend={handleSend} placeholderWhite />
          </div>
        </div>
      </div>
    </div>
  )
}
