/**
 * NeuralNetworkVisualization Component
 *
 * Animated brain-shaped neural network visualization with:
 * - STATIC nodes at fixed positions (never move)
 * - STATIC connection paths between nodes
 * - 5 ANIMATED glowing pulses traveling along RANDOM paths
 * - Central hippocampus glow effect
 *
 * Pulses pick random paths and random durations for organic feel
 */

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Colors } from '../constants/theme';

// Create animated version of Circle for PULSES only
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface NeuralNetworkVisualizationProps {
  /** Whether the visualization should animate */
  isAnimating?: boolean;
  /** Size of the visualization */
  size?: number;
  /** Current theta state for color theming */
  thetaState?: 'low' | 'normal' | 'high';
}

// STATIC node positions forming a brain shape (normalized 0-100)
const NODES = [
  // Left hemisphere - frontal
  { id: 1, x: 20, y: 35 },
  { id: 2, x: 25, y: 25 },
  { id: 3, x: 35, y: 18 },
  // Left hemisphere - parietal
  { id: 4, x: 15, y: 50 },
  { id: 5, x: 22, y: 55 },
  // Left hemisphere - temporal
  { id: 6, x: 18, y: 70 },
  { id: 7, x: 28, y: 75 },
  // Left hemisphere - occipital
  { id: 8, x: 35, y: 82 },

  // Center - corpus callosum / hippocampus
  { id: 9, x: 50, y: 15 },
  { id: 10, x: 50, y: 35 },
  { id: 11, x: 50, y: 50 }, // Central hippocampus node
  { id: 12, x: 50, y: 65 },
  { id: 13, x: 50, y: 85 },

  // Right hemisphere - frontal
  { id: 14, x: 80, y: 35 },
  { id: 15, x: 75, y: 25 },
  { id: 16, x: 65, y: 18 },
  // Right hemisphere - parietal
  { id: 17, x: 85, y: 50 },
  { id: 18, x: 78, y: 55 },
  // Right hemisphere - temporal
  { id: 19, x: 82, y: 70 },
  { id: 20, x: 72, y: 75 },
  // Right hemisphere - occipital
  { id: 21, x: 65, y: 82 },

  // Additional depth nodes
  { id: 22, x: 38, y: 45 },
  { id: 23, x: 62, y: 45 },
  { id: 24, x: 40, y: 60 },
  { id: 25, x: 60, y: 60 },
];

// ALL static connections (for background lines)
const ALL_CONNECTIONS: [number, number][] = [
  // Left hemisphere
  [1, 2], [2, 3], [3, 9], [1, 4], [4, 5], [5, 6], [6, 7], [7, 8],
  [4, 22], [5, 22], [22, 10], [22, 24], [24, 11], [24, 7],
  // Right hemisphere
  [14, 15], [15, 16], [16, 9], [14, 17], [17, 18], [18, 19], [19, 20], [20, 21],
  [17, 23], [18, 23], [23, 10], [23, 25], [25, 11], [25, 20],
  // Cross-hemisphere
  [3, 16], [9, 10], [10, 11], [11, 12], [12, 13], [8, 13], [21, 13],
  [22, 11], [23, 11], [24, 12], [25, 12],
  // Additional
  [1, 22], [14, 23], [6, 24], [19, 25], [8, 12], [21, 12],
];

// All possible paths a pulse can travel (including reverse directions)
const ALL_PATHS: { from: number; to: number }[] = [
  // Forward paths
  ...ALL_CONNECTIONS.map(([from, to]) => ({ from, to })),
  // Reverse paths for variety
  ...ALL_CONNECTIONS.map(([from, to]) => ({ from: to, to: from })),
];

// Number of animated pulses
const NUM_PULSES = 5;

// Theta state colors
const THETA_COLORS = {
  low: Colors.theta.low,
  normal: Colors.accent.primary,
  high: Colors.theta.high,
};

// Get random path from all possible paths
const getRandomPath = () => ALL_PATHS[Math.floor(Math.random() * ALL_PATHS.length)];

// Get random duration between 1800-2800ms
const getRandomDuration = () => 1800 + Math.random() * 1000;

