/**
 * RBM Compliance Test Runner - AUTHORITATIVE v1.9.5
 * 
 * Integration point for running acceptance criteria validation
 */

import React, { useState, useCallback } from 'react';
import { rbmAcceptanceCriteriaValidator } from './acceptance-criteria-validator';

interface ComplianceTestResult {
  passed: boolean;
  results: Array<{
    criterion: string;
    test: string;
    passed: boolean;
    details: string;
    timestamp: string;
  }>;
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    passRate: string;
  };
}

export const RBMComplianceTestRunner: React.FC = () => {
  const [testResult, setTestResult] = useState<ComplianceTestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const runTests = useCallback(async () => {
    setIsRunning(true);
    setTestResult(null);
    
    try {
      console.log('🚀 Starting RBM Acceptance Criteria Validation...');
      const result = await rbmAcceptanceCriteriaValidator.runCompleteValidation();
      setTestResult(result);
      
      if (result.passed) {
        console.log('🎉 All acceptance criteria PASSED!');
      } else {
        console.warn('⚠️ Some acceptance criteria FAILED. See results for details.');
      }
    } catch (error) {
      console.error('💥 Test execution failed:', error);
      setTestResult({
        passed: false,
        results: [{
          criterion: 'Test Execution',
          test: 'Test Runner Execution',
          passed: false,
          details: error.message,
          timestamp: new Date().toISOString()
        }],
        summary: {
          totalTests: 1,
          passed: 0,
          failed: 1,
          passRate: '0.0%'
        }
      });
    } finally {
      setIsRunning(false);
    }
  }, []);
  
  const downloadReport = useCallback(() => {
    if (!testResult) return;
    
    const report = rbmAcceptanceCriteriaValidator.generateComplianceReport();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rbm-compliance-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [testResult]);
  
  return (
    <div className="rbm-compliance-test-runner" style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>🔍 RBM Audit Metadata Compliance Validation</h2>
      <p>
        This tool validates that the RBM implementation meets ALL authoritative v1.9.5 acceptance criteria:
      </p>
      <ul>
        <li><strong>Criterion 1:</strong> Metadata always present in requests</li>
        <li><strong>Criterion 2:</strong> Justification enforced in UI</li>
        <li><strong>Criterion 3:</strong> No audit data stored client-side</li>
      </ul>
      
      <div style={{ margin: '20px 0' }}>
        <button
          onClick={runTests}
          disabled={isRunning}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: isRunning ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isRunning ? '⏳ Running Tests...' : '🚀 Run Compliance Tests'}
        </button>
        
        {testResult && (
          <button
            onClick={downloadReport}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📄 Download Report
          </button>
        )}
      </div>
      
      {testResult && (
        <div className="test-results" style={{ marginTop: '20px' }}>
          <div
            style={{
              padding: '15px',
              borderRadius: '4px',
              backgroundColor: testResult.passed ? '#d4edda' : '#f8d7da',
              border: `1px solid ${testResult.passed ? '#c3e6cb' : '#f5c6cb'}`,
              marginBottom: '20px'
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', color: testResult.passed ? '#155724' : '#721c24' }}>
              {testResult.passed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}
            </h3>
            <p style={{ margin: '0', color: testResult.passed ? '#155724' : '#721c24' }}>
              <strong>Summary:</strong> {testResult.summary.passed}/{testResult.summary.totalTests} tests passed ({testResult.summary.passRate})
            </p>
          </div>
          
          <div className="detailed-results">
            <h4>📋 Detailed Results</h4>
            {testResult.results.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '10px',
                  margin: '10px 0',
                  backgroundColor: result.passed ? '#f8f9fa' : '#fff3cd',
                  border: `1px solid ${result.passed ? '#dee2e6' : '#ffeaa7'}`,
                  borderRadius: '4px'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {result.passed ? '✅' : '❌'} {result.test}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <strong>Criterion:</strong> {result.criterion}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <strong>Details:</strong> {result.details}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {result.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {isRunning && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '18px', color: '#007bff' }}>
            ⏳ Running compliance validation tests...
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            This may take a few moments while we validate all acceptance criteria.
          </div>
        </div>
      )}
    </div>
  );
};

export default RBMComplianceTestRunner;