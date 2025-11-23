import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { getMessagesByUser } from '../../services/api'

export default function HistoryPage() {
  const { user } = useContext(AuthContext)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!user) return
    getMessagesByUser(user.id).then(msgs => {
      setMessages(msgs)
    })
  }, [user])

  return (
    <div className="pattern-postlogin" style={{padding:24}}>
      <div className="history-wrapper">
        <div className="history-area">
          <div className="history-title">HISTÓRICO</div>

          <div style={{width:'100%'}}>
            {messages.length === 0 && <div className="text-sm" style={{color:'rgba(255,255,255,0.9)'}}>Nenhuma mensagem encontrada.</div>}

            {messages.map((m) => (
              <div key={m.id} className="history-card mb-3">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{fontWeight:700, color:'#fff'}}>{m.direction === 'sent' ? 'Você' : 'Sistema'}</div>
                  <div style={{fontSize:12, color:'rgba(255,255,255,0.85)'}}>{new Date(m.created_at).toLocaleString([], {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'})}</div>
                </div>
                <div style={{marginTop:8, color:'#fff'}}>{m.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
