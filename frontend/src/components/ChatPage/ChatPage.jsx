import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import ChatWindow from "../ChatWindow/ChatWindow";
import MessageInput from "../MessageInput/MessageInput";
import {
  getMessagesByUser,
  postMessage,
  markMessagesViewed,
} from "../../services/api";

export default function ChatPage() {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getMessagesByUser(user.id)
      .then((msgs) => {
        setMessages(Array.isArray(msgs) ? msgs : msgs.results || []);
        return markMessagesViewed(user.id);
      })
      .then(() => getMessagesByUser(user.id))
      .then((refreshed) =>
        setMessages(
          Array.isArray(refreshed) ? refreshed : refreshed.results || []
        )
      )
      .catch((e) => console.error("fetch messages", e))
      .finally(() => setLoading(false));
  }, [user]);

  function scrollToBottom() {
    try {
      if (chatWindowRef.current) {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
      }
    } catch (e) {}
  }

  async function handleSend(text) {
    if (!text?.trim() || !user?.id) return;
    setIsTyping(true);
    try {
      const result = await postMessage({
        user: user.id,
        userName: user.name,
        text,
      });
      await new Promise((r) => setTimeout(r, 480));
      setIsTyping(false);
      const userMsg = {
        id: result.id,
        user: result.user,
        text: result.text,
        direction: "sent",
        created_at: result.created_at || new Date().toISOString(),
        viewed: result.viewed ?? false,
        user_name: result.user_name ?? result.userName ?? user.name,
      };

      const respId = result.response_id || `${result.id}-r`;
      const respMsg = {
        id: respId,
        user: result.user,
        text:
          result.response_text ||
          `Obrigado, ${result.user_name || user.name}. Em breve nossa equipe retornará.`,
        response_text: "",
        direction: "received",
        created_at: new Date().toISOString(),
        viewed: false,
        user_name: result.user_name ?? user.name,
      };

      setMessages((prev) => {
        const next = Array.isArray(prev) ? [...prev] : [];
        const hasUser = next.some((m) => String(m.id) === String(userMsg.id));
        const hasResp = next.some((m) => String(m.id) === String(respMsg.id));
        if (!hasUser) next.push(userMsg);
        if (!hasResp) next.push(respMsg);
        return next;
      });

      markMessagesViewed(user.id).catch(() => {});

      try {
        window.dispatchEvent(
          new CustomEvent("messages:updated", { detail: { user: user.id } })
        );
      } catch (e) {
        const ev = document.createEvent("Event");
        ev.initEvent("messages:updated", true, true);
        window.dispatchEvent(ev);
      }

      setTimeout(scrollToBottom, 80);
    } catch (e) {
      console.error("handleSend error", e);
      setIsTyping(false);
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
                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>{" "}
                Respondendo...
              </div>
            )}
            <MessageInput onSend={handleSend} placeholderWhite />
          </div>
        </div>
      </div>
    </div>
  );
}
