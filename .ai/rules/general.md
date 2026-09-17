---
paths:
    - '**'
---

# General

## Use Conventional Commits for commit messages

Use Conventional Commits in English: `<type>(<scope>): <description>`. Allowed types: feat, fix, refactor, perf, docs, test, style, build, ci, chore, revert. Prefer business scope (auth, user, customer, shipment, pickup, tracking, invoice, payment, report, notification); use technical scope (api, database, ui, config, deps, vite, actions) only if not feature-tied, omit if unclear. Subject: imperative lowercase verb, concise specific, no period, no generic wording. Details and examples: `.github/instructions/commit-message.instructions.md`.

## Composer ci:check is the final gate

Run `composer ci:check` as the final gate after edits and narrow tests pass, before reporting done / commit / PR. Do not substitute partial checks (`--filter`, only pint/tsc). Ensure vendor + node_modules installed (`composer setup` if unsure). On failure, fix root cause and rerun the full gate until green; never claim green without actual green output.
