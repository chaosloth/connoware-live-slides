"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  FormControl,
  Heading,
  HelpText,
  Input,
  Label,
  Stack,
  Text,
  Spinner,
} from "@twilio-paste/core";
import { useAuth } from "../context/Auth";

const stepTransitionStyles = {
  entering: {
    opacity: 0,
    transform: "translateX(20px)",
    transition: "opacity 300ms ease-in-out, transform 300ms ease-in-out",
  },
  entered: {
    opacity: 1,
    transform: "translateX(0)",
    transition: "opacity 300ms ease-in-out, transform 300ms ease-in-out",
  },
  exiting: {
    opacity: 0,
    transform: "translateX(-20px)",
    transition: "opacity 300ms ease-in-out, transform 300ms ease-in-out",
  },
};

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isValidatingPhone, setIsValidatingPhone] = useState(false);
  const [isValidPhone, setIsValidPhone] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Phone number validation effect
  useEffect(() => {
    if (!phoneNumber || phoneNumber === "") {
      setIsValidPhone(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

    setIsValidatingPhone(true);
    setIsValidPhone(false);

    fetch(
      `${API_BASE}/api/number-lookup?countryCode=US&From=${encodeURIComponent(phoneNumber)}`,
      { signal }
    )
      .then((resp) => resp.json())
      .then((data) => {
        const normalized = data.phoneNumber;
        if (normalized && normalized.length > 0) {
          setNormalizedPhone(normalized);
          setIsValidPhone(true);
          setError(null);
        } else {
          setIsValidPhone(false);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log("Aborted phone validation");
        } else {
          console.log("Error validating phone number", err);
        }
        setIsValidPhone(false);
      })
      .finally(() => setIsValidatingPhone(false));

    return () => {
      controller.abort();
    };
  }, [phoneNumber]);

  const handleSendCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: normalizedPhone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send code");
      }

      // Trigger transition animation
      setIsTransitioning(true);
      setTimeout(() => {
        setStep("code");
        setIsTransitioning(false);
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: normalizedPhone, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid code");
      }

      login(data.token, data.phoneNumber);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      backgroundColor="colorBackgroundBody"
    >
      <Box width="400px" maxWidth="90vw">
        <Card padding="space100">
          <Stack orientation="vertical" spacing="space60">
          <Box textAlign="center">
            <Heading as="h1" variant="heading10">
              Admin Login
            </Heading>
            <Text as="p" color="colorTextWeak" marginTop="space30">
              Enter your authorized phone number
            </Text>
          </Box>

          {error && (
            <Box
              padding="space40"
              backgroundColor="colorBackgroundErrorWeakest"
              borderRadius="borderRadius30"
            >
              <Text as="p" color="colorTextError">
                {error}
              </Text>
            </Box>
          )}

          <Box
            style={{
              ...stepTransitionStyles.entered,
              minHeight: "220px",
              ...(isTransitioning ? stepTransitionStyles.exiting : {}),
            }}
          >
            {step === "phone" ? (
              <Stack orientation="vertical" spacing="space60">
                <FormControl>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    disabled={loading}
                  />
                  <HelpText
                    variant={isValidPhone && !isValidatingPhone ? "default" : "error"}
                  >
                    <Stack orientation="horizontal" spacing="space20">
                      {isValidatingPhone && (
                        <Spinner decorative={true} size="sizeIcon10" title="" />
                      )}
                      {isValidPhone && !isValidatingPhone
                        ? `Using phone number ${normalizedPhone}`
                        : "Enter your phone number in E.164 format (e.g., +1234567890)"}
                    </Stack>
                  </HelpText>
                </FormControl>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSendCode}
                  disabled={!isValidPhone || loading}
                  loading={loading}
                >
                  Send Verification Code
                </Button>
              </Stack>
            ) : (
              <Stack orientation="vertical" spacing="space60">
                <Box>
                  <Text as="p" color="colorText">
                    A verification code has been sent to:
                  </Text>
                  <Text as="p" fontWeight="fontWeightSemibold">
                    {normalizedPhone}
                  </Text>
                </Box>

                <FormControl>
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    disabled={loading}
                    maxLength={6}
                  />
                  <HelpText>Enter the 6-digit code sent to your phone</HelpText>
                </FormControl>

                <Stack orientation="vertical" spacing="space40">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleVerifyCode}
                    disabled={!code || loading}
                    loading={loading}
                  >
                    Verify Code
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setStep("phone");
                        setCode("");
                        setError(null);
                        setPhoneNumber("");
                        setNormalizedPhone("");
                        setIsValidPhone(false);
                        setIsTransitioning(false);
                      }, 300);
                    }}
                    disabled={loading}
                  >
                    Use Different Number
                  </Button>
                </Stack>
              </Stack>
            )}
          </Box>
        </Stack>
      </Card>
      </Box>
    </Box>
  );
}
