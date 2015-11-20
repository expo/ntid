# NTID [![Circle CI](https://circleci.com/gh/exponentjs/ntid.svg?style=svg)](https://circleci.com/gh/exponentjs/ntid)

NTIDs are IDs of the form `Type[...]` where the string between the square brackets may contain other NTIDs or a URL-safe Base64 string. NTIDs are designed to be:

1. relatively human-readable
2. typed (so you never accidentally mix up a user ID and a photo ID, for example)
3. generatable anywhere (i.e. not relying on a central service to sequentially dole them out; any client can just make one up that will be unique)
4. composable; e.g., the ID for the Like object that captures the like-state of User A liking (or not liking) Photo B, is deterministic. This is useful so that two clients, or a client and server, avoid creating separate entities for things that should be singletons. It's also useful as a primary key in RethinkDB (or any other system that doesn't allow compound primary keys).
