import React, { useState } from "react";

export default function MessageInput({ onSend, placeholderWhite = false }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e) {
    e?.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await onSend(text.trim());
      setText("");
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-3 items-center">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        className={`chat-input ${placeholderWhite ? "input-placeholder-white" : ""}`}
        placeholder="Escreva sua mensagem e pressione Enter para enviar..."
        aria-label="mensagem"
      />
      <button
        type="submit"
        disabled={sending}
        className="btn-send"
        style={{
          background: "var(--brand-top)",
          color: "#fff",
          border: "none",
        }}
      >
        {sending ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
