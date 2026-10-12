import { expect, test } from 'claude-code/testing'

const BAND_PROPS = {
  hasSurvey: false,
  isWorking: true,
  maxRows: 10,
  bodyColumns: 120,
  scroll: { offset: 0 },
  view: {},
} as never

const PANE_PROPS = {
  title: 'Savvy Progress',
  isFocused: false,
  bodyColumns: 120,
  placement: 'dock',
  scroll: { offset: 0 },
  view: {},
} as never

const SUBJECTS = ['Pull Search Console data', 'Audit page titles', 'Write the SEO report', 'List negative keywords', 'Draft fixes', 'Check the work']

for (const surface of ['terminal', 'desktop'] as const) {
  test(`shows the exact line on ${surface}`, async ($, on) => {
    let next = 0
    on('ui.render', async ($e, e) => {
      const { Box } = $e.ui.resolve(e)
      return <Box key="engine" />
    })
    on('tool.call', async (_$, e) => {
      if (e.tool === 'TaskCreate') {
        next += 1
        return { result: { task: { id: String(next), subject: e.subject } } } as never
      }
      return { result: { success: true, taskId: 'x', updatedFields: [] } } as never
    })

    for (const subject of SUBJECTS) {
      await $.tool.call({ tool: 'TaskCreate', subject, description: 'x' })
    }
    await $.tool.call({ tool: 'TaskUpdate', taskId: '1', status: 'completed' })
    await $.tool.call({ tool: 'TaskUpdate', taskId: '2', status: 'completed' })
    await $.tool.call({ tool: 'TaskUpdate', taskId: '3', status: 'in_progress', activeForm: 'Writing the SEO report' })

    const want = 'Savvy Progress ████████████░░░░░░░░░░░░ 50% Step 3/6 · Writing the SEO report'
    const band = await $.ui.mount({ plugin: 'savvy-progress', surface, component: 'AbovePrompt', props: BAND_PROPS })
    expect(JSON.stringify(await band.drawn())).toContain(want)

    const pane = await $.ui.mount({ plugin: 'savvy-progress', surface, component: 'Pane', requestId: 'savvy-progress', props: PANE_PROPS })
    expect(JSON.stringify(await pane.drawn())).toContain(want)

    for (const id of ['3', '4', '5', '6']) {
      await $.tool.call({ tool: 'TaskUpdate', taskId: id, status: 'completed' })
    }
    const finished = await $.ui.mount({ plugin: 'savvy-progress', surface, component: 'AbovePrompt', props: BAND_PROPS })
    expect(JSON.stringify(await finished.drawn())).toContain('Savvy Progress ████████████████████████ 100% Step 6/6 · Done ✅')

    await $.command.run({ command: 'savvy-progress', args: 'hide' } as never)
    const hidden = await $.ui.mount({ plugin: 'savvy-progress', surface, component: 'AbovePrompt', props: BAND_PROPS })
    expect(JSON.stringify(await hidden.drawn())).not.toContain('Savvy Progress')
  })

  test(`bar shows with no task and no panel on ${surface}`, async ($, on) => {
    on('ui.render', async ($e, e) => {
      const { Box } = $e.ui.resolve(e)
      return <Box key="engine" />
    })
    const band = await $.ui.mount({ plugin: 'savvy-progress', surface, component: 'AbovePrompt', props: BAND_PROPS })
    expect(JSON.stringify(await band.drawn())).toContain('Savvy Progress ░░░░░░░░░░░░░░░░░░░░░░░░ 0% · no task running')
  })
}
