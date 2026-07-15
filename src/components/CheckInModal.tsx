import type { FormEvent } from 'react'
import dayjs from 'dayjs'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import type { Habit } from '../types'
import { today } from '../utils/date'

interface CheckInModalProps {
  habit: Habit
  date: string
  note: string
  hasEntry: boolean
  onCancel: () => void
  onDateChange: (date: string) => void
  onNoteChange: (note: string) => void
  onRemove: () => void
  onSave: (event: FormEvent) => void
}

export default function CheckInModal(props: CheckInModalProps) {
  return (
    <Dialog open fullWidth maxWidth="md" onClose={props.onCancel}>
      <form onSubmit={props.onSave}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', pt: 3 }}>
        <div><Typography color="primary" variant="overline">Check in</Typography><Typography variant="h5" sx={{ fontWeight: 700 }}>{props.habit.name}</Typography></div>
        <IconButton onClick={props.onCancel} aria-label="Close">×</IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'stretch' }}>
          <Stack sx={{ flex: '0 0 350px' }}><Typography variant="caption" sx={{ fontWeight: 700 }}>Date</Typography><DateCalendar value={dayjs(props.date)} maxDate={dayjs(today)} onChange={(date) => date && props.onDateChange(date.format('YYYY-MM-DD'))} sx={{ m: 0, mt: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2 }} /></Stack>
          <TextField label="Notes" multiline fullWidth value={props.note} onChange={(event) => props.onNoteChange(event.target.value)} placeholder={'Bench press — 3 × 8 at 135 lb\nSquats — 3 × 10 at 185 lb'} sx={{ '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' }, '& textarea': { height: '100% !important' } }} />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {props.hasEntry && <Button color="error" onClick={props.onRemove}>Remove entry</Button>}
        <span style={{ flex: 1 }} />
        <Button variant="outlined" onClick={props.onCancel}>Cancel</Button>
        <Button variant="contained" type="submit">Save check-in</Button>
      </DialogActions>
      </form>
    </Dialog>
  )
}
