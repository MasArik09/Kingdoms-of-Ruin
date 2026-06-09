# Kingdoms of Ruin
## Development Tasks

Status Legend:

- [ ] Not Started
- [x] Completed
- [-] Skipped

---

# Phase 0 — Project Foundation

## Repository

- [x] Initialize repository structure
- [x] Configure TypeScript
- [ ] Configure ESLint
- [ ] Configure Prettier
- [ ] Configure Husky
- [ ] Configure lint-staged

## Frontend

- [x] Setup Phaser.js
- [x] Setup Zustand
- [x] Setup UI layer
- [x] Setup Scene Manager
- [x] Setup Asset Loader

## Backend

- [x] Setup Fiber
- [x] Setup PostgreSQL
- [ ] Setup Redis
- [ ] Setup WebSocket server
- [x] Setup Config Management

## Documentation

- [ ] Create Architecture Diagram
- [ ] Create API Contracts
- [ ] Create Database Schema Diagram

---

# Phase 1 — Core Character System

## Player Entity

- [x] Create Player entity
- [x] Create Player component
- [x] Create Player sprite
- [x] Create Animation controller

## Movement

- [x] WASD movement
- [-] Mouse movement
- [x] Collision detection
- [x] Camera follow

## Input

- [x] Keyboard handler
- [-] Mouse handler
- [x] Input abstraction layer

---

# Phase 1B — Core Interaction Loop

## Proximity Interaction

- [x] Generic InteractionComponent
- [x] InteractionSystem registry
- [x] InteractionManager update loops & key listener
- [x] Proximity visual prompt UI

## Landmarks & Loot

- [x] Campfire class, light glow, flame tweens, rest callback
- [x] AncientShrine class, static collider, examine callback
- [x] TreasureChest class, open/closed state, loot event
- [x] Stacking UI toasts for feedback

## Item & Inventory System

- [x] Data-driven ItemRegistry and ItemDefinition
- [x] Zustand InventoryStore
- [x] Grid inventory UI panel toggled on TAB
- [x] Inventory filter tabs and item descriptions

## Backend Integration

- [x] PostgreSQL owner-based inventory_items schema
- [x] Fiber GET/POST endpoints & upsert SQL logic

---

# Phase 2 — Equipment, Progression, & Visual Customization

## Database & Persistence
- [x] Create characters and character_equipment tables
- [x] Implement Fiber GET/POST endpoints for equipment
- [x] Use SQL transactions to safely equip/unequip gear

## Stat Progression
- [x] implement Zustand character store
- [x] Calculate derived stats (Max HP, Max Stamina, Attack Power, Armor, Speed)

## Visual Customization
- [x] Redesign player base knight sprite to be heroic/athletic
- [x] Create custom vector overlay sprites for Traveler Hood, Worn Leather Armor, and Old Boots
- [x] Implement PaperDoll rendering manager for depth, scale, and movement alignment
- [x] Hook into Phaser's postupdate event loop to eliminate overlay frame lag

## UI Isolation & Layout
- [x] Extract HUD overlay manager class
- [x] Add responsive side-by-side positioning for Character Sheet and Inventory panels
- [x] Optimize stats layout spacing to prevent vertical overlapping

---

# Phase 3 — Combat & Enemy Foundations

## Enemy Foundation
- [ ] Create abstract `EnemyBase` class in Phaser
- [ ] Implement `Slime` enemy subclass with custom behavior and textures
- [ ] Create `EnemyRegistry` to manage enemy types and stats

## Combat & Damage Systems
- [ ] Create `CombatSystem` for handling melee attacks, triggers, and hits
- [ ] Create `DamageSystem` for calculating final damage and applying HP changes
- [ ] Implement floating damage text on hit

## Progression & Persistence
- [ ] Update PostgreSQL characters table to track level and experience
- [ ] Implement `ExperienceSystem` to handle XP rewards, leveling up, and DB sync
- [ ] Implement CharacterCombatStats layer to consolidate combat values

---

# Phase 5 — Dungeon Generation

## Dungeon Generator

- [ ] BSP generation
- [ ] Room placement
- [ ] Corridor generation

## Dungeon Population

- [ ] Enemy spawn points
- [ ] Loot spawn points
- [ ] Boss rooms

---

# Phase 6 — Loot System

## Loot Core

- [ ] Loot tables
- [ ] Loot generation

## Rarity

- [ ] Common
- [ ] Uncommon
- [ ] Rare
- [ ] Epic
- [ ] Legendary

---

# Phase 7 — Save System

## Persistence

- [ ] Save player
- [ ] Save inventory
- [ ] Save dungeon state

## Backend

- [ ] Save API
- [ ] Load API
- [ ] Character endpoint

---

# Phase 8 — Quest System

## Quest Core

- [ ] Quest model
- [ ] Quest tracker
- [ ] Quest rewards

## Quest Types

- [ ] Kill quest
- [ ] Collection quest
- [ ] Exploration quest

---

# Phase 9 — Companion System

## Companion Core

- [ ] Recruit companion
- [ ] Companion inventory
- [ ] Companion equipment

## AI

- [ ] Follow player
- [ ] Assist combat
- [ ] Auto heal

---

# Phase 10 — Settlement System

## Buildings

- [ ] Town Hall
- [ ] Warehouse
- [ ] Farm
- [ ] Blacksmith

## Resources

- [ ] Wood
- [ ] Stone
- [ ] Iron
- [ ] Food

---

# Phase 11 — NPC Simulation

## Needs

- [ ] Hunger
- [ ] Energy
- [ ] Mood

## Behavior

- [ ] Work
- [ ] Sleep
- [ ] Eat

---

# Phase 12 — Crafting

- [ ] Crafting recipes
- [ ] Production chains
- [ ] Workshop jobs

---

# Phase 13 — World Map

- [ ] Biome generation
- [ ] Region generation
- [ ] Discovery system

---

# Phase 14 — Factions

- [ ] Reputation system
- [ ] Diplomacy
- [ ] Trading
- [ ] War declarations

---

# Phase 15 — Economy

- [ ] Market simulation
- [ ] Dynamic pricing
- [ ] Regional trade

---

# Phase 16 — Dynamic Events

- [ ] Bandit raids
- [ ] Droughts
- [ ] Epidemics
- [ ] Natural disasters

---

# Phase 17 — Endgame

- [ ] Ancient bosses
- [ ] Legendary artifacts
- [ ] World threats

---

# Phase 18 — Multiplayer Preparation

- [ ] Session architecture
- [ ] Redis pub/sub
- [ ] Realtime sync model

---

# Phase 19 — Multiplayer Alpha

- [ ] Lobby system
- [ ] Party system
- [ ] Shared dungeon

---

# Phase 20 — Release

- [ ] Steam page
- [ ] Trailer
- [ ] Public release