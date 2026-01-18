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
                    resolve({ error: 'JSON parse error', raw: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log(`🚀 Starting Calendar Tests for Agent ${AGENT_ID} (GPT-4o)\n`);

    // TEST 1: BOOKING
    console.log('--- Test 1: Booking Appointment (Tomorrow 10:00) ---');
    const conversationId1 = undefined; // Start new
    const chat1 = await request(`/api/agents/${AGENT_ID}/chat`, 'POST', {
        message: "Prenota un appuntamento per domani alle 10:00 dal titolo 'Test Appuntamento A'",
        conversationId: conversationId1
    });

    const reply1 = chat1.message?.content || "No content";
    console.log(`Agent Reply: ${reply1.substring(0, 100)}...`);

    // Verify booking
    // Get tomorrow's date YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const events = await request(`/api/agents/${AGENT_ID}/calendar?startDate=${dateStr}T00:00:00&endDate=${dateStr}T23:59:59`, 'GET');
    const createdEvent = events.events?.find(e => e.title.includes('Test Appuntamento A'));

    if (createdEvent) {
        console.log(`✅ Appointment Created: ${createdEvent.title} at ${createdEvent.startTime}`);
    } else {
        console.error(`❌ Appointment NOT found in calendar list.`);
        console.log('List result:', JSON.stringify(events, null, 2));
    }

    // TEST 2: CONFLICT
    console.log('\n--- Test 2: Conflict Booking (Same Time) ---');
    const chat2 = await request(`/api/agents/${AGENT_ID}/chat`, 'POST', {
        message: "Prenota un ALTRO appuntamento per domani alle 10:00 dal titolo 'Conflitto Sicuro'",
        conversationId: chat1.conversationId // Maintain context
    });

    const reply2 = chat2.message?.content || "No content";
    console.log(`Agent Reply: ${reply2}`);

    // Check if refused (simple keyword check)
    if (reply2.toLowerCase().includes('occupato') || reply2.toLowerCase().includes('già un appuntamento') || reply2.toLowerCase().includes('conflitto')) {
        console.log(`✅ Conflict correctly identified and handled.`);
    } else {
        console.log(`⚠️ Agent response needs manual verification for conflict handling.`);
    }
}

runTests();
