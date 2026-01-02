/**
 * RBM Script Includes - Fluent Definitions
 * 
 * Defines the Script Include metadata for RBM governance services
 */

import '@servicenow/sdk/global';
import { ScriptInclude } from '@servicenow/sdk/core';
import RBMApiUtilScript from '../../server/script-includes/RBMApiUtil.js';
import RBMRecordListServiceScript from '../../server/script-includes/RBMRecordListService.js';
import RBMRecordListActionServiceScript from '../../server/script-includes/RBMRecordListActionService.js';
import RBMEvidenceServiceScript from '../../server/script-includes/RBMEvidenceService.js';

// RBMApiUtil Script Include
export const rbmApiUtil = ScriptInclude({
    $id: Now.ID['rbm-api-util'],
    name: 'RBMApiUtil',
    script: RBMApiUtilScript,
    description: 'RBM API utilities for correlation ID generation, validation, and standard response helpers',
    active: true,
    clientCallable: false
});

// RBMRecordListService Script Include  
export const rbmRecordListService = ScriptInclude({
    $id: Now.ID['rbm-record-list-service'],
    name: 'RBMRecordListService',
    script: RBMRecordListServiceScript,
    description: 'RBM Record List service with hard allow-list registry and server-side data operations',
    active: true,
    clientCallable: false
});

// RBMRecordListActionService Script Include
export const rbmRecordListActionService = ScriptInclude({
    $id: Now.ID['rbm-record-list-action-service'],
    name: 'RBMRecordListActionService',
    script: RBMRecordListActionServiceScript,
    description: 'RBM Record List action service with action registry and ACL enforcement',
    active: true,
    clientCallable: false
});

// RBMEvidenceService Script Include
export const rbmEvidenceService = ScriptInclude({
    $id: Now.ID['rbm-evidence-service'],
    name: 'RBMEvidenceService',
    script: RBMEvidenceServiceScript,
    description: 'RBM Evidence service for audit logging and governance compliance',
    active: true,
    clientCallable: false
});