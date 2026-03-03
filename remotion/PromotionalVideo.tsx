import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Img,
  staticFile,
} from 'remotion';

const DURATION_FPS = 900; // 30 seconds at 30fps

// --- Animated gradient background ---
function AnimatedBackground() {
  const frame = useCurrentFrame();
  const hueShift = interpolate(frame, [0, DURATION_FPS], [0, 360], {
    extrapolateRight: 'extend',
  });
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${135 + (frame % 360) * 0.05}deg, 
          hsl(${260 + Math.sin(frame * 0.01) * 20}, 70%, 12%) 0%, 
          hsl(${280 + hueShift * 0.05}, 80%, 6%) 50%,
          hsl(${320 + Math.cos(frame * 0.02) * 15}, 75%, 10%) 100%)`,
      }}
    />
  );
}

// --- Floating orbs ---
function FloatingOrbs() {
  const frame = useCurrentFrame();
  const orbs = [
    { x: 10, y: 20, size: 400, delay: 0, hue: 270 },
    { x: 80, y: 70, size: 250, delay: 30, hue: 320 },
    { x: 70, y: 30, size: 180, delay: 60, hue: 200 },
    { x: 20, y: 80, size: 300, delay: 90, hue: 240 },
  ];
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {orbs.map((orb, i) => {
        const float = Math.sin((frame + orb.delay) * 0.02 + i) * 25;
        const opacity = interpolate(frame, [0, 60 + orb.delay], [0, 0.12], {
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: orb.size,
              height: orb.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, hsla(${orb.hue}, 80%, 60%, 0.35) 0%, transparent 70%)`,
              transform: `translate(-50%, -50%) translateY(${float}px)`,
              opacity,
              filter: 'blur(80px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

// --- 3D Device showcase: laptop/computer on desk with perspective, zoom, diagonal ---
function DeviceShowcase({
  screenshotSrc,
  label,
  zoom = 1,
  rotateY = -18,
  rotateX = 4,
  perspective = 1400,
}: {
  screenshotSrc: string;
  label: string;
  zoom?: number;
  rotateY?: number;
  rotateX?: number;
  perspective?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const labelOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Zoom in at start of each scene
  const zoomAnim = interpolate(frame, [0, 30], [0.9, 1], {
    extrapolateRight: 'clamp',
  });

  // Subtle floating/breathing animation
  const floatY = Math.sin(frame * 0.04) * 8;
  const floatRotate = Math.sin(frame * 0.03) * 2;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: `${perspective}px`,
      }}
    >
      {/* 3D device container - laptop on desk style */}
      <div
        style={{
          transform: `scale(${scale * zoom * zoomAnim}) translateY(${floatY}px) rotateY(${rotateY + floatRotate}deg) rotateX(${rotateX}deg)`,
          transformStyle: 'preserve-3d',
          width: '85%',
          maxWidth: 1400,
        }}
      >
        {/* Laptop/computer frame */}
        <div
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: `
              0 50px 120px rgba(0,0,0,0.5),
              0 0 0 1px rgba(255,255,255,0.08),
              inset 0 1px 0 rgba(255,255,255,0.1)
            `,
            background: '#0d0d0d',
          }}
        >
          {/* Browser chrome / window frame */}
          <div
            style={{
              padding: '10px 16px',
              background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', gap: 5 }}>
              {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: c,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>
            <div
              style={{
                flex: 1,
                padding: '6px 14px',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: 6,
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'monospace',
              }}
            >
              System Design Simulator
            </div>
          </div>

          {/* Screen content */}
          <div
            style={{
              aspectRatio: '16/9',
              position: 'relative',
              overflow: 'hidden',
              background: '#fafaf8',
            }}
          >
            <Img
              src={screenshotSrc}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top center',
              }}
            />
          </div>

              {/* Laptop base / stand - gives "on desk" feel */}
          <div
            style={{
              height: 28,
              background: 'linear-gradient(180deg, #252525 0%, #151515 50%, #0a0a0a 100%)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '0 0 12px 12px',
            }}
          />
        </div>
      </div>

      {/* Scene label */}
      <div
        style={{
          marginTop: 28,
          padding: '12px 28px',
          background: 'rgba(139, 92, 246, 0.25)',
          borderRadius: 14,
          border: '1px solid rgba(139, 92, 246, 0.45)',
          opacity: labelOpacity,
          boxShadow: '0 4px 24px rgba(139, 92, 246, 0.2)',
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: 'white',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// --- CTA overlay ---
function CTAOverlay({ text }: { text: string }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 100,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        opacity,
      }}
    >
      <span
        style={{
          fontSize: 26,
          fontWeight: 600,
          color: 'white',
          textShadow: '0 2px 24px rgba(0,0,0,0.6)',
        }}
      >
        {text}
      </span>
    </div>
  );
}

