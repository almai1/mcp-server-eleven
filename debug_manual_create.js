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
                    console.log(`Status: ${res.statusCode}`);
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve({ error: 'JSON parse error', raw: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    console.log(`Creating Manual Event for Agent ${AGENT_ID}...`);

    // Create for tomorrow 10:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const payload = {
        title: "Manual Debug Event",
        startTime: tomorrow.toISOString(),
        description: "Created via debug_manual_create.js to verify persistence"
    };

    const result = await request(`/api/agents/${AGENT_ID}/calendar`, 'POST', payload);
    console.log('Create Result:', JSON.stringify(result, null, 2));

    if (result.event) {
        console.log('✅ Event Created. Listing to verify...');
        const listResult = await request(`/api/agents/${AGENT_ID}/calendar?view=week`, 'GET');
        const found = listResult.events?.find(e => e.id === result.event.id);
        if (found) {
            console.log('✅ Event successfully retrieved from list.');
        } else {
            console.error('❌ Event created but NOT found in list (Persistence/Query issue).');
        }
    } else {
        console.error('❌ Creation failed.');
    }
}

run();
