import React from 'react'
import classNames from 'classnames'

export default function MessageBubble({ message }) {
  const isUser = message.direction === 'sent'
  return (
    <div className={classNames('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={classNames('rounded-xl px-4 py-2 max-w-[75%] text-sm', {
          'bg-white border border-blue-mid text-blue-deep': isUser,
          'bg-blue-mid/90 text-white': !isUser
        })}
      >
        <div>{message.text}</div>
        <div className="text-xs mt-2 text-gray-200/80 text-right">
          {new Date(message.created_at).toLocaleString()}
        </div>
      </div>
    </div>
  )
}
