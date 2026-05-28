const particles = Array.from({ length: 82 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 101}%`,
  top: `${(index * 53) % 100}%`,
  size: 1 + ((index * 7) % 4),
  delay: (index % 13) * 0.45,
  duration: 5 + (index % 9),
}));

export default function BackgroundFX() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-space-deep" />
      <div className="absolute inset-0 bg-cosmic-radial opacity-90" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(217,70,239,0.035)_1px,transparent_1px)] bg-[size:92px_92px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      <div className="starfield absolute inset-0">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="star-particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
