# Smart Omni CRM – CLAUDE.md

This file defines the mandatory engineering rules for Claude Code when working in this repository.

Read this file before modifying code.

Also read the relevant documents under `/docs`.

---

## 1. PROJECT

Smart Omni CRM is a unified platform combining:

- CRM
- Sales
- Omnichannel Messaging
- Chatbot
- AI Copilot
- Knowledge Hub / RAG
- Workflow / Automation
- Analytics

Core product principle:

> ONE CUSTOMER – ONE TIMELINE – UNIFIED CONVERSATIONS – CONNECTED SALES JOURNEY – HUMAN + AI COLLABORATION

Do not design CRM, Inbox, Chatbot, AI, or Knowledge as isolated applications.

---

## 2. SOURCE OF TRUTH

The `/docs` directory contains the approved product and technical specifications.

Expected documents include:

```text
/docs/
  01_PRD_Omni_CRM.md
  02_Database_Schema_v2.0.md
  03_Screen_Architecture_v2.0.md
  04_User_Flow_v2.0.md
  05_System_Architecture_API_v2.0.md
  06_Master_Prompt_Implementation_Roadmap.md
```

Read the relevant specification before implementing a module.

Do not silently modify approved requirements.

If a material conflict exists, stop that specific implementation decision and produce:

```text
SPEC CONFLICT

Requirement A:
Requirement B:
Technical impact:
Recommended resolution:
```

If an architectural deviation is necessary:

```text
SPEC DEVIATION

Original requirement:
Proposed change:
Technical reason:
Impact:
Migration/backward compatibility impact:
```

---

## 3. IMPLEMENTATION STRATEGY

Do not implement the whole product at once.

Work one approved sprint at a time.

Default order:

```text
Sprint 00 Foundation
Sprint 01 IAM
Sprint 02 CRM Core
Sprint 03 Customer 360 + Timeline
Sprint 04 Tasks + Meetings
Sprint 05 Leads
Sprint 06 Sales Pipeline
Sprint 07 Products + Quotes
Sprint 08 Omnichannel Foundation
Sprint 09 Unified Inbox
Sprint 10 Chatbot
Sprint 11 Knowledge Hub + RAG
Sprint 12 AI Foundation
Sprint 13 AI CRM Features
Sprint 14 Human Handoff
Sprint 15 Automation + Notifications
Sprint 16 Dashboard + Reports
Sprint 17 Contracts + Payments
Sprint 18 Hardening + QA
```

Do not automatically begin the next sprint after completing the current sprint.

---

## 4. REQUIRED PRE-WORK FOR EACH SPRINT

Before coding:

1. Inspect the current repository.
2. Read relevant `/docs` specifications.
3. Review existing migrations.
4. Review existing APIs and modules.
5. Identify dependencies and conflicts.
6. Produce a concise Sprint Implementation Plan.

The plan must include:

```text
Scope
Modules/files affected
Database migrations
API endpoints
Frontend screens/components
Background jobs/events
Tests
Security considerations
Risks
```

---

## 5. ARCHITECTURE

Use a Modular Monolith for the main application.

Use background workers for asynchronous work.

Recommended logical domains:

```text
auth
iam

organizations
contacts
leads

activities
tasks
meetings

pipelines
opportunities
products
quotes
contracts
payments

channels
conversations
messages

chatbots
handoffs

ai
knowledge

automation
approvals

notifications
files

dashboard
reports
audit
settings
```

Maintain explicit module boundaries.

Avoid circular dependencies.

---

## 6. BACKEND LAYERING

Follow:

```text
Controller
→ Application Service
→ Repository
→ Database
```

Controllers should be thin.

Do not put complex business logic in controllers.

Do not put business logic in frontend components.

Repositories are responsible for persistence, not application orchestration.

---

## 7. DATABASE

Database Schema v2.0 is authoritative.

General rules:

- PostgreSQL
- UUID primary keys
- tenant-aware business records
- foreign keys
- soft delete where defined
- TIMESTAMPTZ
- NUMERIC/DECIMAL for money
- explicit currency fields
- indexes for search/filter relations
- migrations for all schema changes

Never modify a shared/production database manually as a substitute for migrations.

Never reset a database unless explicitly authorized.

If a migration tool proposes destructive reset, stop and report it.

---

## 8. TENANT ISOLATION

Never trust tenant_id from request payloads.

Derive tenant from authenticated request context.

Every tenant-owned query must be scoped to the current tenant.

Cross-tenant access is a critical security defect.

---

## 9. AUTHORIZATION

Protected requests must evaluate:

```text
Authentication
→ Tenant
→ Permission
→ Record Scope
```

Record scope may include:

```text
OWN
TEAM
DEPARTMENT
ALL
```

Frontend hiding is not authorization.

Backend must always enforce permission.

---

## 10. CUSTOMER IDENTITY

Identity resolution is a core capability.

Use normalized identifiers such as:

