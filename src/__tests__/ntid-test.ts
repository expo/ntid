import { it, expect } from '@jest/globals';

import { getTypeFromId, makeCompoundId, makeId, makeSymmetricId } from '../ntid';

it('makes IDs with the given type', () => {
  const id = makeId('test');
  expect(id).toMatch(/^test\[/);
});

it('makes IDs with 22 random characters', () => {
  const type = 'test';
  const id = makeId(type);
  expect(id.length).toBe(type.length + 2 + 22);
});

it('makes compound IDs', () => {
  const id1 = makeId('type1');
  const id2 = makeId('type2');

  const compoundId = makeCompoundId('compound', [id1, id2]);
  expect(compoundId).toMatch(/^compound\[/);
});

it('makes symmetric compound IDs', () => {
  const id1 = makeId('type1');
  const id2 = makeId('type2');

  const symmetricId1 = makeSymmetricId('sym', [id1, id2]);
  const symmetricId2 = makeSymmetricId('sym', [id2, id1]);
  expect(symmetricId1).toMatch(/^sym\[/);
  expect(symmetricId1).toBe(symmetricId2);
});

it('extracts the types of ids', () => {
  const type = 'test';
  const compoundType = 'compound';

  const id = makeId(type);
  expect(getTypeFromId(id)).toBe(type);

  const compoundId = makeCompoundId(compoundType, [id, id]);
  expect(getTypeFromId(compoundId)).toBe(compoundType);
});
