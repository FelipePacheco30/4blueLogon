import React, { useContext, useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import logo from '../../assets/logo-4blue.png'
import icon4white from '../../assets/4icon-white.png'

/* Icon wrapper: reserva espaço consistente para o ícone (sem background) */
const IconWrapper = ({ children }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
    boxSizing: 'border-box'
  }}>
    {children}
  </div>
)

const IconChat = ({ color = 'currentColor' }) => (
  <IconWrapper>
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28, color }}>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </IconWrapper>
)

const IconHistory = ({ color = 'currentColor' }) => (
  <IconWrapper>
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28, color }}>
      <path d="M21 12a9 9 0 1 1-2.53-6.06" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 7v5l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </IconWrapper>
)

const IconSettings = ({ color = 'currentColor' }) => (
  <IconWrapper>
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28, color }}>
      <path 
        d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" 
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
      <path 
        d="M19.4 12a7.4 7.4 0 0 0-.1-1.2l2-1.5-2-3.5-2.3 1a7.3 7.3 0 0 0-2-1.2l-.3-2.5h-4l-.3 2.5a7.3 7.3 0 0 0-2 1.2l-2.3-1-2 3.5 2 1.5a7.4 7.4 0 0 0 0 2.4l-2 1.5 2 3.5 2.3-1a7.3 7.3 0 0 0 2 1.2l.3 2.5h4l.3-2.5a7.3 7.3 0 0 0 2-1.2l2.3 1 2-3.5-2-1.5a7.4 7.4 0 0 0 .1-1.2z" 
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  </IconWrapper>
)

const IconLogout = ({ color = 'currentColor' }) => (
  <IconWrapper>
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28, color }}>
      <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </IconWrapper>
)

