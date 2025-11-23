import React from 'react'
import { Link } from 'react-router-dom'
import presenters from '../../assets/presenters-placeholder.png'
import logo from '../../assets/logo-4blue.png'

export default function Hero4Blue() {
  return (
    <section className="hero-pattern bg-gradient-to-b from-blue-deep to-blue-mid text-white">
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <img src={logo} alt="4blue" className="h-10 mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Fala, empresário (a)!</h1>
          <h2 className="mt-4 text-xl md:text-2xl font-bold uppercase">
            AQUI VOCÊ ENCONTRA TUDO O QUE PRECISA PARA TER UMA EMPRESA MÁQUINA DE LUCROS 🚀
          </h2>

          <ul className="mt-6 space-y-2 text-white/90">
            <li>• Cresce as vendas de forma consistente</li>
            <li>• Lucra mesmo em tempos de crise</li>
            <li>• Funciona mesmo quando você está de férias</li>
          </ul>

          <p className="mt-4 text-white/80 max-w-xl">
            Soluções práticas e consultoria estratégica para transformar operações em resultado.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/chat" className="bg-white text-blue-deep rounded-full px-5 py-3 border border-blue-mid flex items-center gap-2">
              <span>Consultoria de Gestão Empresarial - MDL</span>
            </Link>
            <a className="bg-white text-blue-deep rounded-full px-5 py-3 border border-blue-mid flex items-center gap-2" href="#trainings">
              <span>Treinamentos 4blue</span>
            </a>
            <a className="bg-white text-blue-deep rounded-full px-5 py-3 border border-blue-mid flex items-center gap-2" href="#sobre">
              <span>Sobre a 4blue</span>
            </a>
          </div>
        </div>

        <div className="relative flex justify-center">
          {presenters ? (
            <img src={presenters} alt="Apresentadores" className="max-w-full rounded-xl shadow-2xl object-cover" style={{ maxHeight: 420 }} />
          ) : (
            <div className="w-full h-80 bg-white/10 rounded-xl" />
          )}
        </div>
      </div>

      <div className="border-t border-white/10" />
      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/00000000000"
        className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg"
        style={{ background: '#25D366' }}
        aria-label="WhatsApp"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.5 3.5C18.7 1.7 16.4 1 14 1 8 1 3.2 5.8 3 11.8 2.9 14 3.8 16.1 5.4 17.7L4 22l4.6-1.4c1.5.8 3.2 1.2 4.8 1.2 6 0 10.8-4.8 10.8-10.8 0-2.5-.8-4.8-2.7-6.6zM14 19.2c-1.3 0-2.6-.3-3.7-.9l-.3-.2-3.4 1 1-3.1-.2-.3C6 14.7 5.6 13.2 5.6 11.6 5.6 7.3 8.9 4 13.2 4c2.4 0 4.6.9 6.2 2.6 1.6 1.6 2.6 3.8 2.6 6.2 0 4.3-3.3 7.6-7.6 7.6z" />
        </svg>
      </a>
    </section>
  )
}
