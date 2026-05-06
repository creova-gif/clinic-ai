#!/usr/bin/env node

/**
 * CI/CD TRANSLATION GATE
 * AfyaCare Tanzania
 * 
 * Runs all translation validation checks before deployment
 * BLOCKS deployment if any critical issues found
 * 
 * Usage:
 *   node scripts/translationGate.js
 * 
 * Exit codes:
 *   0 - All checks passed
 *   1 - Critical issues found (blocks deployment)
 *   2 - Warnings found (allows deployment with review)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class TranslationGate {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = true;
  }

  /**
   * RUN ALL CHECKS
   */
  async runAllChecks() {
    console.log(this.banner());
    console.log('');

    // 1. Check translation files exist
    await this.checkTranslationFilesExist();

    // 2. Run hardcoded string scanner
    await this.runHardcodedStringScanner();

    // 3. Run missing key detector
    await this.runMissingKeyDetector();

    // 4. Run unused key detector
    await this.runUnusedKeyDetector();

    // 5. Run E2E language switching tests
    await this.runE2ETests();

    // 6. Run backend API language audit
    await this.runBackendAudit();

    // 7. Check translation completeness
    await this.checkTranslationCompleteness();

    // 8. Generate report
    this.generateReport();

    // Exit with appropriate code
    if (this.errors.length > 0) {
      console.log(`\n${colors.red}❌ DEPLOYMENT BLOCKED${colors.reset}\n`);
      process.exit(1);
    } else if (this.warnings.length > 0) {
      console.log(`\n${colors.yellow}⚠️  DEPLOYMENT ALLOWED WITH WARNINGS${colors.reset}\n`);
      process.exit(2);
    } else {
      console.log(`\n${colors.green}✅ ALL CHECKS PASSED - SAFE TO DEPLOY${colors.reset}\n`);
      process.exit(0);
    }
  }

  /**
   * 1. CHECK TRANSLATION FILES EXIST
   */
  async checkTranslationFilesExist() {
    this.logStep('Checking translation files...');

    const requiredFiles = [
      'src/i18n/locales/sw.json',
      'src/i18n/locales/en.json',
      'src/i18n/config.ts'
    ];

    requiredFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        this.errors.push(`Missing required file: ${file}`);
        this.passed = false;
      }
    });

    if (this.errors.length === 0) {
      this.logSuccess('Translation files present');
    } else {
      this.logError('Translation files missing');
    }
  }

  /**
   * 2. RUN HARDCODED STRING SCANNER
   */
  async runHardcodedStringScanner() {
    this.logStep('Scanning for hardcoded strings...');

    try {
      // Run grep to find hardcoded medical terms
      const result = execSync(
        'grep -rn "Emergency\\|Doctor\\|Patient\\|Appointment\\|Symptom\\|Fever\\|Malaria" src/app/components/ --include="*.tsx" --include="*.ts" | grep -v "t(" || true',
        { encoding: 'utf8' }
      );

      if (result.trim()) {
        const lines = result.trim().split('\n');
        lines.forEach(line => {
          this.errors.push(`Hardcoded medical term found: ${line}`);
        });
        this.passed = false;
        this.logError(`Found ${lines.length} hardcoded medical terms`);
      } else {
        this.logSuccess('No hardcoded medical terms found');
      }
    } catch (error) {
      this.logWarning('Could not run hardcoded string scanner');
    }
  }

  /**
   * 3. RUN MISSING KEY DETECTOR
   */
  async runMissingKeyDetector() {
    this.logStep('Checking for missing translation keys...');

    try {
      execSync('npm run test:i18n:missing-keys', { stdio: 'pipe' });
      this.logSuccess('All translation keys present');
    } catch (error) {
      this.errors.push('Missing translation keys detected');
      this.passed = false;
      this.logError('Translation keys missing');
    }
  }

  /**
   * 4. RUN UNUSED KEY DETECTOR
   */
  async runUnusedKeyDetector() {
    this.logStep('Checking for unused translation keys...');

    try {
      const sw = JSON.parse(fs.readFileSync('src/i18n/locales/sw.json', 'utf8'));
      const allKeys = this.getAllKeys(sw);
      
      // Simple heuristic: check if keys exist in component files
      const componentsContent = execSync('cat src/app/components/*.tsx', { encoding: 'utf8' });
      
      const unusedKeys = allKeys.filter(key => {
        const quotedKey = `'${key}'`;
        const doubleQuotedKey = `"${key}"`;
        return !componentsContent.includes(quotedKey) && !componentsContent.includes(doubleQuotedKey);
      });

      if (unusedKeys.length > 10) {
        this.warnings.push(`${unusedKeys.length} unused translation keys (consider cleanup)`);
        this.logWarning(`${unusedKeys.length} unused keys found`);
      } else {
        this.logSuccess('Translation keys are actively used');
      }
    } catch (error) {
      this.logWarning('Could not check for unused keys');
    }
  }

  /**
   * 5. RUN E2E TESTS
   */
  async runE2ETests() {
    this.logStep('Running E2E language switching tests...');

    try {
      execSync('npm run test:e2e:language-switching', { stdio: 'pipe' });
      this.logSuccess('E2E language tests passed');
    } catch (error) {
      this.errors.push('E2E language switching tests failed');
      this.passed = false;
      this.logError('E2E tests failed');
    }
  }

  /**
   * 6. RUN BACKEND AUDIT
   */
  async runBackendAudit() {
    this.logStep('Auditing backend API language consistency...');

    try {
      // Check for hardcoded English messages in backend
      const result = execSync(
        'grep -rn "message:\\s*[\\"\']" src/backend/ --include="*.ts" | grep -v "message_key" || true',
        { encoding: 'utf8' }
      );

      if (result.trim()) {
        const lines = result.trim().split('\n');
        lines.forEach(line => {
          this.warnings.push(`Backend may have hardcoded message: ${line}`);
        });
        this.logWarning(`Found ${lines.length} potential hardcoded backend messages`);
      } else {
        this.logSuccess('Backend uses translation keys');
      }
    } catch (error) {
      this.logWarning('Could not audit backend files');
    }
  }

  /**
   * 7. CHECK TRANSLATION COMPLETENESS
   */
  async checkTranslationCompleteness() {
    this.logStep('Checking translation completeness...');

    try {
      const sw = JSON.parse(fs.readFileSync('src/i18n/locales/sw.json', 'utf8'));
      const en = JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf8'));

      const swKeys = this.getAllKeys(sw);
      const enKeys = this.getAllKeys(en);

      const missingInEn = swKeys.filter(k => !enKeys.includes(k));
      const missingInSw = enKeys.filter(k => !swKeys.includes(k));

      if (missingInEn.length > 0 || missingInSw.length > 0) {
        this.errors.push(`Translation mismatch: ${missingInEn.length} missing in EN, ${missingInSw.length} missing in SW`);
        this.passed = false;
        this.logError('Translation files not in sync');
      } else {
        this.logSuccess(`${swKeys.length} translation keys matched`);
      }
    } catch (error) {
      this.errors.push('Could not validate translation completeness');
      this.passed = false;
      this.logError('Translation validation failed');
    }
  }

  /**
   * GENERATE REPORT
   */
  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log(`${colors.cyan}📊 TRANSLATION GATE REPORT${colors.reset}`);
    console.log('='.repeat(70) + '\n');

    console.log(`${colors.magenta}Date:${colors.reset} ${new Date().toISOString()}`);
    console.log(`${colors.magenta}Commit:${colors.reset} ${this.getGitCommit()}`);
    console.log(`${colors.magenta}Branch:${colors.reset} ${this.getGitBranch()}\n`);

    // Errors
    if (this.errors.length > 0) {
      console.log(`${colors.red}🚨 CRITICAL ERRORS (${this.errors.length}):${colors.reset}`);
      this.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
      console.log('');
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log(`${colors.yellow}⚠️  WARNINGS (${this.warnings.length}):${colors.reset}`);
      this.warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
      console.log('');
    }

    // Summary
    console.log('='.repeat(70));
    console.log(`${colors.blue}SUMMARY:${colors.reset}`);
    console.log(`   Total errors: ${this.errors.length}`);
    console.log(`   Total warnings: ${this.warnings.length}`);
    console.log(`   Status: ${this.passed ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
    console.log('='.repeat(70));

    // Save report to file
    this.saveReport();
  }

  /**
   * SAVE REPORT TO FILE
   */
  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      commit: this.getGitCommit(),
      branch: this.getGitBranch(),
      passed: this.passed,
      errors: this.errors,
      warnings: this.warnings
    };

    const reportDir = 'test-results/translation-gate';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n${colors.cyan}📄 Report saved: ${reportPath}${colors.reset}`);
  }

  /**
   * HELPER METHODS
   */

  banner() {
    return `
${colors.cyan}╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║           🌍 AFYACARE TRANSLATION GATE 🇹🇿                     ║
║                                                                ║
║   Ensuring Clinical Safety Through Language Consistency        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝${colors.reset}
    `;
  }

  logStep(message) {
    console.log(`${colors.blue}▶${colors.reset} ${message}`);
  }

  logSuccess(message) {
    console.log(`  ${colors.green}✓${colors.reset} ${message}`);
  }

  logError(message) {
    console.log(`  ${colors.red}✗${colors.reset} ${message}`);
  }

  logWarning(message) {
    console.log(`  ${colors.yellow}!${colors.reset} ${message}`);
  }

  getAllKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys = keys.concat(this.getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys;
  }

  getGitCommit() {
    try {
      return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  getGitBranch() {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  }
}

/**
 * EXECUTE
 */
if (require.main === module) {
  const gate = new TranslationGate();
  gate.runAllChecks().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
}

module.exports = TranslationGate;
