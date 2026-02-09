import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary, ErrorMessage } from '../index';
import { Theme } from '@twilio-paste/core/theme';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Wrapper to provide Twilio Paste theme
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Theme.Provider theme="twilio">{children}</Theme.Provider>
);

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when no error occurs', () => {
    render(
      <Wrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </Wrapper>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when child throws error', () => {
    render(
      <Wrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </Wrapper>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/We're sorry, but something unexpected happened/)
    ).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <Wrapper>
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </Wrapper>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <Wrapper>
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </Wrapper>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });
});

describe('ErrorMessage', () => {
  it('should render error message from Error object', () => {
    const error = new Error('Test error message');

    render(
      <Wrapper>
        <ErrorMessage error={error} />
      </Wrapper>
    );

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render error message from string', () => {
    render(
      <Wrapper>
        <ErrorMessage error="String error message" />
      </Wrapper>
    );

    expect(screen.getByText('String error message')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const onRetry = jest.fn();

    render(
      <Wrapper>
        <ErrorMessage error="Test error" onRetry={onRetry} />
      </Wrapper>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(
      <Wrapper>
        <ErrorMessage error="Test error" />
      </Wrapper>
    );

    const retryButton = screen.queryByRole('button', { name: /try again/i });
    expect(retryButton).not.toBeInTheDocument();
  });
});
