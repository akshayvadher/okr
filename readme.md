# OKR

# Features

- local first
- sync

# Design

![image](./docs/okr-sync-localfirst.excalidraw.svg)

# Start

```shell
cd api
podman compose up
go build ./cmd/api/main.go && ./main
```

```shell
bun i
bun run build && bun start
```

# Todo

- [x] Last sync persistance
- [x] Offline tracker
- [ ] Offline support
- [ ] Better queue in web (remove delay)
- [ ] Better event in server (remove polling)
- [ ] Jotai listener to avoid code duplication
- [ ] PgLite listener
- [x] Using dynamic table name based on create query
- [ ] Add loading per entity

# Nice to have (not directly related to sync)

- [x] Remove dead code
- [ ] Backend to be transactional
- [ ] Consistency in naming (key_results vs keyResults)
- [ ] Use go migrations instead of
- [ ] Default exampand to be on

# Todo for completeness

- [ ] Workspace/multi-tenancy support

# Bugs

- [ ] Too many connections when server stopped
- [ ] After many transactions, the client becomes slow

# To check

- [ ] If using a big object pool and calculating upfront is costly
- [ ] First DB query is slow (Like 1 whole second)

# Not doing

- [ ] Error rollback
- [ ] Conflict handling
- [ ] Delete old tables
- [ ] I don't know how to test the sync part
- [ ] Not doing any sort of testing

# Risk

- [ ] Complexity
- [ ] Client code to have a lot of business logic
- [ ] Db structure revealed
