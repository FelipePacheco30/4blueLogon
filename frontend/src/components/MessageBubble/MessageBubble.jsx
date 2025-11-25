import React from "react";

const CheckIcon = ({ color = "gray", className = "w-5 h-5" }) => {
  const stroke = color === "blue" ? "#2F80ED" : "#9CA3AF";
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function MessageBubble({ message }) {
  const isUser = message.direction === "sent";
  const viewed = !!message.viewed;
  const timeOptions = { hour: "2-digit", minute: "2-digit" };
  const time = new Date(message.created_at).toLocaleTimeString([], timeOptions);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`${isUser ? "msg-user" : "msg-system"} rounded-xl px-5 py-3 max-w-[78%] text-sm`}
      >
        <div className="flex items-end justify-between gap-3">
          <div className="break-words" style={{ whiteSpace: "pre-wrap" }}>
            {message.text}
          </div>

          <div className="ml-3 text-right flex flex-col items-end">
            <div className={isUser ? "msg-time-user" : "msg-time"}>{time}</div>
            {isUser && (
              <div className="mt-1">
                <CheckIcon color={viewed ? "blue" : "gray"} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
