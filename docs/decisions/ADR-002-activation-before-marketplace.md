# ADR-002: Focus on User Activation Before Marketplace

**Date:** 2025-01-30  
**Status:** Accepted  
**Deciders:** Product Lead, Engineering Lead

## Context

Product success metrics define "activation" as connecting integration + creating workflow. Without activation, users won't use the platform, and marketplace won't succeed.

## Decision

Prioritize user activation (onboarding flow, integration connection, workflow creation) before building marketplace features.

## Consequences

**Enables:**
- Validates core product value before building advanced features
- Establishes activation funnel metrics (prerequisite for all other metrics)
- Reduces risk by proving product-market fit with core workflows
- Creates foundation for marketplace success (users need to activate first)

**Blocks:**
- Marketplace features delayed
- AI agent marketplace revenue delayed

**Risks and Trade-offs:**
- Risk: May delay marketplace launch
- Trade-off: Marketplace won't succeed without activated users anyway
- Mitigation: Activation sprint is 30 days, marketplace can follow immediately after

## Alternatives Considered

**Alternative 1: Build Marketplace First**
- Why not chosen: Marketplace requires activated users. Building marketplace without activation is putting cart before horse.

**Alternative 2: Build Both in Parallel**
- Why not chosen: Too ambitious. Risk of delivering neither well. Need focused execution.

**Alternative 3: Build Activation After Marketplace**
- Why not chosen: Marketplace won't succeed without activated users. Activation is prerequisite.

---

**Related:** See `docs/SPRINT_N+1_GOAL.md` for sprint goal details.
