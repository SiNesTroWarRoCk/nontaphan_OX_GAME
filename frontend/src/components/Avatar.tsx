import { useState } from 'react';

type AvatarProps = {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: 'sm' | 'md';
};

function getInitial(name?: string | null, email?: string | null) {
  const value = name || email || 'Player';
  return value.trim().charAt(0).toUpperCase();
}

export function Avatar({ src, name, email, size = 'md' }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initial = getInitial(name, email);

  if (!src || failed) {
    return <div className={`avatar avatar-${size}`} aria-label="Avatar fallback">{initial}</div>;
  }

  return (
    <img
      className={`avatar avatar-${size}`}
      src={src}
      alt="Avatar"
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