export default function Sidebar() {
  const { user, logout, availableUsers, switchUser } = useContext(AuthContext)
  const [collapsed, setCollapsed] = useState(true)
  const [openDropdown, setOpenDropdown] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const ddRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (collapsed) {
      document.documentElement.setAttribute('data-sidebar-collapsed', 'true')
    } else {
      document.documentElement.removeAttribute('data-sidebar-collapsed')
    }
  }, [collapsed])

  useEffect(() => {
    const onDoc = e => { if (ddRef.current && !ddRef.current.contains(e.target)) setOpenDropdown(false) }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  useEffect(() => {
    function onResize() {
      const m = window.innerWidth <= 768
      setIsMobile(m)
      if (!m) setMobileOpen(false)
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
  }

  const collapsedWidth = 72
  const expandedWidth = 220

  /* helper: render a nav item row with icon on left and label centered in remaining space */
  function NavRow({ to, onClick, Icon, label }) {
    // when collapsed: center whole row (so icon centers)
    const baseStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 12px',
      color: '#fff',
      textDecoration: 'none',
      borderRadius: 10,
      width: '100%',
      boxSizing: 'border-box',
      cursor: onClick ? 'pointer' : 'auto',
      justifyContent: collapsed ? 'center' : 'flex-start' // <-- center when collapsed
    }

    // icon slot: left when expanded (flex-start), but still centered inside its box when collapsed
    const iconContainerStyle = {
      width: 44,
      display: 'flex',
      justifyContent: collapsed ? 'center' : 'flex-start'
    }

    // label area - visible only when expanded
    const labelStyle = {
      flex: 1,
      textAlign: 'center',
      fontWeight: 700,
      display: collapsed ? 'none' : 'block'
    }

    return to ? (
      <Link to={to} style={baseStyle}>
        <div style={iconContainerStyle}>
          <Icon />
        </div>
        <div style={labelStyle}>{label}</div>
      </Link>
    ) : (
      <div onClick={onClick} style={baseStyle}>
        <div style={iconContainerStyle}>
          <Icon />
        </div>
        <div style={labelStyle}>{label}</div>
      </div>
    )
  }

  return (
    <>
      {/* mobile button (left corner) */}
      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          style={{
            position: 'fixed',
            top: 12,
            left: 12,
            zIndex: 1100,
            background: '#FFD54A',
            border: 'none',
            padding: 10,
            borderRadius: 10,
            boxShadow: '0 8px 20px rgba(2,20,42,0.12)',
            cursor: 'pointer'
          }}
        >
          <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 24" fill="none"><path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
      )}

      <aside
        className={`sidebar ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
        style={{
          background: 'linear-gradient(180deg,#052C4A,#0D5FA8)',
          width: collapsed ? `${collapsedWidth}px` : `${expandedWidth}px`,
          minWidth: collapsed ? `${collapsedWidth}px` : `${expandedWidth}px`,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          position: 'fixed',
          top: 0,
          transform: isMobile && !mobileOpen ? 'translateX(-110%)' : 'translateX(0)',
          zIndex: 999,
          transition: 'width 260ms cubic-bezier(.2,.9,.2,1), min-width 260ms cubic-bezier(.2,.9,.2,1), transform 260ms cubic-bezier(.2,.9,.2,1)',
          willChange: 'width, transform',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {/* Logo / toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <button
            onClick={() => setCollapsed(v => !v)}
            aria-label="Toggle sidebar"
            style={{ background: 'transparent', border: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <img src={collapsed ? icon4white : logo} alt="4blue" style={{ width: collapsed ? 56 : 120, height: 'auto', borderRadius: 12 }}/>
          </button>
        </div>

        {/* Nav items: icon slot left (or centered when collapsed), label centered in remainder */}
        <nav style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          flexGrow: 1,
          paddingTop: 8,
          paddingLeft: 4,
          paddingRight: 4,
          alignItems: 'stretch',
          justifyContent: 'center'
        }}>
          <NavRow to="/chat" Icon={IconChat} label="Chat" />
          <NavRow to="/historico" Icon={IconHistory} label="Histórico" />
          <NavRow to="/configuracoes" Icon={IconSettings} label="Configurações" />
          <NavRow onClick={handleLogout} Icon={IconLogout} label="Sair" />
        </nav>

        {/* Footer user (avatar always circle) */}
        <div ref={ddRef} style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-start',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          position: 'relative',
          paddingTop: 8,
          paddingBottom: 8
        }} onClick={() => setOpenDropdown(!openDropdown)}>
          <div className="account-avatar" style={{
            width: 56,
            height: 56,
            borderRadius: '50%',        // force circular
            overflow: 'hidden',
            background: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <img src="/src/assets/4icon.png" alt="user" style={{ width: '72%', height: 'auto', objectFit: 'contain', display: 'block' }} />
          </div>

          {/* Name: centered vertically and horizontally in the remaining area */}
          {!collapsed && (
            <div style={{ color: '#fff', fontWeight: 700, textAlign: 'center', width: 'calc(100% - 80px)' }}>
              {user?.name || 'Usuário'}
            </div>
          )}

          {/* Dropdown */}
          {openDropdown && (
            <div style={{
              position: 'absolute',
              bottom: 72,
              left: collapsed ? '100%' : 16,
              width: 260,
              background: '#fff',
              color: '#03417E',
              borderRadius: 12,
              boxShadow: '0 12px 36px rgba(2,20,42,0.18)',
              zIndex: 1200,
              padding: 8
            }}>
              <div style={{ fontSize: 14, padding: 8, color: '#666' }}>Alternar conta</div>
              {availableUsers.map(u => (
                <div key={u.id} onClick={() => { switchUser(u.id); setOpenDropdown(false) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', cursor: 'pointer', borderTop: '1px solid rgba(2,20,42,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f3f6fb', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <img src="/src/assets/4icon.png" alt={u.id} style={{ width: 22, height: 22, objectFit: 'contain' }} />
                    </div>
                    <div style={{ fontWeight: 700 }}>{u.name}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#999' }}>{u.id === user?.id ? 'Ativo' : ''}</div>
                </div>
              ))}
              <div style={{ padding: 8 }}>
                <button onClick={handleLogout} style={{ width: '100%', padding: 10, borderRadius: 8, background: '#fff1f0', color: '#B72828', border: 'none' }}>Sair</button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
