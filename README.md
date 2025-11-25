# 4Chatting

<div align="center">

[![Status](https://img.shields.io/badge/⚙️_Status-concluido-green?style=for-the-badge)]()

</div>

**4Chatting** é um projeto de chat Full Stack que combina **Django** no backend e **React** no frontend, permitindo comunicação entre usuários e o sistema. Inspirado na identidade visual da **4blue**, o projeto não é apenas um desafio: ele resolve um problema real, gerando um produto funcional, intuitivo e responsivo.

O sistema possui:  
- Sistema de criação e edição de conta  
- Chatbot simples que gera respostas personalizadas imediatas
- Sidebar intuitiva e moderna para melhor navegação entre as funcionalidades
- Sistema de historico de mensagens com filtragem e pesquisa
- Dockerização completa para backend, frontend e banco de dados
- configurações do usuário como exclusão de historico, alteração de nome de usuário e senha

---

## 🧭 Visão

Permitir que qualquer usuário se comunique com o sistema de maneira rápida e organizada, armazenando histórico de mensagens e possibilitando troca de usuários de forma transparente. A interface é responsiva e mantém a experiência consistente mesmo em telas pequenas.

---

## ❓ Problemas Resolvidos

- Usuários que aguardavam dias por respostas  
- usuarios sem registro de suas conversas/duvidas  


---

## 🎯 Objetivos do projeto

- Criar um chat funcional com histórico persistente  
- Permitir múltiplos usuários com troca fácil via sidebar  
- Garantir persistência de mensagens no backend  
- Design responsivo e limpo, paleta baseada na identidade 4blue

---
## 📚 Estrutura do projeto
```
4chatting/
├─ backend/
│  ├─ chat_project/
│  ├─ messages_app/
│  ├─ staticfiles/
│  ├─ Dockerfile
│  ├─ db.sqlite3
│  ├─ manage.py
│  └─ requirements.txt
├─ frontend/
│  ├─ src/
│  │  ├─ assets/
│  │  ├─ components/
│  │  ├─ context/
│  │  └─ services/
│  ├─ Dockerfile
│  ├─ package.json
│  └─ vite.config.js
├─ .gitignore
└─ docker-compose.yml
```

## ⚙️ Como rodar (localmente sem Docker)

### Requisitos
- Python 3.11  
- pip, virtualenv (ou conda)  
- Node.js + npm  

### Backend
```
cd backend
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Backend: http://localhost:8000

### Frontend
```
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

## 🐳 Como rodar com Docker
```
docker compose up --build
```
Backend: Gunicorn (http://localhost:8000)
Frontend: Nginx (http://localhost:5173)

---


## 📚 Modelagem de Dados 

O backend usa SQLite (db.sqlite3) no desenvolvimento e pode ser facilmente adaptado para PostgreSQL no Docker.


### Classe Account
```
class Account(models.Model):
    identifier = models.CharField(max_length=48, primary_key=True)
    name = models.CharField(max_length=150, blank=True)
    password_hash = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

identifier: string pública usada pelo frontend (ex: 'A', 'B', '7f3a2c')

name: display name

password_hash: opcional, para contas criadas via frontend

Usuários padrão A e B não possuem senha, mas usam backend para respostas do chat, assim como todos usuários
```
---

## Message
```
class Message(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.CharField(max_length=48, db_index=True)
    user_name = models.CharField(max_length=150, blank=True)
    text = models.TextField(blank=True)
    response_text = models.TextField(blank=True)
    direction = models.CharField(max_length=16, choices=(("sent","sent"),("received","received")))
    viewed = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["created_at"]

user: identifica o usuário que enviou a mensagem

user_name: display name do usuário (opcional)

text: mensagem enviada pelo usuário

response_text: resposta do backend

direction: 'sent' = usuário para sistema, 'received' = resposta do sistema

viewed: se a mensagem já foi lida no frontend
```


🔧 Decisões Técnicas

Django + DRF: Backend robusto para APIs REST

React + Tailwind: Frontend moderno, responsivo e limpo

Context API: Gerencia estado global de usuário ativo e autenticação

Sidebar dinâmica: Sempre visível, aparece acima do ícone em telas pequenas

Docker: Facilita deploy e isolamento de serviços

Design: Paleta e UX inspirados na identidade visual da 4blue, focando em produto real


