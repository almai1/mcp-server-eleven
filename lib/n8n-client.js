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
        // baseUrl already includes /api/v1, so don't add it again
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            // Use Authorization Bearer for JWT tokens (n8n API standard)
            'Authorization': `Bearer ${this.apiKey}`,
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

    // ============ Tags ============

    /**
     * List all tags
     * @returns {Promise<Array>} List of tags
     */
    async listTags() {
        const result = await this.request('/tags');
        return result.data || result;
    }

    /**
     * Create a new tag
     * @param {string} name 
     * @returns {Promise<Object>} Created tag
     */
    async createTag(name) {
        return this.request('/tags', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    }

    /**
     * Ensure a tag exists and return its ID
     * @param {string} name 
     * @returns {Promise<string>} Tag ID
     */
    async ensureTag(name) {
        try {
            const tags = await this.listTags();
            const existing = tags.find(t => t.name === name);
            if (existing) return existing.id;

            const newTag = await this.createTag(name);
            return newTag.id;
        } catch (error) {
            console.error(`Failed to ensure tag ${name}:`, error);
            throw error;
        }
    }

    // ============ Workflows ============

    /**
     * List all workflows
     * @param {Object} options - { active?: boolean, tags?: string[] }
     * @returns {Promise<Array>} List of workflows
     */
    async listWorkflows(options = {}) {
        let endpoint = '/workflows';
        const params = new URLSearchParams();

        if (options.active !== undefined) {
            params.set('active', options.active.toString());
        }

        if (options.tags && options.tags.length > 0) {
            // n8n API filtering by tags often requires resolving names to IDs first
            // But here we accept tag NAMES and resolve them if we are providing a helper
            // standard n8n API might need explicit handling. 
            // For simply listing, n8n API usually accepts `tags` as query param with IDs.
            // We will assume the caller might pass IDs, but if we want to support names 
            // we'd need to fetch tags first. 
            // For now, let's assume the caller handles ID resolution or we do it here.
            // Let's force ID resolution here for safety if they look like names.

            // This is complex to do efficiently without caching. 
            // For now, pass 'tags' param directly if provided.
            params.set('tags', options.tags.join(','));
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
     * @param {Object} workflowData - { name, nodes, connections, settings?, tags?: string[] }
     * @returns {Promise<Object>} Created workflow
     */
    async createWorkflow(workflowData) {
        // Resolve tags if provided as names
        if (workflowData.tags && workflowData.tags.length > 0) {
            const tagIds = [];
            for (const tag of workflowData.tags) {
                // If it looks like an ID (short alphanumeric), assume ID, else ensureTag
                // n8n IDs are usually UUIDs or short strings. 
                // Safest is to try ensureTag for everything that doesn't look like a standard n8n ID (nanoId).
                // But simplified: just call ensureTag.
                try {
                    tagIds.push(await this.ensureTag(tag));
                } catch (e) {
                    console.warn(`Could not resolve tag ${tag}, skipping`);
                }
            }
            // n8n API expects tags as array of objects { id: "..." } for creation sometimes
            // or just ids. Let's send objects to be safe for v1 API.
            workflowData.tags = tagIds.map(id => ({ id }));
        }

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
