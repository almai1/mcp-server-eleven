# VoiceForge MCP Client

Client MCP per gestire agenti AI VoiceForge da **Cursor**, **Antigravity (Gemini)**, o qualsiasi assistente compatibile MCP.

## 🚀 Quick Start

### 1. Ottieni la tua API Key

1. Vai a https://voiceforge.super-chatbot.com
2. Registrati o fai login
3. Dashboard → **API Keys** → Crea nuova key
4. Copia la key (inizia con `vf_...`)

### 2. Configura il tuo assistente

#### Antigravity (Gemini)

Aggiungi a `~/.gemini/antigravity/mcp_config.json`:

```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "npx",
      "args": ["-y", "github:almai1/mcp-server-eleven"],
      "env": {
        "VOICEFORGE_API_KEY": "vf_LA_TUA_API_KEY_QUI"
      }
    }
  }
}
```

#### Cursor

Aggiungi a `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "npx",
      "args": ["-y", "github:almai1/mcp-server-eleven"],
      "env": {
        "VOICEFORGE_API_KEY": "vf_LA_TUA_API_KEY_QUI"
      }
    }
  }
}
```

> ⚠️ **Sostituisci** `vf_LA_TUA_API_KEY_QUI` con la tua API key personale!

### 3. Riavvia e Testa

Riavvia il tuo assistente e prova:
> "elenca i miei agenti VoiceForge"

---

## 📦 Deploy su GitHub

Se vuoi pubblicare il server MCP su GitHub per uso con `npx`:

### 1. Crea il repository

```bash
cd voiceforge-mcp
git init
git add .
git commit -m "Initial commit: VoiceForge MCP server"
```

### 2. Pubblica su GitHub

```bash
# Crea il repo su GitHub, poi:
git remote add origin https://github.com/TUO_USERNAME/mcp-server-eleven.git
git branch -M main
git push -u origin main
```

### 3. Verifica che funzioni

```bash
npx -y github:TUO_USERNAME/mcp-server-eleven
```

> 💡 Il repo deve essere **pubblico** per usare `npx github:...`

---

## 🔧 Installazione Locale (alternativa)

Se preferisci eseguire il server localmente:

### 1. Clona e installa

```bash
git clone https://github.com/almai1/mcp-server-eleven.git
cd mcp-server-eleven
npm install
```

### 2. Configura con path locale

**Antigravity** (`~/.gemini/antigravity/mcp_config.json`):

```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "node",
      "args": ["/percorso/completo/mcp-server-eleven/index.js"],
      "env": {
        "VOICEFORGE_API_KEY": "vf_LA_TUA_API_KEY_QUI"
      }
    }
  }
}
```

**Windows esempio:**
```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "node",
      "args": ["C:/Users/TuoUtente/mcp-server-eleven/index.js"],
      "env": {
        "VOICEFORGE_API_KEY": "vf_LA_TUA_API_KEY_QUI"
      }
    }
  }
}
```

---

## 🛠️ Tools Disponibili

| Tool | Descrizione |
|------|-------------|
| `list_agents` | Lista tutti gli agenti |
| `get_agent` | Dettagli di un agente |
| `create_agent` | Crea nuovo agente |
| `update_agent` | Modifica agente |
| `delete_agent` | Elimina agente |
| `list_knowledge` | Lista knowledge base |
| `add_knowledge_text` | Aggiungi testo |
| `add_knowledge_url` | Aggiungi URL |
| `chat` | Invia messaggio |

---

## 💬 Esempi d'uso

> "Crea un agente customer service per un'agenzia viaggi che parla italiano"

> "Aggiungi alla knowledge base le FAQ dal sito www.esempio.com"

> "Aggiorna il prompt di sistema dell'agente per renderlo più formale"

---

## 🐛 Troubleshooting

### Server non caricato

1. **Verifica il path del config file:**
   - Antigravity: `~/.gemini/antigravity/mcp_config.json`
   - Cursor: `~/.cursor/mcp.json`

2. **Riavvia completamente l'IDE** dopo aver modificato la configurazione

3. **Testa il server manualmente:**
   ```bash
   VOICEFORGE_API_KEY=vf_... node index.js
   ```

### Errore API Key

Assicurati che:
- La key inizi con `vf_`
- La key sia valida (creata da https://voiceforge.super-chatbot.com/api-keys)
- La variabile `VOICEFORGE_API_KEY` sia configurata nel file JSON

### Repository GitHub non trovato

Se `npx github:...` fallisce:
- Verifica che il repo sia **pubblico**
- Controlla che il nome del repo sia corretto
- Prova l'installazione locale come alternativa

---

## 📄 License

MIT

