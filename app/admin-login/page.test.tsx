import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import AdminLoginPage from './page'

// Mock modules
jest.mock('next/navigation')
jest.mock('@supabase/ssr')

describe('AdminLoginPage', () => {
  let mockRouter: any
  let mockSupabase: any

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
      refresh: jest.fn(),
    }
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

    mockSupabase = {
      auth: {
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
      },
      from: jest.fn(),
    }
    ;(createBrowserClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Test Case 1: Handles invalid credentials and returns error message', () => {
    it('should display error message when credentials are invalid', async () => {
      // Mock sign in error
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      })

      render(<AdminLoginPage />)

      // Fill in the form
      const emailInput = screen.getByPlaceholderText('admin@example.com')
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })

      // Verify signInWithPassword was called
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      })

      // Verify router was not called
      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('should show loading state during sign in attempt', async () => {
      mockSupabase.auth.signInWithPassword.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: null, error: { message: 'Error' } }), 100))
      )

      render(<AdminLoginPage />)

      const emailInput = screen.getByPlaceholderText('admin@example.com')
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password' } })
      fireEvent.click(submitButton)

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument()
      })

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.getByText('Sign In')).toBeInTheDocument()
      })
    })
  })

  describe('Test Case 2: Restricts access to non-admin users by signing out', () => {
    it('should sign out non-admin users and display error message', async () => {
      const mockUserId = 'user-123'

      // Mock successful sign in
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      })

      // Mock profile query returning non-admin role
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { admin_role: 'user' }, // Not an admin
              error: null,
            }),
          }),
        }),
      })
      mockSupabase.from = mockFrom

      render(<AdminLoginPage />)

      const emailInput = screen.getByPlaceholderText('admin@example.com')
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText('You do not have admin access')).toBeInTheDocument()
      })

      // Verify sign out was called
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()

      // Verify router was not called
      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('should sign out when profile query returns error', async () => {
      const mockUserId = 'user-456'

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      })

      // Mock profile query returning error
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Profile not found' },
            }),
          }),
        }),
      })
      mockSupabase.from = mockFrom

      render(<AdminLoginPage />)

      const emailInput = screen.getByPlaceholderText('admin@example.com')
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('You do not have admin access')).toBeInTheDocument()
      })

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should allow admin users to proceed', async () => {
      const mockUserId = 'admin-789'

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: mockUserId } },
        error: null,
      })

      // Mock profile query returning admin role
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { admin_role: 'admin' },
              error: null,
            }),
          }),
        }),
      })
      mockSupabase.from = mockFrom

      render(<AdminLoginPage />)

      const emailInput = screen.getByPlaceholderText('admin@example.com')
      const passwordInput = screen.getByPlaceholderText('••••••••')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'adminpass' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/admin')
        expect(mockRouter.refresh).toHaveBeenCalled()
      })

      // Verify sign out was NOT called
      expect(mockSupabase.auth.signOut).not.toHaveBeenCalled()
    })
  })
})