- phone;
- email;
- Zalo ID;
- WhatsApp ID;
- Viber ID;
- Messenger ID.

Do not auto-merge uncertain matches.

Possible duplicates require human confirmation.

Do not maintain separate customer identities for each communication channel.

---

## 11. CUSTOMER 360

Customer 360 is an aggregation/read model.

Do not create a duplicate `customer_360` storage table unless a formally approved caching/read-model strategy requires it.

Customer 360 may aggregate:

```text
Organization
Contacts
Activities
Opportunities
Conversations
Quotes
Contracts
Payments
Tasks
Meetings
Notes
Files
AI Insights
```

---

## 12. ACTIVITY TIMELINE

Timeline contains meaningful business events.

Do not create an activity record for every individual chat message.

Examples of Timeline events:

```text
Meeting
Call
Stage Change
Conversation Summary
Quote Sent
Contract
Payment
Handoff
Executed AI Action
```

---

## 13. SALES

Pipeline configuration must be data-driven.

Do not hard-code stages.

Every Opportunity stage transition must create stage history.

WON requires:

```text
final_value
actual_close_date
```

LOST requires:

```text
lost_reason
```

Lead conversion must be transactional.

---

## 14. OMNICHANNEL

Provider-specific behavior must live behind channel adapters.

Do not scatter code such as:

```ts
if (channel === "WHATSAPP") ...
if (channel === "ZALO") ...
```

throughout business modules.

Connector responsibilities should include:

```text
connect
disconnect
healthCheck
verifyWebhook
normalizeInboundMessage
normalizeDeliveryEvent
sendText
sendTemplate
sendAttachment
```

---

## 15. WEBHOOKS

Inbound webhook flow:

```text
Verify
→ Idempotency
→ Persist raw event
→ Queue
→ Normalize
→ Identity resolution
→ Conversation resolution
→ Message persistence
→ Routing
```

Never process the same provider event twice.

Use provider event/message identifiers for idempotency.

---

## 16. MESSAGING

Outbound message flow:

```text
Permission
→ Consent
→ Do-not-contact
→ Channel health
→ Persist message
→ Queue
→ Connector
→ Provider
→ Delivery update
```

Sending a message is a business action and must not be confused with generating an AI draft.

---

## 17. CHATBOT

A chatbot is an actor in the Conversation system.

Do not create a separate chatbot contact/customer database.

Support:

```text
Session
Intent
Flow
Variables
Knowledge
Lead Capture
Meeting Request
Handoff
```

Bot flow production changes require versioning.

Do not overwrite a published flow directly.

---

## 18. AI

Frontend must never call model providers directly.

Use:

```text
Frontend
→ AI API
→ AI Orchestrator
→ AI Gateway
→ Provider
```

AI Context Builder must apply authorization and data minimization before sending context to the model.

AI never has more data access than the requesting actor.

---

## 19. AI TOOL CALLS

Models must not access repositories or databases directly.

AI write action:

```text
LLM Tool Request
→ Tool Registry
→ Permission Check
→ Approval Policy
→ Application Service
→ Audit
```

Examples:

```text
search_customer          LOW       AUTO
get_customer_360         LOW       AUTO
draft_message            LOW       AUTO
create_task              MEDIUM    USER_CONFIRM
update_opportunity       MEDIUM    USER_CONFIRM
record_payment           HIGH      DISABLED by default
```

---

## 20. AI HUMAN APPROVAL

Important actions should default to human approval.

Examples:

- send AI-generated customer message;
- create/update business records via AI;
- modify opportunity;
- send quote;
- change contract;
- payment operation;
- deletion;
- permission change.

AI drafts are drafts until explicitly applied/sent.

---

## 21. KNOWLEDGE / RAG

Knowledge runtime:

```text
Query
→ Actor permissions
→ Allowed Knowledge Bases
→ Effective documents
→ Retrieval
→ Reranking if configured
→ Context
→ Model
→ Answer + source references
```

Do not let a public chatbot retrieve confidential internal knowledge.

If reliable knowledge is unavailable, do not fabricate business facts.

---

## 22. PROMPTS

Production prompts must be versioned/configurable.

Do not bury important business prompts as random string literals across source files.

Support:

```text
Draft
Test
Publish
Version
Rollback
```

---

## 23. EXTERNAL SERVICES

Use adapters for external systems:

```text
ZaloAdapter
WhatsAppAdapter
ViberAdapter
EmailAdapter
StorageAdapter
AIProviderAdapter
```

Do not call external providers directly from controllers.

---

## 24. ASYNC WORK

Use background jobs for operations such as:

- webhook processing;
- message retry;
- document indexing;
- embeddings;
- large AI analysis;
- PDF generation;
- exports;
- bulk scoring;
- workflow execution.

Do not block HTTP requests unnecessarily.

---

## 25. EVENTS

Use domain events where appropriate.

Examples:

