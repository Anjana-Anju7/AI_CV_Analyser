import { render, screen, fireEvent } from '@testing-library/react';
import { SectionAccordion } from '../components/analysis/SectionAccordion';
import type { SectionDetail } from '../types';

const mockSection: SectionDetail = {
  score: 78,
  label: 'Strong',
  highlights: [
    { type: 'positive', text: 'Uses strong action verbs consistently' },
    { type: 'improvement', text: 'Avoid passive voice in experience bullets' },
  ],
};

describe('SectionAccordion', () => {
  it('renders the section name', () => {
    render(<SectionAccordion name="Tone & Style" section={mockSection} icon={<span />} />);
    expect(screen.getByText('Tone & Style')).toBeInTheDocument();
  });

  it('renders the section score', () => {
    render(<SectionAccordion name="Tone & Style" section={mockSection} icon={<span />} />);
    expect(screen.getByText('78')).toBeInTheDocument();
  });

  it('renders the label badge', () => {
    render(<SectionAccordion name="Tone & Style" section={mockSection} icon={<span />} />);
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('is collapsed by default', () => {
    render(<SectionAccordion name="Tone & Style" section={mockSection} icon={<span />} />);
    expect(screen.queryByText('Uses strong action verbs consistently')).not.toBeInTheDocument();
  });

  it('expands on click to show highlights', () => {
    render(<SectionAccordion name="Tone & Style" section={mockSection} icon={<span />} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Uses strong action verbs consistently')).toBeInTheDocument();
    expect(screen.getByText('Avoid passive voice in experience bullets')).toBeInTheDocument();
  });

  it('collapses again on second click', () => {
    render(<SectionAccordion name="Tone & Style" section={mockSection} icon={<span />} />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(screen.queryByText('Uses strong action verbs consistently')).not.toBeInTheDocument();
  });

  it('is open by default when defaultOpen=true', () => {
    render(
      <SectionAccordion name="Skills" section={mockSection} icon={<span />} defaultOpen />
    );
    expect(screen.getByText('Uses strong action verbs consistently')).toBeInTheDocument();
  });
});
