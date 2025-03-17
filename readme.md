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
- [ ] Offline support
- [ ] Better queue in web (remove delay)
- [ ] Better event in server (remove polling)
- [ ] Jotai listener to avoid code duplication
- [ ] dynamic table naming in client
- [ ] PgLite listener
- [x] Remove dead code
- [ ] Using dynamic table name based on create query
- [ ] Backend to be transactional
- [ ] Consistency in naming (key_results vs keyResults)

# Todo for completeness

- [ ] Workspace/multi-tenancy support

# Bugs

- [ ] Too many connections when server stopped
- [ ] After many transactions, the client becomes slow

# To check

- [ ] If using a big object pool and calculating upfront is costly

# Not doing

- [ ] Error rollback
- [ ] Conflict handling
- [ ] Delete old tables

# Risk

- [ ] Complexity
- [ ] Client code to have a lot of business logic
- [ ] Db structure revealed