```text
lead.converted
opportunity.stage_changed
opportunity.won
quote.sent
meeting.completed
message.received
handoff.requested
payment.received
```

Important async business events should be compatible with a Transactional Outbox pattern.

---

## 26. API

Use versioned APIs:

```text
/api/v1
```

Prefer REST resource naming.

Good:

```text
GET  /api/v1/organizations
POST /api/v1/opportunities/:id/change-stage
```

Avoid:

```text
/getCustomers
/updateLeadStatus
```

Use action endpoints only when the action is not natural CRUD.

---

## 27. API CONTRACT

Standard success:

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "request_id": "uuid"
}
```

Standard error:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Message",
    "details": {}
  },
  "request_id": "uuid"
}
```

Do not expose raw ORM entities directly.

Use DTOs / schemas.

---

## 28. OPENAPI

Document all public/internal application APIs as applicable.

An endpoint is not complete without:

- request schema;
- response schema;
- errors;
- auth requirements;
- permission requirements.

---

## 29. FRONTEND

Organize frontend by domain.

Avoid uncontrolled component dumping.

Prefer reusable shared components such as:

```text
AppShell
Sidebar
Header
DataTable
FilterBar
RecordHeader
RecordTabs
Timeline
ConversationList
MessageBubble
MessageComposer
AISummaryCard
AIInsightCard
TaskDrawer
MeetingDrawer
EmptyState
ErrorState
LoadingSkeleton
```

---

## 30. SERVER STATE

Use a dedicated query/cache layer for server state.

Do not duplicate the full API dataset in arbitrary global frontend stores.

---

## 31. PERFORMANCE

List pages must use server-side pagination/filter/sort.

Message history must use cursor pagination.

Customer 360 should load critical summary first and lazy-load secondary tabs.

Avoid unnecessary N+1 queries.

---

## 32. REALTIME

Realtime is expected for:

- new messages;
- unread updates;
- conversation assignment;
- handoff queue;
- notifications.

Do not reload the full application for individual realtime events.

Patch or invalidate relevant state only.

---

## 33. FILES

Do not store large binary files directly in PostgreSQL.

Use object storage and metadata records.

Validate:

- file size;
- MIME;
- extension;
- authorization.

Never expose storage credentials.

---

## 34. SECRETS

Never commit:

```text
password
API key
access token
refresh token
private credential
```

Use environment variables and/or secret storage.

`.env.example` may contain variable names only.

---

## 35. SECURITY

At minimum verify:

- authentication;
- tenant isolation;
- RBAC;
- record scope;
- input validation;
- rate limits where relevant;
- webhook signatures;
- file upload protection;
- secret handling;
- AI authorization;
- RAG authorization;
- audit.

---

## 36. AUDIT

Audit important business mutations.

Examples:

- owner changes;
- opportunity stage/value;
- contact merge;
- approvals;
- role/permission changes;
- AI-executed actions.

Do not rely solely on database triggers for business audit.

---

## 37. TESTING

At minimum use:

- unit tests for business rules;
- integration tests for database/API;
- authorization tests;
- critical E2E tests;
- connector normalization tests;
- AI tool permission tests;
- RAG permission tests.

Never report tests passing unless actually executed.

---

## 38. REQUIRED END-OF-SPRINT CHECKS

Before declaring a sprint complete, run applicable:

```text
lint
typecheck
unit tests
integration tests
build
migration verification
```

If something cannot be run, explicitly mark:

```text
NOT VERIFIED
```

and state why.

---

## 39. COMPLETION REPORT

At the end of each sprint, output:

```text
SPRINT COMPLETION REPORT

1. Implemented
2. Database migrations
3. API endpoints
4. Screens/components
5. Tests run
6. Security checks
7. Known limitations
8. Spec deviations
9. Files changed
10. Unverified items
11. Recommended next step
```

---

## 40. DO NOT

Do not:

- implement all sprints in one pass;
- silently change approved architecture;
- reset databases without authorization;
- call DB directly from frontend;
- call AI providers directly from frontend;
- create separate customer DBs for chatbot/inbox;
- hard-code pipeline stages;
- hard-code production prompts;
- bypass authorization in AI;
- auto-merge uncertain customer records;
- expose secrets;
- claim unverified work is complete.

---

## 41. WHEN STARTING A NEW REPOSITORY

If the repository is new:

Do not immediately build the full application.

Start with Sprint 00 only.

Before implementation:

1. inspect repository;
2. read `/docs`;
3. verify current stable compatible dependency versions using official documentation;
4. create Sprint 00 Implementation Plan;
5. implement Sprint 00;
6. run verification;
7. produce Sprint Completion Report.

Do not proceed to Sprint 01 automatically.

---

## 42. NORTH STAR

Every technical decision should preserve:

```text
ONE CUSTOMER
ONE TIMELINE
UNIFIED CONVERSATIONS
CONNECTED SALES JOURNEY
HUMAN + AI COLLABORATION
```