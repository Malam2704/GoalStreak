import { Box, Button, IconButton, Paper, Stack, Typography } from '@mui/material'
import type { Habit } from '../types'

interface GoalListProps {
  habits: Habit[]
  selectedHabitId: string | null
  onAddGoal: () => void
  onAddEntry: (habit: Habit) => void
  onSelectGoal: (habitId: string) => void
}

export default function GoalList(props: GoalListProps) {
  return (
    <section className="goals-section" aria-labelledby="goals-title">
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'end', mb: 1.5 }}>
        <div><Typography color="primary" variant="overline">Your list</Typography><Typography id="goals-title" variant="h5" sx={{ fontWeight: 700 }}>Goals</Typography></div>
        <Button onClick={props.onAddGoal}>+ New goal</Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 1.25 }}>
        {props.habits.map((habit) => (
          <Paper key={habit.id} variant="outlined" sx={{ display: 'flex', overflow: 'hidden', borderColor: props.selectedHabitId === habit.id ? 'primary.main' : 'divider' }}>
            <Button fullWidth color="inherit" onClick={() => props.onSelectGoal(habit.id)} sx={{ justifyContent: 'flex-start', gap: 1.5, px: 2, py: 1.5 }}>
              <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: habit.color }} />
              {habit.name}
            </Button>
            <IconButton onClick={() => props.onAddEntry(habit)} aria-label={`Add ${habit.name} entry`} sx={{ borderLeft: '1px solid', borderColor: 'divider', borderRadius: 0, px: 2 }}>+</IconButton>
          </Paper>
        ))}
      </Box>
    </section>
  )
}
