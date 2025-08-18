import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AddCafeForm } from '../components/forms/AddCafeForm'

export function AddCafe(): JSX.Element {
  const navigate = useNavigate()

  const handleFormComplete = (cafeId: string): void => {
    // Navigate to success page or back to home with success message
    navigate('/', {
      state: {
        message: 'Café submitted successfully!',
        newCafeId: cafeId,
      },
    })
  }

  const handleFormCancel = (): void => {
    navigate(-1) // Go back to previous page
  }

  return (
    <AddCafeForm onComplete={handleFormComplete} onCancel={handleFormCancel} />
  )
}
