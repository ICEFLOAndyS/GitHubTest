import React, { useState, useRef } from 'react';
import { AccessibilityTester, AccessibilityReport } from './AccessibilityTester';
import { EnhancedStatusIndicator } from './EnhancedStatusIndicator';
import { EnhancedSelectionIndicator } from './EnhancedSelectionIndicator';
import { FocusIndicator } from './FocusIndicator';
import { Icon } from './Icon';

/**
 * WCAG 2.1 AA Accessibility Demo Component
 * 
 * Demonstrates all accessibility features and provides testing utilities
 */

export const AccessibilityDemo: React.FC = () => {
  const [testReport, setTestReport] = useState<AccessibilityReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const demoRef = useRef<HTMLDivElement>(null);

  const runAccessibilityTests = async () => {
    if (!demoRef.current) return;
    
    setIsRunningTests(true);
    try {
      const tester = new AccessibilityTester(demoRef.current);
      const report = await tester.runFullTestSuite();
      setTestReport(report);
    } catch (error) {
      console.error('Error running accessibility tests:', error);
    }
    setIsRunningTests(false);
  };

  const handleSelectionChange = (item: string, selected: boolean) => {
    if (selected) {
      setSelectedItems(prev => [...prev, item]);
    } else {
      setSelectedItems(prev => prev.filter(i => i !== item));
    }
  };

  const demoData = [
    { id: 'item1', name: 'Critical System Alert', status: 'error', priority: 'high' },
    { id: 'item2', name: 'Maintenance Warning', status: 'warning', priority: 'medium' },
    { id: 'item3', name: 'System Operational', status: 'success', priority: 'low' },
    { id: 'item4', name: 'Update Available', status: 'info', priority: 'low' },
    { id: 'item5', name: 'Processing Request', status: 'in-progress', priority: 'medium' }
  ];

  return (
    <div ref={demoRef} className="accessibility-demo">
      <header>
        <h1>WCAG 2.1 AA Accessibility Demo</h1>
        <p>This demo showcases all implemented accessibility features for the RBM Record List component.</p>
      </header>

      <main>
        {/* Accessibility Testing Section */}
        <section aria-labelledby="testing-heading">
          <h2 id="testing-heading">Accessibility Testing</h2>
          
          <div className="test-controls">
            <button
              onClick={runAccessibilityTests}
              disabled={isRunningTests}
              className="rbm-button rbm-button--primary"
              aria-describedby="test-description"
            >
              {isRunningTests ? (
                <>
                  <Icon name="loading" size="sm" decorative />
                  Running Tests...
                </>
              ) : (
                <>
                  <Icon name="check" size="sm" decorative />
                  Run Accessibility Tests
                </>
              )}
            </button>
            
            <p id="test-description">
              This will run a comprehensive WCAG 2.1 AA compliance test suite on all components.
            </p>
          </div>

          {testReport && (
            <div className="test-results" role="region" aria-label="Test Results">
              <h3>Test Results</h3>
              <div className={`test-summary test-summary--${testReport.overall}`}>
                <EnhancedStatusIndicator
                  status={testReport.overall === 'pass' ? 'success' : testReport.overall === 'fail' ? 'error' : 'warning'}
                  text={`Score: ${testReport.score}/100`}
                  variant="detailed"
                />
                <div className="test-stats">
                  <span>Total: {testReport.summary.totalTests}</span>
                  <span>Passed: {testReport.summary.passed}</span>
                  <span>Failed: {testReport.summary.failed}</span>
                  <span>Warnings: {testReport.summary.warnings}</span>
                </div>
              </div>
              
              <details className="test-details">
                <summary>View Detailed Results ({testReport.results.length} tests)</summary>
                <ul role="list">
                  {testReport.results.map((result, index) => (
                    <li key={index} role="listitem">
                      <EnhancedStatusIndicator
                        status={result.passed ? 'success' : result.severity === 'error' ? 'error' : 'warning'}
                        text={result.testName}
                        description={result.message}
                        variant="compact"
                      />
                      <span className="test-message">{result.message}</span>
                      {result.wcagCriteria && (
                        <span className="wcag-criteria">
                          WCAG {result.wcagCriteria.join(', ')}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          )}
        </section>

        {/* Visual Indicators Demo */}
        <section aria-labelledby="indicators-heading">
          <h2 id="indicators-heading">Visual Indicators (Never Color Alone)</h2>
          
          <div className="demo-grid" role="grid" aria-label="Status indicators demonstration">
            <div role="row" className="demo-grid-header">
              <div role="columnheader">Status</div>
              <div role="columnheader">Description</div>
              <div role="columnheader">Visual Cues</div>
            </div>
            
            {demoData.map((item, index) => (
              <div key={item.id} role="row" className="demo-grid-row">
                <div role="gridcell">
                  <EnhancedStatusIndicator
                    status={item.status as any}
                    text={item.status}
                    variant="detailed"
                    showPattern={true}
                  />
                </div>
                <div role="gridcell">{item.name}</div>
                <div role="gridcell">
                  Icon + Text + Pattern + Border Style
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Selection Demo */}
        <section aria-labelledby="selection-heading">
          <h2 id="selection-heading">Selection Indicators</h2>
          
          <div className="selection-demo">
            <p>Selected items: {selectedItems.length}</p>
            
            <fieldset>
              <legend>Select Demo Items (Multiple Visual Cues)</legend>
              <ul role="list">
                {demoData.map((item) => (
                  <li key={item.id} role="listitem">
                    <FocusIndicator variant="prominent" shape="rounded">
                      <label className="selection-item">
                        <EnhancedSelectionIndicator
                          isSelected={selectedItems.includes(item.id)}
                          selectionMode="multiple"
                          showText={true}
                          variant="detailed"
                          onChange={(selected) => handleSelectionChange(item.id, selected)}
                        />
                        <span className="selection-label">{item.name}</span>
                      </label>
                    </FocusIndicator>
                  </li>
                ))}
              </ul>
            </fieldset>
          </div>
        </section>

        {/* Keyboard Navigation Demo */}
        <section aria-labelledby="keyboard-heading">
          <h2 id="keyboard-heading">Keyboard Navigation</h2>
          
          <div className="keyboard-demo">
            <div className="keyboard-instructions" role="region" aria-label="Keyboard navigation instructions">
              <h3>Try These Keyboard Interactions:</h3>
              <dl>
                <dt><kbd>Tab</kbd></dt>
                <dd>Navigate between focusable elements</dd>
                
                <dt><kbd>Arrow Keys</kbd></dt>
                <dd>Navigate within grids and menus</dd>
                
                <dt><kbd>Space</kbd></dt>
                <dd>Toggle selection checkboxes</dd>
                
                <dt><kbd>Enter</kbd></dt>
                <dd>Activate buttons and links</dd>
                
                <dt><kbd>Escape</kbd></dt>
                <dd>Close modals and menus</dd>
              </dl>
            </div>

            <div className="demo-actions">
              <button className="rbm-button rbm-button--primary">
                <Icon name="view" size="sm" decorative />
                Primary Action
              </button>
              
              <button className="rbm-button rbm-button--secondary">
                <Icon name="edit" size="sm" decorative />
                Secondary Action
              </button>
              
              <button className="rbm-button rbm-button--danger">
                <Icon name="delete" size="sm" decorative />
                Danger Action
              </button>
            </div>
          </div>
        </section>

        {/* Screen Reader Demo */}
        <section aria-labelledby="screen-reader-heading">
          <h2 id="screen-reader-heading">Screen Reader Support</h2>
          
          <div className="screen-reader-demo">
            <p>This section includes content specifically for screen readers:</p>
            
            {/* Live region for announcements */}
            <div aria-live="polite" aria-atomic="true" className="rbm-sr-only" id="announcements">
              Dynamic announcements appear here
            </div>
            
            {/* Screen reader only instructions */}
            <div className="rbm-sr-only">
              Screen reader users: This demo showcases various accessibility features.
              Navigate using your screen reader's commands to explore the content.
            </div>
            
            <div className="visible-content">
              <h3>Content with Screen Reader Enhancements</h3>
              <table role="table" aria-label="Demo data table">
                <thead>
                  <tr role="row">
                    <th role="columnheader" scope="col">Item</th>
                    <th role="columnheader" scope="col">Status</th>
                    <th role="columnheader" scope="col">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {demoData.map((item, index) => (
                    <tr key={item.id} role="row">
                      <td role="cell">
                        <span>{item.name}</span>
                        <span className="rbm-sr-only">
                          , Row {index + 1} of {demoData.length}
                        </span>
                      </td>
                      <td role="cell">
                        <EnhancedStatusIndicator
                          status={item.status as any}
                          text={item.status}
                          variant="compact"
                        />
                      </td>
                      <td role="cell">{item.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Skip links (typically at top of page) */}
      <nav className="skip-links" aria-label="Skip links">
        <a href="#testing-heading" className="skip-link">Skip to Testing</a>
        <a href="#indicators-heading" className="skip-link">Skip to Visual Indicators</a>
        <a href="#selection-heading" className="skip-link">Skip to Selection</a>
        <a href="#keyboard-heading" className="skip-link">Skip to Keyboard Navigation</a>
        <a href="#screen-reader-heading" className="skip-link">Skip to Screen Reader</a>
      </nav>
    </div>
  );
};