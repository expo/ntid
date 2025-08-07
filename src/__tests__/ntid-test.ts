import { describe, it, expect, test } from '@jest/globals';

import {
  encodeIdToBytes,
  decodeIdFromBytes,
  getInnerPartOfId,
  getTypeFromId,
  makeCompoundId,
  makeId,
  makeSymmetricId,
  reconstructIdFromTypeAndInnerPart,
} from '../ntid';

describe(makeId, () => {
  it('makes IDs with the given type', () => {
    const id = makeId('test');
    expect(id).toMatch(/^test\[/);
  });

  it('makes IDs with 22 random characters', () => {
    const type = 'test';
    const id = makeId(type);
    expect(id.length).toBe(type.length + 2 + 22);
  });
});

describe(makeCompoundId, () => {
  it('makes compound IDs', () => {
    const id1 = makeId('type1');
    const id2 = makeId('type2');

    const compoundId = makeCompoundId('compound', [id1, id2]);
    expect(compoundId).toMatch(/^compound\[/);
  });
});

describe(makeSymmetricId, () => {
  it('makes symmetric compound IDs', () => {
    const id1 = makeId('type1');
    const id2 = makeId('type2');

    const symmetricId1 = makeSymmetricId('sym', [id1, id2]);
    const symmetricId2 = makeSymmetricId('sym', [id2, id1]);
    expect(symmetricId1).toMatch(/^sym\[/);
    expect(symmetricId1).toBe(symmetricId2);
  });
});

describe(getTypeFromId, () => {
  it('extracts the type from constant case', () => {
    const id = `FakeType[MZlL-RDgaMn05ebg3iyTt8]`;
    const type = getTypeFromId(id);
    expect(type).toBe('FakeType');
  });

  it('extracts the types of ids', () => {
    const type = 'test';
    const compoundType = 'compound';

    const id = makeId(type);
    expect(getTypeFromId(id)).toBe(type);

    const compoundId = makeCompoundId(compoundType, [id, id]);
    expect(getTypeFromId(compoundId)).toBe(compoundType);
  });

  it('throws an error for invalid ids', () => {
    expect(() => getTypeFromId('invalid_id')).toThrow();
  });
});

describe(getInnerPartOfId, () => {
  it('extracts the inner part of constant case', () => {
    const id = `FakeType[MZlL-RDgaMn05ebg3iyTt8]`;
    const innerPart = getInnerPartOfId(id);
    expect(innerPart).toBe('MZlL-RDgaMn05ebg3iyTt8');
  });

  it('extracts the inner part of ids', () => {
    const type = 'test';
    const id = makeId(type);
    const innerPart = getInnerPartOfId(id);
    expect(innerPart).toHaveLength(22);
    expect(id).toBe(`${type}[${innerPart}]`);
  });

  it('throws an error for invalid ids', () => {
    expect(() => getInnerPartOfId('invalid_id')).toThrow();
  });
});

describe(reconstructIdFromTypeAndInnerPart, () => {
  it('reconstructs the id from type and inner part', () => {
    const type = 'FakeType';
    const innerPart = 'MZlL-RDgaMn05ebg3iyTt8';
    const id = reconstructIdFromTypeAndInnerPart(type, innerPart);
    expect(id).toBe(`${type}[${innerPart}]`);
  });
});

describe(encodeIdToBytes, () => {
  it('returns the bytes from an id', () => {
    const type = 'test';
    const id = makeId(type);
    const bytes = encodeIdToBytes(id);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(17);
  });
});

describe(decodeIdFromBytes, () => {
  it('returns the inner part from bytes', () => {
    const type = 'test';
    const id = makeId(type);
    const bytes = encodeIdToBytes(id);
    const decoded = decodeIdFromBytes(type, bytes);
    expect(decoded).toEqual(id);
  });

  test('test many times with random ids', () => {
    for (let i = 0; i < 10000; i++) {
      const type = `test${i}`;
      const id = makeId(type);
      const bytes = encodeIdToBytes(id);
      const decoded = decodeIdFromBytes(type, bytes);
      expect(decoded).toEqual(id);
    }
  });
});