export const NeuralNetworkVisualization: React.FC<NeuralNetworkVisualizationProps> = ({
  isAnimating = false,
  size = 280,
  thetaState = 'normal',
}) => {
  // Animation values for each pulse
  const pulseAnimations = useRef(
    Array(NUM_PULSES).fill(null).map(() => new Animated.Value(0))
  ).current;

  // Current path for each pulse (changes randomly after each animation)
  const [pulsePaths, setPulsePaths] = useState<{ from: number; to: number }[]>(() =>
    Array(NUM_PULSES).fill(null).map(() => getRandomPath())
  );

  // Central glow animation
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  // Track if component is mounted for cleanup
  const isMountedRef = useRef(true);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Get current color based on theta state
  const stateColor = useMemo(() => {
    switch (thetaState) {
      case 'high': return THETA_COLORS.high;
      case 'low': return THETA_COLORS.low;
      default: return THETA_COLORS.normal;
    }
  }, [thetaState]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!isAnimating) {
      pulseAnimations.forEach(anim => anim.stopAnimation());
      pulseAnimations.forEach(anim => anim.setValue(0));
      glowAnim.stopAnimation();
      glowAnim.setValue(0.3);
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];
      return;
    }

    // Animate a single pulse
    const animatePulse = (index: number) => {
      if (!isMountedRef.current || !isAnimating) return;

      pulseAnimations[index].setValue(0);

      Animated.timing(pulseAnimations[index], {
        toValue: 1,
        duration: getRandomDuration(),
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && isMountedRef.current && isAnimating) {
          // Pick a new random path for next animation
          setPulsePaths(prev => {
            const newPaths = [...prev];
            newPaths[index] = getRandomPath();
            return newPaths;
          });

          // Small random delay before next animation
          const timeout = setTimeout(() => {
            animatePulse(index);
          }, Math.random() * 300);
          timeoutsRef.current.push(timeout);
        }
      });
    };

    // Start each pulse with staggered delay
    for (let i = 0; i < NUM_PULSES; i++) {
      const timeout = setTimeout(() => {
        animatePulse(i);
      }, i * 500 + Math.random() * 300);
      timeoutsRef.current.push(timeout);
    }

    // Central glow pulsing
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    glowAnimation.start();

    return () => {
      isMountedRef.current = false;
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];
      pulseAnimations.forEach(anim => anim.stopAnimation());
      glowAnimation.stop();
    };
  }, [isAnimating, pulseAnimations, glowAnim]);

  // Scale coordinates to actual size
  const scale = (val: number) => (val / 100) * size;

  // Get node by ID
  const getNode = (id: number) => NODES.find(n => n.id === id);

  // Generate curved path between two nodes
  const getConnectionPath = (fromId: number, toId: number): string => {
    const from = getNode(fromId);
    const to = getNode(toId);
    if (!from || !to) return '';

    const x1 = scale(from.x);
    const y1 = scale(from.y);
    const x2 = scale(to.x);
    const y2 = scale(to.y);

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const curvature = 0.15;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const cx = midX - dy * curvature;
    const cy = midY + dx * curvature;

    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={stateColor} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={stateColor} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Central hippocampus glow */}
        <AnimatedCircle
          cx={scale(50)}
          cy={scale(50)}
          r={scale(25)}
          fill="url(#centerGlow)"
          opacity={glowAnim}
        />

        {/* Brain outline hint */}
        <Path
          d={`
            M ${scale(50)} ${scale(8)}
            C ${scale(25)} ${scale(8)}, ${scale(8)} ${scale(30)}, ${scale(10)} ${scale(50)}
            C ${scale(8)} ${scale(70)}, ${scale(25)} ${scale(90)}, ${scale(50)} ${scale(92)}
            C ${scale(75)} ${scale(90)}, ${scale(92)} ${scale(70)}, ${scale(90)} ${scale(50)}
            C ${scale(92)} ${scale(30)}, ${scale(75)} ${scale(8)}, ${scale(50)} ${scale(8)}
          `}
          stroke={stateColor}
          strokeWidth={1}
          strokeOpacity={0.1}
          fill="none"
        />

        {/* Static connection paths */}
        <G>
          {ALL_CONNECTIONS.map(([fromId, toId]) => (
            <Path
              key={`connection-${fromId}-${toId}`}
              d={getConnectionPath(fromId, toId)}
              stroke={stateColor}
              strokeWidth={1}
              strokeOpacity={0.2}
              fill="none"
            />
          ))}
        </G>

        {/* Static nodes - FIXED, never move */}
        <G>
          {NODES.map((node) => {
            const isCenter = node.id === 11;
            const nodeRadius = isCenter ? 5 : 3.5;

            return (
              <Circle
                key={`node-${node.id}`}
                cx={scale(node.x)}
                cy={scale(node.y)}
                r={nodeRadius}
                fill={stateColor}
                opacity={isAnimating ? 0.7 : 0.4}
              />
            );
          })}
        </G>

        {/* 5 Animated glowing pulses with random paths */}
        {isAnimating && (
          <G>
            {pulsePaths.map((path, index) => {
              if (!path) return null;

              const fromNode = getNode(path.from);
              const toNode = getNode(path.to);
              if (!fromNode || !toNode) return null;

              const x1 = scale(fromNode.x);
              const y1 = scale(fromNode.y);
              const x2 = scale(toNode.x);
              const y2 = scale(toNode.y);

              // Calculate curve control point
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;
              const curvature = 0.15;
              const dx = x2 - x1;
              const dy = y2 - y1;
              const cx = midX - dy * curvature;
              const cy = midY + dx * curvature;

              // Interpolate position along curved path
              const animatedCx = pulseAnimations[index].interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [x1, cx, x2],
              });

              const animatedCy = pulseAnimations[index].interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [y1, cy, y2],
              });

              // Fade in/out at endpoints
              const animatedOpacity = pulseAnimations[index].interpolate({
                inputRange: [0, 0.1, 0.9, 1],
                outputRange: [0, 1, 1, 0],
              });

              return (
                <React.Fragment key={`pulse-${index}`}>
                  {/* Outer glow - large, very transparent */}
                  <AnimatedCircle
                    cx={animatedCx}
                    cy={animatedCy}
                    r={14}
                    fill={stateColor}
                    opacity={animatedOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.1],
                    })}
                  />
                  {/* Middle glow */}
                  <AnimatedCircle
                    cx={animatedCx}
                    cy={animatedCy}
                    r={9}
                    fill={stateColor}
                    opacity={animatedOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.25],
                    })}
                  />
                  {/* Core - small, bright */}
                  <AnimatedCircle
                    cx={animatedCx}
                    cy={animatedCy}
                    r={5}
                    fill={stateColor}
                    opacity={animatedOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.85],
                    })}
                  />
                </React.Fragment>
              );
            })}
          </G>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NeuralNetworkVisualization;
