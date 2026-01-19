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

## 📦 Primitive MCP

### Resources

Le **Resources** forniscono contesto documentale al modello AI.

| URI | Descrizione |
|-----|-------------|
| `agents://list` | Lista di tutti gli agenti dell'utente |
| `docs://api` | Documentazione API VoiceForge |
| `docs://agents` | Guida alla creazione di agenti complessi |

**Esempio d'uso in Antigravity/Cursor:**

```
> Leggi la documentazione API (usa resource docs://api)
> Mostrami la lista degli agenti (usa resource agents://list)
```

### Prompts

I **Prompts** sono template riutilizzabili per creare agenti.

| Nome | Descrizione | Parametri |
|------|-------------|-----------|
| `create-customer-service-agent` | Crea agente customer service | companyName, industry, language |
| `create-appointment-agent` | Crea agente prenotazioni | businessName, serviceType, workingHours |
| `create-school-agent` | Crea agente scolastico | teacherName, subject |

**Esempio d'uso in Antigravity/Cursor:**

```
> Usa il prompt create-customer-service-agent per PizzaExpress nel settore food
> Crea un agente scolastico con create-school-agent per Prof. Rossi (Matematica)
```

---

## 🛠️ Tools Disponibili (50+)

### 👤 Agenti
| Tool | Descrizione |
|------|-------------|
| `list_agents` | Lista tutti gli agenti |
| `get_agent` | Dettagli di un agente |
| `create_agent` | Crea nuovo agente |
| `update_agent` | Modifica agente |
| `delete_agent` | Elimina agente |

### 📚 Knowledge Base
| Tool | Descrizione |
|------|-------------|
| `list_knowledge` | Lista knowledge base |
| `add_knowledge_text` | Aggiungi testo |
| `add_knowledge_url` | Aggiungi URL |

### 💬 Chat
| Tool | Descrizione |
|------|-------------|
| `chat` | Invia messaggio a un agente |

### 📅 Calendario
| Tool | Descrizione |
|------|-------------|
| `list_calendar_events` | Lista eventi |
| `create_calendar_event` | Crea evento |
| `update_calendar_event` | Modifica evento |
| `delete_calendar_event` | Elimina evento |
| `list_calendar_users` | Lista utenti calendario |
| `add_calendar_user` | Aggiungi utente |
| `update_calendar_user` | Modifica utente |
| `remove_calendar_user` | Rimuovi utente |

### 🔗 Webhooks
| Tool | Descrizione |
|------|-------------|
| `list_webhooks` | Lista webhook |
| `create_webhook` | Crea webhook |
| `update_webhook` | Modifica webhook |
| `delete_webhook` | Elimina webhook |
| `test_webhook` | Testa webhook |

### ⚙️ Workflows
| Tool | Descrizione |
|------|-------------|
| `list_workflows` | Lista workflow |
| `get_workflow` | Dettagli workflow |
| `create_workflow` | Crea workflow |
| `update_workflow` | Modifica workflow |
| `delete_workflow` | Elimina workflow |
| `execute_workflow` | Esegui workflow |
| `publish_workflow` | Pubblica versione |

### 🔌 Integrazioni
| Tool | Descrizione |
|------|-------------|
| `list_integrations` | Lista integrazioni |
| `get_integration` | Dettagli integrazione |
| `create_integration` | Configura integrazione |
| `update_integration` | Modifica integrazione |
| `delete_integration` | Elimina integrazione |

### 📊 Analytics
| Tool | Descrizione |
|------|-------------|
| `get_analytics` | Statistiche e report |

### 🔑 API Keys
| Tool | Descrizione |
|------|-------------|
| `list_api_keys` | Lista API keys |
| `create_api_key` | Crea nuova key |
| `revoke_api_key` | Revoca key |

### 🎤 Voci
| Tool | Descrizione |
|------|-------------|
| `list_voices` | Lista voci disponibili |
| `get_voice` | Dettagli voce |
| `clone_voice` | Clona voce da audio |
| `update_voice_settings` | Modifica impostazioni |
| `delete_voice` | Elimina voce |

### 🔊 TTS/STT
| Tool | Descrizione |
|------|-------------|
| `generate_speech` | Text-to-Speech |
| `transcribe_audio` | Speech-to-Text |

### 📞 Telefonia
| Tool | Descrizione |
|------|-------------|
| `list_phone_numbers` | Lista numeri |
| `configure_phone_number` | Configura numero |

### 👥 Teams
| Tool | Descrizione |
|------|-------------|
| `list_teams` | Lista team |
| `create_team` | Crea team |
| `add_team_member` | Aggiungi membro |
| `remove_team_member` | Rimuovi membro |

### 🏢 Organizzazioni
| Tool | Descrizione |
|------|-------------|
| `list_organizations` | Lista organizzazioni |
| `get_organization` | Dettagli organizzazione |

### 🔧 Strumenti Agente
| Tool | Descrizione |
|------|-------------|
| `list_agent_tools` | Lista strumenti |
| `configure_agent_tool` | Configura strumento |

### 🖼️ Widget
| Tool | Descrizione |
|------|-------------|
| `get_widget_config` | Config widget |
| `update_widget_config` | Personalizza widget |

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

