import { render, screen, fireEvent } from '@testing-library/react';
import TaskFilter from '../../components/TaskFilter';

describe('TaskFilter', () => {
  // Define the type for the filter change callback
  const createMockOnFilterChange = () => {
    const mockFn = jest.fn(() => {});
    return mockFn;
  };

  it('renders all filter options', () => {
    const mockOnFilterChange = createMockOnFilterChange();
    
    render(<TaskFilter onFilterChange={mockOnFilterChange} />);
    
    // Check for all filter labels
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/from date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to date/i)).toBeInTheDocument();
  });

  it('applies filter for priority', () => {
    const mockOnFilterChange = createMockOnFilterChange();
    
    render(<TaskFilter onFilterChange={mockOnFilterChange} />);
    
    const prioritySelect = screen.getByLabelText(/priority/i);
    
    // Select High priority
    fireEvent.change(prioritySelect, { target: { value: 'High' } });
    
    // Verify filter was called with correct priority
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: 'High'
      })
    );
  });

  it('applies filter for completion status', () => {
    const mockOnFilterChange = createMockOnFilterChange();
    
    render(<TaskFilter onFilterChange={mockOnFilterChange} />);
    
    const statusSelect = screen.getByLabelText(/status/i);
    
    // Select completed tasks
    fireEvent.change(statusSelect, { target: { value: 'completed' } });
    
    // Verify filter was called with correct completion status
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        completed: true
      })
    );
  });

  it('applies filter for date range', () => {
    const mockOnFilterChange = createMockOnFilterChange();
    
    render(<TaskFilter onFilterChange={mockOnFilterChange} />);
    
    const startDateInput = screen.getByLabelText(/from date/i);
    const endDateInput = screen.getByLabelText(/to date/i);
    
    // Set start and end dates
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });
    
    // Verify filter was called with correct date range
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      })
    );
  });

  it('prevents end date before start date', () => {
    const mockOnFilterChange = createMockOnFilterChange();
    
    render(<TaskFilter onFilterChange={mockOnFilterChange} />);
    
    const startDateInput = screen.getByLabelText(/from date/i);
    const endDateInput = screen.getByLabelText(/to date/i);
    
    // Set start date
    fireEvent.change(startDateInput, { target: { value: '2024-12-31' } });
    
    // Verify end date input has min attribute set to start date
    expect(endDateInput).toHaveAttribute('min', '2024-12-31');
  });

  it('resets all filters', () => {
    const mockOnFilterChange = createMockOnFilterChange();
    
    render(<TaskFilter onFilterChange={mockOnFilterChange} />);
    
    // Set some filters
    const prioritySelect = screen.getByLabelText(/priority/i);
    const statusSelect = screen.getByLabelText(/status/i);
    const startDateInput = screen.getByLabelText(/from date/i);
    
    fireEvent.change(prioritySelect, { target: { value: 'High' } });
    fireEvent.change(statusSelect, { target: { value: 'completed' } });
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    
    // Click reset button
    const resetButton = screen.getByRole('button', { name: /reset filters/i });
    fireEvent.click(resetButton);
    
    // Verify all inputs are reset to default
    expect(prioritySelect).toHaveValue('');
    expect(statusSelect).toHaveValue('all');
    expect(startDateInput).toHaveValue('');
  });

  it('handles incomplete filter scenarios', () => {
    const mockOnFilterChange = createMockOnFilterChange();
    
    render(<TaskFilter onFilterChange={mockOnFilterChange} />);
    
    const statusSelect = screen.getByLabelText(/status/i);
    
    // Select incomplete tasks
    fireEvent.change(statusSelect, { target: { value: 'incomplete' } });
    
    // Verify filter was called with correct completion status
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        completed: false
      })
    );
  });
});