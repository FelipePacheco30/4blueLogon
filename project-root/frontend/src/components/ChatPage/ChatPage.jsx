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

  // helper to coerce API response into an array
  function normalizeResponseToArray(res) {
    if (!res) return []
    if (Array.isArray(res)) return res
    if (res.data && Array.isArray(res.data)) return res.data
    // fallback: maybe server returns { messages: [...] }
    if (res.messages && Array.isArray(res.messages)) return res.messages
    return []
  }

  // load messages on user change
  useEffect(() => {
    if (!user?.id) return
    let mounted = true
    setLoading(true)

    getMessagesByUser(user.id)
      .then((res) => {
        if (!mounted) return
        const arr = normalizeResponseToArray(res)
        // sort newest last (ascending)
        const sorted = arr.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        setMessages(sorted)
        // attempt to mark viewed (best-effort)
        return markMessagesViewed(user.id).catch(() => null)
      })
      .then(() => {
        // re-fetch to sync server-side changes after mark viewed
        return getMessagesByUser(user.id).catch(() => null)
      })
      .then((resRefreshed) => {
        if (!mounted) return
        const arr = normalizeResponseToArray(resRefreshed)
        const sorted = arr.slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        setMessages(sorted)
      })
      .catch((e) => {
        console.error('fetch messages', e)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => { mounted = false }
  }, [user])

  // helper to scroll to bottom of chat card's scroll container
  function scrollToBottom() {
    try {
      if (chatWindowRef.current) {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
      }
    } catch (e) { /* ignore */ }
  }

  // send message
 // ChatPage.jsx (handleSend)
// dentro de ChatPage.jsx: certifique-se de importar postMessage no topo:
// import { getMessagesByUser, postMessage, markMessagesViewed } from '../../services/api'

async function handleSend(text) {
  if (!text?.trim() || !user?.id) return
  setIsTyping(true)
  try {
    const result = await postMessage({
      user: user.id,
      userName: user.name || '', // importante para as respostas usarem o nome atual
      text: text
    })

    // small delay to simulate typing
    await new Promise(r => setTimeout(r, 480))
    setIsTyping(false)

    const userMsg = {
      id: result.id,
      user: result.user,
      text: result.text,
      direction: 'sent',
      created_at: result.created_at || new Date().toISOString(),
      viewed: result.viewed ?? false
    }

    const respId = result.response_id || `${result.id}-r`
    const respMsg = {
      id: respId,
      user: result.user,
      text: result.response_text || (`Resposta automática para ${result.user_name || result.user}`),
      direction: 'received',
      created_at: new Date().toISOString(),
      viewed: false
    }

    setMessages(prev => {
      const next = Array.isArray(prev) ? [...prev] : []
      if (!next.some(m => String(m.id) === String(userMsg.id))) next.push(userMsg)
      if (!next.some(m => String(m.id) === String(respMsg.id))) next.push(respMsg)
      return next
    })

    // best-effort mark viewed
    markMessagesViewed(user.id).catch((e) => {
      console.warn('markMessagesViewed failed', e)
    })

    // notify listeners
    try {
      window.dispatchEvent(new CustomEvent('messages:updated', { detail: { user: user.id } }))
    } catch (e) {
      const ev = document.createEvent('Event')
      ev.initEvent('messages:updated', true, true)
      window.dispatchEvent(ev)
    }

    setTimeout(scrollToBottom, 80)
  } catch (e) {
    console.error('handleSend error', e)
    setIsTyping(false)
    // show visual feedback if you want
  }
}

  return (
    <div className="chat-wrapper pattern-postlogin">
      <div className="chat-area">
        <div className="chat-page-title">CHAT</div>

        <div className="chat-card">
          {/* Outer scroll container (kept for layout) */}
          <div className="chat-window" ref={chatWindowRef} style={{ maxHeight: 520 }}>
            <ChatWindow messages={Array.isArray(messages) ? messages : []} loading={loading} />
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
