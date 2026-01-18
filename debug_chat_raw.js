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
                    // Try to parse, but also log raw if it fails or is interesting
                    console.log('--- RAW RESPONSE ---');
                    console.log(data);
                    console.log('--------------------');
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
    console.log(`Sending Chat Message to Agent ${AGENT_ID}...`);
    const result = await request(`/api/agents/${AGENT_ID}/chat`, 'POST', {
        message: "Prenota un appuntamento per domani alle 10:00 dal titolo 'Test Appuntamento A'"
    });

    console.log('Parsed Result:', JSON.stringify(result, null, 2));
}

run();
