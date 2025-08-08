# NTID

[![tests](https://github.com/expo/ntid/workflows/tests/badge.svg?branch=master)](https://github.com/expo/ntid/actions?query=workflow%3Atests+branch%3Amaster)

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

See inline docblocks for full API and documentation.

### makeId(type)

Takes a string denoting the type of NTID to generate and returns a new randomly generated NTID.

### getTypeFromId(id)

Parses the type of the given NTID.
