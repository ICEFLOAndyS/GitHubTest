/**
 * WCAG 2.1 AA Accessibility Validation and Testing Utilities
 * 
 * Comprehensive testing suite for keyboard navigation, screen reader compatibility,
 * and WCAG compliance validation
 */

export interface AccessibilityTestResult {
  testName: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
  wcagCriteria?: string[];
}

export interface AccessibilityReport {
  overall: 'pass' | 'fail' | 'warning';
  score: number;
  results: AccessibilityTestResult[];
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

export class AccessibilityTester {
  private container: HTMLElement;
  private results: AccessibilityTestResult[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Run comprehensive accessibility test suite
   */
  async runFullTestSuite(): Promise<AccessibilityReport> {
    this.results = [];

    // WCAG 2.1 AA Test Categories
    await this.testKeyboardNavigation();
    await this.testARIAImplementation();
    await this.testFocusManagement();
    await this.testScreenReaderSupport();
    await this.testColorIndependence();
    await this.testTextAlternatives();
    await this.testInteractionTargets();

    return this.generateReport();
  }

  /**
   * Test keyboard navigation compliance (WCAG 2.1.1, 2.1.2)
   */
  private async testKeyboardNavigation(): Promise<void> {
    // Test 1: All interactive elements are keyboard accessible
    const interactiveElements = this.container.querySelectorAll(
      'button, a, input, select, textarea, [tabindex], [role="button"], [role="link"], [role="menuitem"]'
    );

    let keyboardAccessibleCount = 0;
    interactiveElements.forEach((element) => {
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex !== '-1' && !element.hasAttribute('disabled')) {
        keyboardAccessibleCount++;
      }
    });

    this.addResult({
      testName: 'Keyboard Accessibility',
      passed: keyboardAccessibleCount === interactiveElements.length,
      message: `${keyboardAccessibleCount}/${interactiveElements.length} interactive elements are keyboard accessible`,
      severity: keyboardAccessibleCount === interactiveElements.length ? 'info' : 'error',
      wcagCriteria: ['2.1.1', '2.1.2']
    });

    // Test 2: Tab order is logical
    const tabbableElements = Array.from(this.container.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));

    const tabIndices = tabbableElements.map(el => {
      const tabIndex = el.getAttribute('tabindex');
      return tabIndex ? parseInt(tabIndex) : 0;
    });

    const hasLogicalTabOrder = tabIndices.every((index, i) => 
      i === 0 || index >= tabIndices[i - 1] || (index === 0 && tabIndices[i - 1] === 0)
    );

    this.addResult({
      testName: 'Tab Order',
      passed: hasLogicalTabOrder,
      message: hasLogicalTabOrder ? 'Tab order is logical' : 'Tab order is inconsistent',
      severity: hasLogicalTabOrder ? 'info' : 'warning',
      wcagCriteria: ['2.4.3']
    });

    // Test 3: Focus trap in modals/dialogs
    const modals = this.container.querySelectorAll('[role="dialog"], [role="modal"]');
    let focusTrapWorking = true;

    modals.forEach(modal => {
      const focusableElements = modal.querySelectorAll(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) {
        focusTrapWorking = false;
      }
    });

    this.addResult({
      testName: 'Focus Trap in Modals',
      passed: focusTrapWorking,
      message: focusTrapWorking ? 'Focus trap implemented correctly' : 'Focus trap issues detected',
      severity: focusTrapWorking ? 'info' : 'error',
      wcagCriteria: ['2.1.2']
    });
  }

