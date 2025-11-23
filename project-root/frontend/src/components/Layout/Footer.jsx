import React from 'react'

export default function Footer() {
  return (
    <footer className="app-footer" role="contentinfo" aria-label="Rodapé 4blue">
      <div style={{maxWidth:1100, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
        <div style={{fontWeight:700}}>4blue</div>
        <div style={{fontSize:13, opacity:0.95}}>© {new Date().getFullYear()} 4blue — Atendimento Simulado</div>
        <div style={{fontSize:13, opacity:0.9}}>Versão demo</div>
      </div>
    </footer>
  )
}
