import { ReactNode } from "react";

export type DiceType = "d2" | "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100";

export type Dice = {
  label: string;
  shape: (value?: ReactNode) => ReactNode;
  maxValue: number;
};

export const dices: Record<DiceType, Dice> = {
  d2: {
    label: "D2 - Coin",
    shape: (value = 2) => (
      <svg viewBox="0 0 32 32" className="size-full">
        <circle
          cx="16"
          cy="16"
          r="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fontSize="9"
          fill="currentColor"
        >
          {value}
        </text>
      </svg>
    ),
    maxValue: 2,
  },
  d4: {
    label: "D4 - Tetrahedron",
    shape: (value = 4) => (
      <svg viewBox="0 0 32 32" className="size-full">
        <polygon
          points="16,4 28,28 4,28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fontSize="9"
          fill="currentColor"
        >
          {value}
        </text>
      </svg>
    ),
    maxValue: 4,
  },
  d6: {
    label: "D6 - Cube",
    shape: (value = 6) => (
      <svg viewBox="0 0 32 32" className="size-full">
        <rect
          x="4"
          y="4"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fontSize="9"
          fill="currentColor"
        >
          {value}
        </text>
      </svg>
    ),
    maxValue: 6,
  },
  d8: {
    label: "D8 - Octahedron",
    shape: (value = 8) => (
      <svg viewBox="0 0 32 32" className="size-full">
        <polygon
          points="16,2 30,16 16,30 2,16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <text
          x="17"
          y="22"
          textAnchor="middle"
          fontSize="9"
          fill="currentColor"
        >
          {value}
        </text>
      </svg>
    ),
    maxValue: 8,
  },
  d10: {
    label: "D10 - Pentagonal",
    shape: (value = 10) => (
      <svg viewBox="0 0 32 32" className="size-full">
        <polygon
          points="16,2 28,12 24,28 8,28 4,12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fontSize="9"
          fill="currentColor"
        >
          {value}
        </text>
      </svg>
    ),
    maxValue: 10,
  },
  d12: {
    label: "D12 - Dodecahedron",
    shape: (value = 12) => (
      <svg viewBox="0 0 32 32" className="size-full">
        <polygon
          points="16,2 26,6 30,16 26,26 16,30 6,26 2,16 6,6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fontSize="9"
          fill="currentColor"
        >
          {value}
        </text>
      </svg>
    ),
    maxValue: 12,
  },
  d20: {
    label: "D20 - Icosahedron",
    shape: (value = 20) => (
      <svg viewBox="0 0 32 32" className="size-full">
        <polygon
          points="16,2 28,8 28,24 16,30 4,24 4,8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fontSize="9"
          fill="currentColor"
        >
          {value}
        </text>
      </svg>
    ),
    maxValue: 20,
  },
  d100: {
    label: "D100 - Zocchihedron",
    shape: (value = 100) => (
      <svg viewBox="0 0 32 32" className="size-full">
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
        <text
          x="16"
          y="21"
          textAnchor="middle"
          fontSize="8"
          fill="currentColor"
        >
          {value}
        </text>
      </svg>
    ),
    maxValue: 100,
  },
};
