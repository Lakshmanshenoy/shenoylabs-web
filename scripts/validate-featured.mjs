#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'projects');

function fail(msg) {
  console.error('validate-featured: ERROR:', msg);
  process.exitCode = 1;
}

function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.log('No projects content directory found; skipping featured validation.');
    return;
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'));
  const featured = [];
  const orders = new Map();

  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    const { data } = matter(raw);
    const slug = file.replace(/\.mdx$/, '');
    if (data && data.featured === true) {
      featured.push({ slug, file, frontmatter: data });
      if (typeof data.featuredOrder !== 'undefined') {
        const order = Number(data.featuredOrder);
        if (!Number.isInteger(order)) {
          fail(`project ${slug} has non-integer featuredOrder: ${data.featuredOrder}`);
        } else if (orders.has(order)) {
          fail(`duplicate featuredOrder ${order} in ${slug} and ${orders.get(order)}`);
        } else {
          orders.set(order, slug);
        }
      }
    }
  }

  // If there are featured projects with orders, ensure they form a compact sequence starting at 1
  if (orders.size > 0) {
    const nums = Array.from(orders.keys()).sort((a,b) => a-b);
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] !== i + 1) {
        fail(`featuredOrder values must be a compact sequence starting at 1, found: ${nums.join(', ')}`);
        break;
      }
    }
  }

  // Basic sanity checks
  for (const p of featured) {
    const fm = p.frontmatter;
    if (!fm.title) fail(`featured project ${p.slug} is missing title`);
    if (!fm.status) fail(`featured project ${p.slug} is missing status`);
  }

  if (process.exitCode && process.exitCode !== 0) {
    console.error('validate-featured: validation failed');
    process.exit(process.exitCode);
  }

  console.log(`validate-featured: OK (${featured.length} featured project(s) found)`);
}

main();
