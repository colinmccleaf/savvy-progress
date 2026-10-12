import { expect, test } from 'claude-code/testing'

const BAND_PROPS = {
  hasSurvey: false,
  isWorking: true,
  maxRows: 10,
  bodyColumns: 80,
  scroll: { offset: 0 },
  view: {},
} as never

for (const surface of ['terminal', 'desktop'] as const) {
  test(`tracks steps and shows them on ${surface}`, async ($, on) => {
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

    await $.tool.call({ tool: 'TaskCreate', subject: 'Find firms', description: 'a' })
    await $.tool.call({ tool: 'TaskCreate', subject: 'Draft emails', description: 'b' })
    await $.tool.call({ tool: 'TaskUpdate', taskId: '1', status: 'completed' })
    await $.tool.call({ tool: 'TaskUpdate', taskId: '2', status: 'in_progress', activeForm: 'Drafting emails' })

    const band = await $.ui.mount({ plugin: 'savvy-progress', surface, component: 'AbovePrompt', props: BAND_PROPS })
    expect(JSON.stringify(await band.drawn())).toContain('Savvy Progress 1/2 · now: Drafting emails')

    const pane = await $.ui.mount({
      plugin: 'savvy-progress',
      surface,
      component: 'Pane',
      requestId: 'savvy-progress',
      props: { title: 'Savvy Progress', isFocused: false, bodyColumns: 40, placement: 'dock', scroll: { offset: 0 }, view: {} } as never,
    })
    expect(JSON.stringify(await pane.drawn())).toContain('1 left')
    expect(JSON.stringify(await pane.drawn())).toContain('"▶"," ","Drafting emails"')

    await $.command.run({ command: 'savvy-progress', args: 'hide' } as never)
    const hidden = await $.ui.mount({ plugin: 'savvy-progress', surface, component: 'AbovePrompt', props: BAND_PROPS })
    expect(JSON.stringify(await hidden.drawn())).not.toContain('Savvy Progress')
  })

  test(`bar shows with no steps and no panel on ${surface}`, async ($, on) => {
    on('ui.render', async ($e, e) => {
      const { Box } = $e.ui.resolve(e)
      return <Box key="engine" />
    })
    const band = await $.ui.mount({ plugin: 'savvy-progress', surface, component: 'AbovePrompt', props: BAND_PROPS })
    expect(JSON.stringify(await band.drawn())).toContain('no task running')
  })
}
