import { useState, type FormEvent } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material'
import type { NewHabit } from '../types'

interface Props {
  onAdd: (habit: NewHabit) => void
  onCancel: () => void
}

const colors = ['#2563eb', '#7c3aed', '#059669', '#e11d48', '#ea580c', '#0891b2']

export default function AddGoalForm({ onAdd, onCancel }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(colors[0])

  function submit(event: FormEvent) {
    event.preventDefault()
    if (name.trim()) onAdd({ name: name.trim(), color })
  }

  return (
    <Dialog open fullWidth maxWidth="xs" onClose={onCancel}>
      <form onSubmit={submit}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', pt: 3 }}>
        <div><Typography color="primary" variant="overline">New goal</Typography><Typography variant="h5" sx={{ fontWeight: 700 }}>Add something to track</Typography></div>
        <IconButton onClick={onCancel} aria-label="Close">×</IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField autoFocus label="Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Take vitamins" />
          <Stack spacing={1}><Typography variant="caption" sx={{ fontWeight: 700 }}>Color</Typography><Stack direction="row" spacing={1}>{colors.map((item) => <Box component="button" type="button" aria-label={`Choose ${item}`} onClick={() => setColor(item)} key={item} sx={{ width: 28, height: 28, p: 0, borderRadius: '50%', bgcolor: item, border: '3px solid white', outline: color === item ? '2px solid #94a3b8' : '1px solid #e5e7eb' }} />)}</Stack></Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}><Button variant="outlined" onClick={onCancel}>Cancel</Button><Button variant="contained" type="submit">Add goal</Button></DialogActions>
      </form>
    </Dialog>
  )
}
