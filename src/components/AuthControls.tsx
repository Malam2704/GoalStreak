import type { User } from '@supabase/supabase-js'
import { Avatar, Button, Chip, Stack, Typography } from '@mui/material'

interface AuthControlsProps {
  configured: boolean
  loading: boolean
  user: User | null
  onSignIn: () => void
  onSignOut: () => void
}

export default function AuthControls({
  configured,
  loading,
  user,
  onSignIn,
  onSignOut,
}: AuthControlsProps) {
  if (user) {
    const name = user.user_metadata.full_name ?? user.user_metadata.name ?? user.email

    return (
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
        <Avatar src={user.user_metadata.avatar_url} alt="" sx={{ width: 34, height: 34 }} />
        <div className="account-name">
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{name}</Typography>
          <Typography color="text.secondary" variant="caption">Synced with Google</Typography>
        </div>
        <Button color="inherit" disabled={loading} onClick={onSignOut}>Sign out</Button>
      </Stack>
    )
  }

  if (!configured) {
    return <Chip label="Local only" size="small" variant="outlined" />
  }

  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
      <Typography className="account-name" color="text.secondary" variant="caption">
        Data is stored on this device
      </Typography>
      <Button disabled={loading} onClick={onSignIn} variant="contained">
        Sign in with Google
      </Button>
    </Stack>
  )
}
