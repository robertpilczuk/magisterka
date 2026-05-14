import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LangProvider, useLang } from './LangContext'

function TestComponent() {
    const { lang, setLang, t } = useLang()
    return (
        <div>
            <span data-testid="lang">{lang}</span>
            <span data-testid="title">{t('nav.title')}</span>
            <span data-testid="search-btn">{t('search.button')}</span>
            <button onClick={() => setLang('EN')}>Switch to EN</button>
            <button onClick={() => setLang('PL')}>Switch to PL</button>
        </div>
    )
}

describe('LangContext', () => {
    it('defaults to PL', () => {
        render(<LangProvider><TestComponent /></LangProvider>)
        expect(screen.getByTestId('lang').textContent).toBe('PL')
    })

    it('switches to EN', () => {
        render(<LangProvider><TestComponent /></LangProvider>)
        fireEvent.click(screen.getByText('Switch to EN'))
        expect(screen.getByTestId('lang').textContent).toBe('EN')
    })

    it('switches back to PL', () => {
        render(<LangProvider><TestComponent /></LangProvider>)
        fireEvent.click(screen.getByText('Switch to EN'))
        fireEvent.click(screen.getByText('Switch to PL'))
        expect(screen.getByTestId('lang').textContent).toBe('PL')
    })

    it('t() returns PL translation by default', () => {
        render(<LangProvider><TestComponent /></LangProvider>)
        expect(screen.getByTestId('search-btn').textContent).toBe('Szukaj')
    })

    it('t() returns EN translation after switch', () => {
        render(<LangProvider><TestComponent /></LangProvider>)
        fireEvent.click(screen.getByText('Switch to EN'))
        expect(screen.getByTestId('search-btn').textContent).toBe('Search')
    })

    it('t() returns fallback for missing key', () => {
        function TestMissing() {
            const { t } = useLang()
            return <span data-testid="missing">{t('nonexistent.key')}</span>
        }
        render(<LangProvider><TestMissing /></LangProvider>)
        expect(screen.getByTestId('missing').textContent).toBe('nonexistent.key')
    })

})
