# NTID [![Circle CI](https://circleci.com/gh/exponent/ntid.svg?style=svg)](https://circleci.com/gh/exponent/ntid)

NTIDs are IDs of the form `Type[...]` where the string between the square brackets may contain other NTIDs or a URL-safe Base64 string. NTIDs are designed to be:

1. relatively human-readable
2. typed (so you never accidentally mix up a user ID and a photo ID, for example)
3. generatable anywhere (i.e. not relying on a central service to sequentially dole them out; any client can just make one up that will be unique)
4. composable; e.g., the ID for the Like object that captures the like-state of User A liking (or not liking) Photo B, is deterministic. This is useful so that two clients, or a client and server, avoid creating separate entities for things that should be singletons. It's also useful as a primary key in RethinkDB (or any other system that doesn't allow compound primary keys).

## CLI

NTID comes with a command called `ntid` that generates IDs. Install NTID globally with `npm i -g ntid` and run:

```sh
$ ntid example
example[RY7ss1F2-Y7S0nvTbNBH73]
```

## API

### makeId(type)

Takes a string denoting the type of NTID to generate and returns a new randomly generated NTID.

### makeCompoundId(type, ids)

A compound NTID is made up of nested NTIDs. Like all NTIDs, it has its own type but instead of a randomly generated body, it contains nested NTIDs. The order of the nested NTIDs matches the order in which they appear in the given array, which makes them useful for directed edges.

### makeSymmetricId(type, ids)

A symmetric NTID is a compound ID that sorts its nested NTIDs in a consistent manner. This is useful for undirected edges, hence the symmetry.

### getTypeFromId(id)

Parses the type of the given NTID.
