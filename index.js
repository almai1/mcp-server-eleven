#!/usr/bin/env node
/**
 * VoiceForge MCP Client
 * 
 * Connette qualsiasi assistente AI compatibile MCP (Cursor, Antigravity, etc.)
 * al server VoiceForge per gestire agenti AI, knowledge base e conversazioni.
 * 
 * @see https://voiceforge.super-chatbot.com
 */

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');

// Configuration
const API_KEY = process.env.VOICEFORGE_API_KEY;
const BASE_URL = process.env.VOICEFORGE_URL || 'https://voiceforge.super-chatbot.com';
const VERSION = '2.0.0';

if (!API_KEY) {
    console.error('❌ ERRORE: VOICEFORGE_API_KEY è richiesta');
    console.error('');
    console.error('Ottieni la tua API key da:');
    console.error('  https://voiceforge.super-chatbot.com/api-keys');
    console.error('');
    console.error('Poi configura la variabile d\'ambiente:');
    console.error('  export VOICEFORGE_API_KEY=vf_...');
    process.exit(1);
}

// HTTP Client
async function api(path, method = 'GET', body = null) {
    const url = `${BASE_URL}${path}`;
    const opts = {
        method,
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'User-Agent': `voiceforge-mcp/${VERSION}`
        }
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `HTTP ${res.status}`);
    }

    return res.json();
}

// Success/Error response helpers
function ok(text) {
    return { content: [{ type: 'text', text: typeof text === 'string' ? text : JSON.stringify(text, null, 2) }] };
}

function err(error) {
    return { content: [{ type: 'text', text: `❌ ${error.message || error}` }], isError: true };
}

// Create MCP Server
const server = new McpServer({
    name: 'voiceforge',
    version: VERSION,
});

// ======================
// AGENT TOOLS
// ======================

