/**
 * NTIDs are IDs of the form Type[...] where the string between the square
 * brackets may contain other NTIDs or a URL-safe Base64 string. NTIDs are
 * designed to be:
 *
 * (1) relatively human-readable
 * (2) typed (so you never accidentally mix up a user ID and a photo ID, for
 *     example)
 * (3) generatable anywhere (i.e. not relying on a central service to
 *     sequentially dole them out; any client can just make one up that will be
 *     unique)
 * (4) composable; e.g., the ID for the Like object that captures the like-state
 *     of User A liking (or not liking) Photo B, is deterministic. This is
 *     useful so that two clients, or a client and server, avoid creating
 *     separate entities for things that should be singletons. It's also useful
 *     as a primary key in RethinkDB (or any other system that doesn't allow
 *     compound primary keys).
 */
import invariant from 'invariant';
import { v4 as uuidv4 } from 'uuid';

export type NTID<TypeName extends string> = `${TypeName}[${string}]`;

const NTID_LENGTH = 22;

const BASE_64_URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

if (256 % BASE_64_URL_ALPHABET.length !== 0) {
  console.warn('UUID alphabet size must divide 256 evenly to avoid modulo bias');
}

/**
 * Create a new randomly generated NTID.
 * @param type type of NTID to generate
 * @returns new randomly generated NTID of the form Type[...]
 */
export function makeId<TypeName extends string>(type: TypeName): NTID<TypeName> {
  const bytes = new Array(32);
  uuidv4(null, bytes, 0);
  uuidv4(null, bytes, 16);

  const body = bytes
    .slice(0, NTID_LENGTH)
    .map((byte) => BASE_64_URL_ALPHABET[byte % BASE_64_URL_ALPHABET.length])
    .join('');
  return `${type}[${body}]`;
}

/**
 * A compound NTID is made up of nested NTIDs. Like all NTIDs, it has its own type but
 * instead of a randomly generated body, it contains nested NTIDs. The order of the nested
 * NTIDs matches the order in which they appear in the given array, which makes them useful
 * for directed edges.
 *
 * @param type type of compound NTID to generate
 * @param ids nested NTIDs to include in the compound NTID
 * @returns new compound NTID of the form Type[...]
 */
export function makeCompoundId<TypeName extends string>(
  type: TypeName,
  ids: NTID<any>[],
): NTID<TypeName> {
  return `${type}[${ids.join(',')}]`;
}

/**
 * A symmetric NTID is a compound ID that sorts its nested NTIDs in a consistent manner.
 * This is useful for undirected edges, hence the symmetry.
 *
 * @param type type of symmetric NTID to generate
 * @param ids nested NTIDs to include in the symmetric NTID
 * @returns new symmetric NTID of the form Type[...]
 */
export function makeSymmetricId<TypeName extends string>(
  type: TypeName,
  ids: NTID<any>[],
): NTID<TypeName> {
  return `${type}[${Array.from(ids).sort().join(',')}]`;
}

function getTypeAndInnerPart<TypeName extends string>(id: NTID<TypeName>): [TypeName, string] {
  const match = /^([^[]+)\[(.*)\]$/.exec(id);
  invariant(match, `${id} is not a valid NTID`);
  return [match[1] as TypeName, match[2]];
}

/**
 * Get the type of the given NTID.
 *
 * @example
 * For the NTID `FakeType[...]`, this function will return `FakeType`.
 *
 * @param id NTID
 * @returns the type of the NTID
 */
export function getTypeFromId<TypeName extends string>(id: NTID<TypeName>): TypeName {
  return getTypeAndInnerPart(id)[0];
}

/**
 * Get the inner random part of a given NTID.
 *
 * @example
 * For the NTID `FakeType[MZlL-RDgaMn05ebg3iyTt8]`, this function will return `MZlL-RDgaMn05ebg3iyTt8`.
 *
 * @param id NTID
 * @returns the inner part of the NTID
 */
export function getInnerPartOfId<TypeName extends string>(id: NTID<TypeName>): string {
  return getTypeAndInnerPart(id)[1];
}

/**
 * Reconstruct an NTID from its type and inner part.
 *
 * @param type Type of the NTID, typically obtained using `getTypeFromId`
 * @param innerPart Inner part of the NTID, typically obtained using `getInnerPartOfId`
 * @returns Reconstructed NTID of the form Type[innerPart]
 */
export function reconstructIdFromTypeAndInnerPart<TypeName extends string>(
  type: TypeName,
  innerPart: string,
): NTID<TypeName> {
  return `${type}[${innerPart}]`;
}

/**
 * Encodes the inner part of a regular NTID (not compound or symmetric) to a 17-byte Uint8Array.
 * Useful for storing NTIDs in a compact binary format when the type is constant and known for reconstruction.
 *
 * @param id NTID to encode
 * @returns 17-byte Uint8Array representing the inner part of the NTID
 */
export function encodeIdToBytes<TypeName extends string>(id: NTID<TypeName>): Uint8Array {
  const innerPart = getInnerPartOfId(id);
  invariant(
    innerPart.length === NTID_LENGTH,
    `Inner part of NTID must be ${NTID_LENGTH} characters long, got ${innerPart.length}`,
  );

  // Append one zero sextet ('A' == value 0) so decoding yields 17 bytes.
  // Add padding character 'A' to make it 23 characters for proper base64url decoding
  // 'A' represents 0 in base64url, so it adds 6 zero bits
  const paddedInnerPart = `${innerPart}A`;

  // convert inner part from base64url to base64
  const base64URLString = paddedInnerPart.replace(/-/g, '+').replace(/_/g, '/');

  // 23 chars = 138 bits, but atob decoding produces 17 bytes (136 bits)
  // The last 2 bits from the extra 'A' padding are discarded by atob
  // This works because 'A' = 000000 in base64url, so we truncate 2 zero bits of padding

  const binaryString = atob(base64URLString);
  const uint8Array = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  invariant(uint8Array.length === 17, `Expected 17 bytes, got ${uint8Array.length} bytes`);

  return uint8Array;
}

/**
 * Decodes a 17-byte Uint8Array back to an NTID.
 * This is useful for reconstructing the NTID from its binary representation generated by `encodeIdToBytes`.
 *
 * @param type Type of the NTID, typically obtained using `getTypeFromId`
 * @param bytes 17-byte Uint8Array representing the inner part of the NTID
 * @returns Reconstructed NTID of the form Type[innerPart]
 */
export function decodeIdFromBytes<TypeName extends string>(
  type: TypeName,
  bytes: Uint8Array,
): NTID<TypeName> {
  invariant(bytes.length === 17, `Expected 17 bytes, got ${bytes.length} bytes`);

  // decode bytes to base64
  const binaryString = String.fromCodePoint(...bytes);
  const base64String = btoa(binaryString); // convert to base64 string

  // convert base64 to base64url and remove base64 padding and our padding 'A'
  const base64URLStringBeforeRemovalOfPadding = base64String
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  invariant(
    base64URLStringBeforeRemovalOfPadding.endsWith('A'),
    'Last base64url character should be A (zero sextet)',
  );
  const innerPart = base64URLStringBeforeRemovalOfPadding.slice(0, -1);
  return reconstructIdFromTypeAndInnerPart(type, innerPart);
}

export default {
  makeId,
  makeCompoundId,
  makeSymmetricId,
  getTypeFromId,
  getInnerPartOfId,
  reconstructIdFromTypeAndInnerPart,
  encodeIdToBytes,
  decodeIdFromBytes,
};
