#!/usr/bin/env node

/**
 * Authentication Test Script
 *
 * This script tests authentication flows for:
 * 1. Local development (localhost:5173 + localhost:8787)
 * 2. Tunnel environment (my-blog-local.chl11wq12.workers.dev)
 * 3. GitHub OAuth via Cloudflare Access
 *
 * Usage:
 *   node test-auth.js local              # Test local development
 *   node test-auth.js tunnel             # Test tunnel environment
 *   node test-auth.js all                # Test all environments
 *   node test-auth.js help               # Show help
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  local: {
    frontend: 'http://localhost:5173',
    api: 'http://localhost:8787',
    description: 'Local Development',
  },
  tunnel: {
    frontend: 'https://my-blog-local.chl11wq12.workers.dev',
    api: 'https://my-blog-worker.chl11wq12.workers.dev',
    description: 'Tunnel Environment',
  },
  production: {
    frontend: 'https://choidaruhan.github.io',
    api: 'https://my-blog-worker.chl11wq12.workers.dev',
    description: 'Production (GitHub Pages)',
  },
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(`${colors.bold}${colors.cyan}${message}${colors.reset}`);
  console.log('='.repeat(60));
}

function logTest(name, status, message = '') {
  const statusIcon = status === 'PASS' ? '✅' : '❌';
  const statusColor = status === 'PASS' ? colors.green : colors.red;
  console.log(`${statusIcon} ${colors.bold}${name}${colors.reset}: ${statusColor}${status}${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

// HTTP request helper
async function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Auth-Test-Script/1.0',
        'Accept': 'application/json',
        ...options.headers,
      },
      timeout: 10000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            raw: data,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            raw: data,
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout: ${url}`));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// Test functions
async function testHealth(apiUrl) {
  try {
    const response = await fetchUrl(`${apiUrl}/health`);
    if (response.status === 200 && response.data?.status === 'ok') {
      return { success: true, data: response.data };
    } else if (response.status === 302 && response.headers.location?.includes('cloudflareaccess.com')) {
      return { success: true, data: { requiresAuth: true, location: response.headers.location } };
    }
    return { success: false, error: `Status: ${response.status}, Data: ${response.raw}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testAuthMe(apiUrl, origin) {
  try {
    const response = await fetchUrl(`${apiUrl}/auth/me`, {
      headers: {
        'Origin': origin,
        'Accept': 'application/json',
      },
    });

    if (response.status === 200 && response.data?.user) {
      return {
        success: true,
        data: response.data,
        isLocalUser: response.data.user.email === 'dev@localhost',
      };
    } else if (response.status === 302 && response.headers.location?.includes('cloudflareaccess.com')) {
      return {
        success: true,
        data: { requiresAuth: true, location: response.headers.location },
        requiresGitHubOAuth: true,
      };
    } else if (response.status === 401) {
      return { success: true, data: { unauthorized: true }, requiresAuth: true };
    }
    return { success: false, error: `Status: ${response.status}, Data: ${response.raw}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testPostsApi(apiUrl, origin) {
  try {
    const response = await fetchUrl(`${apiUrl}/api/posts`, {
      headers: {
        'Origin': origin,
      },
    });

    if (response.status === 200 && Array.isArray(response.data)) {
      return { success: true, data: response.data, count: response.data.length };
    } else if (response.status === 302 && response.headers.location?.includes('cloudflareaccess.com')) {
      return { success: true, data: { requiresAuth: true }, requiresAuth: true };
    } else if (response.status === 401) {
      return { success: true, data: { unauthorized: true }, requiresAuth: true };
    }
    return { success: false, error: `Status: ${response.status}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testLoginFlow(apiUrl, origin) {
  try {
    const response = await fetchUrl(`${apiUrl}/auth/login`, {
      headers: {
        'Origin': origin,
      },
    });

    if (response.status === 302) {
      const location = response.headers.location;
      if (location === origin || location === `${origin}/`) {
        return { success: true, data: { localBypass: true } };
      } else if (location.includes('cloudflareaccess.com')) {
        return {
          success: true,
          data: {
            requiresGitHubOAuth: true,
            loginUrl: location,
          },
        };
      }
      return { success: true, data: { redirect: location } };
    }
    return { success: false, error: `Status: ${response.status}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testConfigFiles() {
  const results = [];

  try {
    // Check wrangler.toml
    const wranglerPath = join(__dirname, 'wrangler.toml');
    const wranglerContent = readFileSync(wranglerPath, 'utf8');
    const hasFrontendUrl = wranglerContent.includes('FRONTEND_URL');
    const hasAccessDomain = wranglerContent.includes('ACCESS_TEAM_DOMAIN');
    const hasAccessAudience = wranglerContent.includes('ACCESS_AUDIENCE');

    results.push({
      name: 'wrangler.toml',
      exists: true,
      hasFrontendUrl,
      hasAccessDomain,
      hasAccessAudience,
    });
  } catch (error) {
    results.push({ name: 'wrangler.toml', exists: false, error: error.message });
  }

  try {
    // Check .dev.vars
    const devVarsPath = join(__dirname, '.dev.vars');
    const devVarsContent = readFileSync(devVarsPath, 'utf8');
    const hasAllowLocalAuth = devVarsContent.includes('ALLOW_LOCAL_AUTH');
    const hasFrontendUrl = devVarsContent.includes('FRONTEND_URL');

    results.push({
      name: '.dev.vars',
      exists: true,
      hasAllowLocalAuth,
      hasFrontendUrl,
    });
  } catch (error) {
    results.push({ name: '.dev.vars', exists: false, error: error.message });
  }

  try {
    // Check config.ts
    const configPath = join(__dirname, 'src/lib/config.ts');
    const configContent = readFileSync(configPath, 'utf8');
    const hasApiBase = configContent.includes('API_BASE');
    const hasTunnelConfig = configContent.includes('my-blog-local.chl11wq12.workers.dev');
    const hasLocalConfig = configContent.includes('localhost');

    results.push({
      name: 'config.ts',
      exists: true,
      hasApiBase,
      hasTunnelConfig,
      hasLocalConfig,
    });
  } catch (error) {
    results.push({ name: 'config.ts', exists: false, error: error.message });
  }

  return results;
}

// Main test function for an environment
async function testEnvironment(envName) {
  const env = CONFIG[envName];
  if (!env) {
    throw new Error(`Unknown environment: ${envName}`);
  }

  logHeader(`Testing ${env.description}`);
  logInfo(`Frontend: ${env.frontend}`);
  logInfo(`API: ${env.api}`);

  const results = {
    environment: envName,
    description: env.description,
    tests: [],
  };

  // Test 1: Health endpoint
  const healthTest = await testHealth(env.api);
  results.tests.push({
    name: 'Health Check',
    success: healthTest.success,
    data: healthTest.data,
    error: healthTest.error,
  });

  logTest('Health Check', healthTest.success ? 'PASS' : 'FAIL');
  if (healthTest.data?.requiresAuth) {
    logInfo(`Requires GitHub OAuth: ${healthTest.data.location}`);
  }

  // Test 2: Auth me endpoint
  const authTest = await testAuthMe(env.api, env.frontend);
  results.tests.push({
    name: 'Auth /me Endpoint',
    success: authTest.success,
    data: authTest.data,
    error: authTest.error,
  });

  logTest('Auth /me Endpoint', authTest.success ? 'PASS' : 'FAIL');
  if (authTest.data?.user) {
    logInfo(`User: ${authTest.data.user.email} (${authTest.data.user.name})`);
    if (authTest.isLocalUser) {
      logInfo('✓ Local development auth bypass working');
    }
  } else if (authTest.data?.requiresAuth) {
    logInfo('✓ GitHub OAuth required (expected for Tunnel/Production)');
  }

  // Test 3: Posts API
  const postsTest = await testPostsApi(env.api, env.frontend);
  results.tests.push({
    name: 'Posts API',
    success: postsTest.success,
    data: postsTest.data,
    error: postsTest.error,
  });

  logTest('Posts API', postsTest.success ? 'PASS' : 'FAIL');
  if (postsTest.data?.count !== undefined) {
    logInfo(`Found ${postsTest.data.count} posts`);
  } else if (postsTest.data?.requiresAuth) {
    logInfo('✓ API requires authentication (expected)');
  }

  // Test 4: Login flow
  const loginTest = await testLoginFlow(env.api, env.frontend);
  results.tests.push({
    name: 'Login Flow',
    success: loginTest.success,
    data: loginTest.data,
    error: loginTest.error,
  });

  logTest('Login Flow', loginTest.success ? 'PASS' : 'FAIL');
  if (loginTest.data?.localBypass) {
    logInfo('✓ Local development login bypass working');
  } else if (loginTest.data?.requiresGitHubOAuth) {
    logInfo(`✓ GitHub OAuth login URL: ${loginTest.data.loginUrl?.substring(0, 80)}...`);
  }

  // Calculate summary
  results.summary = {
    totalTests: results.tests.length,
    passedTests: results.tests.filter(t => t.success).length,
    failedTests: results.tests.filter(t => !t.success).length,
  };

  logHeader(`Summary for ${env.description}`);
  logInfo(`Total Tests: ${results.summary.totalTests}`);
  logInfo(`Passed: ${colors.green}${results.summary.passedTests}${colors.reset}`);
  logInfo(`Failed: ${results.summary.failedTests > 0 ? colors.red : colors.green}${results.summary.failedTests}${colors.reset}`);

  return results;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  logHeader('Authentication Test Suite');
  logInfo('Testing GitHub OAuth via Cloudflare Access');

  // Show configuration files status
  logHeader('Configuration Files');
  const configFiles = await testConfigFiles();

  for (const file of configFiles) {
    if (file.exists) {
      const checks = [];
      if (file.hasFrontendUrl) checks.push('FRONTEND_URL');
      if (file.hasAccessDomain) checks.push('ACCESS_TEAM_DOMAIN');
      if (file.hasAccessAudience) checks.push('ACCESS_AUDIENCE');
      if (file.hasAllowLocalAuth) checks.push('ALLOW_LOCAL_AUTH');
      if (file.hasTunnelConfig) checks.push('Tunnel config');
      if (file.hasLocalConfig) checks.push('Local config');

      logTest(file.name, 'FOUND', checks.length > 0 ? `(${checks.join(', ')})` : '');
    } else {
      logTest(file.name, 'MISSING', file.error ? `- ${file.error}` : '');
    }
  }

  // Run tests based on command
  switch (command) {
    case 'local':
      await testEnvironment('local');
      break;

    case 'tunnel':
      await testEnvironment('tunnel');
      break;

    case 'production':
      await testEnvironment('production');
      break;

    case 'all':
      logHeader('Running All Environment Tests');
      const allResults = [];

      allResults.push(await testEnvironment('local'));
      logWarning('\n⚠️  Note: Tunnel test requires cloudflared tunnel to be running');
      logWarning('Run: cloudflared tunnel run my-blog-tunnel');
      allResults.push(await testEnvironment('tunnel'));
      allResults.push(await testEnvironment('production'));

      // Overall summary
      logHeader('Overall Test Summary');
      const totalTests = allResults.reduce((sum, r) => sum + r.summary.totalTests, 0);
      const totalPassed = allResults.reduce((sum, r) => sum + r.summary.passedTests, 0);
      const totalFailed = allResults.reduce((sum, r) => sum + r.summary.failedTests, 0);

      logInfo(`Total Environments: ${allResults.length}`);
      logInfo(`Total Tests: ${totalTests}`);
      logInfo(`Total Passed: ${colors.green}${totalPassed}${colors.reset}`);
      logInfo(`Total Failed: ${totalFailed > 0 ? colors.red : colors.green}${totalFailed}${colors.reset}`);

      // Show GitHub OAuth status
      logHeader('GitHub OAuth Readiness');
      const tunnelEnv = allResults.find(r => r.environment === 'tunnel');
      if (tunnelEnv) {
        const authTest = tunnelEnv.tests.find(t => t.name === 'Auth /me Endpoint');
        if (authTest?.data?.requiresAuth || authTest?.data?.requiresGitHubOAuth) {
          logInfo('✅ Tunnel environment requires GitHub OAuth (correct!)');
          logInfo('   This means Cloudflare Access is protecting the Workers API');
          logInfo('   Users will be redirected to GitHub for authentication');
        } else {
          logWarning('⚠️  Tunnel environment may not be properly protected by Cloudflare Access');
          logWarning('   Check Cloudflare Zero Trust → Access → Applications');
        }
      }
      break;

    case 'help':
    default:
      console.log('\nUsage:');
      console.log('  node test-auth.js local        Test local development environment');
      console.log('  node test-auth.js tunnel       Test tunnel environment');
      console.log('  node test-auth.js production   Test production environment');
      console.log('  node test-auth.js all          Test all environments');
      console.log('  node test-auth.js help         Show this help');

      console.log('\nPrerequisites:');
      console.log('  1. Local development: Run "npm run dev" and "npx wrangler dev"');
      console.log('  2. Tunnel: Run "cloudflared tunnel run my-blog-tunnel"');
      console.log('  3. Production: Workers should be deployed');

      console.log('\nGitHub OAuth Setup Checklist:');
      console.log('  ✓ Cloudflare Zero Trust configured with GitHub OAuth');
      console.log('  ✓ Access policy for my-blog-local.chl11wq12.workers.dev');
      console.log('  ✓ Your GitHub email added to allowed emails');
      console.log('  ✓ Workers deployed with ACCESS_TEAM_DOMAIN and ACCESS_AUDIENCE');
      break;
  }
}

// Run the main function
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`${colors.red}${colors.bold}Fatal error:${colors.reset} ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  });
}

export {
  testHealth,
  testAuthMe,
  testPostsApi,
  testLoginFlow,
  testConfigFiles,
  testEnvironment,
};
