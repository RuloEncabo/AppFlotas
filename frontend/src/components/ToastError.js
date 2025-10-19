import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'

const ToastError = ({ message = "Esto no funciono.", buttonText = 'OK', onButtonClick }) => {
  return (
    <Box
      sx={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column', '& svg': { mb: 2 } }}
    >
      <Icon icon='tabler:x' fontSize='2rem' />
      <Typography sx={{ mb: 4, fontWeight: 600 }}>Error</Typography>
      <Typography sx={{ mb: 3 }}>{message}</Typography>
      <Button
        sx={{ mb: 8 }}
        color='error'
        variant='contained'
        onClick={() => {
          toast.error(message)
          if (onButtonClick) {
            onButtonClick()
          }
        }}
      >
        {buttonText}
      </Button>
    </Box>
  )
}

export default ToastError
