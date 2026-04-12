#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found in project root');
  process.exit(1);
}
const env = fs.readFileSync(envPath, 'utf8');
function get(key) {
  const m = env.match(new RegExp('^' + key + '=(.*)$', 'm'));
  if (!m) return null;
  let v = m[1].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
}
const token = get('VERCEL_TOKEN');
if (!token) {
  console.error('VERCEL_TOKEN not found in .env.local');
  process.exit(1);
}
const deployArg = process.argv[2];
const DEPLOY = deployArg || 'dpl_FXCxugBLx9GTSe4GuNH7Qquj8983';
const endpoints = [
  `https://api.vercel.com/v2/deployments/${DEPLOY}/events`,
  `https://api.vercel.com/v6/deployments/${DEPLOY}/events`,
  `https://api.vercel.com/v13/deployments/${DEPLOY}/events`,
  `https://api.vercel.com/v1/integrations/deployments/events?deploymentId=${DEPLOY}`,
];

(async () => {
  for (const e of endpoints) {
    try {
      console.log('\n=== ' + e + '\n');
      const res = await fetch(e, { headers: { Authorization: 'Bearer ' + token } });
      const txt = await res.text();
      if (res.ok) {
        console.log(txt.substring(0, 20000));
      } else {
        console.log('HTTP', res.status, txt.substring(0, 20000));
      }
    } catch (err) {
      console.error('error fetching', e, err && err.message ? err.message : err);
    }
  }
})();
