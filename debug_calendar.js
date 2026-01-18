const https = require('https');

const API_KEY = process.env.VOICEFORGE_API_KEY;
if (!API_KEY) {
    console.error('❌ ERRORE: VOICEFORGE_API_KEY è richiesta.');
    process.exit(1);
}
const AGENT_ID = 'cmkbsjuv400011hxay5yjreqs';
const HOST = 'voiceforge.super-chatbot.com';

function request(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            path: path,
            method: 'GET',
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    console.error('Error parsing JSON:', data);
                    resolve({});
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function check() {
    console.log('Checking Tools...');
    const toolsData = await request(`/api/agents/${AGENT_ID}/tools`);
    console.log(JSON.stringify(toolsData, null, 2));

    console.log('\nChecking Events...');
    const eventsData = await request(`/api/agents/${AGENT_ID}/calendar`);
    console.log(JSON.stringify(eventsData, null, 2));
}

check();