server.tool(
    'list_agents',
    'Lista tutti gli agenti AI dell\'utente con statistiche',
    {},
    async () => {
        try {
            const { agents } = await api('/api/agents');
            const summary = agents.map(a => `• ${a.name} (${a.id}) - ${a.language || 'it-IT'}`).join('\n');
            return ok(`Trovati ${agents.length} agenti:\n\n${summary}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'get_agent',
    'Ottieni i dettagli completi di un agente',
    { agentId: z.string().describe('ID dell\'agente') },
    async ({ agentId }) => {
        try {
            const { agent } = await api(`/api/agents/${agentId}`);
            return ok(agent);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'create_agent',
    'Crea un nuovo agente AI con personalità specifica',
    {
        name: z.string().describe('Nome dell\'agente'),
        systemPrompt: z.string().describe('Prompt di sistema che definisce comportamento e personalità'),
        description: z.string().optional().describe('Descrizione breve'),
        firstMessage: z.string().optional().describe('Messaggio iniziale'),
        language: z.string().optional().describe('Lingua (default: it-IT)'),
        llmModel: z.string().optional().describe('Modello LLM (default: gpt-4o-mini)'),
        temperature: z.number().optional().describe('Temperatura 0-1 (default: 0.7)')
    },
    async (args) => {
        try {
            const { agent } = await api('/api/agents', 'POST', args);
            return ok(`✅ Agente "${agent.name}" creato!\n\nID: ${agent.id}\nLingua: ${agent.language}\nModello: ${agent.llmModel}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'update_agent',
    'Modifica un agente esistente',
    {
        agentId: z.string().describe('ID dell\'agente'),
        name: z.string().optional().describe('Nuovo nome'),
        systemPrompt: z.string().optional().describe('Nuovo prompt di sistema'),
        description: z.string().optional().describe('Nuova descrizione'),
        firstMessage: z.string().optional().describe('Nuovo messaggio iniziale'),
        temperature: z.number().optional().describe('Nuova temperatura')
    },
    async ({ agentId, ...data }) => {
        try {
            const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
            const { agent } = await api(`/api/agents/${agentId}`, 'PATCH', cleanData);
            return ok(`✅ Agente "${agent.name}" aggiornato`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'delete_agent',
    'Elimina definitivamente un agente',
    { agentId: z.string().describe('ID dell\'agente da eliminare') },
    async ({ agentId }) => {
        try {
            await api(`/api/agents/${agentId}`, 'DELETE');
            return ok('✅ Agente eliminato');
        } catch (e) { return err(e); }
    }
);

// ======================
// KNOWLEDGE TOOLS
// ======================

server.tool(
    'list_knowledge',
    'Lista le knowledge base di un agente',
    { agentId: z.string().describe('ID dell\'agente') },
    async ({ agentId }) => {
        try {
            const { knowledgeBases } = await api(`/api/agents/${agentId}/knowledge`);
            if (!knowledgeBases?.length) return ok('Nessuna knowledge base trovata');
            const summary = knowledgeBases.map(kb => `• ${kb.name} (${kb.type}) - ${kb.status}`).join('\n');
            return ok(`Knowledge base:\n\n${summary}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'add_knowledge_text',
    'Aggiungi testo alla knowledge base',
    {
        agentId: z.string().describe('ID dell\'agente'),
        name: z.string().describe('Nome del documento'),
        content: z.string().describe('Contenuto testuale')
    },
    async ({ agentId, name, content }) => {
        try {
            const { knowledgeBase } = await api(`/api/agents/${agentId}/knowledge`, 'POST', { name, content, type: 'text' });
            return ok(`✅ Knowledge base "${knowledgeBase.name}" creata`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'add_knowledge_url',
    'Aggiungi contenuto da URL',
    {
        agentId: z.string().describe('ID dell\'agente'),
        name: z.string().describe('Nome del documento'),
        url: z.string().url().describe('URL da cui estrarre contenuto')
    },
    async ({ agentId, name, url }) => {
        try {
            const { knowledgeBase } = await api(`/api/agents/${agentId}/knowledge`, 'POST', { name, url, type: 'url' });
            return ok(`✅ Knowledge base "${knowledgeBase.name}" creata da URL`);
        } catch (e) { return err(e); }
    }
);

// ======================
// CHAT TOOLS
// ======================

server.tool(
    'chat',
    'Invia un messaggio a un agente e ottieni una risposta',
    {
        agentId: z.string().describe('ID dell\'agente'),
        message: z.string().describe('Il messaggio da inviare'),
        conversationId: z.string().optional().describe('ID conversazione esistente')
    },
    async ({ agentId, message, conversationId }) => {
        try {
            const result = await api(`/api/agents/${agentId}/chat`, 'POST', { message, conversationId });
            return ok(`🤖 ${result.response}\n\n[Conversazione: ${result.conversationId}]`);
        } catch (e) { return err(e); }
    }
);

// ======================
// CALENDAR TOOLS
// ======================

server.tool(
    'list_calendar_events',
    'Lista gli eventi del calendario di un agente',
    {
        agentId: z.string().describe('ID dell\'agente'),
        startDate: z.string().optional().describe('Data inizio (ISO format)'),
        endDate: z.string().optional().describe('Data fine (ISO format)')
    },
    async ({ agentId, startDate, endDate }) => {
        try {
            let path = `/api/agents/${agentId}/calendar`;
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (params.toString()) path += `?${params.toString()}`;

            const { events } = await api(path);
            if (!events?.length) return ok('Nessun evento trovato');
            const summary = events.map(e => `• ${e.title} - ${new Date(e.startTime).toLocaleString('it-IT')}`).join('\n');
            return ok(`Eventi calendario:\n\n${summary}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'create_calendar_event',
    'Crea un nuovo evento nel calendario dell\'agente',
    {
        agentId: z.string().describe('ID dell\'agente'),
        title: z.string().describe('Titolo dell\'evento'),
        startTime: z.string().describe('Data/ora inizio (ISO format)'),
        endTime: z.string().describe('Data/ora fine (ISO format)'),
        description: z.string().optional().describe('Descrizione evento'),
        attendees: z.array(z.string()).optional().describe('Email partecipanti'),
        location: z.string().optional().describe('Luogo evento')
    },
    async ({ agentId, ...eventData }) => {
        try {
            const { event } = await api(`/api/agents/${agentId}/calendar`, 'POST', eventData);
            return ok(`✅ Evento "${event.title}" creato!\n\nID: ${event.id}\nInizio: ${new Date(event.startTime).toLocaleString('it-IT')}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'update_calendar_event',
    'Modifica un evento esistente',
    {
        agentId: z.string().describe('ID dell\'agente'),
        eventId: z.string().describe('ID dell\'evento'),
        title: z.string().optional().describe('Nuovo titolo'),
        startTime: z.string().optional().describe('Nuova data/ora inizio'),
        endTime: z.string().optional().describe('Nuova data/ora fine'),
        description: z.string().optional().describe('Nuova descrizione'),
        status: z.enum(['confirmed', 'cancelled', 'tentative']).optional().describe('Stato evento')
    },
    async ({ agentId, eventId, ...data }) => {
        try {
            const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
            const { event } = await api(`/api/agents/${agentId}/calendar/${eventId}`, 'PATCH', cleanData);
            return ok(`✅ Evento "${event.title}" aggiornato`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'delete_calendar_event',
    'Elimina un evento dal calendario',
    {
        agentId: z.string().describe('ID dell\'agente'),
        eventId: z.string().describe('ID dell\'evento da eliminare')
    },
    async ({ agentId, eventId }) => {
        try {
            await api(`/api/agents/${agentId}/calendar/${eventId}`, 'DELETE');
            return ok('✅ Evento eliminato');
        } catch (e) { return err(e); }
    }
);

// ======================
// CALENDAR USERS TOOLS
// ======================

server.tool(
    'list_calendar_users',
    'Lista gli utenti del calendario di un agente',
    { agentId: z.string().describe('ID dell\'agente') },
    async ({ agentId }) => {
        try {
            const { users } = await api(`/api/agents/${agentId}/calendar/users`);
            if (!users?.length) return ok('Nessun utente calendario configurato');
            const summary = users.map(u => `• ${u.name} (${u.email}) - ${u.role || 'member'}`).join('\n');
            return ok(`Utenti calendario:\n\n${summary}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'add_calendar_user',
    'Aggiungi un utente al calendario dell\'agente',
    {
        agentId: z.string().describe('ID dell\'agente'),
        name: z.string().describe('Nome utente'),
        email: z.string().describe('Email utente'),
        role: z.enum(['admin', 'member', 'viewer']).optional().describe('Ruolo (default: member)'),
        availability: z.array(z.object({
            dayOfWeek: z.number().min(0).max(6),
            startTime: z.string(),
            endTime: z.string()
        })).optional().describe('Disponibilità settimanale')
    },
    async ({ agentId, ...userData }) => {
        try {
            const { user } = await api(`/api/agents/${agentId}/calendar/users`, 'POST', userData);
            return ok(`✅ Utente "${user.name}" aggiunto al calendario!\n\nID: ${user.id}\nEmail: ${user.email}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'update_calendar_user',
    'Modifica un utente del calendario',
    {
        agentId: z.string().describe('ID dell\'agente'),
        userId: z.string().describe('ID dell\'utente'),
        name: z.string().optional().describe('Nuovo nome'),
        role: z.enum(['admin', 'member', 'viewer']).optional().describe('Nuovo ruolo'),
        availability: z.array(z.object({
            dayOfWeek: z.number().min(0).max(6),
            startTime: z.string(),
            endTime: z.string()
        })).optional().describe('Nuova disponibilità')
    },
    async ({ agentId, userId, ...data }) => {
        try {
            const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
            const { user } = await api(`/api/agents/${agentId}/calendar/users/${userId}`, 'PATCH', cleanData);
            return ok(`✅ Utente "${user.name}" aggiornato`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'remove_calendar_user',
    'Rimuovi un utente dal calendario',
    {
        agentId: z.string().describe('ID dell\'agente'),
        userId: z.string().describe('ID dell\'utente da rimuovere')
    },
    async ({ agentId, userId }) => {
        try {
            await api(`/api/agents/${agentId}/calendar/users/${userId}`, 'DELETE');
            return ok('✅ Utente rimosso dal calendario');
        } catch (e) { return err(e); }
    }
);

// ======================
// WEBHOOK TOOLS
// ======================

server.tool(
    'list_webhooks',
    'Lista i webhook configurati per un agente',
    { agentId: z.string().describe('ID dell\'agente') },
    async ({ agentId }) => {
        try {
            const { webhooks } = await api(`/api/agents/${agentId}/webhooks`);
            if (!webhooks?.length) return ok('Nessun webhook configurato');
            const summary = webhooks.map(w => `• ${w.name} (${w.event}) - ${w.enabled ? '✅ Attivo' : '❌ Disattivo'}\n  URL: ${w.url}`).join('\n\n');
            return ok(`Webhook configurati:\n\n${summary}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'create_webhook',
    'Crea un nuovo webhook per eventi dell\'agente',
    {
        agentId: z.string().describe('ID dell\'agente'),
        name: z.string().describe('Nome webhook'),
        url: z.string().url().describe('URL endpoint webhook'),
        event: z.enum(['conversation.started', 'conversation.ended', 'message.received', 'message.sent', 'tool.executed', 'error']).describe('Tipo evento da intercettare'),
        secret: z.string().optional().describe('Secret per firma HMAC'),
        enabled: z.boolean().optional().describe('Attivo (default: true)')
    },
    async ({ agentId, ...webhookData }) => {
        try {
            const { webhook } = await api(`/api/agents/${agentId}/webhooks`, 'POST', webhookData);
            return ok(`✅ Webhook "${webhook.name}" creato!\n\nID: ${webhook.id}\nEvento: ${webhook.event}\nURL: ${webhook.url}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'update_webhook',
    'Modifica un webhook esistente',
    {
        agentId: z.string().describe('ID dell\'agente'),
        webhookId: z.string().describe('ID del webhook'),
        name: z.string().optional().describe('Nuovo nome'),
        url: z.string().optional().describe('Nuovo URL'),
        enabled: z.boolean().optional().describe('Attiva/disattiva')
    },
    async ({ agentId, webhookId, ...data }) => {
        try {
            const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
            const { webhook } = await api(`/api/agents/${agentId}/webhooks/${webhookId}`, 'PATCH', cleanData);
            return ok(`✅ Webhook "${webhook.name}" aggiornato`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'delete_webhook',
    'Elimina un webhook',
    {
        agentId: z.string().describe('ID dell\'agente'),
        webhookId: z.string().describe('ID del webhook da eliminare')
    },
    async ({ agentId, webhookId }) => {
        try {
            await api(`/api/agents/${agentId}/webhooks/${webhookId}`, 'DELETE');
            return ok('✅ Webhook eliminato');
        } catch (e) { return err(e); }
    }
);

server.tool(
    'test_webhook',
    'Testa un webhook inviando un evento di prova',
    {
        agentId: z.string().describe('ID dell\'agente'),
        webhookId: z.string().describe('ID del webhook da testare')
    },
    async ({ agentId, webhookId }) => {
        try {
            const result = await api(`/api/agents/${agentId}/webhooks/${webhookId}/test`, 'POST');
            return ok(`✅ Test webhook completato!\n\nStatus: ${result.status}\nRisposta: ${result.response || 'OK'}`);
        } catch (e) { return err(e); }
    }
);

// ======================
// WORKFLOW TOOLS
// ======================

server.tool(
    'list_workflows',
    'Lista i workflow di un agente',
    { agentId: z.string().describe('ID dell\'agente') },
    async ({ agentId }) => {
        try {
            const { workflows } = await api(`/api/agents/${agentId}/workflows`);
            if (!workflows?.length) return ok('Nessun workflow configurato');
            const summary = workflows.map(w => `• ${w.name} (v${w.version || 1}) - ${w.status}\n  Trigger: ${w.trigger || 'manuale'}`).join('\n\n');
            return ok(`Workflow:\n\n${summary}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'get_workflow',
    'Ottieni i dettagli di un workflow',
    {
        agentId: z.string().describe('ID dell\'agente'),
        workflowId: z.string().describe('ID del workflow')
    },
    async ({ agentId, workflowId }) => {
        try {
            const { workflow } = await api(`/api/agents/${agentId}/workflows/${workflowId}`);
            return ok(workflow);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'create_workflow',
    'Crea un nuovo workflow',
    {
        agentId: z.string().describe('ID dell\'agente'),
        name: z.string().describe('Nome workflow'),
        description: z.string().optional().describe('Descrizione'),
        trigger: z.enum(['manual', 'message', 'schedule', 'webhook', 'intent']).optional().describe('Tipo trigger'),
        nodes: z.array(z.object({
            id: z.string(),
            type: z.string(),
            data: z.record(z.any()).optional()
        })).optional().describe('Nodi del workflow'),
        edges: z.array(z.object({
            source: z.string(),
            target: z.string()
        })).optional().describe('Connessioni tra nodi')
    },
    async ({ agentId, ...workflowData }) => {
        try {
            const { workflow } = await api(`/api/agents/${agentId}/workflows`, 'POST', workflowData);
            return ok(`✅ Workflow "${workflow.name}" creato!\n\nID: ${workflow.id}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'update_workflow',
    'Modifica un workflow esistente',
    {
        agentId: z.string().describe('ID dell\'agente'),
        workflowId: z.string().describe('ID del workflow'),
        name: z.string().optional().describe('Nuovo nome'),
        description: z.string().optional().describe('Nuova descrizione'),
        nodes: z.array(z.object({
            id: z.string(),
            type: z.string(),
            data: z.record(z.any()).optional()
        })).optional().describe('Nuovi nodi'),
        edges: z.array(z.object({
            source: z.string(),
            target: z.string()
        })).optional().describe('Nuove connessioni')
    },
    async ({ agentId, workflowId, ...data }) => {
        try {
            const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
            const { workflow } = await api(`/api/agents/${agentId}/workflows/${workflowId}`, 'PATCH', cleanData);
            return ok(`✅ Workflow "${workflow.name}" aggiornato`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'delete_workflow',
    'Elimina un workflow',
    {
        agentId: z.string().describe('ID dell\'agente'),
        workflowId: z.string().describe('ID del workflow da eliminare')
    },
    async ({ agentId, workflowId }) => {
        try {
            await api(`/api/agents/${agentId}/workflows/${workflowId}`, 'DELETE');
            return ok('✅ Workflow eliminato');
        } catch (e) { return err(e); }
    }
);

server.tool(
    'execute_workflow',
    'Esegui un workflow manualmente',
    {
        agentId: z.string().describe('ID dell\'agente'),
        workflowId: z.string().describe('ID del workflow da eseguire'),
        input: z.record(z.any()).optional().describe('Dati di input per il workflow')
    },
    async ({ agentId, workflowId, input }) => {
        try {
            const result = await api(`/api/agents/${agentId}/workflows/${workflowId}/execute`, 'POST', { input });
            return ok(`✅ Workflow eseguito!\n\nExecution ID: ${result.executionId}\nStatus: ${result.status}\n\nOutput:\n${JSON.stringify(result.output, null, 2)}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'publish_workflow',
    'Pubblica una nuova versione del workflow',
    {
        agentId: z.string().describe('ID dell\'agente'),
        workflowId: z.string().describe('ID del workflow da pubblicare')
    },
    async ({ agentId, workflowId }) => {
        try {
            const { version } = await api(`/api/agents/${agentId}/workflows/${workflowId}/publish`, 'POST');
            return ok(`✅ Workflow pubblicato!\n\nVersione: ${version}`);
        } catch (e) { return err(e); }
    }
);

// ======================
// INTEGRATION TOOLS
// ======================

server.tool(
    'list_integrations',
    'Lista le integrazioni disponibili',
    {},
    async () => {
        try {
            const { integrations } = await api('/api/integrations');
            if (!integrations?.length) return ok('Nessuna integrazione configurata');
            const summary = integrations.map(i => `• ${i.name} (${i.type}) - ${i.enabled ? '✅ Attivo' : '❌ Disattivo'}`).join('\n');
            return ok(`Integrazioni:\n\n${summary}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'get_integration',
    'Ottieni i dettagli di un\'integrazione',
    { integrationId: z.string().describe('ID dell\'integrazione') },
    async ({ integrationId }) => {
        try {
            const { integration } = await api(`/api/integrations/${integrationId}`);
            return ok(integration);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'create_integration',
    'Configura una nuova integrazione',
    {
        type: z.enum(['zapier', 'make', 'n8n', 'webhook', 'slack', 'telegram', 'whatsapp']).describe('Tipo integrazione'),
        name: z.string().describe('Nome integrazione'),
        config: z.record(z.any()).describe('Configurazione specifica'),
        enabled: z.boolean().optional().describe('Attiva (default: true)')
    },
    async (integrationData) => {
        try {
            const { integration } = await api('/api/integrations', 'POST', integrationData);
            return ok(`✅ Integrazione "${integration.name}" creata!\n\nID: ${integration.id}\nTipo: ${integration.type}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'update_integration',
    'Modifica un\'integrazione esistente',
    {
        integrationId: z.string().describe('ID dell\'integrazione'),
        name: z.string().optional().describe('Nuovo nome'),
        config: z.record(z.any()).optional().describe('Nuova configurazione'),
        enabled: z.boolean().optional().describe('Attiva/disattiva')
    },
    async ({ integrationId, ...data }) => {
        try {
            const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
            const { integration } = await api(`/api/integrations/${integrationId}`, 'PATCH', cleanData);
            return ok(`✅ Integrazione "${integration.name}" aggiornata`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'delete_integration',
    'Elimina un\'integrazione',
    { integrationId: z.string().describe('ID dell\'integrazione da eliminare') },
    async ({ integrationId }) => {
        try {
            await api(`/api/integrations/${integrationId}`, 'DELETE');
            return ok('✅ Integrazione eliminata');
        } catch (e) { return err(e); }
    }
);

// ======================
// ANALYTICS TOOLS
// ======================

server.tool(
    'get_analytics',
    'Ottieni statistiche e analytics',
    {
        agentId: z.string().optional().describe('ID agente (opzionale, per stats specifiche)'),
        period: z.enum(['today', 'week', 'month', 'year']).optional().describe('Periodo (default: week)')
    },
    async ({ agentId, period = 'week' }) => {
        try {
            let path = '/api/analytics/reports';
            const params = new URLSearchParams({ period });
            if (agentId) params.append('agentId', agentId);
            path += `?${params.toString()}`;

            const report = await api(path);
            return ok(`📊 Analytics (${period}):\n\n• Conversazioni: ${report.totalConversations || 0}\n• Messaggi: ${report.totalMessages || 0}\n• Utenti attivi: ${report.activeUsers || 0}\n• Soddisfazione: ${report.satisfaction || 'N/A'}%`);
        } catch (e) { return err(e); }
    }
);

// ======================
// API KEYS TOOLS
// ======================

server.tool(
    'list_api_keys',
    'Lista le API keys dell\'utente',
    {},
    async () => {
        try {
            const { apiKeys } = await api('/api/api-keys');
            if (!apiKeys?.length) return ok('Nessuna API key trovata');
            const summary = apiKeys.map(k => `• ${k.name} (${k.prefix}...) - ${k.enabled ? '✅ Attiva' : '❌ Disattiva'}\n  Creata: ${new Date(k.createdAt).toLocaleDateString('it-IT')}`).join('\n\n');
            return ok(`API Keys:\n\n${summary}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'create_api_key',
    'Crea una nuova API key',
    {
        name: z.string().describe('Nome descrittivo della key'),
        expiresInDays: z.number().optional().describe('Scadenza in giorni (0 = mai)')
    },
    async ({ name, expiresInDays }) => {
        try {
            const { apiKey, key } = await api('/api/api-keys', 'POST', { name, expiresInDays });
            return ok(`✅ API Key creata!\n\n⚠️ SALVA QUESTA KEY (mostrata solo ora):\n${key}\n\nID: ${apiKey.id}\nNome: ${apiKey.name}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'revoke_api_key',
    'Revoca un\'API key',
    { keyId: z.string().describe('ID della key da revocare') },
    async ({ keyId }) => {
        try {
            await api(`/api/api-keys/${keyId}`, 'DELETE');
            return ok('✅ API Key revocata');
        } catch (e) { return err(e); }
    }
);

// ======================
// VOICES TOOLS
// ======================

server.tool(
    'list_voices',
    'Lista le voci disponibili',
    {
        search: z.string().optional().describe('Cerca per nome'),
        category: z.enum(['premade', 'cloned', 'generated']).optional().describe('Categoria voci')
    },
    async ({ search, category }) => {
        try {
            let path = '/api/voices';
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            if (params.toString()) path += `?${params.toString()}`;

            const { voices } = await api(path);
            if (!voices?.length) return ok('Nessuna voce trovata');
            const summary = voices.map(v => `• ${v.name} (${v.category}) - ${v.language || 'multi'}`).join('\n');
            return ok(`Voci disponibili:\n\n${summary}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'get_voice',
    'Ottieni dettagli di una voce',
    { voiceId: z.string().describe('ID della voce') },
    async ({ voiceId }) => {
        try {
            const { voice } = await api(`/api/voices/${voiceId}`);
            return ok(voice);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'clone_voice',
    'Clona una voce da file audio',
    {
        name: z.string().describe('Nome della voce clonata'),
        description: z.string().optional().describe('Descrizione'),
        audioUrl: z.string().url().describe('URL del file audio campione')
    },
    async ({ name, description, audioUrl }) => {
        try {
            const { voice } = await api('/api/voices/clone', 'POST', { name, description, audioUrl });
            return ok(`✅ Voce "${voice.name}" clonata!\n\nID: ${voice.id}\nStatus: ${voice.status}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'update_voice_settings',
    'Modifica le impostazioni di una voce',
    {
        voiceId: z.string().describe('ID della voce'),
        stability: z.number().min(0).max(1).optional().describe('Stabilità (0-1)'),
        similarityBoost: z.number().min(0).max(1).optional().describe('Boost similarità (0-1)'),
        style: z.number().min(0).max(1).optional().describe('Stile (0-1)'),
        speakerBoost: z.boolean().optional().describe('Boost speaker')
    },
    async ({ voiceId, ...settings }) => {
        try {
            const cleanSettings = Object.fromEntries(Object.entries(settings).filter(([_, v]) => v !== undefined));
            const { voice } = await api(`/api/voices/${voiceId}/settings`, 'PATCH', cleanSettings);
            return ok(`✅ Impostazioni voce "${voice.name}" aggiornate`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'delete_voice',
    'Elimina una voce clonata',
    { voiceId: z.string().describe('ID della voce da eliminare') },
    async ({ voiceId }) => {
        try {
            await api(`/api/voices/${voiceId}`, 'DELETE');
            return ok('✅ Voce eliminata');
        } catch (e) { return err(e); }
    }
);

// ======================
// TTS/STT TOOLS
// ======================

server.tool(
    'generate_speech',
    'Genera audio da testo (Text-to-Speech)',
    {
        text: z.string().describe('Testo da convertire in audio'),
        voiceId: z.string().describe('ID della voce da usare'),
        modelId: z.string().optional().describe('Modello TTS (default: eleven_multilingual_v2)'),
        outputFormat: z.enum(['mp3_44100_128', 'mp3_22050_64', 'pcm_16000', 'pcm_22050']).optional().describe('Formato output')
    },
    async ({ text, voiceId, modelId, outputFormat }) => {
        try {
            const result = await api('/api/tts/generate', 'POST', { text, voiceId, modelId, outputFormat });
            return ok(`✅ Audio generato!\n\nURL: ${result.audioUrl}\nDurata: ${result.duration || 'N/A'}s\nCaratteri: ${result.characterCount}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'transcribe_audio',
    'Trascrivi audio in testo (Speech-to-Text)',
    {
        audioUrl: z.string().url().describe('URL del file audio da trascrivere'),
        language: z.string().optional().describe('Codice lingua (es: it, en)')
    },
    async ({ audioUrl, language }) => {
        try {
            const result = await api('/api/stt/transcribe', 'POST', { audioUrl, language });
            return ok(`✅ Trascrizione completata!\n\nTesto:\n${result.text}\n\nLingua rilevata: ${result.detectedLanguage || 'N/A'}`);
        } catch (e) { return err(e); }
    }
);

// ======================
// PHONE NUMBERS TOOLS
// ======================

server.tool(
    'list_phone_numbers',
    'Lista i numeri di telefono configurati',
    {},
    async () => {
        try {
            const { phoneNumbers } = await api('/api/phone/numbers');
            if (!phoneNumbers?.length) return ok('Nessun numero di telefono configurato');
            const summary = phoneNumbers.map(p => `• ${p.phoneNumber} (${p.friendlyName || 'N/A'})\n  Agente: ${p.agentId || 'non assegnato'}`).join('\n\n');
            return ok(`Numeri telefono:\n\n${summary}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'configure_phone_number',
    'Configura un numero di telefono per un agente',
    {
        phoneNumberId: z.string().describe('ID del numero'),
        agentId: z.string().describe('ID dell\'agente da collegare'),
        friendlyName: z.string().optional().describe('Nome descrittivo')
    },
    async ({ phoneNumberId, agentId, friendlyName }) => {
        try {
            const { phoneNumber } = await api(`/api/phone/numbers/${phoneNumberId}`, 'PATCH', { agentId, friendlyName });
            return ok(`✅ Numero ${phoneNumber.phoneNumber} configurato per agente ${agentId}`);
        } catch (e) { return err(e); }
    }
);

// ======================
// TEAMS TOOLS
// ======================

server.tool(
    'list_teams',
    'Lista i team dell\'utente',
    {},
    async () => {
        try {
            const { teams } = await api('/api/teams');
            if (!teams?.length) return ok('Nessun team trovato');
            const summary = teams.map(t => `• ${t.name} - ${t.memberCount || 0} membri`).join('\n');
            return ok(`Team:\n\n${summary}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'create_team',
    'Crea un nuovo team',
    {
        name: z.string().describe('Nome del team'),
        description: z.string().optional().describe('Descrizione')
    },
    async ({ name, description }) => {
        try {
            const { team } = await api('/api/teams', 'POST', { name, description });
            return ok(`✅ Team "${team.name}" creato!\n\nID: ${team.id}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'add_team_member',
    'Aggiungi un membro al team',
    {
        teamId: z.string().describe('ID del team'),
        email: z.string().describe('Email del membro da invitare'),
        role: z.enum(['owner', 'admin', 'member', 'viewer']).optional().describe('Ruolo (default: member)')
    },
    async ({ teamId, email, role }) => {
        try {
            const { member } = await api(`/api/teams/${teamId}/members`, 'POST', { email, role });
            return ok(`✅ Invito inviato a ${email}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'remove_team_member',
    'Rimuovi un membro dal team',
    {
        teamId: z.string().describe('ID del team'),
        memberId: z.string().describe('ID del membro da rimuovere')
    },
    async ({ teamId, memberId }) => {
        try {
            await api(`/api/teams/${teamId}/members/${memberId}`, 'DELETE');
            return ok('✅ Membro rimosso dal team');
        } catch (e) { return err(e); }
    }
);

// ======================
// ORGANIZATION TOOLS
// ======================

server.tool(
    'list_organizations',
    'Lista le organizzazioni dell\'utente',
    {},
    async () => {
        try {
            const { organizations } = await api('/api/org');
            if (!organizations?.length) return ok('Nessuna organizzazione trovata');
            const summary = organizations.map(o => `• ${o.name} (${o.slug}) - ${o.plan || 'free'}`).join('\n');
            return ok(`Organizzazioni:\n\n${summary}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'get_organization',
    'Ottieni dettagli organizzazione',
    { slug: z.string().describe('Slug dell\'organizzazione') },
    async ({ slug }) => {
        try {
            const { organization } = await api(`/api/org/${slug}`);
            return ok(organization);
        } catch (e) { return err(e); }
    }
);

// ======================
// AGENT TOOLS (External tools)
// ======================

server.tool(
    'list_agent_tools',
    'Lista gli strumenti esterni configurati per un agente',
    { agentId: z.string().describe('ID dell\'agente') },
    async ({ agentId }) => {
        try {
            const { tools } = await api(`/api/agents/${agentId}/tools`);
            if (!tools?.length) return ok('Nessuno strumento configurato');
            const summary = tools.map(t => `• ${t.name} (${t.type}) - ${t.enabled ? '✅ Attivo' : '❌ Disattivo'}`).join('\n');
            return ok(`Strumenti agente:\n\n${summary}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'configure_agent_tool',
    'Configura uno strumento esterno per un agente',
    {
        agentId: z.string().describe('ID dell\'agente'),
        type: z.enum(['calendar', 'email', 'crm', 'custom_api', 'database']).describe('Tipo strumento'),
        name: z.string().describe('Nome strumento'),
        config: z.record(z.any()).describe('Configurazione specifica'),
        enabled: z.boolean().optional().describe('Attivo (default: true)')
    },
    async ({ agentId, ...toolData }) => {
        try {
            const { tool } = await api(`/api/agents/${agentId}/tools`, 'POST', toolData);
            return ok(`✅ Strumento "${tool.name}" configurato!\n\nID: ${tool.id}`);
        } catch (e) { return err(e); }
    }
);

// ======================
// WIDGET TOOLS
// ======================

server.tool(
    'get_widget_config',
    'Ottieni la configurazione del widget embed di un agente',
    { agentId: z.string().describe('ID dell\'agente') },
    async ({ agentId }) => {
        try {
            const { widget } = await api(`/api/agents/${agentId}/widget`);
            return ok(`Widget Config:\n\nEmbed Code: ${widget.embedCode}\nURL: ${widget.embedUrl}\n\nPersonalizzazioni:\n${JSON.stringify(widget.customization, null, 2)}`);
        } catch (e) { return err(e); }
    }
);

server.tool(
    'update_widget_config',
    'Personalizza il widget embed',
    {
        agentId: z.string().describe('ID dell\'agente'),
        primaryColor: z.string().optional().describe('Colore primario (hex)'),
        position: z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left']).optional().describe('Posizione'),
        buttonText: z.string().optional().describe('Testo pulsante'),
        welcomeMessage: z.string().optional().describe('Messaggio di benvenuto'),
        avatarUrl: z.string().optional().describe('URL avatar')
    },
    async ({ agentId, ...customization }) => {
        try {
            const cleanData = Object.fromEntries(Object.entries(customization).filter(([_, v]) => v !== undefined));
            const { widget } = await api(`/api/agents/${agentId}/widget`, 'PATCH', { customization: cleanData });
            return ok(`✅ Widget aggiornato!\n\nEmbed Code: ${widget.embedCode}`);
        } catch (e) { return err(e); }
    }
);

// ======================
// START SERVER
// ======================

async function main() {
    console.error(`🚀 VoiceForge MCP v${VERSION}`);
    console.error(`   Server: ${BASE_URL}`);
    console.error('');

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('✅ Connesso e pronto');
}

main().catch(e => {
    console.error('❌ Errore fatale:', e.message);
    process.exit(1);
});
