"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Button, Heading, Text, Stack } from "@twilio-paste/core";
import { ErrorIcon } from "@twilio-paste/icons/esm/ErrorIcon";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React component errors
 * Prevents the entire app from crashing when a component throws an error
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          padding="space80"
          backgroundColor="colorBackgroundBody"
        >
          <Box
            maxWidth="size60"
            padding="space80"
            backgroundColor="colorBackgroundErrorWeakest"
            borderRadius="borderRadius30"
            borderColor="colorBorderErrorWeaker"
            borderStyle="solid"
            borderWidth="borderWidth10"
          >
            <Stack orientation="vertical" spacing="space60">
              <Box display="flex" alignItems="center" columnGap="space30">
                <ErrorIcon decorative={false} title="Error" color="colorTextError" size="sizeIcon70" />
                <Heading as="h2" variant="heading20">
                  Something went wrong
                </Heading>
              </Box>

              <Text as="p" color="colorText">
                We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
              </Text>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <Box
                  padding="space40"
                  backgroundColor="colorBackgroundBody"
                  borderRadius="borderRadius20"
                  marginTop="space40"
                >
                  <Text as="p" fontFamily="fontFamilyCode" fontSize="fontSize20" color="colorTextError">
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <Box marginTop="space30">
                      <Text as="pre" fontFamily="fontFamilyCode" fontSize="fontSize10" color="colorTextWeak">
                        {this.state.errorInfo.componentStack}
                      </Text>
                    </Box>
                  )}
                </Box>
              )}

              <Box display="flex" columnGap="space40">
                <Button variant="primary" onClick={this.handleReset}>
                  Try Again
                </Button>
                <Button variant="secondary" onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              </Box>
            </Stack>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

/**
 * Simple error message component for displaying errors inline
 */
interface ErrorMessageProps {
  error: Error | string;
  onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Box
      padding="space60"
      backgroundColor="colorBackgroundErrorWeakest"
      borderRadius="borderRadius30"
      borderColor="colorBorderErrorWeaker"
      borderStyle="solid"
      borderWidth="borderWidth10"
    >
      <Stack orientation="vertical" spacing="space40">
        <Box display="flex" alignItems="center" columnGap="space30">
          <ErrorIcon decorative={false} title="Error" color="colorTextError" />
          <Text as="p" color="colorTextError" fontWeight="fontWeightSemibold">
            {errorMessage}
          </Text>
        </Box>

        {onRetry && (
          <Button variant="secondary" size="small" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </Stack>
    </Box>
  );
}
