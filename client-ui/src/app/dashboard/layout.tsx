"use client";
import { Box } from "@twilio-paste/core/box";
import React from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <Box width={"100%"} height={"100%"} overflowY={"scroll"}>
        <Box
          marginBottom="space60"
          marginTop={["space10", "space60"]}
          marginLeft="space60"
          marginRight="space60"
          backgroundColor={"colorBackgroundBody"}
          padding={"space70"}
          borderRadius={"borderRadius30"}
        >
          {children}
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