// --- Intro ---
function IntroSequence() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOpacity = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const titleY = interpolate(
    spring({ frame, fps, config: { damping: 15 } }),
    [0, 1],
    [60, 0]
  );
  const taglineOpacity = interpolate(frame, [25, 55], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const ctaOpacity = interpolate(frame, [50, 85], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const ctaScale = spring({
    frame: Math.max(0, frame - 50),
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  return (
    <AbsoluteFill
      style={{ justifyContent: 'center', alignItems: 'center', zIndex: 20 }}
    >
      <div style={{ textAlign: 'center', transform: `translateY(${titleY}px)`, opacity: titleOpacity }}>
        <h1
          style={{
            fontSize: 78,
            fontWeight: 800,
            color: 'white',
            margin: 0,
            textShadow: '0 0 80px rgba(139, 92, 246, 0.5)',
            letterSpacing: '-2px',
          }}
        >
          System Design Simulator
        </h1>
        <p
          style={{
            fontSize: 30,
            color: 'rgba(255,255,255,0.88)',
            marginTop: 20,
            opacity: taglineOpacity,
            fontWeight: 500,
          }}
        >
          Design. Simulate. Optimize.
        </p>
      </div>
      <div style={{ marginTop: 70, opacity: ctaOpacity, transform: `scale(${ctaScale})` }}>
        <div
          style={{
            display: 'inline-block',
            padding: '20px 52px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            borderRadius: 18,
            boxShadow: '0 0 50px rgba(139, 92, 246, 0.6)',
            border: '2px solid rgba(255,255,255,0.2)',
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            Try it free →
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// --- Outro ---
function OutroSequence() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const ctaScale = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  return (
    <AbsoluteFill
      style={{ justifyContent: 'center', alignItems: 'center', zIndex: 25, opacity }}
    >
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: 'white',
            margin: 0,
          }}
        >
          Ready to design your system?
        </h2>
        <p
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.85)',
            marginTop: 20,
          }}
        >
          Drag, connect, simulate — find bottlenecks before they find you.
        </p>
        <div style={{ marginTop: 50, transform: `scale(${ctaScale})` }}>
          <div
            style={{
              display: 'inline-block',
              padding: '22px 60px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              borderRadius: 18,
              boxShadow: '0 0 60px rgba(34, 197, 94, 0.5)',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            <span
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}
            >
              Get started now
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// --- Main composition: 30 sec, build sequence, showcase style ---
export const PromotionalVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <FloatingOrbs />

      {/* Intro */}
      <Sequence from={0} durationInFrames={120}>
        <IntroSequence />
      </Sequence>

      {/* Build sequence - device showcase with varying angles */}
      <Sequence from={120} durationInFrames={90}>
        <DeviceShowcase
          screenshotSrc={staticFile('/screenshots/screenshot-empty.png')}
          label="Drag components from the sidebar"
          rotateY={-20}
          rotateX={5}
        />
        <CTAOverlay text="20+ infrastructure components at your fingertips" />
      </Sequence>

      <Sequence from={210} durationInFrames={75}>
        <DeviceShowcase
          screenshotSrc={staticFile('/screenshots/screenshot-step1-lb.png')}
          label="Drag & drop — place Load Balancer"
          rotateY={-15}
          rotateX={3}
        />
        <CTAOverlay text="Components snap to the canvas" />
      </Sequence>

      <Sequence from={285} durationInFrames={75}>
        <DeviceShowcase
          screenshotSrc={staticFile('/screenshots/screenshot-step2-api.png')}
          label="Add API Server"
          rotateY={-18}
          rotateX={4}
        />
        <CTAOverlay text="Build your system step by step" />
      </Sequence>

      <Sequence from={360} durationInFrames={75}>
        <DeviceShowcase
          screenshotSrc={staticFile('/screenshots/screenshot-step3-connect.png')}
          label="Connect the flow"
          rotateY={-12}
          rotateX={2}
        />
        <CTAOverlay text="Draw connections between components" />
      </Sequence>

      <Sequence from={435} durationInFrames={90}>
        <DeviceShowcase
          screenshotSrc={staticFile('/screenshots/screenshot-design.png')}
          label="Full architecture"
          rotateY={-22}
          rotateX={6}
        />
        <CTAOverlay text="Cache, Database, Load Balancers — configure capacity" />
      </Sequence>

      <Sequence from={525} durationInFrames={120}>
        <DeviceShowcase
          screenshotSrc={staticFile('/screenshots/screenshot-results.png')}
          label="Run simulation & find bottlenecks"
          rotateY={-16}
          rotateX={4}
        />
        <CTAOverlay text="Instant utilization analysis & bottleneck detection" />
      </Sequence>

      {/* Outro */}
      <Sequence from={645} durationInFrames={255}>
        <OutroSequence />
      </Sequence>
    </AbsoluteFill>
  );
};
