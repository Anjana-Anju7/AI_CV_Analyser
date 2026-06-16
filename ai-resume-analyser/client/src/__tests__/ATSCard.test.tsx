import { render, screen } from '@testing-library/react';
import { ATSCard } from '../components/analysis/ATSCard';
import type { ATSItem } from '../types';

const items: ATSItem[] = [
  { type: 'pass', message: 'Standard section headers detected' },
  { type: 'warning', message: 'Missing contact email in header' },
];

describe('ATSCard', () => {
  it('displays the ATS score', () => {
    render(<ATSCard score={80} items={items} />);
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('shows "Great Job!" for score >= 75', () => {
    render(<ATSCard score={80} items={items} />);
    expect(screen.getByText('Great Job!')).toBeInTheDocument();
  });

  it('shows "Getting There" for score 50–74', () => {
    render(<ATSCard score={60} items={items} />);
    expect(screen.getByText('Getting There')).toBeInTheDocument();
  });

  it('shows "Needs Improvement" for score < 50', () => {
    render(<ATSCard score={30} items={items} />);
    expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
  });

  it('renders all pass and warning item messages', () => {
    render(<ATSCard score={80} items={items} />);
    expect(screen.getByText('Standard section headers detected')).toBeInTheDocument();
    expect(screen.getByText('Missing contact email in header')).toBeInTheDocument();
  });

  it('renders ATS score heading', () => {
    render(<ATSCard score={72} items={items} />);
    expect(screen.getByText('ATS Score — 72/100')).toBeInTheDocument();
  });

  it('handles empty items list gracefully', () => {
    render(<ATSCard score={50} items={[]} />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });
});
