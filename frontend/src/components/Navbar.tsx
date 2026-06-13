import { NavLink } from 'react-router-dom';
import { LogoutButton } from './LogoutButton';

export function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/game">Game</NavLink>
      <NavLink to="/scoreboard">Scoreboard</NavLink>
      <NavLink to="/profile">Profile</NavLink>
      <LogoutButton />
    </nav>
  );
}
