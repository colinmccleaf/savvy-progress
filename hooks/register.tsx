import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Step, StepStatus } from '../types'

const PLUGIN = 'savvy-progress'
const PANE = 'savvy-progress'
const TITLE = 'Savvy Progress'

const steps = atom({ plugin: 'savvy-progress', key: 'steps' } as const, [] as Step[])
const isHidden = atom({ plugin: 'savvy-progress', key: 'isHidden' } as const, false)

const GUIDANCE = [
  'Savvy Progress is on: a progress tracker beside the conversation always shows the task list.',
  'For any task with more than one step or tool call, create its steps with TaskCreate before the first other tool call (3 to 8 steps, the last one "Check the work"),',
  'mark each step in_progress with TaskUpdate before starting it and completed the moment it finishes.',
  'Never mark a step completed that did not fully finish. Quick one-step answers need no steps.',
  'Also put the Savvy Progress line in your replies while a task runs, exactly as: Savvy Progress <24-character bar of █ and ░> <percent>% Step <n>/<total> · <current step>, for example: Savvy Progress ████████████░░░░░░░░░░░░ 50% Step 3/6 · Writing the SEO report.',
].join(' ')

const ICON: Record<StepStatus, string> = { completed: '✅', in_progress: '▶', pending: '☐' }

const BAR_WIDTH = 24

function counts(list: readonly Step[]) {
  const done = list.filter(s => s.status === 'completed').length
  const now = list.find(s => s.status === 'in_progress')
  const next = list.find(s => s.status === 'pending')
  return { done, total: list.length, left: list.length - done, now, next }
}

function bar(fraction: number, width = BAR_WIDTH) {
  const filled = Math.max(0, Math.min(width, Math.round(fraction * width)))
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

// One line, everywhere: "Savvy Progress ████████████░░░░░░░░░░░░ 50% Step 3/6 · Writing the SEO report"
function line(list: readonly Step[]) {
  const { done, total, now, next } = counts(list)
  if (total === 0) return `${TITLE} ${bar(0)} 0% · no task running`
  if (done === total) return `${TITLE} ${bar(1)} 100% Step ${total}/${total} · Done ✅`
  const step = Math.min(total, done + (now ? 1 : 0))
  const fraction = step / total
  const label = now ? (now.activeForm ?? now.subject) : `Up next: ${next?.subject ?? ''}`
  return `${TITLE} ${bar(fraction)} ${Math.round(fraction * 100)}% Step ${Math.max(step, 1)}/${total} · ${label}`
}

function summary(list: readonly Step[]) {
  return list.length === 0 ? undefined : line(list)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'savvy-progress',
      description: 'Show the Savvy Progress panel and bar ("hide" hides the bar, "clear" resets the steps)',
    })
    void $.ui.open({ id: PANE, title: TITLE })
    return next(e)
  })

  on('command.run', { command: 'savvy-progress' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'clear') {
      await update($, steps, () => [])
      $.ui.status(undefined)
      return { text: 'Savvy Progress cleared.' }
    }
    if (arg === 'hide') {
      await update($, isHidden, () => true)
      return { text: 'Savvy Progress band hidden. Run /savvy-progress to show it again.' }
    }
    await update($, isHidden, () => false)
    await $.ui.open({ id: PANE, title: TITLE })
    return { text: 'Savvy Progress is showing.' }
  })

  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    return {
      sections: [
        ...composed.sections,
        { id: `${PLUGIN}:guidance`, text: GUIDANCE, scope: 'session' as const },
      ],
    }
  })

  on('tool.call', { tool: 'TaskCreate' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && ran.isError !== true) {
      const id = (ran.result as { task?: { id?: string } } | undefined)?.task?.id
      if (id) {
        const step: Step = { id, subject: e.subject, activeForm: e.activeForm, status: 'pending' }
        await update($, steps, list => [...list.filter(s => s.id !== id), step])
        $.ui.status(summary(await read($, steps)))
      }
    }
    return ran
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'TaskUpdate' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && ran.isError !== true) {
      const status = e.status
      await update($, steps, list =>
        status === 'deleted'
          ? list.filter(s => s.id !== e.taskId)
          : list.map(s =>
              s.id !== e.taskId
                ? s
                : {
                    ...s,
                    subject: e.subject ?? s.subject,
                    activeForm: e.activeForm ?? s.activeForm,
                    status: status ?? s.status,
                  },
            ),
      )
      $.ui.status(summary(await read($, steps)))
    }
    return ran
  }).catch(($, e, next) => next(e))

  on('tool.call', { tool: 'TodoWrite' }, async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny === undefined && ran.isError !== true) {
      await update($, steps, () =>
        e.todos.map((t, i) => ({
          id: `todo-${i}`,
          subject: t.content,
          activeForm: t.activeForm,
          status: t.status,
        })),
      )
      $.ui.status(summary(await read($, steps)))
    }
    return ran
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    $.ui.status(summary(await read($, steps)))
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const list = await read($, steps)
    const { done, total, left } = counts(list)

    if (total === 0) {
      return (
        <Box flexDirection="column">
          <Text bold>{TITLE}</Text>
          <Text dimColor>No steps yet. Steps appear here as soon as a multi-step task starts.</Text>
        </Box>
      )
    }

    return (
      <Box flexDirection="column">
        <Text bold>{line(list)}</Text>
        <Text dimColor>
          {done}/{total} done{left > 0 ? ` · ${left} left` : ''}
        </Text>
        {list.map(s => (
          <Text key={s.id} dimColor={s.status === 'completed'} bold={s.status === 'in_progress'}>
            {ICON[s.status]} {s.status === 'in_progress' ? (s.activeForm ?? s.subject) : s.subject}
          </Text>
        ))}
      </Box>
    )
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, isHidden))) {
      return next(e)
    }
    const { Box, Text } = $.ui.resolve(e)
    const list = await read($, steps)
    const text = line(list)
    const room = Math.max(40, e.props.bodyColumns)
    const shown = text.length > room ? `${text.slice(0, room - 1)}…` : text

    return (
      <Box>
        <Text dimColor={list.length === 0}>{shown}</Text>
      </Box>
    )
  })
}
