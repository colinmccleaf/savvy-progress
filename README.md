# Savvy Progress

An always-visible progress tracker for Claude.

- **Bar above the chat box** — always on, even with the side panel closed:
  `████░░░░ Savvy Progress 2/4 · now: Drafting outreach emails`
- **Side panel** — every step with ✅ done, ▶ in progress, ☐ to do, plus a progress bar.
- **Keeps Claude on track** — Claude breaks multi-step work into 3–8 steps (last one: "Check the work") and ticks them off as it goes.

## Install

In a Claude Code session, type:

```
/plugin install savvy-progress --marketplace colinmccleaf/savvy-progress
```

Answer `y` to add the marketplace, then press Enter to install for your user. It's active right away, and in every session after.

## Commands

- `/savvy-progress` — reopen the side panel and show the bar
- `/savvy-progress hide` — hide the bar (run `/savvy-progress` to bring it back)
- `/savvy-progress clear` — reset the steps
