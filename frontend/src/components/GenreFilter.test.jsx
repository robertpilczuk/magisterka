import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LangProvider } from '../LangContext'
import GenreFilter from './GenreFilter'

function renderWithLang(ui) {
    return render(<LangProvider>{ui}</LangProvider>)
}

describe('GenreFilter', () => {
    it('renders all 18 genre buttons', () => {
        renderWithLang(<GenreFilter selected={[]} onChange={() => { }} />)
        // 18 gatunków + 2 przyciski (Pokaż wszystkie / Ukryj wszystkie)
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBe(20)
    })

    it('calls onChange when genre is clicked', () => {
        const onChange = vi.fn()
        renderWithLang(<GenreFilter selected={[]} onChange={onChange} />)
        fireEvent.click(screen.getByText('Akcja'))
        expect(onChange).toHaveBeenCalledWith(['Action'])
    })

    it('removes genre from selected when clicked again', () => {
        const onChange = vi.fn()
        renderWithLang(<GenreFilter selected={['Action']} onChange={onChange} />)
        fireEvent.click(screen.getByText(/Akcja/))
        expect(onChange).toHaveBeenCalledWith([])
    })

    it('show all button clears selection', () => {
        const onChange = vi.fn()
        renderWithLang(<GenreFilter selected={['Action', 'Drama']} onChange={onChange} />)
        fireEvent.click(screen.getByText(/Pokaż wszystkie/))
        expect(onChange).toHaveBeenCalledWith([])
    })

    it('hide all button selects all genres', () => {
        const onChange = vi.fn()
        renderWithLang(<GenreFilter selected={[]} onChange={onChange} />)
        fireEvent.click(screen.getByText(/Ukryj wszystkie/))
        const called = onChange.mock.calls[0][0]
        expect(called.length).toBe(18)
    })

    it('shows hidden count when genres are selected', () => {
        renderWithLang(<GenreFilter selected={['Action', 'Drama']} onChange={() => { }} />)
        expect(screen.getByText(/Ukryto 2/)).toBeInTheDocument()
    })

    it('does not show hidden count when nothing selected', () => {
        renderWithLang(<GenreFilter selected={[]} onChange={() => { }} />)
        expect(screen.queryByText(/Ukryto/)).not.toBeInTheDocument()
    })
})
