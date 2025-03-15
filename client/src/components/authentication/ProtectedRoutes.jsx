import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from "react-router-dom"

const ProtectedRoutes = () => {
  const user = useSelector((state) => state.user.user)

  return user ? children : <Navigate to="/login" />
}

export default ProtectedRoutes