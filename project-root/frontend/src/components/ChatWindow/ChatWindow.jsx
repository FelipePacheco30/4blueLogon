import React, { useEffect, useRef } from 'react'
import MessageBubble from '../MessageBubble/MessageBubble'

export default function ChatWindow({ messages = [], loading = false }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="flex-1 overflow-auto" style={{ maxHeight: 360 }}>
      <div className="space-y-3">
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-500 p-8">Nenhuma mensagem ainda — envie a primeira!</div>
        )}

        {messages.map(m => (
          <MessageBubble key={String(m.id)} message={m} />
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
