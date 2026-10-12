---
name: savvy-progress
description: Always show a live progress tracker while working. Use on every task that takes more than one step or tool call: research, building files, running other skills, outreach, SEO audits, spreadsheet work, anything with stages.
---

# Savvy Progress

Colin should always be able to glance at the conversation and know what's done, what's happening now, and what's left. Apply this on every multi-step task, including when another skill is running.

## The progress line

Every progress update is this one line, in exactly this shape:

```
Savvy Progress ████████████░░░░░░░░░░░░ 50% Step 3/6 · Writing the SEO report
```

- **Bar:** always 24 characters. Filled `█` = round(24 × current step ÷ total steps); the rest is `░`.
- **Percent:** current step ÷ total steps, rounded to a whole number.
- **Step n/total:** n counts the steps already finished plus the one in progress (2 finished + step 3 underway = Step 3/6).
- **After the ·:** what's happening now, in a few plain words ("Writing the SEO report").
- **Finished:** `Savvy Progress ████████████████████████ 100% Step 6/6 · Done ✅`

Reference widths for a 6-step task:

| Step | Bar | % |
| --- | --- | --- |
| 1/6 | `████░░░░░░░░░░░░░░░░░░░░` | 17% |
| 2/6 | `████████░░░░░░░░░░░░░░░░` | 33% |
| 3/6 | `████████████░░░░░░░░░░░░` | 50% |
| 4/6 | `████████████████░░░░░░░░` | 67% |
| 5/6 | `████████████████████░░░░` | 83% |
| 6/6 | `████████████████████████` | 100% |

## 1. Open with the plan

Before the first tool call:

- Break the task into 3 to 8 steps. Merge tiny steps; split anything that will take many tool calls. The last step is always "Check the work" (facts against sources, numbers re-run, file opened and looked at).
- Create the steps in the task-list widget (TaskCreate), so the bar above the chat box and the side panel fill in.
- Post the step list once, then the first progress line.

## 2. Update as you go

- Mark a step in progress (TaskUpdate) before starting it, and completed the moment it finishes.
- Each time a step starts, send the progress line (SendUserMessage when mid-task). Add a short result after a finished step when there is one: `✅ Found 14 firms with trials this month`.
- Don't narrate individual tool calls between updates.

## 3. Flag changes immediately

Send an update right away, marked ⚠️, when:
- A step is blocked (site unreachable, connector missing, file not attached)
- The plan changes (a step added, dropped or reordered); recount the total and send a fresh progress line
- Something found changes what Colin will get at the end

## 4. Close with the finished line

When the task ends, send the 100% line, then one or two sentences on the outcome and, if there is one, the single best next step. If a step only partly finished, say so with ⚠️ instead of counting it as done.

## Rules

- Short tasks (one quick answer, one lookup) get no line; just answer.
- Never mark a step done that didn't fully finish.
- If Colin steps away, keep updating; the line is how he catches up.
