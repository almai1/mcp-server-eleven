# Integrazione n8n con VoiceForge MCP

Il server MCP VoiceForge include **supporto completo per n8n**, permettendoti di gestire workflow n8n direttamente da Antigravity, Cursor o qualsiasi assistente compatibile MCP.

## 🚀 Setup Rapido

### 1. Ottieni l'API Key n8n

1. Accedi alla tua istanza n8n (es. `http://10.0.1.113:5678`)
2. Vai su **Settings** → **API**
3. Clicca su **Create API Key**
4. Copia la key generata

### 2. Configura le variabili d'ambiente

Aggiungi alla configurazione MCP:

```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "npx",
      "args": ["-y", "github:almai1/mcp-server-eleven"],
      "env": {
        "VOICEFORGE_API_KEY": "vf_...",
        "N8N_BASE_URL": "http://10.0.1.113:5678",
        "N8N_API_KEY": "n8n_api_..."
      }
    }
  }
}
```

### 3. Riavvia e Testa

```
> Lista i workflow n8n disponibili
```

## 🔧 Tools Disponibili

### Gestione Workflow

- **`list_n8n_workflows`** - Lista tutti i workflow associati a un agente
- **`get_n8n_workflow`** - Ottieni dettagli completi di un workflow
- **`create_n8n_workflow`** - Crea un nuovo workflow n8n
- **`update_n8n_workflow`** - Modifica un workflow esistente
- **`delete_n8n_workflow`** - Elimina un workflow
- **`activate_n8n_workflow`** - Attiva un workflow
- **`deactivate_n8n_workflow`** - Disattiva un workflow

### Esecuzione e Monitoraggio

- **`execute_n8n_workflow`** - Esegui manualmente un workflow
- **`get_n8n_execution`** - Ottieni stato e risultati di un'esecuzione
- **`list_n8n_executions`** - Lista esecuzioni recenti

## 💡 Esempi Pratici

### Creare un Workflow Webhook → Slack

```
> Crea un workflow n8n per l'agente [AGENT_ID] che:
  1. Riceve webhook POST su /notifiche
  2. Estrae i campi "messaggio" e "urgenza" dal payload
  3. Invia il messaggio a Slack nel canale #alert se urgenza è "alta"
```

Il sistema genererà automaticamente i nodi necessari:
- **Webhook** node per ricevere i dati
- **IF** node per verificare l'urgenza
- **Slack** node per inviare la notifica

### Attivare/Disattivare Workflow

```
> Attiva il workflow n8n [WORKFLOW_ID] per l'agente [AGENT_ID]
> Disattiva temporaneamente il workflow [WORKFLOW_ID]
```

### Monitorare Esecuzioni

```
> Mostrami lo stato dell'ultima esecuzione del workflow [WORKFLOW_ID]
> Lista le ultime 10 esecuzioni del workflow [WORKFLOW_ID]
```

## 🏗️ Struttura dei Nodi n8n

Quando crei workflow tramite MCP, usa la struttura corretta per i nodi:

### Webhook Node
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "path-name",
    "responseMode": "responseNode"
  },
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2
}
```

### IF Node
```json
{
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "leftValue": "",
        "typeValidation": "strict"
      },
      "conditions": [{
        "id": "cond-1",
        "leftValue": "={{ $json.field }}",
        "rightValue": "value",
        "operator": {
          "type": "string",
          "operation": "equals"
        }
      }],
      "combinator": "and"
    },
    "options": {}
  },
  "type": "n8n-nodes-base.if",
  "typeVersion": 2
}
```

### HTTP Request Node
```json
{
  "parameters": {
    "method": "POST",
    "url": "https://api.example.com",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify($json) }}"
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2
}
```

### Set Node
```json
{
  "parameters": {
    "assignments": {
      "assignments": [{
        "id": "field-1",
        "name": "fieldName",
        "value": "value",
        "type": "string"
      }]
    },
    "options": {}
  },
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4
}
```

## 🔒 Sicurezza

- L'API Key n8n è **user-scoped**: può accedere solo ai workflow dell'utente che l'ha creata
- I workflow sono **taggati con l'agentId** per l'associazione con VoiceForge
- Le credenziali n8n sono gestite separatamente e **non sono esposte** via MCP

## 🐛 Troubleshooting

### "n8n tools not available"

Verifica che:
1. `N8N_BASE_URL` e `N8N_API_KEY` siano configurati
2. L'istanza n8n sia raggiungibile dall'URL specificato
3. L'API Key sia valida e non scaduta

### "Could not find property option"

Questo errore indica che la struttura dei nodi non è corretta. Usa ESATTAMENTE il formato documentato sopra.

### "Workflow not found for agent"

I workflow devono essere taggati con l'ID dell'agente. Il sistema gestisce questo automaticamente quando crei workflow via MCP.

## 📚 Risorse

- [n8n API Documentation](https://docs.n8n.io/api/)
- [n8n Nodes Reference](https://docs.n8n.io/integrations/)
- [VoiceForge MCP Server](https://github.com/almai1/mcp-server-eleven)
