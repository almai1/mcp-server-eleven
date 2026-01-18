const https = require('https');

const API_KEY = process.env.VOICEFORGE_API_KEY;
if (!API_KEY) {
    console.error('❌ ERRORE: VOICEFORGE_API_KEY è richiesta.');
    process.exit(1);
}
const AGENT_ID = 'cmkctvzgg000jwesuhst7scya';
const HOST = 'voiceforge.super-chatbot.com';

function request(path, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.log('Raw response:', data);
                    resolve({ error: 'JSON parse error' });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

const toolDefinitions = [
    {
        name: 'create_appointment',
        description: 'Prenota un nuovo appuntamento nel calendario. Richiede titolo e data/ora inizio (ISO).',
        type: 'calendar',
        config: {
            agentId: AGENT_ID,
            action: 'create_appointment'
        },
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Titolo appuntamento' },
                startTime: { type: 'string', description: 'Data inizio ISO 8601 (es: 2026-01-14T10:00:00)' },
                endTime: { type: 'string', description: 'Data fine ISO 8601' },
                description: { type: 'string' },
                contactName: { type: 'string' },
                contactPhone: { type: 'string' },
                contactEmail: { type: 'string' }
            },
            required: ['title', 'startTime']
        }
    },
    {
        name: 'check_availability',
        description: 'Controlla la disponibilità del calendario per una data specifica.',
        type: 'calendar',
        config: {
            agentId: AGENT_ID,
            action: 'check_availability'
        },
        parameters: {
            type: 'object',
            properties: {
                date: { type: 'string', description: 'Data da controllare (YYYY-MM-DD)' }
            },
            required: ['date']
        }
    },
    {
        name: 'list_appointments',
        description: 'Lista gli appuntamenti esistenti (oggi o settimana).',
        type: 'calendar',
        config: {
            agentId: AGENT_ID,
            action: 'list_appointments'
        },
        parameters: {
            type: 'object',
            properties: {
                period: { type: 'string', enum: ['today', 'week'], description: 'Periodo da visualizzare' }
            }
        }
    }
];

async function run() {
    console.log(`Setting up tools for Agent ${AGENT_ID}...`);

    // 0. Fix Model ID (Direct Patch - bypassing MCP tool limitation)
    console.log(`Patching agent model to 'gpt-4o'...`);
    const patchResult = await request(`/api/agents/${AGENT_ID}`, 'PATCH', { llmModel: 'gpt-4o' });
    if (patchResult.error) console.error('Failed to patch model:', patchResult);
    else console.log('✅ Model updated to gpt-4o');

    // 1. List existing tools
    const listResult = await request(`/api/agents/${AGENT_ID}/tools`, 'GET');
    console.log('Current tools:', listResult);

    // 2. Add tools
    for (const toolDef of toolDefinitions) {
        // Check if exists
        const exists = listResult.tools?.find(t => t.name === toolDef.name);
        if (exists) {
            console.log(`Tool ${toolDef.name} already exists. Enabling...`);
            await request(`/api/agents/${AGENT_ID}/tools/${exists.id}`, 'PATCH', { isEnabled: true });
        } else {
            console.log(`Creating tool ${toolDef.name}...`);
            const createResult = await request(`/api/agents/${AGENT_ID}/tools`, 'POST', toolDef);
            if (createResult.error) {
                console.error(`❌ Failed:`, createResult);
            } else {
                console.log(`✅ Created: ${createResult.tool?.id}`);
            }
        }
    }
}

run();
