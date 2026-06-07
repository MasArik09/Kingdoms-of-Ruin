# ADR - Architecture Decision Records

Project: Kingdoms of Ruin

---

## Purpose

Dokumen ini berisi keputusan arsitektur utama yang digunakan selama pengembangan Kingdoms of Ruin.

Setiap keputusan harus memiliki:

- Context
- Decision
- Consequences

Tujuannya agar project tetap mudah di-maintain meskipun berkembang menjadi puluhan ribu baris kode.

---

# ADR-001: Why Phaser.js?

## Status

Accepted

## Context

Project membutuhkan:

- Browser-based game
- Open source
- Ringan
- Mudah di-deploy
- Tidak perlu installer

## Decision

Menggunakan Phaser.js sebagai game engine utama.

## Consequences

### Pros

- Gratis
- Open Source
- Berjalan langsung di browser
- Cocok untuk 2D RPG

### Cons

- Tidak sekuat Unity untuk 3D
- Harus membangun banyak sistem sendiri

---

# ADR-002: Why TypeScript?

## Status

Accepted

## Context

Project diperkirakan berkembang menjadi puluhan ribu baris kode.

## Decision

Menggunakan TypeScript pada seluruh frontend.

## Consequences

### Pros

- Type safety
- Refactoring lebih aman
- Cocok untuk AI Agent

### Cons

- Sedikit lebih verbose

---

# ADR-003: Why Zustand?

## Status

Accepted

## Context

Game memiliki banyak state:

- Inventory
- Quest
- Player Stats
- UI
- Settings

## Decision

Menggunakan Zustand.

## Consequences

### Pros

- Sangat ringan
- Tidak boilerplate
- Mudah dipelajari

### Cons

- Tidak sekompleks Redux Toolkit

---

# ADR-004: Why Go Fiber?

## Status

Accepted

## Context

Backend membutuhkan:

- Performa tinggi
- WebSocket support
- Mudah dikembangkan
- Multiplayer-ready

## Decision

Menggunakan Go Fiber.

## Consequences

### Pros

- Sangat cepat
- API mirip Express.js
- Developer experience bagus

### Cons

- Ekosistem lebih kecil dibanding Gin

---

# ADR-005: Why PostgreSQL?

## Status

Accepted

## Context

Data utama game bersifat relasional:

- User
- Character
- Inventory
- Quest
- Settlement
- Faction

## Decision

Menggunakan PostgreSQL.

## Consequences

### Pros

- Relasi kuat
- Stabil
- Cocok untuk game skala besar

### Cons

- Lebih kompleks dibanding SQLite

---

# ADR-006: Why ECS Architecture?

## Status

Accepted

## Context

Game akan memiliki ribuan entity:

- Player
- NPC
- Monster
- Projectile
- Item

## Decision

Menggunakan ECS (Entity Component System).

## Consequences

### Pros

- Skalabel
- Modular
- Mudah menambah fitur

### Cons

- Kurva belajar lebih tinggi

---

# ADR-007: Why WebSocket?

## Status

Accepted

## Context

Fitur masa depan:

- Multiplayer
- Chat
- Presence
- Trading

## Decision

Menggunakan WebSocket.

## Consequences

### Pros

- Real-time
- Latensi rendah

### Cons

- Lebih kompleks dibanding REST

---

# ADR-008: Why Redis (Future)?

## Status

Planned

## Context

Multiplayer membutuhkan:

- Presence
- Cache
- Event Bus
- Matchmaking

## Decision

Redis akan ditambahkan setelah MVP selesai.

## Consequences

### Pros

- Sangat cepat
- Cocok untuk game server

### Cons

- Menambah kompleksitas deployment

---

# ADR-009: Why Single Player First?

## Status

Accepted

## Context

Banyak game indie gagal karena langsung mengejar multiplayer.

## Decision

MVP fokus pada:

- Dungeon
- Settlement
- Quest
- Companion

Multiplayer ditunda.

## Consequences

### Pros

- Scope lebih terkontrol
- Development lebih cepat
- Lebih mudah di-test

### Cons

- Multiplayer hadir lebih lambat

---

# ADR-010: Why AI-Agent Driven Development?

## Status

Accepted

## Context

Project dirancang untuk dibangun bersama AI Agent.

## Decision

Seluruh pengembangan wajib diawali dengan:

- GDD
- TDD
- ADR
- Roadmap
- Tasks

## Consequences

### Pros

- AI lebih konsisten
- Dokumentasi lengkap
- Maintainability tinggi

### Cons

- Setup awal lebih lama