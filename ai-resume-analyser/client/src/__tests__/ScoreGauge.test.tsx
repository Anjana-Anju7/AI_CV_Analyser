import { render, screen } from '@testing-library/react';
import { ScoreGauge } from '../components/analysis/ScoreGauge';

describe('ScoreGauge', () => {
  it('displays the score number', () => {
    render(<ScoreGauge score={72} />);
    expect(screen.getByText('72')).toBeInTheDocument();
  });

  it('shows "Strong" label for score >= 75', () => {
    render(<ScoreGauge score={85} />);
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('shows "Good Start" label for score 50–74', () => {
    render(<ScoreGauge score={60} />);
    expect(screen.getByText('Good Start')).toBeInTheDocument();
  });

  it('shows "Needs Work" label for score 25–49', () => {
    render(<ScoreGauge score={40} />);
    expect(screen.getByText('Needs Work')).toBeInTheDocument();
  });

  it('shows "Poor" label for score < 25', () => {
    render(<ScoreGauge score={10} />);
    expect(screen.getByText('Poor')).toBeInTheDocument();
  });

  it('shows "out of 100" sub-label', () => {
    render(<ScoreGauge score={50} />);
    expect(screen.getByText('out of 100')).toBeInTheDocument();
  });
});
