import React, { useEffect, useRef, useMemo } from "react";
import MessageBubble from "../MessageBubble/MessageBubble";

export default function ChatWindow({ messages = [], loading = false }) {
  const bottomRef = useRef(null);

  const list = useMemo(() => {
    if (Array.isArray(messages)) return messages;
    if (!messages) return [];

    if (Array.isArray(messages.data)) return messages.data;
    if (Array.isArray(messages.messages)) return messages.messages;

    try {
      const vals = Object.values(messages).filter((v) => Array.isArray(v));
      if (vals.length) return vals[0];
    } catch (e) {}
    return [];
  }, [messages]);

  useEffect(() => {
    const t = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(t);
  }, [list.length, loading]);

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
        {!loading && list.length === 0 && (
          <div className="text-center text-gray-500 p-8">
            Nenhuma mensagem — envie a primeira.
          </div>
        )}

        {list.map((m) => (
          <div key={String(m.id)} className="fade-in">
            <MessageBubble message={m} />
          </div>
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
