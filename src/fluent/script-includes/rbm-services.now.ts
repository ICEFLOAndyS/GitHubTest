/**
 * RBM Script Includes - Fluent Definitions
 * 
 * Defines the Script Include metadata for RBM governance services
 */

import '@servicenow/sdk/global';
import { ScriptInclude } from '@servicenow/sdk/core';

// RBMApiUtil Script Include
export const rbmApiUtil = ScriptInclude({
    $id: Now.ID['rbm-api-util'],
    name: 'RBMApiUtil',
    script: Now.include('../../server/script-includes/RBMApiUtil.js'),
    description: 'RBM API utilities for correlation ID generation, validation, and standard response helpers',
    active: true,
    clientCallable: false
});

// RBMRecordListService Script Include  
export const rbmRecordListService = ScriptInclude({
    $id: Now.ID['rbm-record-list-service'],
    name: 'RBMRecordListService',
    script: Now.include('../../server/script-includes/RBMRecordListService.js'),
    description: 'RBM Record List service with hard allow-list registry and server-side data operations',
    active: true,
    clientCallable: false
});

// RBMRecordListActionService Script Include
export const rbmRecordListActionService = ScriptInclude({
    $id: Now.ID['rbm-record-list-action-service'],
    name: 'RBMRecordListActionService',
    script: Now.include('../../server/script-includes/RBMRecordListActionService.js'),
    description: 'RBM Record List action service with action registry and ACL enforcement',
    active: true,
    clientCallable: false
});

// RBMEvidenceService Script Include
export const rbmEvidenceService = ScriptInclude({
    $id: Now.ID['rbm-evidence-service'],
    name: 'RBMEvidenceService',
    script: Now.include('../../server/script-includes/RBMEvidenceService.js'),
    description: 'RBM Evidence service for audit logging and governance compliance',
    active: true,
    clientCallable: false
});

// RBMAuditMetadataValidator Script Include (NEW for v1.9.5)
export const rbmAuditMetadataValidator = ScriptInclude({
    $id: Now.ID['rbm-audit-metadata-validator'],
    name: 'RBMAuditMetadataValidator',
    script: Now.include('../../server/script-includes/RBMAuditMetadataValidator.js'),
    description: 'RBM Audit Metadata Validator for AUTHORITATIVE v1.9.5 compliance enforcement',
    active: true,
    clientCallable: false
});