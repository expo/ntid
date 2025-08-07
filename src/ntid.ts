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

export type ntid = string;
export type ntidByteEncoding = Uint8Array;

const UUID_LENGTH = 22;
const UUID_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const BASE_64_URL_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'; // this is the Base64URL alphabet

if (UUID_ALPHABET !== BASE_64_URL_ALPHABET) {
  console.warn('UUID alphabet must be the same as Base64URL alphabet for base64 encoding/decoding to work correctly');
}

if (256 % UUID_ALPHABET.length !== 0) {
  console.warn('UUID alphabet size must divide 256 evenly to avoid modulo bias');
}

export function makeId(type: string): ntid {
  const bytes = new Array(32);
  uuidv4(null, bytes, 0);
  uuidv4(null, bytes, 16);

  const body = bytes.slice(0, UUID_LENGTH).map(
    byte => UUID_ALPHABET[byte % UUID_ALPHABET.length]
  ).join('');
  return `${type}[${body}]`;
}

export function makeCompoundId(type: string, ids: ntid[]): ntid {
  return `${type}[${ids.join(',')}]`;
}

export function makeSymmetricId(type: string, ids: ntid[]): ntid {
  return `${type}[${Array.from(ids).sort().join(',')}]`;
}

function getTypeAndInnerPart(id: ntid): [string, string] {
  const match = /^([^[]+)\[(.*)\]$/.exec(id);
  invariant(match, `${id} is not a valid NTID`);
  return [match[1], match[2]];
}

export function getTypeFromId(id: ntid): string {
  return getTypeAndInnerPart(id)[0];
}

export function getInnerPartOfId(id: ntid): string {
  return getTypeAndInnerPart(id)[1];
}

export function reconstructIdFromTypeAndInnerPart(type: string, innerPart: string): ntid {
  return `${type}[${innerPart}]`;
}

export function encodeIdToBytes(id: ntid): ntidByteEncoding {
  const innerPart = getInnerPartOfId(id);
  invariant(innerPart.length === UUID_LENGTH, `Inner part of NTID must be ${UUID_LENGTH} characters long, got ${innerPart.length}`);

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

export function decodeIdFromBytes(type: string, bytes: ntidByteEncoding): ntid {
  invariant(bytes.length === 17, `Expected 17 bytes, got ${bytes.length} bytes`);

  // decode bytes to base64
  const binaryString = String.fromCodePoint(...bytes);
  const base64String = btoa(binaryString); // convert to base64 string

  // convert base64 to base64url and remove base64 padding and our padding 'A'
  const base64URLStringBeforeRemovalOfPadding = base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  if (base64URLStringBeforeRemovalOfPadding[base64URLStringBeforeRemovalOfPadding.length - 1] !== 'A') {
    throw new Error('Last base64url char should be A (zero sextet)');
  }
  const innerPart = base64URLStringBeforeRemovalOfPadding.slice(0, -1);
  return reconstructIdFromTypeAndInnerPart(type, innerPart);
}

export default {
  makeId,
  makeCompoundId,
  makeSymmetricId,
  getTypeFromId,
};
