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

---

## 📝 Come Aggiungere il Server MCP

### Passo 1: Localizza il File di Configurazione

Il file di configurazione MCP si trova in posizioni diverse a seconda del tuo sistema operativo e dell'IDE:

**Antigravity (Gemini):**
- **Windows**: `C:\Users\TuoUtente\.gemini\antigravity\mcp_config.json`
- **macOS/Linux**: `~/.gemini/antigravity/mcp_config.json`

**Cursor:**
- **Windows**: `C:\Users\TuoUtente\.cursor\mcp.json`
- **macOS/Linux**: `~/.cursor/mcp.json`

> 💡 **Trova rapidamente il file**:
> - Windows: Apri Esplora File e digita `%USERPROFILE%\.gemini\antigravity` nella barra degli indirizzi
> - macOS/Linux: Apri il terminale e usa `open ~/.gemini/antigravity` (macOS) o `cd ~/.gemini/antigravity` (Linux)

### Passo 2: Crea o Modifica il File

Se il file **non esiste**, crealo con questo contenuto:

**Per Antigravity** (`mcp_config.json`):

```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "npx",
      "args": ["-y", "--", "github:almai1/mcp-server-eleven"],
      "env": {
        "VOICEFORGE_API_KEY": "vf_LA_TUA_API_KEY_QUI"
      }
    }
  }
}
```

**Per Cursor** (`mcp.json`):

```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "npx",
      "args": ["-y", "--", "github:almai1/mcp-server-eleven"],
      "env": {
        "VOICEFORGE_API_KEY": "vf_LA_TUA_API_KEY_QUI"
      }
    }
  }
}
```

Se il file **esiste già**, aggiungi `"voiceforge"` all'interno di `"mcpServers"`:

```json
{
  "mcpServers": {
    "altro-server": {
      // ... configurazione esistente
    },
    "voiceforge": {
      "command": "npx",
      "args": ["-y", "--", "github:almai1/mcp-server-eleven"],
      "env": {
        "VOICEFORGE_API_KEY": "vf_LA_TUA_API_KEY_QUI"
      }
    }
  }
}
```

### Passo 3: Ottieni la tua API Key

1. Vai su https://voiceforge.super-chatbot.com
2. Registrati o fai login
3. Vai su **Dashboard** → **API Keys**
4. Clicca su **Crea Nuova Key**
5. Copia la key (inizia con `vf_...`)
6. Sostituisci `vf_LA_TUA_API_KEY_QUI` nel file di configurazione

### Passo 4: Riavvia l'IDE

Chiudi completamente e riapri Antigravity o Cursor per caricare il server MCP.

### Passo 5: Verifica l'Installazione

Testa il server chiedendo al tuo assistente:
> "elenca i miei agenti VoiceForge"

Se ricevi una risposta con la lista degli agenti (o un messaggio che non ne hai ancora), il server è configurato correttamente! ✅

---

## 🔄 Integrazione n8n (Opzionale - Consigliato)

Per gestire workflow n8n, usa il **server MCP n8n dedicato** insieme a VoiceForge per un'esperienza "plug and play":

### Configurazione Multi-Server

Aggiungi **entrambi i server** al tuo file di configurazione:


**Antigravity** (`~/.gemini/antigravity/mcp_config.json`):

```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "npx",
      "args": ["-y", "--", "github:almai1/mcp-server-eleven"],
      "env": {
        "VOICEFORGE_API_KEY": "vf_LA_TUA_API_KEY_QUI"
      }
    },
    "n8n": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://n8n.example.com/api/v1",
        "N8N_API_KEY": "LA_TUA_N8N_API_KEY_QUI"
      }
    }
  }
}
```

**Cursor** (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "npx",
      "args": ["-y", "--", "github:almai1/mcp-server-eleven"],
      "env": {
        "VOICEFORGE_API_KEY": "vf_LA_TUA_API_KEY_QUI"
      }
    },
    "n8n": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://n8n.example.com/api/v1",
        "N8N_API_KEY": "LA_TUA_N8N_API_KEY_QUI"
      }
    }
  }
}
```

> ⚠️ **Nota importante per n8n**: 
> - Usa `N8N_API_URL` (non `N8N_BASE_URL`) per il server n8n-mcp
> - L'URL deve includere `/api/v1` alla fine
> - Per istanze locali: `http://localhost:5678/api/v1`

### Perché Due Server Separati?

✅ **Separazione delle responsabilità**: VoiceForge gestisce agenti AI, n8n gestisce workflow
✅ **Manutenzione semplificata**: Ogni server è aggiornato indipendentemente  
✅ **Flessibilità**: Puoi usare solo VoiceForge, o aggiungere n8n quando serve
✅ **Hassle-free**: Entrambi funzionano "out of the box" senza configurazioni complesse

### Test

Riavvia l'assistente e prova:

**VoiceForge:**
> "elenca i miei agenti VoiceForge"

**n8n (se configurato):**
> "lista i workflow n8n disponibili"

📖 **Documentazione n8n-mcp**: https://github.com/czlonkowski/n8n-mcp

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

### 2. Configura le credenziali

Crea il file `.env` partendo dall'esempio:

```bash
# Linux/Mac
cp .env.example .env

# Windows
copy .env.example .env
```

Poi modifica `.env` con le tue credenziali:

```env
# REQUIRED: API Key VoiceForge
VOICEFORGE_API_KEY=vf_LA_TUA_API_KEY_QUI

# OPTIONAL: Solo se usi n8n
N8N_BASE_URL=https://tuo-dominio.com/api/v1
N8N_API_KEY=LA_TUA_N8N_API_KEY_QUI
```

### 3. Configura con path locale

**Antigravity** (`~/.gemini/antigravity/mcp_config.json`):

```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "node",
      "args": ["/percorso/completo/mcp-server-eleven/index.js"]
    }
  }
}
```

> 💡 **Le variabili d'ambiente vengono caricate dal file `.env`**, quindi non serve ripeterle nella config!

**Windows esempio:**
```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "node",
      "args": ["C:/Users/TuoUtente/mcp-server-eleven/index.js"]
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
   # Con variabile d'ambiente
   VOICEFORGE_API_KEY=vf_... node index.js
   
   # Oppure con file .env (installazione locale)
   cd /path/to/mcp-server-eleven
   # Assicurati che il file .env esista con le credenziali
   node index.js
   ```

### Errore API Key

Assicurati che:
- La key inizi con `vf_`
- La key sia valida (creata da https://voiceforge.super-chatbot.com/api-keys)
- Per installazione con `npx`: La variabile `VOICEFORGE_API_KEY` sia configurata nel file JSON
- Per installazione locale: Il file `.env` esista e contenga `VOICEFORGE_API_KEY=vf_...`

### Errore n8n: 401 Unauthorized

Se ricevi errori 401 chiamando tools n8n:

1. **Verifica che `N8N_API_KEY` sia configurata**
   - Per `npx`: Aggiungila in `env` nel file config JSON
   - Per installazione locale: Aggiungila nel file `.env`

2. **Verifica che `N8N_BASE_URL` includa `/api/v1`**
   - ✅ Corretto: `https://n8n.example.com/api/v1`
   - ❌ Errato: `https://n8n.example.com`

3. **Riavvia Antigravity/Cursor** dopo aver modificato la configurazione

### Repository GitHub non trovato

Se `npx github:...` fallisce:
- Verifica che il repo sia **pubblico**
- Controlla che il nome del repo sia corretto
- Prova l'installazione locale come alternativa

---

## 📄 License

MIT

