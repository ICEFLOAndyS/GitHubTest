/**
 * RBM API Utility Script Include
 * 
 * Provides common utilities for RBM API operations:
 * - Correlation ID generation and management
 * - Standard success/error response helpers
 * - Request validation utilities
 */

import { gs } from '@servicenow/glide';

export class RBMApiUtil {
    
    /**
     * Generate a correlation ID for request tracking
     * @param {string} prefix - Optional prefix for correlation ID
     * @returns {string} Generated correlation ID
     */
    static generateCorrelationId(prefix = 'rbm') {
        const timestamp = new Date().getTime();
        const random = Math.random().toString(36).substr(2, 9);
        return `${prefix}_${timestamp}_${random}`;
    }
    
    /**
     * Extract or generate correlation ID from request context
     * @param {Object} context - Request context object
     * @returns {string} Correlation ID
     */
    static getCorrelationId(context) {
        if (context && context.correlationId) {
            // Validate format to prevent injection
            if (typeof context.correlationId === 'string' && 
                /^[a-zA-Z0-9_-]{1,100}$/.test(context.correlationId)) {
                return context.correlationId;
            }
        }
        return this.generateCorrelationId();
    }
    
    /**
     * Create standard success response
     * @param {*} data - Response data
     * @param {string} correlationId - Request correlation ID
     * @returns {Object} Standard success response
     */
    static createSuccessResponse(data, correlationId) {
        return {
            ...data,
            correlationId: correlationId,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Create standard error response
     * @param {string} code - Error code
     * @param {string} message - Error message
     * @param {string} correlationId - Request correlation ID
     * @param {number} httpStatus - HTTP status code
     * @returns {Object} Standard error response
     */
    static createErrorResponse(code, message, correlationId, httpStatus = 400) {
        const errorResponse = {
            error: {
                code: code,
                message: message
            },
            correlationId: correlationId,
            timestamp: new Date().toISOString()
        };
        
        // Log error for monitoring
        gs.error(`RBM API Error [${code}]: ${message} - CorrelationId: ${correlationId}`);
        
        return {
            response: errorResponse,
            httpStatus: httpStatus
        };
    }
    
    /**
     * Validate required fields in request body
     * @param {Object} requestBody - Request body to validate
     * @param {Array<string>} requiredFields - Required field names
     * @returns {Object} Validation result
     */
    static validateRequiredFields(requestBody, requiredFields) {
        const missingFields = [];
        
        for (const field of requiredFields) {
            if (!this.hasValue(requestBody, field)) {
                missingFields.push(field);
            }
        }
        
        return {
            valid: missingFields.length === 0,
            missingFields: missingFields
        };
    }
    
    /**
     * Check if nested field has a value
     * @param {Object} obj - Object to check
     * @param {string} fieldPath - Dot-notation field path (e.g., 'metadata.sourceComponent')
     * @returns {boolean} True if field has value
     */
    static hasValue(obj, fieldPath) {
        const keys = fieldPath.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current == null || typeof current !== 'object') {
                return false;
            }
            current = current[key];
        }
        
        return current !== null && current !== undefined && current !== '';
    }
    
    /**
     * Sanitize input string to prevent injection attacks
     * @param {string} input - Input string to sanitize
     * @param {number} maxLength - Maximum allowed length
     * @returns {string} Sanitized string
     */
    static sanitizeString(input, maxLength = 1000) {
        if (typeof input !== 'string') {
            return '';
        }
        
        // Remove potentially dangerous characters and limit length
        return input
            .replace(/[<>\"'&]/g, '') // Remove HTML/script injection chars
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .substr(0, maxLength);
    }
    
    /**
     * Validate and sanitize array input
     * @param {*} input - Input to validate as array
     * @param {number} maxLength - Maximum array length
     * @returns {Array} Validated array
     */
    static validateArray(input, maxLength = 1000) {
        if (!Array.isArray(input)) {
            return [];
        }
        
        return input.slice(0, maxLength);
    }
    
    /**
     * Log API operation for audit/monitoring
     * @param {string} operation - Operation name
     * @param {Object} metadata - Operation metadata
     * @param {string} correlationId - Correlation ID
     */
    static logApiOperation(operation, metadata, correlationId) {
        const logData = {
            operation: operation,
            user: gs.getUserID(),
            timestamp: new Date().toISOString(),
            correlationId: correlationId,
            metadata: metadata
        };
        
        gs.info(`RBM API Operation: ${operation} - User: ${gs.getUserID()} - CorrelationId: ${correlationId}`);
        
        // Could be enhanced to write to custom audit table
        // this.writeApiAuditLog(logData);
    }
    
    /**
     * Check if current user has required role
     * @param {string} roleName - Role name to check
     * @returns {boolean} True if user has role
     */
    static hasRole(roleName) {
        return gs.hasRole(roleName);
    }
    
    /**
     * Get current user information
     * @returns {Object} User information
     */
    static getCurrentUserInfo() {
        return {
            userId: gs.getUserID(),
            userName: gs.getUserName(),
            userDisplayName: gs.getUserDisplayName(),
            roles: gs.getUser().getRoles().toString().split(',')
        };
    }
    
    /**
     * Validate pagination parameters
     * @param {Object} page - Page parameters
     * @param {number} maxPageSize - Maximum page size allowed
     * @returns {Object} Validated pagination
     */
    static validatePagination(page, maxPageSize = 200) {
        const validatedPage = {
            size: 25, // default
            offset: 0,
            cursor: null
        };
        
        if (page && typeof page === 'object') {
            // Validate page size
            if (typeof page.size === 'number' && page.size > 0) {
                validatedPage.size = Math.min(page.size, maxPageSize);
            }
            
            // Validate offset
            if (typeof page.offset === 'number' && page.offset >= 0) {
                validatedPage.offset = page.offset;
            }
            
            // Validate cursor (for cursor-based pagination)
            if (typeof page.cursor === 'string') {
                validatedPage.cursor = this.sanitizeString(page.cursor, 100);
            }
        }
        
        return validatedPage;
    }
    
    /**
     * Create HTTP response with proper headers and status
     * @param {Object} response - ServiceNow response object
     * @param {Object} data - Response data
     * @param {number} status - HTTP status code
     */
    static sendResponse(response, data, status = 200) {
        response.setStatus(status);
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.getStreamWriter().writeString(JSON.stringify(data));
    }
}