import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, token, user } = useSelector(state => state.auth)
  const location = useLocation()

  // Check if user has a valid token in localStorage
  const hasToken = localStorage.getItem('token') || token
  
  // Debug authentication state
  console.log('🛡️ ProtectedRoute Auth State:', { 
    isAuthenticated, 
    loading,
    hasToken: !!hasToken,
    user: user ? { id: user._id, email: user.email } : null,
    location: location.pathname
  });

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22c55e]-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated or no token
  if (!isAuthenticated || !hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
