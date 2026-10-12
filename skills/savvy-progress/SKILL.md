---
name: savvy-progress
description: Always show a live progress tracker while working. Use on every task that takes more than one step or tool call: research, building files, running other skills, outreach, SEO audits, spreadsheet work, anything with stages.
---

# Savvy Progress

Colin should always be able to glance at the conversation and know three things: what's done, what's happening now, and what's left. Apply this on every multi-step task, including when another skill is running.

## 1. Open with the plan

Before the first tool call, post a short progress card:

```
**Savvy Progress** — <task name>
☐ Step 1 — <plain-words description>
☐ Step 2 — ...
☐ Step N — Check the work
Est. steps: N
```

- 3 to 8 steps. Merge tiny steps; split anything that will take many tool calls.
- The last step is always checking the work (facts against sources, numbers re-run, file opened and looked at).
- Also create the same steps in the task-list widget (TaskCreate), so progress is visible beside the chat.

## 2. Update as you go

- Mark a step in progress (TaskUpdate) before starting it, and completed the moment it finishes.
- After each step finishes, send a one-line update (SendUserMessage when mid-task):
  `✅ Step 2/5 done — found 14 firms with trials this month`
- The update says the result, not the effort. "Found 14 firms" beats "Searched Google."
- Don't narrate individual tool calls between updates.

## 3. Flag changes immediately

Send an update right away, marked ⚠️, when:
- A step is blocked (site unreachable, connector missing, file not attached)
- The plan changes (a step added, dropped or reordered); repost the full card
- Something found changes what Colin will get at the end

Example: `⚠️ Step 3/5 — LinkedIn needs a sign-in; switching to Google results for now`

## 4. Close with the final card

When the task ends, post the finished card:

```
**Savvy Progress** — <task name> ✅ Complete
✅ Step 1 — ...
✅ Step 2 — ...
⚠️ Step 3 — partial: <what's missing>
✅ Step 4 — Checked
```

Then one or two sentences on the outcome and, if there is one, the single best next step.

## Rules

- Short tasks (one quick answer, one lookup) don't get a card; just answer.
- Never mark a step ✅ that didn't fully finish; use ⚠️ partial and say what's missing.
- If Colin steps away, keep updating; the card is how he catches up.
- Keep every update to one line. The card is the summary; don't repeat it in prose.
