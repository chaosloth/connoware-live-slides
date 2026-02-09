"use client";

import React, { useEffect, useState, useRef } from "react";
import { Box, Text } from "@twilio-paste/core";

export type BubbleData = {
  label: string;
  value: number;
};

type BubbleChartProps = {
  data: BubbleData[];
  width?: number;
  height?: number;
  maxBubbleSize?: number;
  minBubbleSize?: number;
};

type PositionedBubble = BubbleData & {
  x: number;
  y: number;
  size: number;
  color: string;
};

const COLORS = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffeb3b",
  "#ffc107",
  "#ff9800",
  "#ff5722",
];

const BubbleChart: React.FC<BubbleChartProps> = ({
  data,
  width = 900,
  height = 600,
  maxBubbleSize = 150,
  minBubbleSize = 40,
}) => {
  const [bubbles, setBubbles] = useState<PositionedBubble[]>([]);
  // Store positions, colors, and current values for each label
  const bubbleRegistry = useRef<
    Map<
      string,
      {
        x: number;
        y: number;
        color: string;
        colorIndex: number;
        lastValue: number;
        size: number;
      }
    >
  >(new Map());
  const colorIndexCounter = useRef(0);

  useEffect(() => {
    if (data.length === 0) return;

    // Create or update positioned bubbles
    const positioned: PositionedBubble[] = data.map((item) => {
      // Check if this label already has a position/color assigned
      let bubbleInfo = bubbleRegistry.current.get(item.label);

      if (!bubbleInfo) {
        // New bubble - assign position and color
        const colorIndex = colorIndexCounter.current % COLORS.length;
        colorIndexCounter.current++;

        // Generate random position ensuring bubble stays within bounds
        const maxSize = maxBubbleSize;
        const padding = maxSize / 2 + 20;
        const x = padding + Math.random() * (width - 2 * padding);
        const y = padding + Math.random() * (height - 2 * padding);

        // Calculate initial size based on minBubbleSize + proportional growth
        const size = minBubbleSize + (item.value - 1) * 15; // 15px per response

        bubbleInfo = {
          x,
          y,
          color: COLORS[colorIndex],
          colorIndex,
          lastValue: item.value,
          size,
        };
        bubbleRegistry.current.set(item.label, bubbleInfo);
      } else if (bubbleInfo.lastValue !== item.value) {
        // Value changed for this bubble - update size
        const newSize = minBubbleSize + (item.value - 1) * 15; // 15px per response
        const cappedSize = Math.min(newSize, maxBubbleSize);

        bubbleInfo = {
          ...bubbleInfo,
          lastValue: item.value,
          size: cappedSize,
        };
        bubbleRegistry.current.set(item.label, bubbleInfo);
      }

      return {
        ...item,
        x: bubbleInfo.x,
        y: bubbleInfo.y,
        size: bubbleInfo.size,
        color: bubbleInfo.color,
      };
    });

    setBubbles(positioned);
  }, [data, width, height, maxBubbleSize, minBubbleSize]);

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box position="relative" style={{ width: `${width}px`, height: `${height}px` }}>
      <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
        {bubbles.map((bubble, index) => (
          <g key={index}>
            {/* Bubble circle with glow effect */}
            <defs>
              <radialGradient id={`gradient-${index}`}>
                <stop offset="0%" stopColor={bubble.color} stopOpacity="0.9" />
                <stop offset="70%" stopColor={bubble.color} stopOpacity="0.7" />
                <stop offset="100%" stopColor={bubble.color} stopOpacity="0.5" />
              </radialGradient>
              <filter id={`glow-${index}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle
              cx={bubble.x}
              cy={bubble.y}
              r={bubble.size / 2}
              fill={`url(#gradient-${index})`}
              filter={`url(#glow-${index})`}
              style={{
                animation: `float${index % 3} ${6 + (index % 3)}s ease-in-out infinite`,
                animationDelay: `${(index * 0.3) % 2}s`,
                transition: "r 0.5s ease-in-out",
              }}
            />
          </g>
        ))}
      </svg>

      {/* Text labels overlaid on bubbles */}
      {bubbles.map((bubble, index) => {
        const percentage = ((bubble.value / total) * 100).toFixed(1);
        return (
          <Box
            key={`label-${index}`}
            position="absolute"
            style={{
              left: `${bubble.x}px`,
              top: `${bubble.y}px`,
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
              animation: `float${index % 3} ${6 + (index % 3)}s ease-in-out infinite`,
              animationDelay: `${(index * 0.3) % 2}s`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
            }}
          >
            <Text
              as="div"
              fontWeight="fontWeightBold"
              fontSize="fontSize40"
              color="colorTextInverse"
              style={{
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                marginBottom: "4px",
                wordBreak: "break-word",
                maxWidth: "90%",
              }}
            >
              {bubble.label}
            </Text>
            <Text
              as="div"
              fontSize="fontSize30"
              color="colorTextInverse"
              style={{
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {bubble.value} ({percentage}%)
            </Text>
          </Box>
        );
      })}

      <style>{`
        @keyframes float0 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(8px, -10px); }
          50% { transform: translate(-8px, 8px); }
          75% { transform: translate(10px, 6px); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-10px, 8px); }
          50% { transform: translate(8px, -8px); }
          75% { transform: translate(-6px, 10px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(6px, 10px); }
          50% { transform: translate(-10px, -6px); }
          75% { transform: translate(8px, -8px); }
        }
      `}</style>
    </Box>
  );
};

export default BubbleChart;
