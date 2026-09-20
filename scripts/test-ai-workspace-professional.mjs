import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { executeProfessionalWorkspaceRequest } from '../src/lib/ai-workspace/professional.ts';

const model = {
  id: 'test-professional-model', provider: 'openai', enabled: true,
  inputRate: '1000000', cachedInputRate: '500000', outputRate: '2000000',
  contextTokens: 100000, maxOutputTokens: 4096, quality: 1, latency: 1,
  reasoning: ['none', 'low', 'medium', 'high'], vision: false, tools: false,
  pricingVerifiedAt: new Date().toISOString(),
};
const entitlements = {
  enabled: true, modes: ['auto', 'fast', 'best'], models: [model.id], tools: [],
  maxOutputTokens: 4096, maxContextTokens: 30000, maxRequestMicros: '100000',
};

function professionalHarness(options = {}) {
  const calls = { reserveStage: [], provider: [], started: [], released: [], settled: [], uncertain: [], retrieval: [] };
  const snapshot = {
    ownerId: 'owner', projectId: 'project', conversationId: 'conversation',
    projectInstructions: '', customInstructions: '', history: [], skills: [],
    models: [model], entitlements, availableMicros: '100000', ...options.snapshot,
  };
  const store = {
    load: async () => snapshot,
    retrieveKnowledge: async (...args) => {
      calls.retrieval.push(args);
      return options.knowledge ?? [];
    },
    reserve: async () => { throw new Error('normal reserve must not be used in professional mode'); },
    reserveStage: async value => { calls.reserveStage.push(value); return options.reserveStageAccepted ?? true; },
    markProviderStarted: async (...args) => { calls.started.push(args); return true; },
    releaseUnstarted: async (...args) => { calls.released.push(args); return true; },
    settle: async value => { calls.settled.push(value); },
    markUncertain: async (...args) => { calls.uncertain.push(args); },
  };
  let providerIndex = 0;
  const provider = {
    async *stream(input) {
      calls.provider.push(input);
      assert.equal(calls.reserveStage.length, 2, 'both professional reservations must exist before first provider call');
      providerIndex += 1;
      if (providerIndex === 1) {
        const enhanced = options.enhanced ?? 'Act as a senior consultant. Answer the user request clearly with constraints and actionable steps.';
        yield { type: 'text', delta: enhanced };
        yield { type: 'complete', providerRequestId: 'resp-enhancer', incomplete: false,
          usage: { inputTokens: 100, cachedInputTokens: 0, outputTokens: Math.max(10, Math.ceil(enhanced.length / 4)) } };
        return;
      }
      yield { type: 'text', delta: 'Professional answer' };
      yield { type: 'complete', providerRequestId: 'resp-answer', incomplete: false,
        usage: { inputTokens: 150, cachedInputTokens: 10, outputTokens: 30 } };
    },
  };
  const input = {
    ownerId: 'owner', projectId: 'project', conversationId: 'conversation',
    requestId: randomUUID(), content: 'Help me plan this project', mode: 'auto',
    signal: new AbortController().signal,
  };
  return { calls, store, provider, input };
}

test('professional mode pre-reserves both stages and emits only the final answer text', async () => {
  const h = professionalHarness();
  const events = [];
  await executeProfessionalWorkspaceRequest(h.input, { store: h.store, provider: h.provider, emit: event => events.push(event) });
  assert.equal(h.calls.reserveStage.length, 2);
  assert.equal(h.calls.reserveStage[0].requestKind, 'answer');
  assert.equal(h.calls.reserveStage[1].requestKind, 'prompt_enhancement');
  assert.equal(h.calls.reserveStage[1].parentRequestId, h.input.requestId);
  assert.equal(h.calls.provider.length, 2);
  assert.equal(h.calls.settled.length, 2);
  assert.equal(h.calls.uncertain.length, 0);
  assert.equal(h.calls.retrieval.length, 1);
  assert.equal(events.filter(event => event.type === 'text').map(event => event.delta).join(''), 'Professional answer');
  const profile = events.find(event => event.type === 'prompt_profile');
  assert.equal(profile?.promptProfile, 'professional');
  assert.equal(profile?.enhancementApplied, true);
  assert.match(profile?.message ?? '', /more AI budget/i);
});

test('professional mode reserves answer cost with retrieved knowledge before either provider call', async () => {
  const h = professionalHarness({ knowledge: [{ id: 'memory-1', text: 'Project deadline is Friday.', sourceType: 'memory', fileId: null }] });
  const events = [];
  await executeProfessionalWorkspaceRequest(h.input, { store: h.store, provider: h.provider, emit: event => events.push(event) });
  assert.equal(h.calls.retrieval.length, 1);
  assert.ok(h.calls.reserveStage[0].route.inputTokenBound > 6000);
  assert.equal(events.find(event => event.type === 'knowledge')?.sources[0].id, 'memory-1');
  assert.ok(!h.calls.provider[0].context.messages.some(message => message.content.includes('Project deadline is Friday.')), 'enhancer must not receive project knowledge');
  assert.ok(h.calls.provider[1].context.messages.at(-1).content.includes('Project deadline is Friday.'), 'answer must receive retrieved reference data');
});

test('professional mode never calls a provider when combined budget cannot be routed', async () => {
  const h = professionalHarness({ snapshot: { availableMicros: '1' } });
  await assert.rejects(executeProfessionalWorkspaceRequest(h.input, { store: h.store, provider: h.provider, emit() {} }), /NO_AFFORDABLE_ROUTE/);
  assert.equal(h.calls.reserveStage.length, 0);
  assert.equal(h.calls.provider.length, 0);
});

test('oversized enhanced prompt is charged for its completed enhancement but final answer reservation is safely released', async () => {
  const h = professionalHarness({ enhanced: 'x'.repeat(7000) });
  await assert.rejects(executeProfessionalWorkspaceRequest(h.input, { store: h.store, provider: h.provider, emit() {} }), /PROMPT_ENHANCEMENT_LIMIT/);
  assert.equal(h.calls.provider.length, 1);
  assert.equal(h.calls.settled.length, 1);
  assert.ok(h.calls.released.some(([, requestId]) => requestId === h.input.requestId));
});
