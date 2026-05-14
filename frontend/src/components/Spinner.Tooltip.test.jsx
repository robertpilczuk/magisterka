import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Spinner from './Spinner'
import Tooltip from './Tooltip'

describe('Spinner', () => {
    it('renders without crashing', () => {
        const { container } = render(<Spinner />)
        expect(container.firstChild).toBeInTheDocument()
    })

    it('applies custom size', () => {
        const { container } = render(<Spinner size={48} />)
        const span = container.firstChild
        expect(span.style.width).toBe('48px')
        expect(span.style.height).toBe('48px')
    })

    it('applies custom color', () => {
        const { container } = render(<Spinner color="#ff0000" />)
        const span = container.firstChild
        expect(span.style.borderTopColor).toBe('rgb(255, 0, 0)')
    })

    it('uses default size 24', () => {
        const { container } = render(<Spinner />)
        const span = container.firstChild
        expect(span.style.width).toBe('24px')
    })
})

describe('Tooltip', () => {
    it('renders children', () => {
        render(
            <Tooltip text="Tooltip text">
                <span>Hover me</span>
            </Tooltip>
        )
        expect(screen.getByText('Hover me')).toBeInTheDocument()
    })

    it('does not show tooltip text initially', () => {
        render(
            <Tooltip text="Hidden tooltip">
                <span>Hover me</span>
            </Tooltip>
        )
        expect(screen.queryByText('Hidden tooltip')).not.toBeInTheDocument()
    })

    it('shows tooltip on mouse enter', () => {
        render(
            <Tooltip text="Visible tooltip">
                <span>Hover me</span>
            </Tooltip>
        )
        fireEvent.mouseEnter(screen.getByText('Hover me').parentElement)
        expect(screen.getByText('Visible tooltip')).toBeInTheDocument()
    })

    it('hides tooltip on mouse leave', () => {
        render(
            <Tooltip text="Hide on leave">
                <span>Hover me</span>
            </Tooltip>
        )
        const wrapper = screen.getByText('Hover me').parentElement
        fireEvent.mouseEnter(wrapper)
        expect(screen.getByText('Hide on leave')).toBeInTheDocument()
        fireEvent.mouseLeave(wrapper)
        expect(screen.queryByText('Hide on leave')).not.toBeInTheDocument()
    })
})
