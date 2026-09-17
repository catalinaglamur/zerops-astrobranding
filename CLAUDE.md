# Zerops AstroBranding — Operational Directives for Claude Code

@AGENTS.md

## Platform Invariant (Anti-AMN)
- **Control Plane (`zcp`)**: This container is exclusively the Zerops orchestrator. Do not run development servers (`bun dev`) or heavy builds here.
- **Runtimes in Zerops Incus LXC**: The 10 sovereign services run in Incus LXC containers deployed via `zerops_workflow` and `zerops_import`.
- **Platform MCP Tools**: Use native `zerops_*` tools (`zerops_workflow`, `zerops_import`, `zerops_discover`). Never install or use `zcli`.

## Deterministic Verification Sensors (Exit Code 0)
Verify all changes before finalizing tasks:
```bash
bun run check        # Strict TypeScript typecheck (tsc --noEmit)
bun run check:arch   # Domain boundary guard (scripts/architecture-check.mjs)
./setup.sh --step 3  # Topology & architecture boundary validation
```

## Architectural Boundaries
- **Contracts Purity**: `packages/contracts` is 100% pure TypeScript/Zod (no DB, no UI).
- **Database Boundary**: `packages/database` never imports UI libraries.
- **Credit Guard**: Astrological extraction in `packages/engine` enforces `dryRun: true` default in dev/test.
- **AI Gateway**: All external LLM calls route through Bifrost at `http://bifrost:8080/v1`.
- **Artifact Offloading**: Write multi-step plans and research to `/var/www/artifacts/`. Keep conversational responses concise.
