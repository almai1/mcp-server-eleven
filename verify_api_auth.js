// Native fetch is available in Node.js 18+


const API_KEY = 'vf_2b0639e36ec64fd4992683ee9a8297e1';
const BASE_URL = 'https://voiceforge.super-chatbot.com/api';

async function testEndpoint(name, url, method = 'GET', body = null) {
    try {
        console.log(`Testing ${name} (${method} ${url})...`);
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        if (body) options.body = JSON.stringify(body);

        const res = await fetch(`${BASE_URL}${url}`, options);

        if (res.ok) {
            console.log(`✅ ${name}: SUCCESS (${res.status})`);
            const data = await res.json();
            // console.log('Data:', JSON.stringify(data).substring(0, 100) + '...');
            return data;
        } else {
            console.log(`❌ ${name}: FAILED (${res.status})`);
            const text = await res.text();
            console.log('Error:', text);
            return null;
        }
    } catch (error) {
        console.log(`❌ ${name}: ERROR`, error.message);
        return null;
    }
}

async function runTests() {
    console.log('Starting API Key Auth Verification...\n');

    // 0. DEBUG AUTH (New Endpoint)
    await testEndpoint('Debug Auth', '/debug-auth', 'POST', { debug: true });
    const agentsData = await testEndpoint('List Agents', '/agents');

    if (!agentsData || !agentsData.agents || agentsData.agents.length === 0) {
        console.log('⚠️ No agents found. Creating a test agent...');
        // Try to create an agent if none exist
        await testEndpoint('Create Agent', '/agents', 'POST', {
            name: 'Test Agent API',
            description: 'Created via API verification script',
            systemPrompt: 'You are a test agent.'
        });
        // Try listing again
        const agentsDataRetry = await testEndpoint('List Agents (Retry)', '/agents');
        if (!agentsDataRetry || !agentsDataRetry.agents || agentsDataRetry.agents.length === 0) {
            console.error('CRITICAL: Could not get any agent ID. Stopping dependent tests.');
            process.exit(1);
        }
        agentsData.agents = agentsDataRetry.agents;
    }

    const agentId = agentsData.agents[0].id;
    console.log(`Using Agent ID: ${agentId}\n`);

    // 2. Test Updated Routes

    // Analytics
    await testEndpoint('Analytics Dashboard', '/analytics');

    // Tools
    await testEndpoint('List Tools', `/agents/${agentId}/tools`);

    // Calendar
    await testEndpoint('List Calendar Events', `/agents/${agentId}/calendar`);
    await testEndpoint('List Calendar Users', `/agents/${agentId}/calendar/users`);

    // Webhooks
    await testEndpoint('List Webhooks', `/agents/${agentId}/webhooks`);
    // Create/List webhooks for sub-route testing could be added here

    // Workflows
    const workflowsData = await testEndpoint('List Workflows', `/agents/${agentId}/workflows`);
    if (workflowsData && workflowsData.workflows && workflowsData.workflows.length > 0) {
        const workflowId = workflowsData.workflows[0].id;
        await testEndpoint('Get Workflow Details', `/agents/${agentId}/workflows/${workflowId}`);
    }

    // Agent Widget
    await testEndpoint('Get Agent Widget', `/agents/${agentId}/widget`);

    // Agent Chat (Auth check only - logic might fail without credits/setup)
    await testEndpoint('Agent Chat (Auth Check)', `/agents/${agentId}/chat`, 'POST', {
        message: 'Hello' // Minimal body
    });

    // 🔴 REPRODUCTION TESTS (POST)
    console.log('\n--- Reproduction Tests ---');

    // Tools POST
    await testEndpoint('Create Tool (POST)', `/agents/${agentId}/tools`, 'POST', {
        name: 'Test Tool ' + Date.now(),
        description: 'Test Description',
        type: 'custom_api',
        config: { url: 'https://example.com' },
        parameters: { type: 'object' },
        enabled: true
    });

    // Calendar User POST
    await testEndpoint('Add Calendar User (POST)', `/agents/${agentId}/calendar/users`, 'POST', {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        role: 'member'
    });

    // Voices
    const voicesData = await testEndpoint('List Voices', '/voices');
    if (voicesData && voicesData.voices && voicesData.voices.length > 0) {
        const voiceId = voicesData.voices[0].id;
        await testEndpoint('Get Voice Details', `/voices/${voiceId}`);
    }

    // TTS Generate (Auth check - might fail validation/credits but shouldn't be 401)
    await testEndpoint('TTS Generate (Auth Check)', '/tts/generate', 'POST', {
        text: 'Test',
        voice: 'alloy'
    });

    // Phone Numbers
    await testEndpoint('List Phone Numbers', '/phone/numbers');

    // Teams
    const teamsData = await testEndpoint('List Teams', '/teams');
    if (teamsData && teamsData.teams && teamsData.teams.length > 0) {
        const teamId = teamsData.teams[0].id;
        await testEndpoint('Get Team Details', `/teams/${teamId}`);
    }

    // API Keys
    await testEndpoint('List API Keys', '/api-keys');

    // Integrations
    const integrationsData = await testEndpoint('List Integrations', '/integrations');
    if (integrationsData && integrationsData.integrations && integrationsData.integrations.length > 0) {
        const integrationId = integrationsData.integrations[0].id;
        await testEndpoint('Get Integration Details', `/integrations/${integrationId}`);
    }

    // 🔴 CLEANUP: Delete Test Tools to prevent blocking
    console.log('\n--- Cleanup ---');
    const toolsCleanup = await testEndpoint('List Tools (Cleanup)', `/agents/${agentId}/tools`);
    if (toolsCleanup && toolsCleanup.tools) {
        for (const tool of toolsCleanup.tools) {
            if (tool.name.startsWith('Test Tool')) {
                console.log(`Deleting cleanup target: ${tool.name} (${tool.id})...`);
                await testEndpoint(`DELETE Tool ${tool.name}`, `/agents/${agentId}/tools/${tool.id}`, 'DELETE');
            }
        }
    }

    console.log('\nVerification Complete.');
}

runTests();
