import { Box } from '@mui/material';
import { keyframes } from '@emotion/react';

interface PirateIconProps {
  size?: number;
  animated?: boolean;
}

const bounceAnimation = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
`;

export function PirateIcon({ size = 24, animated = true }: PirateIconProps) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: animated ? `${bounceAnimation} 0.6s ease-in-out infinite` : 'none',
        fontSize: size * 0.8
      }}
    >
      🏴‍☠️
    </Box>
  );
}
