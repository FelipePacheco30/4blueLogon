import React, { useContext, useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import logo from '../../assets/logo-4blue.png'
import icon4white from '../../assets/4icon-white.png' // white icon used as clickable toggle

const IconChat = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
const IconHistory = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden><path d="M21 12a9 9 0 1 1-2.53-6.06" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 7v5l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
const IconSettings = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 2.3 17.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09c.66 0 1.24-.4 1.51-1A1.65 1.65 0 0 0 3.3 7.1l-.06-.06A2 2 0 1 1 6.07 4.2l.06.06c.48.48 1.28.61 1.82.33.36-.18.68-.46.9-.78A1.65 1.65 0 0 0 10.9 3H11a2 2 0 1 1 4 0h.09c.66 0 1.24.4 1.51 1 .22.32.54.6.9.78.54.28 1.34.15 1.82-.33l.06-.06A2 2 0 1 1 21.7 6.1l-.06.06c-.18.36-.46.68-.78.9A1.65 1.65 0 0 0 21 8.91V9a2 2 0 1 1 0 4h-.09c-.66 0-1.24.4-1.51 1-.22.32-.54.6-.9.78z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
)
const IconLogout = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden><path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
)

export default function Sidebar() {
  const { user, logout, availableUsers, switchUser } = useContext(AuthContext)
  const [collapsed, setCollapsed] = useState(true) // start minimized
  const [openDropdown, setOpenDropdown] = useState(false)
  const ddRef = useRef(null)
  const navigate = useNavigate()

  // sync html attribute for global CSS
  useEffect(() => {
    if (collapsed) {
      document.documentElement.setAttribute('data-sidebar-collapsed', 'true')
    } else {
      document.documentElement.removeAttribute('data-sidebar-collapsed')
    }
  }, [collapsed])

  useEffect(() => {
    function onDoc(e){
      if(ddRef.current && !ddRef.current.contains(e.target)) setOpenDropdown(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  },[])

  function handleLogout() {
    try {
      if (typeof logout === 'function') logout()
    } catch (e) {
      console.warn('logout failed', e)
    }
    // navigate to login
    navigate('/')
  }

  function dropdownStyle() {
    if (collapsed) {
      return {
        position: 'absolute',
        left: '100%',
        bottom: 64,
        marginLeft: 12,
        width: 260,
        background:'#fff',
        color:'#03417E',
        borderRadius:12,
        boxShadow:'0 12px 36px rgba(2,20,42,0.18)',
        zIndex:200
      }
    }
    return {
      position: 'absolute',
      left: 12,
      bottom: 64,
      width: 260,
      background:'#fff',
      color:'#03417E',
      borderRadius:12,
      boxShadow:'0 12px 36px rgba(2,20,42,0.18)',
      zIndex:200
    }
  }

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} h-screen p-4 flex flex-col`}>
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <button onClick={() => setCollapsed(v => !v)} aria-label="Toggle sidebar" style={{background:'transparent', border:'none', padding:0}}>
            {collapsed ? (
              <img src={icon4white} alt="4" className="logo-4icon" style={{width:72,height:72, objectFit:'contain'}} />
            ) : (
              <img src={logo} alt="4blue" className="logo-img" style={{width:140,height:'auto', objectFit:'contain'}} />
            )}
          </button>
        </div>

        <div style={{width:32}} />
      </div>

      <nav className="flex-1 space-y-4">
        <Link to="/chat" className="icon-btn text-white hover:bg-white/8"><IconChat /><span className="item-label">Chat</span></Link>
        <Link to="/historico" className="icon-btn text-white hover:bg-white/8"><IconHistory /><span className="item-label">Histórico</span></Link>

        <div className="divider-yellow" />

        {/* Configurações with icon */}
        <Link to="/configuracoes" className="icon-btn text-white hover:bg-white/8"><IconSettings /><span className="item-label">Configurações</span></Link>

        <button onClick={handleLogout} className="icon-btn text-white hover:bg-white/8"><IconLogout /><span className="item-label">Sair</span></button>
      </nav>

      {/* sidebar footer: align left when expanded; center when collapsed */}
      <div className="sidebar-footer" ref={ddRef} style={{display:'flex', width:'100%'}}>
        <div style={{
          position:'relative',
          width: '100%',
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-start',
          paddingLeft: collapsed ? 0 : 12
        }}>
          <button onClick={() => setOpenDropdown(v=>!v)} className="p-0 rounded bg-transparent" aria-label="Conta">
            <div className="account-avatar" style={{width:56, height:56}}>
              <img src="/src/assets/4icon.png" alt="user" style={{width:'86%', height:'86%', objectFit:'contain'}} />
            </div>
          </button>

          {openDropdown && (
            <div style={dropdownStyle()}>
              <div style={{padding:10, fontSize:14, color:'#666'}}>Alternar conta</div>
              {availableUsers?.map(u=>(
                <div key={u.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between', padding:'8px 10px', borderTop:'1px solid rgba(2,20,42,0.04)'}} role="button" onClick={() => { switchUser(u.id); setOpenDropdown(false) }}>
                  <div style={{display:'flex',gap:10, alignItems:'center'}}>
                    <div style={{width:36,height:36,borderRadius:8,background:'#f3f6fb', display:'flex',alignItems:'center',justifyContent:'center'}}><img src="/src/assets/4icon.png" alt={u.id} style={{width:22,height:22, objectFit:'contain'}} /></div>
                    <div style={{fontWeight:700}}>{u.name}</div>
                  </div>
                  <div style={{fontSize:12, color:'#999'}}>{u.id === user?.id ? 'Ativo' : ''}</div>
                </div>
              ))}

              <div style={{borderTop:'1px solid rgba(2,20,42,0.04)'}} />
              <div style={{padding:10}}>
                <button onClick={handleLogout} style={{width:'100%', padding:10, borderRadius:8, background:'#fff1f0', color:'#B72828', border:'none'}}>Sair</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
