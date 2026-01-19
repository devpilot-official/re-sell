import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createClient } from '@/lib/supabase/client'
import ListingsManagementPage from './page'

// Mock modules
jest.mock('@/lib/supabase/client')

describe('ListingsManagementPage', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(),
    }
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Test Case 5: Filters listings by status and handles removal', () => {
    const mockListings = [
      {
        id: 'listing-1',
        title: 'iPhone 13 Pro',
        category: 'Electronics',
        price: 120000,
        status: 'active',
        created_at: '2026-01-15T10:00:00Z',
        seller: {
          full_name: 'John Doe',
          email: 'john@example.com',
        },
      },
      {
        id: 'listing-2',
        title: 'Samsung Galaxy S21',
        category: 'Electronics',
        price: 95000,
        status: 'sold',
        created_at: '2026-01-14T15:00:00Z',
        seller: {
          full_name: 'Jane Smith',
          email: 'jane@example.com',
        },
      },
      {
        id: 'listing-3',
        title: 'MacBook Air',
        category: 'Electronics',
        price: 250000,
        status: 'active',
        created_at: '2026-01-16T09:00:00Z',
        seller: {
          full_name: 'Bob Wilson',
          email: 'bob@example.com',
        },
      },
      {
        id: 'listing-4',
        title: 'Dell XPS 15',
        category: 'Electronics',
        price: 180000,
        status: 'removed',
        created_at: '2026-01-10T12:00:00Z',
        seller: {
          full_name: 'Alice Brown',
          email: 'alice@example.com',
        },
      },
    ]

    it('should filter listings by status - active', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockListings.filter((l) => l.status === 'active'),
          error: null,
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'listings') {
          return {
            select: mockSelect,
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        return { select: jest.fn() }
      })

      render(<ListingsManagementPage />)

      // Wait for initial load (all listings)
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })

      // Change filter to "active"
      const selectElement = screen.getByDisplayValue('All Status')
      fireEvent.change(selectElement, { target: { value: 'active' } })

      // Wait for filtered results
      await waitFor(() => {
        expect(mockSelect).toHaveBeenCalled()
      })

      // Should show only active listings
      expect(screen.getByText('iPhone 13 Pro')).toBeInTheDocument()
      expect(screen.getByText('MacBook Air')).toBeInTheDocument()
      expect(screen.queryByText('Samsung Galaxy S21')).not.toBeInTheDocument()
      expect(screen.queryByText('Dell XPS 15')).not.toBeInTheDocument()
    })

    it('should filter listings by status - sold', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockListings.filter((l) => l.status === 'sold'),
          error: null,
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'listings') {
          return {
            select: mockSelect,
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        return { select: jest.fn() }
      })

      render(<ListingsManagementPage />)

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })

      const selectElement = screen.getByDisplayValue('All Status')
      fireEvent.change(selectElement, { target: { value: 'sold' } })

      await waitFor(() => {
        expect(mockSelect).toHaveBeenCalled()
      })

      // Should show only sold listings
      expect(screen.getByText('Samsung Galaxy S21')).toBeInTheDocument()
      expect(screen.queryByText('iPhone 13 Pro')).not.toBeInTheDocument()
      expect(screen.queryByText('MacBook Air')).not.toBeInTheDocument()
    })

    it('should filter listings by status - removed', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockListings.filter((l) => l.status === 'removed'),
          error: null,
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'listings') {
          return {
            select: mockSelect,
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        return { select: jest.fn() }
      })

      render(<ListingsManagementPage />)

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })

      const selectElement = screen.getByDisplayValue('All Status')
      fireEvent.change(selectElement, { target: { value: 'removed' } })

      await waitFor(() => {
        expect(mockSelect).toHaveBeenCalled()
      })

      // Should show only removed listings
      expect(screen.getByText('Dell XPS 15')).toBeInTheDocument()
      expect(screen.queryByText('iPhone 13 Pro')).not.toBeInTheDocument()
    })

    it('should display all listings when filter is set to "all"', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockListings,
          error: null,
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'listings') {
          return {
            select: mockSelect,
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        return { select: jest.fn() }
      })

      render(<ListingsManagementPage />)

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })

      // Should show all listings by default
      expect(screen.getByText('iPhone 13 Pro')).toBeInTheDocument()
      expect(screen.getByText('Samsung Galaxy S21')).toBeInTheDocument()
      expect(screen.getByText('MacBook Air')).toBeInTheDocument()
      expect(screen.getByText('Dell XPS 15')).toBeInTheDocument()
    })

    it('should remove listing and refresh the list', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockListings,
          error: null,
        }),
      })

      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'listings') {
          return {
            select: mockSelect,
            delete: mockDelete,
          }
        }
        return { select: jest.fn() }
      })

      render(<ListingsManagementPage />)

      await waitFor(() => {
        expect(screen.getByText('iPhone 13 Pro')).toBeInTheDocument()
      })

      // Find and click the remove button for the first listing
      const removeButtons = screen.getAllByRole('button', { name: /Remove/i })
      fireEvent.click(removeButtons[0])

      // Verify delete was called
      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalled()
      })

      // Verify fetchListings was called again (refresh)
      await waitFor(() => {
        expect(mockSelect).toHaveBeenCalledTimes(2) // Initial load + refresh
      })
    })

    it('should handle listing removal errors gracefully', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockListings,
          error: null,
        }),
      })

      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Delete failed' },
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'listings') {
          return {
            select: mockSelect,
            delete: mockDelete,
          }
        }
        return { select: jest.fn() }
      })

      render(<ListingsManagementPage />)

      await waitFor(() => {
        expect(screen.getByText('iPhone 13 Pro')).toBeInTheDocument()
      })

      const removeButtons = screen.getAllByRole('button', { name: /Remove/i })
      fireEvent.click(removeButtons[0])

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalled()
      })

      // fetchListings should not be called again since deletion failed
      expect(mockSelect).toHaveBeenCalledTimes(1)
    })

    it('should filter listings by search term (title)', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockListings,
          error: null,
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'listings') {
          return {
            select: mockSelect,
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        return { select: jest.fn() }
      })

      render(<ListingsManagementPage />)

      await waitFor(() => {
        expect(screen.getByText('iPhone 13 Pro')).toBeInTheDocument()
      })

      // Search for "iPhone"
      const searchInput = screen.getByPlaceholderText(/Search listings/i)
      await userEvent.type(searchInput, 'iPhone')

      // Should show only iPhone listing
      expect(screen.getByText('iPhone 13 Pro')).toBeInTheDocument()
      expect(screen.queryByText('Samsung Galaxy S21')).not.toBeInTheDocument()
      expect(screen.queryByText('MacBook Air')).not.toBeInTheDocument()
    })

    it('should filter listings by search term (seller name)', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockListings,
          error: null,
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'listings') {
          return {
            select: mockSelect,
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        return { select: jest.fn() }
      })

      render(<ListingsManagementPage />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Search for seller name
      const searchInput = screen.getByPlaceholderText(/Search listings/i)
      await userEvent.type(searchInput, 'Jane Smith')

      // Should show only Jane's listing
      expect(screen.getByText('Samsung Galaxy S21')).toBeInTheDocument()
      expect(screen.queryByText('iPhone 13 Pro')).not.toBeInTheDocument()
      expect(screen.queryByText('MacBook Air')).not.toBeInTheDocument()
    })

    it('should display correct listing count', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockListings,
          error: null,
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'listings') {
          return {
            select: mockSelect,
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        return { select: jest.fn() }
      })

      render(<ListingsManagementPage />)

      await waitFor(() => {
        expect(screen.getByText(/All Listings \(4\)/i)).toBeInTheDocument()
      })
    })

    it('should display formatted prices in Nigerian Naira', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockListings,
          error: null,
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'listings') {
          return {
            select: mockSelect,
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        return { select: jest.fn() }
      })

      render(<ListingsManagementPage />)

      await waitFor(() => {
        // Check for formatted prices with Naira symbol
        expect(screen.getByText(/₦120,000/)).toBeInTheDocument()
        expect(screen.getByText(/₦95,000/)).toBeInTheDocument()
        expect(screen.getByText(/₦250,000/)).toBeInTheDocument()
      })
    })
  })
})