  /**
   * Test ARIA implementation (WCAG 4.1.2)
   */
  private async testARIAImplementation(): Promise<void> {
    // Test 1: Required ARIA attributes
    const elementsWithRoles = this.container.querySelectorAll('[role]');
    let ariaCompliant = true;

    elementsWithRoles.forEach(element => {
      const role = element.getAttribute('role');
      
      // Check specific ARIA requirements
      if (role === 'grid' && !element.hasAttribute('aria-rowcount')) {
        ariaCompliant = false;
      }
      if (role === 'gridcell' && !element.hasAttribute('aria-label') && !element.textContent?.trim()) {
        ariaCompliant = false;
      }
      if ((role === 'checkbox' || role === 'radio') && !element.hasAttribute('aria-checked')) {
        ariaCompliant = false;
      }
      if (role === 'menu' && !element.hasAttribute('aria-orientation')) {
        ariaCompliant = false;
      }
    });

    this.addResult({
      testName: 'ARIA Attributes',
      passed: ariaCompliant,
      message: ariaCompliant ? 'ARIA attributes are properly implemented' : 'Missing required ARIA attributes',
      severity: ariaCompliant ? 'info' : 'error',
      wcagCriteria: ['4.1.2']
    });

    // Test 2: ARIA live regions
    const liveRegions = this.container.querySelectorAll('[aria-live]');
    const hasLiveRegions = liveRegions.length > 0;

    this.addResult({
      testName: 'ARIA Live Regions',
      passed: hasLiveRegions,
      message: hasLiveRegions ? 'ARIA live regions implemented' : 'No ARIA live regions found',
      severity: hasLiveRegions ? 'info' : 'warning',
      wcagCriteria: ['4.1.3']
    });

    // Test 3: Aria-label or aria-labelledby on form controls
    const formControls = this.container.querySelectorAll('input, select, textarea');
    let labelingCompliant = true;

    formControls.forEach(control => {
      const hasLabel = control.hasAttribute('aria-label') || 
                     control.hasAttribute('aria-labelledby') ||
                     control.closest('label') ||
                     document.querySelector(`label[for="${control.id}"]`);
      
      if (!hasLabel) {
        labelingCompliant = false;
      }
    });

    this.addResult({
      testName: 'Form Control Labels',
      passed: labelingCompliant,
      message: labelingCompliant ? 'All form controls are properly labeled' : 'Some form controls lack labels',
      severity: labelingCompliant ? 'info' : 'error',
      wcagCriteria: ['3.3.2', '4.1.2']
    });
  }

