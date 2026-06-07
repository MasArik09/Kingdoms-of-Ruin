# Kingdoms of Ruin

### Game Design Document (GDD) v1.0

---

# 1. Vision Statement

Kingdoms of Ruin adalah game roguelike colony simulator berskala besar yang menggabungkan eksplorasi dungeon procedural, pembangunan pemukiman, simulasi ekonomi, diplomasi antar faksi, dan pengelolaan karakter dalam dunia fantasi yang terus berkembang.

Pemain memulai permainan sebagai seorang penyintas di dunia yang runtuh akibat perang kuno dan bencana magis. Untuk bertahan hidup, pemain harus menjelajahi reruntuhan, mengumpulkan sumber daya, merekrut penduduk, membangun kembali pemukiman, dan menentukan masa depan dunia.

---

# 2. Core Gameplay Loop

## Early Game

Explore Dungeon
→ Gather Resources
→ Return Home
→ Craft Equipment
→ Upgrade Character
→ Explore Deeper

## Mid Game

Explore World
→ Recruit NPCs
→ Build Settlement
→ Establish Economy
→ Expand Territory

## Late Game

Control Multiple Settlements
→ Influence Factions
→ Fight World Threats
→ Shape World Politics
→ Create Kingdom

---

# 3. Target Audience

Primary:

* Roguelike Players
* Colony Sim Players
* RPG Players

Examples:

* RimWorld
* Terraria
* Stardew Valley
* Darkest Dungeon
* Mount & Blade
* Core Keeper
* Dwarf Fortress

Age Range:

* 16+
* Strategy-focused players

---

# 4. Game Pillars

## Pillar 1 — Exploration

Every run reveals new places, resources, enemies, and stories.

## Pillar 2 — Progression

Every expedition improves the player, settlement, or world.

## Pillar 3 — Emergent Stories

Unexpected interactions create unique stories.

## Pillar 4 — Strategic Choices

Every decision has long-term consequences.

## Pillar 5 — Living World

NPCs, factions, and economies evolve over time.

---

# 5. World Lore

Hundreds of years ago, the continent was ruled by the Eternal Kingdom.

A catastrophic magical event known as:

"The Shattering"

destroyed civilization.

The world fractured into:

* Ruined Kingdoms
* Wild Territories
* Ancient Dungeons
* Forgotten Cities

Players arrive long after the collapse.

Their goal is not merely survival.

Their goal is rebuilding civilization.

---

# 6. Character System

## Attributes

* Strength
* Dexterity
* Intelligence
* Vitality
* Charisma

## Derived Stats

* Health
* Mana
* Stamina
* Critical Chance
* Dodge Chance

## Classes

Initial:

* Warrior
* Ranger
* Mage

Future:

* Necromancer
* Paladin
* Alchemist
* Beastmaster

---

# 7. Dungeon System

## Objectives

Generate infinite replayability.

## Dungeon Features

* Random Layout
* Random Loot
* Random Enemies
* Hidden Rooms
* Elite Enemies
* Boss Rooms

## Biomes

* Crypt
* Forest Temple
* Mines
* Ancient Ruins
* Volcano
* Frozen Caverns

## MVP Scope

* Crypt
* Mines

---

# 8. Combat System

## Combat Style

Real-time top-down combat.

## Combat Mechanics

* Melee
* Ranged
* Magic

## Status Effects

* Burn
* Poison
* Bleed
* Freeze
* Stun

## MVP Scope

* Melee
* Basic Ranged

---

# 9. Loot System

## Item Rarity

* Common
* Uncommon
* Rare
* Epic
* Legendary

## Item Types

* Weapons
* Armor
* Consumables
* Materials
* Relics

## Future

Unique legendary items with lore.

---

# 10. Settlement System

## Purpose

Create long-term progression.

## Buildings

### MVP

* House
* Storage
* Farm
* Workshop

### Future

