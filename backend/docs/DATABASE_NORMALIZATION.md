# Database Normalization Architecture: 1NF, 2NF, and 3NF

This document details the relational database design implemented for the **Geopolitical Event Impact Monitoring System** using PostgreSQL and Prisma ORM.

---

## 1. First Normal Form (1NF)

### Rules:
1. Each table column must contain atomic (indivisible) values.
2. No repeating groups or arrays stored in single attributes.
3. Every row must be uniquely identifiable via a Primary Key.

### Implementation:
- **Separation of Source Citations**: Instead of storing comma-separated news sources or URLs inside an `events` table column, citations are modeled via separate relational entities (`sources` and `event_sources`).
- **Atomic Event Attributes**: Distinct columns for `title`, `summary`, `theater`, `severity`, and `status`.
- **Primary Keys**: Every relation possesses a dedicated UUID primary key (`id`), or composite primary key for junction tables (`@@id([eventId, sourceId])`).

---

## 2. Second Normal Form (2NF)

### Rules:
1. The table must satisfy **1NF**.
2. **No Partial Functional Dependencies**: All non-key attributes must be fully functionally dependent on the *entire* primary key, rather than on a subset of a composite key.

### Implementation:
- In the composite junction table `event_sources` (`eventId`, `sourceId`):
  - `citationUrl` and `publishedAt` depend specifically on the *combination* of the event and the reporting source.
  - Attributes belonging solely to the source (e.g. `baseUrl`, `reliabilityScore`, `country`) are kept strictly in the `sources` table.
  - Attributes belonging solely to the event (e.g. `severityScore`, `theater`) remain strictly in the `events` table.
  - This eliminates partial functional dependency.

---

## 3. Third Normal Form (3NF)

### Rules:
1. The table must satisfy **2NF**.
2. **No Transitive Dependencies**: Non-key attributes must not depend on other non-key attributes ($X \to Y$ and $Y \to Z$ where $Z$ depends transitively on the primary key $X$).
3. *"Every non-key attribute must provide a fact about the key, the whole key, and nothing but the key."*

### Implementation:
- **User & Profile Decomposition (`users` & `user_profiles`)**:
  - `users`: Core identity and authentication attributes (`id`, `email`, `passwordHash`, `role`).
  - `user_profiles`: Extensible metadata (`fullName`, `avatarUrl`, `bio`, `theaterPref`) linked via foreign key `userId`.
- **Event & Impact Assessment Decomposition (`events` & `impact_assessments`)**:
  - Impact scores across multiple geopolitical domains (`economicImpact`, `diplomaticImpact`, `militaryImpact`, `humanitarianImpact`, `cyberImpact`) are isolated in `impact_assessments`.
  - Ensures changes to analytical domain models do not introduce schema anomalies into the core event tracking entity.
- **Audit Logging (`audit_logs`)**:
  - System activity logging decoupled from application state, referencing `userId` via foreign key with `SetNull` constraint on user deletion.

---

## 4. Entity-Relationship Summary

| Entity | Primary Key | Foreign Keys | Relationship |
| :--- | :--- | :--- | :--- |
| `users` | `id` (UUID) | None | 1:1 with `user_profiles`, 1:N with `audit_logs` |
| `user_profiles` | `id` (UUID) | `userId` -> `users.id` | 1:1 with `users` |
| `events` | `id` (UUID) | None | 1:1 with `impact_assessments`, N:M with `sources` |
| `impact_assessments` | `id` (UUID) | `eventId` -> `events.id` | 1:1 with `events` |
| `sources` | `id` (UUID) | None | N:M with `events` via `event_sources` |
| `event_sources` | `(eventId, sourceId)` | `eventId`, `sourceId` | Junction table for Event-Source N:M |
| `user_bookmarks` | `(userId, eventId)` | `userId`, `eventId` | Junction table for User-Event bookmarks |
| `audit_logs` | `id` (UUID) | `userId` -> `users.id` | 1:N audit history |