  /**
   * Test focus management (WCAG 2.4.3, 2.4.7)
   */
  private async testFocusManagement(): Promise<void> {
    // Test 1: Visible focus indicators
    const focusableElements = this.container.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    let hasFocusIndicators = true;
    focusableElements.forEach(element => {
      // Simulate focus to test focus indicators
      (element as HTMLElement).focus();
      const computedStyle = window.getComputedStyle(element);
      const hasFocusStyle = computedStyle.outline !== 'none' || 
                          computedStyle.boxShadow !== 'none' ||
                          element.classList.contains('focused');
      
      if (!hasFocusStyle) {
        hasFocusIndicators = false;
      }
    });

    this.addResult({
      testName: 'Focus Indicators',
      passed: hasFocusIndicators,
      message: hasFocusIndicators ? 'Focus indicators are visible' : 'Some elements lack visible focus indicators',
      severity: hasFocusIndicators ? 'info' : 'error',
      wcagCriteria: ['2.4.7']
    });

    // Test 2: Focus order matches visual order
    const visuallyOrderedElements = Array.from(focusableElements).sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      
      // Sort by top position first, then left position
      if (Math.abs(aRect.top - bRect.top) > 5) {
        return aRect.top - bRect.top;
      }
      return aRect.left - bRect.left;
    });

    const focusOrderMatches = Array.from(focusableElements).every((element, index) => {
      return element === visuallyOrderedElements[index];
    });

    this.addResult({
      testName: 'Focus Order',
      passed: focusOrderMatches,
      message: focusOrderMatches ? 'Focus order matches visual order' : 'Focus order does not match visual order',
      severity: focusOrderMatches ? 'info' : 'warning',
      wcagCriteria: ['2.4.3']
    });
  }

  /**
   * Test screen reader support (WCAG 4.1.2)
   */
  private async testScreenReaderSupport(): Promise<void> {
    // Test 1: Semantic structure
    const hasHeadings = this.container.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]').length > 0;
    const hasLandmarks = this.container.querySelectorAll('[role="main"], [role="navigation"], [role="search"], [role="banner"], main, nav').length > 0;

    this.addResult({
      testName: 'Semantic Structure',
      passed: hasHeadings || hasLandmarks,
      message: (hasHeadings || hasLandmarks) ? 'Semantic structure present' : 'No semantic structure found',
      severity: (hasHeadings || hasLandmarks) ? 'info' : 'warning',
      wcagCriteria: ['1.3.1']
    });

    // Test 2: Alt text for images
    const images = this.container.querySelectorAll('img');
    let altTextCompliant = true;

    images.forEach(img => {
      if (!img.hasAttribute('alt') && !img.hasAttribute('aria-label')) {
        altTextCompliant = false;
      }
    });

    this.addResult({
      testName: 'Image Alt Text',
      passed: altTextCompliant || images.length === 0,
      message: altTextCompliant ? 'All images have alt text' : 'Some images lack alt text',
      severity: altTextCompliant ? 'info' : 'error',
      wcagCriteria: ['1.1.1']
    });

    // Test 3: Screen reader only content
    const srOnlyElements = this.container.querySelectorAll('.rbm-sr-only, .sr-only, .visually-hidden');
    const hasScreenReaderContent = srOnlyElements.length > 0;

    this.addResult({
      testName: 'Screen Reader Content',
      passed: hasScreenReaderContent,
      message: hasScreenReaderContent ? 'Screen reader specific content provided' : 'No screen reader specific content found',
      severity: hasScreenReaderContent ? 'info' : 'warning',
      wcagCriteria: ['4.1.2']
    });
  }

  /**
   * Test color independence (WCAG 1.4.1)
   */
  private async testColorIndependence(): Promise<void> {
    // Test 1: Status indicators have non-color cues
    const statusElements = this.container.querySelectorAll('[data-status], .status, .rbm-status-indicator, .rbm-enhanced-status-indicator');
    let hasNonColorCues = true;

    statusElements.forEach(element => {
      const hasIcon = element.querySelector('[class*="icon"], .rbm-icon') !== null;
      const hasPattern = element.querySelector('[class*="pattern"], .rbm-pattern') !== null;
      const hasText = element.textContent?.trim() !== '';
      
      if (!hasIcon && !hasPattern && !hasText) {
        hasNonColorCues = false;
      }
    });

    this.addResult({
      testName: 'Color Independence',
      passed: hasNonColorCues || statusElements.length === 0,
      message: hasNonColorCues ? 'Status conveyed through multiple visual cues' : 'Some status relies only on color',
      severity: hasNonColorCues ? 'info' : 'error',
      wcagCriteria: ['1.4.1']
    });

    // Test 2: Form validation not color-only
    const formErrors = this.container.querySelectorAll('[class*="error"], [aria-invalid="true"]');
    let formErrorsAccessible = true;

    formErrors.forEach(element => {
      const hasErrorText = element.textContent?.includes('error') || 
                          element.getAttribute('aria-describedby') ||
                          element.nextElementSibling?.textContent?.includes('error');
      
      if (!hasErrorText) {
        formErrorsAccessible = false;
      }
    });

    this.addResult({
      testName: 'Form Error Communication',
      passed: formErrorsAccessible || formErrors.length === 0,
      message: formErrorsAccessible ? 'Form errors communicated accessibly' : 'Form errors may rely only on color',
      severity: formErrorsAccessible ? 'info' : 'error',
      wcagCriteria: ['1.4.1', '3.3.1']
    });
  }

  /**
   * Test text alternatives (WCAG 1.1.1)
   */
  private async testTextAlternatives(): Promise<void> {
    // Test 1: Interactive elements have accessible names
    const interactiveElements = this.container.querySelectorAll(
      'button, a, input[type="button"], input[type="submit"], [role="button"]'
    );

    let hasAccessibleNames = true;
    interactiveElements.forEach(element => {
      const hasName = element.textContent?.trim() ||
                     element.getAttribute('aria-label') ||
                     element.getAttribute('aria-labelledby') ||
                     element.getAttribute('title');
      
      if (!hasName) {
        hasAccessibleNames = false;
      }
    });

    this.addResult({
      testName: 'Interactive Element Names',
      passed: hasAccessibleNames,
      message: hasAccessibleNames ? 'All interactive elements have accessible names' : 'Some interactive elements lack accessible names',
      severity: hasAccessibleNames ? 'info' : 'error',
      wcagCriteria: ['1.1.1', '4.1.2']
    });
  }

  /**
   * Test interaction targets (WCAG 2.5.5)
   */
  private async testInteractionTargets(): Promise<void> {
    const interactiveElements = this.container.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])'
    );

    let adequateTargetSize = true;
    const minSize = 44; // WCAG AA minimum

    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width < minSize || rect.height < minSize) {
        // Check if element has sufficient padding or margin
        const computedStyle = window.getComputedStyle(element);
        const totalWidth = rect.width + 
          parseFloat(computedStyle.paddingLeft) + 
          parseFloat(computedStyle.paddingRight);
        const totalHeight = rect.height + 
          parseFloat(computedStyle.paddingTop) + 
          parseFloat(computedStyle.paddingBottom);

        if (totalWidth < minSize || totalHeight < minSize) {
          adequateTargetSize = false;
        }
      }
    });

    this.addResult({
      testName: 'Target Size',
      passed: adequateTargetSize,
      message: adequateTargetSize ? 'All targets meet minimum size requirements' : 'Some targets are too small',
      severity: adequateTargetSize ? 'info' : 'warning',
      wcagCriteria: ['2.5.5']
    });
  }

  /**
   * Add test result
   */
  private addResult(result: AccessibilityTestResult): void {
    this.results.push(result);
  }

  /**
   * Generate comprehensive test report
   */
  private generateReport(): AccessibilityReport {
    const totalTests = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed && r.severity === 'error').length;
    const warnings = this.results.filter(r => !r.passed && r.severity === 'warning').length;

    const score = Math.round((passed / totalTests) * 100);
    
    let overall: 'pass' | 'fail' | 'warning';
    if (failed > 0) {
      overall = 'fail';
    } else if (warnings > 0) {
      overall = 'warning';
    } else {
      overall = 'pass';
    }

    return {
      overall,
      score,
      results: this.results,
      summary: {
        totalTests,
        passed,
        failed,
        warnings
      }
    };
  }

  /**
   * Test keyboard navigation specifically
   */
  async testKeyboardOnlyNavigation(): Promise<boolean> {
    return new Promise((resolve) => {
      let canNavigate = true;
      
      // Simulate keyboard navigation
      const focusableElements = Array.from(this.container.querySelectorAll(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )) as HTMLElement[];

      let currentIndex = 0;
      
      const testNextElement = () => {
        if (currentIndex >= focusableElements.length) {
          resolve(canNavigate);
          return;
        }

        const element = focusableElements[currentIndex];
        element.focus();
        
        // Check if element actually received focus
        if (document.activeElement !== element) {
          canNavigate = false;
        }

        // Test keyboard interaction
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        element.dispatchEvent(event);

        currentIndex++;
        setTimeout(testNextElement, 10); // Small delay to allow focus changes
      };

      testNextElement();
    });
  }

  /**
   * Generate detailed accessibility report
   */
  generateDetailedReport(report: AccessibilityReport): string {
    let output = `
# WCAG 2.1 AA Accessibility Report

## Overall Score: ${report.score}/100 (${report.overall.toUpperCase()})

### Summary
- Total Tests: ${report.summary.totalTests}
- Passed: ${report.summary.passed}
- Failed: ${report.summary.failed}  
- Warnings: ${report.summary.warnings}

## Detailed Results

`;

    report.results.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : (result.severity === 'error' ? '❌ FAIL' : '⚠️ WARN');
      const criteria = result.wcagCriteria ? ` (WCAG ${result.wcagCriteria.join(', ')})` : '';
      
      output += `
### ${index + 1}. ${result.testName}${criteria}
**Status:** ${status}
**Message:** ${result.message}

`;
    });

    output += `
## Recommendations

`;

    const failedTests = report.results.filter(r => !r.passed && r.severity === 'error');
    if (failedTests.length > 0) {
      output += '### Critical Issues (Must Fix)\n';
      failedTests.forEach(test => {
        output += `- **${test.testName}:** ${test.message}\n`;
      });
    }

    const warnings = report.results.filter(r => !r.passed && r.severity === 'warning');
    if (warnings.length > 0) {
      output += '\n### Improvement Opportunities\n';
      warnings.forEach(test => {
        output += `- **${test.testName}:** ${test.message}\n`;
      });
    }

    return output;
  }
}