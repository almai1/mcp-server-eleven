/**
 * n8n API Client
 * Wrapper for n8n REST API
 */

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://10.0.1.113:5678';
const N8N_API_KEY = process.env.N8N_API_KEY || '';

class N8nClient {
    constructor(baseUrl = N8N_BASE_URL, apiKey = N8N_API_KEY) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}/api/v1${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': this.apiKey,
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`n8n API error (${response.status}): ${error}`);
        }

        return response.json();
    }

    // ============ Workflows ============

    /**
     * List all workflows
     * @param {Object} options - { active?: boolean }
     * @returns {Promise<Array>} List of workflows
     */
    async listWorkflows(options = {}) {
        let endpoint = '/workflows';
        const params = new URLSearchParams();
        if (options.active !== undefined) {
            params.set('active', options.active.toString());
        }
        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }
        const result = await this.request(endpoint);
        return result.data || result;
    }

    /**
     * Get workflow by ID
     * @param {string} workflowId 
     * @returns {Promise<Object>} Workflow details
     */
    async getWorkflow(workflowId) {
        return this.request(`/workflows/${workflowId}`);
    }

    /**
     * Create a new workflow
     * @param {Object} workflowData - { name, nodes, connections, settings? }
     * @returns {Promise<Object>} Created workflow
     */
    async createWorkflow(workflowData) {
        return this.request('/workflows', {
            method: 'POST',
            body: JSON.stringify(workflowData),
        });
    }

    /**
     * Update an existing workflow
     * @param {string} workflowId 
     * @param {Object} updates 
     * @returns {Promise<Object>} Updated workflow
     */
    async updateWorkflow(workflowId, updates) {
        return this.request(`/workflows/${workflowId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });
    }

    /**
     * Delete a workflow
     * @param {string} workflowId 
     * @returns {Promise<Object>}
     */
    async deleteWorkflow(workflowId) {
        return this.request(`/workflows/${workflowId}`, {
            method: 'DELETE',
        });
    }

    /**
     * Activate a workflow
     * @param {string} workflowId 
     * @returns {Promise<Object>}
     */
    async activateWorkflow(workflowId) {
        return this.request(`/workflows/${workflowId}/activate`, {
            method: 'POST',
        });
    }

    /**
     * Deactivate a workflow
     * @param {string} workflowId 
     * @returns {Promise<Object>}
     */
    async deactivateWorkflow(workflowId) {
        return this.request(`/workflows/${workflowId}/deactivate`, {
            method: 'POST',
        });
    }

    // ============ Executions ============

    /**
     * Execute a workflow
     * @param {string} workflowId 
     * @param {Object} data - Input data for the workflow
     * @returns {Promise<Object>} Execution result
     */
    async executeWorkflow(workflowId, data = {}) {
        return this.request(`/workflows/${workflowId}/execute`, {
            method: 'POST',
            body: JSON.stringify({ data }),
        });
    }

    /**
     * Get execution by ID
     * @param {string} executionId 
     * @returns {Promise<Object>} Execution details
     */
    async getExecution(executionId) {
        return this.request(`/executions/${executionId}`);
    }

    /**
     * List executions
     * @param {Object} options - { workflowId?, limit?, status? }
     * @returns {Promise<Array>} List of executions
     */
    async listExecutions(options = {}) {
        const params = new URLSearchParams();
        if (options.workflowId) params.set('workflowId', options.workflowId);
        if (options.limit) params.set('limit', options.limit.toString());
        if (options.status) params.set('status', options.status);

        let endpoint = '/executions';
        if (params.toString()) {
            endpoint += `?${params.toString()}`;
        }
        const result = await this.request(endpoint);
        return result.data || result;
    }

    // ============ Credentials ============

    /**
     * List credentials
     * @returns {Promise<Array>} List of credentials
     */
    async listCredentials() {
        const result = await this.request('/credentials');
        return result.data || result;
    }

    // ============ Webhook Utilities ============

    /**
     * Get webhook URL for a workflow
     * @param {string} workflowId 
     * @returns {string} Webhook URL
     */
    getWebhookUrl(workflowId) {
        return `${this.baseUrl}/webhook/${workflowId}`;
    }

    /**
     * Get webhook URL for test mode
     * @param {string} workflowId 
     * @returns {string} Test webhook URL
     */
    getTestWebhookUrl(workflowId) {
        return `${this.baseUrl}/webhook-test/${workflowId}`;
    }
}

// Create singleton instance
const n8nClient = new N8nClient();

module.exports = {
    N8nClient,
    n8nClient,
};
