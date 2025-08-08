import assert from 'node:assert/strict';
import { describe, test, it } from 'node:test';

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

void describe(`${makeId.name}`, () => {
  void it('makes IDs with the given type', () => {
    const id = makeId('test');
    assert.match(id, /^test\[/);
  });

  void it('makes IDs with 22 random characters', () => {
    const type = 'test';
    const id = makeId(type);
    assert.equal(id.length, type.length + 2 + 22);
  });
});

void describe(`${makeCompoundId.name}`, () => {
  void it('makes compound IDs', () => {
    const id1 = makeId('type1');
    const id2 = makeId('type2');

    const compoundId = makeCompoundId('compound', [id1, id2]);
    assert.match(compoundId, /^compound\[/);
  });
});

void describe(`${makeSymmetricId.name}`, () => {
  void it('makes symmetric compound IDs', () => {
    const id1 = makeId('type1');
    const id2 = makeId('type2');

    const symmetricId1 = makeSymmetricId('sym', [id1, id2]);
    const symmetricId2 = makeSymmetricId('sym', [id2, id1]);
    assert.match(symmetricId1, /^sym\[/);
    assert.equal(symmetricId1, symmetricId2);
  });
});

void describe(`${getTypeFromId.name}`, () => {
  void it('extracts the type from constant case', () => {
    const id = `FakeType[MZlL-RDgaMn05ebg3iyTt8]`;
    const type = getTypeFromId(id);
    assert.equal(type, 'FakeType');
  });

  void it('extracts the types of ids', () => {
    const type = 'test';
    const compoundType = 'compound';

    const id = makeId(type);
    assert.equal(getTypeFromId(id), type);

    const compoundId = makeCompoundId(compoundType, [id, id]);
    assert.equal(getTypeFromId(compoundId), compoundType);
  });

  void it('throws an error for invalid ids', () => {
    assert.throws(() => {
      getTypeFromId('invalid_id' as any);
    });
  });
});

void describe(`${getInnerPartOfId.name}`, () => {
  void it('extracts the inner part of constant case', () => {
    const id = `FakeType[MZlL-RDgaMn05ebg3iyTt8]`;
    const innerPart = getInnerPartOfId(id);
    assert.equal(innerPart, 'MZlL-RDgaMn05ebg3iyTt8');
  });

  void it('extracts the inner part of ids', () => {
    const type = 'test';
    const id = makeId(type);
    const innerPart = getInnerPartOfId(id);
    assert.equal(innerPart.length, 22);
    assert.equal(id, `${type}[${innerPart}]`);
  });

  void it('throws an error for invalid ids', () => {
    assert.throws(() => {
      getInnerPartOfId('test' as any);
    });
  });
});

void describe(`${reconstructIdFromTypeAndInnerPart.name}`, () => {
  void it('reconstructs the id from type and inner part', () => {
    const type = 'FakeType';
    const innerPart = 'MZlL-RDgaMn05ebg3iyTt8';
    const id = reconstructIdFromTypeAndInnerPart(type, innerPart);
    assert.equal(id, `${type}[${innerPart}]`);
  });
});

void describe(`${encodeIdToBytes.name}`, () => {
  void it('returns the bytes from an id', () => {
    const type = 'test';
    const id = makeId(type);
    const bytes = encodeIdToBytes(id);
    assert.equal(bytes instanceof Uint8Array, true);
    assert.equal(bytes.length, 17);
  });
});

void describe(`${decodeIdFromBytes.name}`, () => {
  void it('returns the inner part from bytes', () => {
    const type = 'test';
    const id = makeId(type);
    const bytes = encodeIdToBytes(id);
    const decoded = decodeIdFromBytes(type, bytes);
    assert.equal(decoded, id);
  });

  void test('test many times with random ids', () => {
    for (let i = 0; i < 10000; i++) {
      const type = `test${i}`;
      const id = makeId(type);
      const bytes = encodeIdToBytes(id);
      const decoded = decodeIdFromBytes(type, bytes);
      assert.equal(decoded, id);
    }
  });
});
