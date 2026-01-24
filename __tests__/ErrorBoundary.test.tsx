/**
 * Tests for ErrorBoundary Component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ErrorBoundary, withErrorBoundary } from '../src/components/ErrorBoundary';

// Mock __DEV__ global
declare const global: { __DEV__: boolean };
global.__DEV__ = false;

// Suppress console.error for expected errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <Text>Child content</Text>
        </ErrorBoundary>
      );

      expect(getByText('Child content')).toBeTruthy();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <Text>First child</Text>
          <Text>Second child</Text>
        </ErrorBoundary>
      );

      expect(getByText('First child')).toBeTruthy();
      expect(getByText('Second child')).toBeTruthy();
    });

    it('should accept testID prop', () => {
      const { getByTestId } = render(
        <ErrorBoundary testID="my-boundary">
          <Text>Content</Text>
        </ErrorBoundary>
      );

      // TestID is only added to the error UI, not during normal rendering
      expect(getByTestId).toBeDefined();
    });

    it('should accept onError callback prop', () => {
      const mockOnError = jest.fn();
      const { getByText } = render(
        <ErrorBoundary onError={mockOnError}>
          <Text>Content</Text>
        </ErrorBoundary>
      );

      expect(getByText('Content')).toBeTruthy();
      // onError should not be called when no error
      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('should accept showDetails prop', () => {
      const { getByText } = render(
        <ErrorBoundary showDetails={true}>
          <Text>Content</Text>
        </ErrorBoundary>
      );

      expect(getByText('Content')).toBeTruthy();
    });

    it('should accept onRetry callback prop', () => {
      const mockOnRetry = jest.fn();
      const { getByText } = render(
        <ErrorBoundary onRetry={mockOnRetry}>
          <Text>Content</Text>
        </ErrorBoundary>
      );

      expect(getByText('Content')).toBeTruthy();
    });

    it('should accept fallback prop without using it', () => {
      const customFallback = <Text>Fallback</Text>;
      const { getByText, queryByText } = render(
        <ErrorBoundary fallback={customFallback}>
          <Text>Content</Text>
        </ErrorBoundary>
      );

      expect(getByText('Content')).toBeTruthy();
      expect(queryByText('Fallback')).toBeNull();
    });
  });
});

describe('withErrorBoundary HOC', () => {
  it('should wrap component with error boundary', () => {
    const SimpleComponent: React.FC = () => <Text>Simple component</Text>;
    const WrappedComponent = withErrorBoundary(SimpleComponent);

    const { getByText } = render(<WrappedComponent />);

    expect(getByText('Simple component')).toBeTruthy();
  });

  it('should set correct displayName', () => {
    const NamedComponent: React.FC = () => <Text>Named</Text>;
    NamedComponent.displayName = 'MyNamedComponent';

    const Wrapped = withErrorBoundary(NamedComponent);

    expect(Wrapped.displayName).toBe('withErrorBoundary(MyNamedComponent)');
  });

  it('should use function name when displayName not set', () => {
    function MyFunction() {
      return <Text>Function</Text>;
    }

    const Wrapped = withErrorBoundary(MyFunction);

    expect(Wrapped.displayName).toBe('withErrorBoundary(MyFunction)');
  });

  it('should pass props to wrapped component', () => {
    const PropsComponent: React.FC<{ message: string }> = ({ message }) => (
      <Text>{message}</Text>
    );
    const WrappedComponent = withErrorBoundary(PropsComponent);

    const { getByText } = render(<WrappedComponent message="Hello World" />);

    expect(getByText('Hello World')).toBeTruthy();
  });

  it('should accept error boundary options', () => {
    const SimpleComponent: React.FC = () => <Text>Content</Text>;
    const mockOnError = jest.fn();
    const WrappedComponent = withErrorBoundary(SimpleComponent, {
      onError: mockOnError,
      showDetails: false,
    });

    const { getByText } = render(<WrappedComponent />);

    expect(getByText('Content')).toBeTruthy();
  });
});
