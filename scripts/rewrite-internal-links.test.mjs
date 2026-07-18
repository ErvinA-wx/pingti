import assert from 'node:assert/strict'
import test from 'node:test'
import { rewriteInternalLinks } from './rewrite-internal-links.mjs'

test('rewrites FMHY main-site links and bare domain references', () => {
  const source = [
    'https://fmhy.net/posts',
    'http://www.fmhy.net/video#streaming',
    'FMHY.net is the main site'
  ].join('\n')

  assert.equal(
    rewriteInternalLinks(source),
    [
      'https://pingti.org/posts',
      'https://pingti.org/video#streaming',
      'pingti.org is the main site'
    ].join('\n')
  )
})

test('preserves independent FMHY service subdomains', () => {
  const source = [
    'https://api.fmhy.net/single-page',
    'https://i.fmhy.net/og-base.jpg',
    'https://searx.fmhy.net/search?q=test',
    'https://pastes.fmhy.net/example'
  ].join('\n')

  assert.equal(rewriteInternalLinks(source), source)
})

test('is idempotent', () => {
  const once = rewriteInternalLinks('https://fmhy.net/posts')
  assert.equal(rewriteInternalLinks(once), once)
})
