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

const UUID_LENGTH = 22;
const UUID_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

if (256 % UUID_ALPHABET.length !== 0) {
  console.warn('UUID alphabet size must divide 256 evenly to avoid modulo bias');
}

export function makeId(type: string): ntid {
  let bytes = new Array(32);
  uuidv4(null, bytes, 0);
  uuidv4(null, bytes, 16);

  let body = bytes.slice(0, UUID_LENGTH).map(
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

export function getTypeFromId(id: ntid): string {
  let match = /^([^[]+)\[.*\]$/.exec(id);
  invariant(match, `${id} is not a valid NTID`);
  return match[1];
}

export default {
  makeId,
  makeCompoundId,
  makeSymmetricId,
  getTypeFromId,
};
