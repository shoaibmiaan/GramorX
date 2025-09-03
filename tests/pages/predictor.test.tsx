// tests/pages/predictor.test.tsx
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import PredictorPage from '@/pages/predictor/index';

describe('Page: /predictor', () => {
  it('renders heading and CTA', () => {
    render(<PredictorPage />);
    expect(screen.getByText(/IELTS Band Predictor/i)).toBeInTheDocument();
    // From BandPredictorForm
    expect(screen.getByRole('button', { name: /Predict my Band/i })).toBeInTheDocument();
  });
});
