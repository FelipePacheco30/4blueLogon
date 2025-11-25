import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";

import logo_4blue_blue from "../../assets/logo-4blue-blue.png";
import _4icon from "../../assets/4icon.png";

export default function LoginPage() {
  const { login, availableUsers = [], addAccount } = useContext(AuthContext);

  const [selected, setSelected] = useState(availableUsers[0]?.id || null);
  const [submitting, setSubmitting] = useState(false);

  const [showCreatePanel, setShowCreatePanel] = useState(false);

  const [createName, setCreateName] = useState("");
  const [createPass, setCreatePass] = useState("");
  const [createConfirm, setCreateConfirm] = useState("");

  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!availableUsers || availableUsers.length === 0) {
      setSelected(null);
    } else if (!availableUsers.find((u) => u.id === selected)) {
      setSelected(availableUsers[0]?.id || null);
    }
  }, [availableUsers]);

  useEffect(() => {
    const handler = () => {
      if (!availableUsers.find((u) => u.id === selected)) {
        setSelected(availableUsers[0]?.id || null);
      }
    };
    window.addEventListener("accounts:updated", handler);
    return () => window.removeEventListener("accounts:updated", handler);
  }, [availableUsers, selected]);

  function isBuiltin(uId) {
    return uId === "A" || uId === "B";
  }
  function findUserById(id) {
    return availableUsers.find((u) => u.id === id);
  }
  function existsName(name) {
    return availableUsers.some(
      (u) => (u.name || "").toLowerCase() === (name || "").toLowerCase()
    );
  }
  function countCreatedAccounts() {
    return availableUsers.filter((u) => !isBuiltin(u.id)).length;
  }

  async function handleLogin(e) {
    e?.preventDefault();
    if (!selected) {
      setFeedback({
        type: "error",
        text: "Selecione uma conta antes de entrar.",
      });
      return;
    }
    const sel = findUserById(selected);
    if (!sel) {
      setFeedback({ type: "error", text: "Conta inválida." });
      return;
    }
    if (!isBuiltin(sel.id) && (!loginPassword || loginPassword.length === 0)) {
      setFeedback({ type: "error", text: "Informe a senha desta conta." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      await login(selected, isBuiltin(selected) ? undefined : loginPassword);
      setLoginPassword("");
      setFeedback(null);
    } catch (err) {
      console.error("login failed", err);
      const msg =
        err?.message ||
        (err?.body && JSON.stringify(err.body)) ||
        "Erro ao entrar.";
      setFeedback({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateAccount(e) {
    e?.preventDefault();
    setFeedback(null);
    if (countCreatedAccounts() >= 2) {
      setFeedback({
        type: "error",
        text: "Limite de contas atingido (A + B + 2).",
      });
      return;
    }
    if (!createName?.trim()) {
      setFeedback({ type: "error", text: "Informe um nome." });
      return;
    }
    if (createPass !== createConfirm) {
      setFeedback({ type: "error", text: "As senhas não conferem." });
      return;
    }
    if (existsName(createName.trim())) {
      setFeedback({
        type: "error",
        text: "Já existe uma conta com este nome.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/api/accounts/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            name: createName.trim(),
            password: createPass,
          }),
        }
      );
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `status ${res.status}`);
      }
      const data = await res.json();
      setFeedback({ type: "success", text: `Conta criada: ${data.name}` });

      try {
        addAccount && addAccount(data.identifier, data.name);
      } catch (e) {}
      try {
        window.dispatchEvent(
          new CustomEvent("accounts:updated", {
            detail: { identifier: data.identifier, name: data.name },
          })
        );
      } catch (e) {}
      setCreateName("");
      setCreatePass("");
      setCreateConfirm("");
      setShowCreatePanel(false);
      if (data.identifier) setSelected(data.identifier);
    } catch (err) {
      console.error("create account", err);
      setFeedback({
        type: "error",
        text: "Erro ao criar conta (veja console).",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-split">
      <div className="login-left pattern-login">
        <div className="content">
          <h2 className="bemvindo">Bem-vindo</h2>
          <div className="big-title">Transforme atendimento em resultado.</div>

          <p className="subtitle mt-4">
            Conheça o <strong>4chatting</strong> — seu novo espaço de
            atendimento inteligente. Respostas rápidas, contexto que lembra e um
            histórico que realmente ajuda. Pensado para transformar conversa em
            ação, com atendimento humano-simulado e rastreabilidade de cada
            interação.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card fade-in">
          <img src={logo_4blue_blue} alt="4blue" className="brand-logo" />

          <p className="text-sm small-muted mb-4" style={{ opacity: 0.95 }}>
            Escolha sua conta para começar
          </p>

          <form
            onSubmit={handleLogin}
            className="w-full space-y-6"
            aria-label="Form de seleção de usuário"
          >
            <div
              className="user-selection"
              role="radiogroup"
              aria-label="Escolha de usuário"
            >
              {availableUsers.map((u) => {
                const isSel = selected === u.id;
                return (
                  <div
                    key={u.id}
                    className={`user-tile ${isSel ? "selected" : ""}`}
                    onClick={() => {
                      setSelected(u.id);
                      setShowCreatePanel(false);
                      setLoginPassword("");
                    }}
                    aria-checked={isSel}
                    role="radio"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setSelected(u.id);
                    }}
                  >
                    <div className="user-avatar" aria-hidden>
                      <img src={_4icon} alt={`Avatar ${u.id}`} />
                    </div>

                    <div className="user-label">{u.name}</div>
                  </div>
                );
              })}

              <div
                className="user-tile add-account"
                role="button"
                aria-pressed={showCreatePanel}
                tabIndex={0}
                onClick={() => {
                  setShowCreatePanel((v) => !v);
                  setSelected(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setShowCreatePanel((v) => !v);
                    setSelected(null);
                  }
                }}
                style={{ alignItems: "center", gap: 8 }}
              >
                <div className="add-account-circle" aria-hidden>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                    focusable="false"
                  >
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="user-label">Criar conta</div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              {selected && !isBuiltin(selected) && (
                <div
                  className="panel"
                  style={{
                    maxWidth: 420,
                    width: "100%",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <input
                    className="input"
                    placeholder="Senha da conta"
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      background: "transparent",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      cursor: "pointer",
                      color: "#fff",
                    }}
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M3 3l18 18"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10.58 10.58A3 3 0 0 0 13.42 13.42"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7c-1.65 0-3.2-.33-4.59-.92"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div
              className="flex gap-2"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {selected &&
                (isBuiltin(selected) || loginPassword.length > 0) && (
                  <button
                    type="submit"
                    className="btn-enter flex-1"
                    disabled={submitting}
                    style={{ maxWidth: 360 }}
                  >
                    {submitting ? "Entrando..." : "Entrar"}
                  </button>
                )}

              {!selected && !showCreatePanel && (
                <button
                  type="button"
                  className="btn-enter"
                  disabled
                  style={{ opacity: 0.6, maxWidth: 360 }}
                >
                  Selecione uma conta
                </button>
              )}
            </div>
          </form>

          <div
            style={{
              width: "100%",
              marginTop: 12,
              display: "flex",
              justifyContent: "center",
            }}
          >
            {showCreatePanel && (
              <form
                onSubmit={handleCreateAccount}
                className="panel fade-in"
                aria-label="Painel criar conta"
              >
                <input
                  className="input inline"
                  placeholder="Nome da conta"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
                <input
                  className="input inline"
                  placeholder="Senha"
                  type="password"
                  value={createPass}
                  onChange={(e) => setCreatePass(e.target.value)}
                />
                <input
                  className="input inline"
                  placeholder="Confirmar senha"
                  type="password"
                  value={createConfirm}
                  onChange={(e) => setCreateConfirm(e.target.value)}
                />

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="submit"
                    className="btn-enter"
                    style={{ flex: 1 }}
                    disabled={submitting}
                  >
                    {submitting ? "Criando..." : "Criar conta"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreatePanel(false);
                    }}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Voltar
                  </button>
                </div>
              </form>
            )}
          </div>

          {feedback && (
            <div
              style={{
                marginTop: 12,
                padding: 10,
                borderRadius: 8,
                background:
                  feedback.type === "success"
                    ? "rgba(10,120,60,0.08)"
                    : "rgba(183,40,40,0.08)",
                color: feedback.type === "success" ? "#9EE6B9" : "#FFCCCC",
                fontWeight: 700,
              }}
            >
              {feedback.text}
            </div>
          )}

          <footer
            className="login-footer"
            role="contentinfo"
            aria-label="Rodapé 4chatting"
            style={{ marginTop: 18 }}
          >
            <div
              style={{
                maxWidth: 1100,
                margin: "0 auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 700, color: "#fff" }}>4chatting</div>
              <div style={{ fontSize: 13, opacity: 0.95, color: "#fff" }}>
                © {new Date().getFullYear()} Atendimento Simulado
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
