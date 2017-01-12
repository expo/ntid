const ntid = require('../ntid');

it('makes IDs with the given type', () => {
  let id = ntid.makeId('test');
  expect(id).toMatch(/^test\[/);
});

it('makes IDs with 22 random characters', () => {
  let type = 'test';
  let id = ntid.makeId(type);
  expect(id.length).toBe(type.length + 2 + 22);
});

it('makes compound IDs', () => {
  let id1 = ntid.makeId('type1');
  let id2 = ntid.makeId('type2');

  let compoundId = ntid.makeCompoundId('compound', [id1, id2]);
  expect(compoundId).toMatch(/^compound\[/);
});

it('makes symmetric compound IDs', () => {
  let id1 = ntid.makeId('type1');
  let id2 = ntid.makeId('type2');

  let symmetricId1 = ntid.makeSymmetricId('sym', [id1, id2]);
  let symmetricId2 = ntid.makeSymmetricId('sym', [id2, id1]);
  expect(symmetricId1).toMatch(/^sym\[/);
  expect(symmetricId1).toBe(symmetricId2);
});

it('extracts the types of ids', () => {
  let type = 'test';
  let compoundType = 'compound';

  let id = ntid.makeId(type);
  expect(ntid.getTypeFromId(id)).toBe(type);

  let compoundId = ntid.makeCompoundId(compoundType, [id, id]);
  expect(ntid.getTypeFromId(compoundId)).toBe(compoundType);
});
