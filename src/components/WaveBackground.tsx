'use client';

export default function WaveBackground() {
  return (
    <div className="wave-bg" aria-hidden="true">
      {/* Wave Layer 1 */}
      <svg className="wave-1" viewBox="0 0 2880 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path
          d="M0,160 C320,220 640,100 960,160 C1280,220 1440,80 1740,140 C2040,200 2400,120 2880,160 L2880,320 L0,320 Z"
          fill="var(--accent-primary)"
        />
      </svg>
      {/* Wave Layer 2 */}
      <svg className="wave-2" viewBox="0 0 2880 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path
          d="M0,200 C480,120 720,260 1200,180 C1680,100 1920,240 2400,180 C2640,150 2760,200 2880,200 L2880,320 L0,320 Z"
          fill="var(--accent-primary)"
        />
      </svg>
      {/* Wave Layer 3 */}
      <svg className="wave-3" viewBox="0 0 2880 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path
          d="M0,240 C360,190 720,280 1080,220 C1440,160 1800,260 2160,200 C2520,140 2700,220 2880,240 L2880,320 L0,320 Z"
          fill="var(--accent-primary)"
        />
      </svg>
    </div>
  );
}
