import React, { useState } from 'react'

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    try {
      await onSend(text.trim())
      setText('')
    } catch (err) {
      console.error('send error', err)
      alert('Erro ao enviar mensagem.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-3 items-center">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-mid"
        placeholder="Digite sua mensagem..."
        aria-label="mensagem"
      />
      <button
        type="submit"
        disabled={sending}
        className="bg-blue-mid text-white rounded-full px-4 py-2 disabled:opacity-60"
      >
        {sending ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  )
}
