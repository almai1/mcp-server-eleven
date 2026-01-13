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
const VERSION = '1.0.0';

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
