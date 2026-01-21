/**
 * n8n Client Stub
 * This is a temporary placeholder for the n8n integration
 * Tools that use this will be disabled until the full implementation is added
 */

class N8nClient {
    constructor() {
        this.enabled = false;
    }

    async listWorkflows() {
        throw new Error('n8n integration not yet implemented');
    }

    async getWorkflow() {
        throw new Error('n8n integration not yet implemented');
    }

    async createWorkflow() {
        throw new Error('n8n integration not yet implemented');
    }

    async updateWorkflow() {
        throw new Error('n8n integration not yet implemented');
    }

    async deleteWorkflow() {
        throw new Error('n8n integration not yet implemented');
    }

    async activateWorkflow() {
        throw new Error('n8n integration not yet implemented');
    }

    async deactivateWorkflow() {
        throw new Error('n8n integration not yet implemented');
    }

    async executeWorkflow() {
        throw new Error('n8n integration not yet implemented');
    }

    async getExecution() {
        throw new Error('n8n integration not yet implemented');
    }

    async listExecutions() {
        throw new Error('n8n integration not yet implemented');
    }
}

const n8nClient = new N8nClient();

module.exports = { n8nClient, N8nClient };
