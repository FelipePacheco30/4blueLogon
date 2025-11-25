import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function SettingsPage() {
  const { user, logout, updateUserName } = useContext(AuthContext) || {};
  const currentName = user?.name || "";

  const [openUsername, setOpenUsername] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [usernameCurrent, setUsernameCurrent] = useState("");
  const [usernameNew, setUsernameNew] = useState("");
  const [usernameMsg, setUsernameMsg] = useState(null);

  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [pwdMsg, setPwdMsg] = useState(null);

  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState(null);
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  function isBuiltinAccount() {
    return user?.id === "A" || user?.id === "B";
  }

  function getEffectiveIdentifier() {
    if (!user) throw new Error("No user in context");

    if (user.identifier) return user.identifier;

    if (user.id) return user.id;
    throw new Error(
      "Nenhum identificador disponível na sessão. Relogue para atualizar a sessão."
    );
  }

  function MessageBox({ msg }) {
    if (!msg) return null;
    return (
      <div
        style={{
          marginTop: 10,
          padding: 10,
          borderRadius: 8,
          background:
            msg.type === "success"
              ? "rgba(10,120,60,0.12)"
              : "rgba(183,40,40,0.08)",
          color: msg.type === "success" ? "#9EE6B9" : "#FFCCCC",
          fontWeight: 700,
        }}
      >
        {msg.text}
      </div>
    );
  }

  async function handleUsernameConfirm(e) {
    e?.preventDefault();
    setUsernameMsg(null);

    if (!usernameCurrent || !usernameNew) {
      setUsernameMsg({ type: "error", text: "Preencha ambos os campos." });
      return;
    }
    if (usernameCurrent !== currentName) {
      setUsernameMsg({
        type: "error",
        text: "O nome atual não confere. Verifique.",
      });
      return;
    }

    if (isBuiltinAccount()) {
      const localId = user.id;
      updateUserName && updateUserName(localId, usernameNew);
      setUsernameMsg({
        type: "success",
        text: "Nome atualizado localmente para conta padrão.",
      });
      setUsernameCurrent("");
      setUsernameNew("");
      window.dispatchEvent(new CustomEvent("accounts:updated", { detail: {} }));
      return;
    }

    try {
      const identifier = getEffectiveIdentifier();

      await api.updateAccount(identifier, { name: usernameNew });

      updateUserName && updateUserName(identifier, usernameNew);

      window.dispatchEvent(
        new CustomEvent("accounts:updated", {
          detail: { identifier, name: usernameNew },
        })
      );
      setUsernameMsg({ type: "success", text: "Nome atualizado com sucesso." });
      setUsernameCurrent("");
      setUsernameNew("");
    } catch (err) {
      console.error("update username Error:", err);
      const msg =
        err?.message ||
        (err?.body && JSON.stringify(err.body)) ||
        "Erro desconhecido";
      setUsernameMsg({ type: "error", text: "Erro ao atualizar nome: " + msg });
    }
  }

  async function handlePasswordConfirm(e) {
    e?.preventDefault();
    setPwdMsg(null);

    if (!pwdCurrent || !pwdNew || !pwdConfirm) {
      setPwdMsg({ type: "error", text: "Preencha todos os campos." });
      return;
    }
    if (pwdNew !== pwdConfirm) {
      setPwdMsg({
        type: "error",
        text: "A nova senha e a confirmação não conferem.",
      });
      return;
    }
    if (pwdNew.length < 6) {
      setPwdMsg({
        type: "error",
        text: "A nova senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }
    if (isBuiltinAccount()) {
      setPwdMsg({
        type: "error",
        text: "Não é permitido alterar senha das contas padrão A/B.",
      });
      return;
    }

    try {
      setPwdSubmitting(true);
      const identifier = getEffectiveIdentifier();
      await api.updateAccount(identifier, { password: pwdNew });

      await new Promise((r) => setTimeout(r, 450));
      setPwdMsg({ type: "success", text: "Senha alterada com sucesso." });
      setPwdCurrent("");
      setPwdNew("");
      setPwdConfirm("");

      window.dispatchEvent(
        new CustomEvent("accounts:updated", { detail: { identifier } })
      );
    } catch (err) {
      console.error("update password Error:", err);
      const msg =
        err?.message ||
        (err?.body && JSON.stringify(err.body)) ||
        "Erro desconhecido";
      setPwdMsg({ type: "error", text: "Erro ao alterar senha: " + msg });
    } finally {
      setPwdSubmitting(false);
    }
  }

  async function handleDeleteHistory(e) {
    e?.preventDefault();
    setDeleteMsg(null);
    if (!deleteConfirmed) {
      setDeleteMsg({
        type: "error",
        text: "Marque a confirmação antes de excluir.",
      });
      return;
    }
    try {
      const identifier = getEffectiveIdentifier();

      await api.deleteHistory(identifier);
      setDeleteMsg({ type: "success", text: "Histórico excluído." });
      setDeleteConfirmed(false);
      window.dispatchEvent(
        new CustomEvent("messages:updated", { detail: { user: identifier } })
      );
    } catch (err) {
      console.error("delete history Error:", err);
      const msg =
        err?.message ||
        (err?.body && JSON.stringify(err.body)) ||
        "Erro desconhecido";
      setDeleteMsg({
        type: "error",
        text: "Erro ao excluir histórico: " + msg,
      });
    }
  }

  async function handleDeleteAccount(e) {
    e?.preventDefault();
    setDeleteMsg(null);

    if (isBuiltinAccount()) {
      setDeleteMsg({
        type: "error",
        text: "Contas A e B não podem ser excluídas.",
      });
      return;
    }

    if (!confirm("Deseja excluir sua conta permanentemente?")) return;

    try {
      const identifier = getEffectiveIdentifier();
      await api.deleteAccount(identifier);

      updateUserName && updateUserName(identifier, "");
      window.dispatchEvent(
        new CustomEvent("accounts:updated", { detail: { deleted: identifier } })
      );
      setDeleteMsg({ type: "success", text: "Conta excluída com sucesso." });
      try {
        logout && logout();
      } catch (e) {}
    } catch (err) {
      console.error("delete account Error:", err);
      const msg =
        err?.message ||
        (err?.body && JSON.stringify(err.body)) ||
        "Erro desconhecido";
      setDeleteMsg({ type: "error", text: "Erro ao excluir conta: " + msg });
    }
  }

  return (
    <div
      className="pattern-postlogin"
      style={{ padding: 24, minHeight: "100vh" }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <h2 className="history-title" style={{ marginBottom: 4 }}>
          Configurações
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            marginTop: 0,
            marginBottom: 12,
          }}
        >
          Gerencie suas informações de conta.
        </p>

        <section
          className="settings-section"
          aria-labelledby="edit-username-heading"
        >
          <header
            id="edit-username-heading"
            className="settings-header"
            role="button"
            aria-expanded={openUsername}
            onClick={() => setOpenUsername((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                setOpenUsername((v) => !v);
            }}
            tabIndex={0}
          >
            <div>
              <div style={{ fontWeight: 800, color: "#fff" }}>
                Editar nome de usuário
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                Digite seu nome atual e o novo nome desejado.
              </div>
            </div>
            <div
              className={`chev ${openUsername ? "open" : ""}`}
              aria-hidden
              style={{ color: "#fff" }}
            >
              ▾
            </div>
          </header>

          <div className={`settings-body ${openUsername ? "open" : ""}`}>
            <form
              onSubmit={handleUsernameConfirm}
              className="panel"
              aria-label="Editar nome de usuário - formulário"
            >
              <label style={{ fontSize: 13, color: "rgba(255,255,255,0.95)" }}>
                Nome atual
              </label>
              <input
                className="input"
                value={usernameCurrent}
                onChange={(e) => setUsernameCurrent(e.target.value)}
                placeholder={currentName || "Insira seu nome atual"}
                aria-label="Nome atual"
              />
              <label style={{ fontSize: 13, color: "rgba(255,255,255,0.95)" }}>
                Novo nome
              </label>
              <input
                className="input"
                value={usernameNew}
                onChange={(e) => setUsernameNew(e.target.value)}
                placeholder="Novo nome"
                aria-label="Novo nome"
              />
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button
                  type="submit"
                  className="btn-enter"
                  disabled={!usernameCurrent || !usernameNew}
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setUsernameCurrent("");
                    setUsernameNew("");
                    setUsernameMsg(null);
                  }}
                >
                  Limpar
                </button>
              </div>
              <MessageBox msg={usernameMsg} />
            </form>
          </div>
        </section>

        {!isBuiltinAccount() && (
          <section
            className="settings-section"
            aria-labelledby="change-password-heading"
          >
            <header
              id="change-password-heading"
              className="settings-header"
              role="button"
              aria-expanded={openPassword}
              onClick={() => setOpenPassword((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setOpenPassword((v) => !v);
              }}
              tabIndex={0}
            >
              <div>
                <div style={{ fontWeight: 800, color: "#fff" }}>
                  Trocar senha
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                  Insira a senha atual e defina uma nova senha.
                </div>
              </div>
              <div
                className={`chev ${openPassword ? "open" : ""}`}
                aria-hidden
                style={{ color: "#fff" }}
              >
                ▾
              </div>
            </header>
            <div className={`settings-body ${openPassword ? "open" : ""}`}>
              <form
                onSubmit={handlePasswordConfirm}
                className="panel"
                aria-label="Trocar senha - formulário"
              >
                <label
                  style={{ fontSize: 13, color: "rgba(255,255,255,0.95)" }}
                >
                  Senha atual
                </label>
                <input
                  type="password"
                  className="input"
                  value={pwdCurrent}
                  onChange={(e) => setPwdCurrent(e.target.value)}
                  placeholder="Senha atual"
                  aria-label="Senha atual"
                />
                <label
                  style={{ fontSize: 13, color: "rgba(255,255,255,0.95)" }}
                >
                  Nova senha
                </label>
                <input
                  type="password"
                  className="input"
                  value={pwdNew}
                  onChange={(e) => setPwdNew(e.target.value)}
                  placeholder="Nova senha"
                  aria-label="Nova senha"
                />
                <label
                  style={{ fontSize: 13, color: "rgba(255,255,255,0.95)" }}
                >
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  className="input"
                  value={pwdConfirm}
                  onChange={(e) => setPwdConfirm(e.target.value)}
                  placeholder="Confirmar nova senha"
                  aria-label="Confirmar nova senha"
                />
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <button
                    type="submit"
                    className="btn-enter"
                    disabled={
                      !pwdCurrent || !pwdNew || !pwdConfirm || pwdSubmitting
                    }
                  >
                    {pwdSubmitting ? (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          className="spinner"
                          aria-hidden
                          style={{ width: 18, height: 18 }}
                        />
                        Aguarde...
                      </div>
                    ) : (
                      "Confirmar"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setPwdCurrent("");
                      setPwdNew("");
                      setPwdConfirm("");
                      setPwdMsg(null);
                    }}
                  >
                    Limpar
                  </button>
                </div>
                <MessageBox msg={pwdMsg} />
              </form>
            </div>
          </section>
        )}

        <section
          className="settings-section"
          aria-labelledby="delete-history-heading"
        >
          <header
            id="delete-history-heading"
            className="settings-header"
            role="button"
            aria-expanded={openDelete}
            onClick={() => setOpenDelete((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setOpenDelete((v) => !v);
            }}
            tabIndex={0}
          >
            <div>
              <div style={{ fontWeight: 800, color: "#fff" }}>
                Excluir histórico
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                Remover todas as mensagens do seu histórico.
              </div>
            </div>
            <div
              className={`chev ${openDelete ? "open" : ""}`}
              aria-hidden
              style={{ color: "#fff" }}
            >
              ▾
            </div>
          </header>
          <div className={`settings-body ${openDelete ? "open" : ""}`}>
            <form
              onSubmit={handleDeleteHistory}
              className="panel"
              aria-label="Excluir histórico - confirmação"
            >
              <div
                className="settings-warning"
                role="status"
                aria-live="polite"
              >
                ATENÇÃO — Esta ação removerá todo o histórico de mensagens deste
                usuário.
              </div>
              <div style={{ marginTop: 8 }}>
                <label
                  style={{ fontSize: 13, color: "rgba(255,255,255,0.95)" }}
                >
                  Marque para confirmar
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  <input
                    type="checkbox"
                    id="confirmDelete"
                    checked={deleteConfirmed}
                    onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  />
                  <label
                    htmlFor="confirmDelete"
                    style={{ color: "rgba(255,255,255,0.95)" }}
                  >
                    Confirmo que desejo excluir todo o histórico
                  </label>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  type="submit"
                  className="btn-enter"
                  style={{ background: "var(--ui-yellow)", color: "#fff" }}
                >
                  Excluir histórico
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setDeleteConfirmed(false);
                    setDeleteMsg(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
              <MessageBox msg={deleteMsg} />
            </form>
          </div>
        </section>

        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 8 }}
        >
          <div style={{ maxWidth: 520, width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ color: "rgba(255,255,255,0.85)" }}>
                Excluir conta atual
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                  {isBuiltinAccount()
                    ? "Contas A/B não podem ser excluídas."
                    : "Esta ação removerá sua conta permanentemente."}
                </div>
              </div>
              <div>
                <button
                  disabled={isBuiltinAccount()}
                  onClick={handleDeleteAccount}
                  className="btn-enter"
                  style={{
                    background: isBuiltinAccount()
                      ? "rgba(255,255,255,0.12)"
                      : "var(--ui-yellow)",
                    color: "#fff",
                  }}
                >
                  Excluir conta
                </button>
              </div>
            </div>
            <MessageBox msg={deleteMsg} />
          </div>
        </div>
      </div>
    </div>
  );
}
