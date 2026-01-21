# Auto-Update da Git

Se vuoi che il server VoiceForge MCP si aggiorni automaticamente da Git ad ogni riavvio di Antigravity, usa lo script wrapper fornito.

## Setup

Lo script `start-mcp.ps1` è già incluso nel repository e fa automaticamente:

- ✅ Controlla aggiornamenti da Git (`git fetch`)
- ✅ Scarica le ultime modifiche (`git pull`)  
- ✅ Installa nuove dipendenze se `package.json` è cambiato
- ✅ Avvia il server MCP

## Configurazione Antigravity

Modifica `~/.gemini/antigravity/mcp_config.json`:

```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "pwsh",
      "args": [
        "-File",
        "/percorso/completo/mcp-server-eleven/start-mcp.ps1"
      ]
    }
  }
}
```

**Windows esempio:**

```json
{
  "mcpServers": {
    "voiceforge": {
      "command": "pwsh",
      "args": [
        "-File",
        "C:\\Users\\TuoUtente\\mcp-server-eleven\\start-mcp.ps1"
      ]
    }
  }
}
```

## Requisiti

- **PowerShell 7+** installato (comando `pwsh`)
- Su Windows: già incluso
- Su Linux/Mac: `brew install powershell` o usa il package manager del tuo sistema

## Test

Riavvia Antigravity e controlla che il server si aggiorni automaticamente prima di avviarsi. Vedrai messaggi come:

```
🔄 Checking for updates...
✅ Already up to date
🚀 Starting VoiceForge MCP Server...
```

Oppure se ci sono aggiornamenti:

```
🔄 Checking for updates...
📥 Updates found, pulling...
📦 Installing dependencies...
✅ Updated successfully!
🚀 Starting VoiceForge MCP Server...
```
