export type StepStatus = 'pending' | 'in_progress' | 'completed'
export type Step = { id: string; subject: string; activeForm?: string; status: StepStatus }

declare module 'claude-code' {
  interface PluginState {
    'savvy-progress': { steps: Step[]; isHidden: boolean }
  }
}