* Tavern
* Blacksmith
* Barracks
* Market
* Mage Tower

---

# 11. NPC System

NPCs are autonomous.

Each NPC has:

* Name
* Age
* Profession
* Mood
* Hunger
* Energy
* Skills

## Jobs

* Farmer
* Miner
* Guard
* Hunter
* Crafter

---

# 12. Companion System

Companions accompany players into dungeons.

## Companion Attributes

* Personality
* Loyalty
* Traits
* Skills

## Example Traits

* Brave
* Coward
* Greedy
* Loyal
* Genius

---

# 13. Crafting System

## Resource Chain

Wood
→ Plank
→ Bow

Iron Ore
→ Iron Bar
→ Sword

Leather
→ Armor

## Future

Multi-step crafting chains.

---

# 14. Skill Tree System

## Combat Tree

* Sword Mastery
* Archery
* Magic

## Survival Tree

* Farming
* Mining
* Crafting

## Leadership Tree

* Diplomacy
* Trading
* Settlement Management

---

# 15. Faction System

Major Factions:

* Iron Kingdom
* Merchant Guild
* Ashen Cult
* Nomad Tribes
* Necromancer Covenant

## Reputation Levels

* Allied
* Friendly
* Neutral
* Hostile
* At War

---

# 16. Economy System

Dynamic economy based on:

* Supply
* Demand
* Region
* Season

Examples:

Food shortage
→ Food prices increase

Excess iron
→ Iron prices decrease

---

# 17. Dynamic Event System

Random world events.

Examples:

* Bandit Raid
* Plague
* Drought
* Dragon Attack
* Civil War
* Meteor Impact

Events affect:

* Economy
* Settlements
* NPC Mood
* Faction Relations

---

# 18. Progression System

Player Progression

Level
→ Skills
→ Equipment

Settlement Progression

Buildings
→ Population
→ Production

World Progression

Influence
→ Factions
→ Kingdom Power

---

# 19. Multiplayer Expansion (Future)

Not part of MVP.

Planned Features:

* Trading
* Guilds
* Shared Settlements
* Cooperative Dungeons
* Global Marketplace

---

# 20. Development Roadmap

## Phase 1 — Core Roguelike

* ECS Architecture
* Character Controller
* Basic Combat
* Inventory
* Procedural Dungeon

Goal:
Playable prototype

---

## Phase 2 — Loot & Progression

* Equipment
* Item Drops
* Character Progression
* Bosses

Goal:
Replayable dungeon game

---

## Phase 3 — Settlement Building

* Base Construction
* Storage
* Farming

Goal:
Persistent progression

---

## Phase 4 — NPC AI

* Needs System
* Jobs
* Pathfinding

Goal:
Living settlement

---

## Phase 5 — Procedural World

* World Map
* Biomes
* Exploration

Goal:
Open world

---

## Phase 6 — Factions

* Reputation
* Diplomacy
* Quests

Goal:
Political gameplay

---

## Phase 7 — Economy

* Dynamic Pricing
* Trade Routes
* Markets

Goal:
Living economy

---

## Phase 8 — Companions

* Recruitment
* Loyalty
* Relationships

Goal:
Party gameplay

---

## Phase 9 — Dynamic Events

* World Events
* Disasters
* Global Consequences

Goal:
Emergent stories

---

## Phase 10 — Multiplayer

* Guilds
* Trading
* Co-op Dungeons

Goal:
Online ecosystem

---

# 21. Success Metrics

Phase 1 Success

* Playable dungeon run
* Stable combat
* Inventory works

Phase 3 Success

* Settlement loop functional

Phase 5 Success

* Procedural world generation complete

Phase 10 Success

* Multiplayer supports 100+ concurrent players

---

# 22. Long-Term Goal

Create a game capable of generating unique player stories through exploration, settlement growth, faction politics, and dynamic world simulation.

The player should never experience exactly the same world twice.
