# VoiceForge MCP Client

Client MCP per gestire agenti AI VoiceForge da **Cursor**, **Antigravity (Gemini)**, o qualsiasi assistente compatibile MCP.

## 🚀 Quick Start

### 1. Installa

```bash
npm install -g voiceforge-mcp
# oppure
npx voiceforge-mcp
```

### 2. Configura

Aggiungi a `~/.gemini/settings.json` (Antigravity) o `~/.cursor/mcp.json` (Cursor):

```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "npx",
      "args": ["voiceforge-mcp"],
      "env": {
        "VOICEFORGE_API_KEY": "vf_TUA_API_KEY"
      }
    }
  }
}
```

### 3. Ottieni API Key

1. Vai a https://voiceforge.super-chatbot.com
2. Login → API Keys → Crea nuova key

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

## 💬 Esempi d'uso

> "Crea un agente customer service per un'agenzia viaggi"

> "Aggiungi alla knowledge base dell'agente le FAQ del sito"

> "Lista tutti i miei agenti"

## 📄 License

MIT
