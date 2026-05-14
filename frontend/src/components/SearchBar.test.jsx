import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LangProvider } from '../LangContext'
import SearchBar from './SearchBar'

function renderWithLang(ui) {
    return render(<LangProvider>{ui}</LangProvider>)
}

describe('SearchBar', () => {
    it('renders input and button', () => {
        renderWithLang(<SearchBar onSearch={() => { }} />)
        expect(screen.getByRole('spinbutton')).toBeInTheDocument()
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('shows error for invalid input below range', () => {
        renderWithLang(<SearchBar onSearch={() => { }} />)
        const input = screen.getByRole('spinbutton')
        fireEvent.change(input, { target: { value: '0' } })
        fireEvent.click(screen.getByRole('button'))
        expect(screen.getByText(/1–6040/)).toBeInTheDocument()
    })

    it('shows error for invalid input above range', () => {
        renderWithLang(<SearchBar onSearch={() => { }} />)
        const input = screen.getByRole('spinbutton')
        fireEvent.change(input, { target: { value: '9999' } })
        fireEvent.click(screen.getByRole('button'))
        expect(screen.getByText(/1–6040/)).toBeInTheDocument()
    })

    it('calls onSearch with correct id for valid input', () => {
        const onSearch = vi.fn()
        renderWithLang(<SearchBar onSearch={onSearch} />)
        const input = screen.getByRole('spinbutton')
        fireEvent.change(input, { target: { value: '42' } })
        fireEvent.click(screen.getByRole('button'))
        expect(onSearch).toHaveBeenCalledWith(42)
    })

    it('calls onSearch on Enter key', () => {
        const onSearch = vi.fn()
        renderWithLang(<SearchBar onSearch={onSearch} />)
        const input = screen.getByRole('spinbutton')
        fireEvent.change(input, { target: { value: '100' } })
        fireEvent.keyDown(input, { key: 'Enter' })
        expect(onSearch).toHaveBeenCalledWith(100)
    })

    it('does not call onSearch for non-Enter keys', () => {
        const onSearch = vi.fn()
        renderWithLang(<SearchBar onSearch={onSearch} />)
        const input = screen.getByRole('spinbutton')
        fireEvent.change(input, { target: { value: '100' } })
        fireEvent.keyDown(input, { key: 'a' })
        expect(onSearch).not.toHaveBeenCalled()
    })

    it('does not show error for valid input', () => {
        renderWithLang(<SearchBar onSearch={() => { }} />)
        const input = screen.getByRole('spinbutton')
        fireEvent.change(input, { target: { value: '100' } })
        fireEvent.click(screen.getByRole('button'))
        expect(screen.queryByText(/1–6040/)).not.toBeInTheDocument()
    })
})
