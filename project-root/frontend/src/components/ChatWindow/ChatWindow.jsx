import React, { useEffect, useRef } from 'react'
import MessageBubble from '../MessageBubble/MessageBubble'

export default function ChatWindow({ messages = [], loading = false }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="relative flex-1 overflow-auto" style={{ maxHeight: 380 }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/30 z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="spinner" />
            <div className="text-sm text-gray-600">Carregando histórico...</div>
          </div>
        </div>
      )}

      <div className="space-y-3 p-2">
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-500 p-8">Nenhuma mensagem — envie a primeira.</div>
        )}

        {messages.map(m => (
          <div key={String(m.id)} className="fade-in">
            <MessageBubble message={m} />
          </div>
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
