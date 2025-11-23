import React from 'react'
import { Link } from 'react-router-dom'
import UserSwitcher from '../UserSwitcher/UserSwitcher'
import logo from '../../assets/logo-4blue.png'

export default function Header() {
  return (
    <header className="fixed w-full z-30" style={{ top: 0 }}>
      <div className="bg-blue-deep h-18 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" style={{ height: 72 }}>
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="4blue" className="h-10 w-auto" />
            </Link>
            <nav className="hidden md:flex gap-6 text-white text-sm font-medium">
              <Link to="/" className="hover:underline">Início</Link>
              <a href="#quem" className="hover:underline">Quem somos</a>
              <a href="#mdl" className="hover:underline">Consultoria de Gestão Empresarial – MDL</a>
              <div className="relative group">
                <button className="hover:underline">Soluções ▾</button>
              </div>
              <a href="#team" className="hover:underline">Team4you Login</a>
              <a href="#blog" className="hover:underline">Blog</a>
              <div className="relative group">
                <button className="hover:underline">Contato ▾</button>
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <UserSwitcher />
            <Link to="/chat" className="hidden sm:inline-block bg-white text-blue-deep rounded-full px-4 py-2 border border-blue-mid">Chat</Link>
            <Link to="/historico" className="hidden sm:inline-block text-white px-3 py-2">Histórico</Link>
          </div>
        </div>
      </div>
      <div style={{ height: 72 }} /> {/* spacer to avoid content behind fixed header */}
    </header>
  )
}
