# VoiceForge MCP Client

Client MCP per gestire agenti AI VoiceForge da **Cursor**, **Antigravity (Gemini)**, o qualsiasi assistente compatibile MCP.

## 🚀 Quick Start

### 1. Ottieni la tua API Key

1. Vai a https://voiceforge.super-chatbot.com
2. Registrati o fai login
3. Dashboard → **API Keys** → Crea nuova key
4. Copia la key (inizia con `vf_...`)

### 2. Configura il tuo assistente

> 💡 **Installa SOLO quello che usi** (Antigravity O Cursor, non entrambi)

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

**Con supporto n8n (opzionale):**

```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "npx",
      "args": ["-y", "github:almai1/mcp-server-eleven"],
      "env": {
        "VOICEFORGE_API_KEY": "vf_LA_TUA_API_KEY_QUI",
        "N8N_BASE_URL": "http://10.0.1.113:5678",
        "N8N_API_KEY": "LA_TUA_N8N_API_KEY_QUI"
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

**Con supporto n8n (opzionale):**

```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "npx",
      "args": ["-y", "github:almai1/mcp-server-eleven"],
      "env": {
        "VOICEFORGE_API_KEY": "vf_LA_TUA_API_KEY_QUI",
        "N8N_BASE_URL": "http://10.0.1.113:5678",
        "N8N_API_KEY": "LA_TUA_N8N_API_KEY_QUI"
      }
    }
  }
}
```

> ⚠️ **Sostituisci** `vf_LA_TUA_API_KEY_QUI` con la tua API key VoiceForge!
> 
> 💡 **n8n è opzionale**: Se non configuri `N8N_BASE_URL` e `N8N_API_KEY`, i tools n8n semplicemente non saranno disponibili.

#### 📝 Come ottenere l'API Key n8n

1. Accedi alla tua istanza n8n (es. `http://10.0.1.113:5678`)
2. Vai su **Settings** → **API**
3. Clicca su **Create API Key**
4. Copia la key generata

### 3. Riavvia e Testa

Riavvia il tuo assistente e prova:
> "elenca i miei agenti VoiceForge"

**Con n8n configurato:**
> "lista i workflow n8n disponibili"

📖 **Guida completa n8n**: [docs/n8n-integration.md](docs/n8n-integration.md)

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

### ⚙️ Workflows (VoiceForge)
| Tool | Descrizione |
|------|-------------|
| `list_workflows` | Lista workflow |
| `get_workflow` | Dettagli workflow |
| `create_workflow` | Crea workflow |
| `update_workflow` | Modifica workflow |
| `delete_workflow` | Elimina workflow |
| `execute_workflow` | Esegui workflow |
| `publish_workflow` | Pubblica versione |

### 🔄 n8n Workflows
> **Richiede configurazione**: `N8N_BASE_URL` e `N8N_API_KEY`

| Tool | Descrizione |
|------|-------------|
| `list_n8n_workflows` | Lista workflow n8n per agente |
| `get_n8n_workflow` | Dettagli workflow n8n |
| `create_n8n_workflow` | Crea workflow n8n *(con istruzioni formato nodi)* |
| `update_n8n_workflow` | Modifica workflow n8n esistente |
| `delete_n8n_workflow` | Elimina workflow n8n |
| `activate_n8n_workflow` | Attiva workflow n8n |
| `deactivate_n8n_workflow` | Disattiva workflow n8n |
| `execute_n8n_workflow` | Esegui workflow n8n manualmente |
| `get_n8n_execution` | Stato/risultato esecuzione |
| `list_n8n_executions` | Lista esecuzioni recenti |

**Esempio creazione workflow n8n:**
```
> Crea un workflow n8n per l'agente [ID] che riceve webhook POST su /test-webhook e risponde con {"success": true}
```

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

### VoiceForge Agenti

> "Crea un agente customer service per un'agenzia viaggi che parla italiano"

> "Aggiungi alla knowledge base le FAQ dal sito www.esempio.com"

> "Aggiorna il prompt di sistema dell'agente per renderlo più formale"

### n8n Workflows (se configurato)

> "Lista i workflow n8n per l'agente [ID]"

> "Crea un workflow n8n che riceve webhook POST e invia i dati a Slack"

> "Attiva il workflow n8n [WORKFLOW_ID] per l'agente [AGENT_ID]"

> "Mostrami lo stato dell'ultima esecuzione del workflow [WORKFLOW_ID]"

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

