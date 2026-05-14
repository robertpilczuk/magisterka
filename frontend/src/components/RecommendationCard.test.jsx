import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LangProvider } from '../LangContext'
import RecommendationCard from './RecommendationCard'

vi.mock('axios')

function renderWithLang(ui) {
    return render(<LangProvider>{ui}</LangProvider>)
}

const linearRec = {
    movieId: 1,
    title: 'Toy Story (1995)',
    genres: 'Animation|Comedy',
    predicted_rating: 4.25,
}

const logisticRec = {
    movieId: 2,
    title: 'Pulp Fiction (1994)',
    genres: 'Crime|Drama',
    like_probability: 0.87,
}

describe('RecommendationCard', () => {
    it('renders title for linear card', () => {
        renderWithLang(<RecommendationCard rank={1} rec={linearRec} type="linear" />)
        expect(screen.getByText('Toy Story (1995)')).toBeInTheDocument()
    })

    it('renders rank number', () => {
        renderWithLang(<RecommendationCard rank={3} rec={linearRec} type="linear" />)
        expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('renders predicted rating for linear type', () => {
        renderWithLang(<RecommendationCard rank={1} rec={linearRec} type="linear" />)
        expect(screen.getByText(/4.25/)).toBeInTheDocument()
    })

    it('renders like probability for logistic type', () => {
        renderWithLang(<RecommendationCard rank={1} rec={logisticRec} type="logistic" />)
        expect(screen.getByText(/87.0%/)).toBeInTheDocument()
    })

    it('renders genres with dots separator', () => {
        renderWithLang(<RecommendationCard rank={1} rec={linearRec} type="linear" />)
        expect(screen.getByText(/Animation · Comedy/)).toBeInTheDocument()
    })

    it('does not show Why button without userId', () => {
        renderWithLang(<RecommendationCard rank={1} rec={linearRec} type="linear" />)
        expect(screen.queryByText(/Dlaczego/)).not.toBeInTheDocument()
    })

    it('shows Why button when userId provided', () => {
        renderWithLang(<RecommendationCard rank={1} rec={linearRec} type="linear" userId={1} />)
        expect(screen.getByText(/Dlaczego/)).toBeInTheDocument()
    })
})
