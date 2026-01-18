const https = require('https');

const API_KEY = process.env.VOICEFORGE_API_KEY;
if (!API_KEY) {
    console.error('❌ ERRORE: VOICEFORGE_API_KEY è richiesta.');
    process.exit(1);
}
const AGENT_ID = 'cmkbsjuv400011hxay5yjreqs';
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
    console.log(`Checking tools for Agent ${AGENT_ID}...`);

    // 1. List existing tools
    const listResult = await request(`/api/agents/${AGENT_ID}/tools`, 'GET');

    if (!listResult.tools) {
        console.error('Failed to list tools:', JSON.stringify(listResult));
        return;
    }

    const existingTools = listResult.tools;
    console.log(`Found ${existingTools.length} existing tools.`);

    const toolsToEnable = ['create_appointment', 'check_availability', 'list_appointments', 'auto_assign_user'];

    for (const toolName of toolsToEnable) {
        const foundTool = existingTools.find(t => t.name === toolName);

        if (foundTool) {
            console.log(`Tool '${foundTool.name}' found (ID: ${foundTool.id}). Enabled: ${foundTool.isEnabled}`);

            if (!foundTool.isEnabled) {
                console.log(`👉 Enabling tool '${foundTool.name}'...`);
                const updateResult = await request(`/api/agents/${AGENT_ID}/tools/${foundTool.id}`, 'PATCH', {
                    isEnabled: true
                });

                if (updateResult.error) {
                    console.error(`❌ Failed to enable: ${JSON.stringify(updateResult)}`);
                } else {
                    console.log(`✅ Tool enabled successfully.`);
                }
            } else {
                console.log(`Start check passed (already enabled).`);
            }
        } else {
            console.log(`⚠️ Tool '${toolName}' NOT FOUND. Creating it...`);
            const toolDef = toolDefinitions.find(t => t.name === toolName);
            if (toolDef) {
                const createResult = await request(`/api/agents/${AGENT_ID}/tools`, 'POST', toolDef);
                if (createResult.error) console.error(`❌ Creation failed: ${createResult.error}`);
                else console.log(`✅ Created: ${createResult.tool.id}`);
            } else {
                console.log(`Skipping creation (no definition found in script for ${toolName})`);
            }
        }
    }
}

run();
