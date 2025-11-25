import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage/LoginPage";
import ChatPage from "./components/ChatPage/ChatPage";
import HistoryPage from "./components/HistoryPage/HistoryPage";
import SettingsPage from "./components/SettingsPage/SettingsPage";
import Sidebar from "./components/Layout/Sidebar";
import { AuthContext } from "./context/AuthContext";

function Footer() {
  return (
    <footer className="app-footer">
      <div className="max-w-6xl mx-auto text-sm">
        © {new Date().getFullYear()} 4blue — Demo. Gradiente aplicado no topo e
        rodapé.
      </div>
    </footer>
  );
}
export default function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex flex-col">
      {user ? (
        <div className="flex-1 flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/historico" element={<HistoryPage />} />
              <Route path="/configuracoes" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
      {user && (
        <footer className="app-footer">
          <div className="max-w-6xl mx-auto text-sm">
            © {new Date().getFullYear()} 4blue — Todos os direitos reservados.
          </div>
        </footer>
      )}
    </div>
  );
}
