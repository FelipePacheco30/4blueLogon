import React from 'react'

export default function SettingsPage() {
  return (
    <div className="pattern-postlogin" style={{padding:24}}>
      <div className="history-wrapper">
        <div className="history-area">
          <div className="history-title">CONFIGURAÇÕES</div>

          <div style={{width:'100%', maxWidth:720, marginTop:12, background:'rgba(255,255,255,0.03)', padding:20, borderRadius:12}}>
            <h3 style={{color:'#fff', marginBottom:10}}>Gerenciar conta</h3>
            <p style={{color:'rgba(255,255,255,0.85)'}}>Nesta tela serão disponibilizadas opções de perfil e exclusão de histórico. (Funcionalidade ainda não implementada — apenas a interface está sendo exibida.)</p>

            <div style={{marginTop:18, display:'flex', gap:12, alignItems:'center'}}>
              <button style={{background:'#fff', color:'#03417E', padding:'10px 14px', borderRadius:8, border:'none', fontWeight:700}}>Editar perfil</button>
              <button style={{background:'#ffd9d9', color:'#b72828', padding:'10px 14px', borderRadius:8, border:'none', fontWeight:700}}>Excluir histórico (em breve)</button>
            </div>

            <div style={{marginTop:12, color:'rgba(255,255,255,0.6)'}}>Observação: exclusão de histórico será implementada no backend em etapa posterior. Por enquanto este botão é informativo.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
