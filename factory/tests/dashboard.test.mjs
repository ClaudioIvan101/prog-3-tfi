import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

class Element {
  constructor(tag = 'div') {
    this.tagName = tag;
    this.children = [];
    this.dataset = {};
    this.attributes = {};
    this.handlers = {};
    this.textContent = '';
    this.open = false;
  }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = [...children]; }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, handler) { this.handlers[name] = handler; }
  focus() { this.focused = true; }
  showModal() { this.open = true; }
  close() { this.open = false; this.handlers.close?.(); }
}

function start(fetchImpl = async () => ({ ok: true, json: async () => ({ jobs: [] }) })) {
  const html = fs.readFileSync(new URL('../dashboard.html', import.meta.url), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const ids = new Map();
  const document = {
    getElementById(id) {
      if (!ids.has(id)) ids.set(id, new Element());
      return ids.get(id);
    },
    createElement: tag => new Element(tag),
    addEventListener() {},
  };
  const context = vm.createContext({
    document, fetch: fetchImpl, setInterval() {}, clearInterval() {},
    location: { protocol: 'http:' }, Date, console, AbortController,
  });
  vm.runInContext(script, context);
  return { context, ids, run: source => vm.runInContext(source, context) };
}

function job(overrides = {}) {
  return { id: '001-health', title: 'Health endpoint', branch: 'factory/001-health',
    stage: 'review', round: 1, rounds: [{ number: 1, commit: 'a'.repeat(40),
      reviews: { security: 'PASS', ux: 'pending', ui: 'CHANGES', code: 'PASS' } }],
    ...overrides };
}

test('rejects unsafe jobs, invalid verdicts, and duplicate identifiers', () => {
  const { context, run } = start();
  for (const invalid of [job({ id: '../secrets' }), job({ stage: 'unknown' }),
    job({ rounds: [{ number: 1, reviews: { security: 'APPROVE' } }] })]) {
    context.input = { jobs: [invalid] };
    assert.throws(() => run('validateBoard(input)'));
  }
  context.input = { jobs: [job(), job()] };
  assert.throws(() => run('validateBoard(input)'));
});

test('renders safe text and every review round, including pending chips', () => {
  const { context, run, ids } = start();
  const item = job({ title: '<img src=x onerror=alert(1)>', rounds: [
    ...job().rounds,
    { number: 2, commit: 'b'.repeat(40), reviews: { code: 'PASS' } },
  ], round: 2 });
  context.input = { jobs: [item] };
  run('render(validateBoard(input))');
  const flatten = element => [element, ...element.children.flatMap(flatten)];
  const nodes = flatten(ids.get('board'));
  assert.ok(nodes.some(node => node.textContent === item.title));
  assert.equal(nodes.filter(node => node.className?.startsWith('chip ')).length, 8);
  assert.ok(nodes.some(node => node.textContent === 'UX · pending'));
  assert.ok(!nodes.some(node => node.tagName === 'img'));
});

test('artifact paths stay in the selected job and preserve round history', () => {
  const { context, run } = start();
  context.input = job({ round: 2, rounds: [...job().rounds,
    { number: 2, commit: 'b'.repeat(40), reviews: {} }] });
  const files = Array.from(run('artifactPaths(input)'));
  assert.equal(files.length, 11);
  assert.ok(files.includes('jobs/001-health/round-2/review-security.md'));
  assert.ok(files.includes('jobs/001-health/decision.md'));
  context.input = job({ id: '../../secret' });
  assert.throws(() => run('artifactPaths(input)'));
});

test('polls without caching and retains the last board on fetch failure', async () => {
  let fail = false;
  let options;
  const { context, ids } = start(async (url, opts) => {
    options = opts;
    if (fail) throw new Error('network down');
    return { ok: true, json: async () => ({ jobs: [job()] }) };
  });
  await context.poll();
  const old = ids.get('board').children[0];
  fail = true;
  await context.poll();
  assert.equal(options.cache, 'no-store');
  assert.equal(ids.get('board').children[0], old);
  assert.match(ids.get('connection').textContent, /Offline/);
});

test('markdown is displayed as text and missing files have an honest state', async () => {
  const { context, ids } = start(async url => url === 'board.json'
    ? { ok: true, json: async () => ({ jobs: [] }) }
    : { ok: true, text: async () => '<script>unsafe()</script>' });
  await context.showArtifact('jobs/001-health/spec.md');
  assert.equal(ids.get('artifact').textContent, '<script>unsafe()</script>');
  context.fetch = async () => ({ ok: false, status: 404 });
  await context.showArtifact('jobs/001-health/build.md');
  assert.match(ids.get('artifact').textContent, /Not created yet/);
});

test('details restore focus to the current card after a board refresh', () => {
  const { context, ids, run } = start();
  context.input = { jobs: [job()] };
  run('render(validateBoard(input))');
  const findCard = () => ids.get('board').children[2].children[1];
  const oldCard = findCard();
  oldCard.handlers.click();
  assert.equal(ids.get('details').open, true);
  assert.equal(ids.get('close').focused, true);
  run('render(validateBoard(input))');
  ids.get('close').handlers.click();
  assert.equal(ids.get('details').open, false);
  assert.notEqual(findCard(), oldCard);
  assert.equal(findCard().focused, true);
});

test('late artifact responses cannot replace a newer selection', async () => {
  let finishFirst;
  const { context, ids } = start(async url => {
    if (url === 'board.json') return { ok: true, json: async () => ({ jobs: [] }) };
    if (url.endsWith('spec.md')) return new Promise(resolve => { finishFirst = resolve; });
    return { ok: true, text: async () => 'Newest artifact' };
  });
  const first = context.showArtifact('jobs/001-health/spec.md');
  await context.showArtifact('jobs/001-health/build.md');
  finishFirst({ ok: true, text: async () => 'Stale artifact' });
  await first;
  assert.equal(ids.get('artifact').textContent, 'Newest artifact');
  await assert.rejects(context.showArtifact('jobs/001-health/../../secret.md'), /Unsafe/);
});
