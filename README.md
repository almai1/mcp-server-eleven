# VoiceForge MCP Client

Client MCP per gestire agenti AI VoiceForge da **Cursor**, **Antigravity (Gemini)**, o qualsiasi assistente compatibile MCP.

## 🚀 Quick Start

### 1. Ottieni la tua API Key

1. Vai a https://voiceforge.super-chatbot.com
2. Registrati o fai login
3. Dashboard → **API Keys** → Crea nuova key
4. Copia la key (inizia con `vf_...`)

### 2. Configura il tuo assistente

Aggiungi a `~/.gemini/settings.json` (Antigravity) o `~/.cursor/mcp.json` (Cursor):

```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "npx",
      "args": ["-y", "github:almai1/voiceforge-mcp"],
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

> "Crea un agente customer service per un'agenzia viaggi che parla italiano"

> "Aggiungi alla knowledge base le FAQ dal sito www.esempio.com"

> "Aggiorna il prompt di sistema dell'agente per renderlo più formale"

## 📄 License

MIT

