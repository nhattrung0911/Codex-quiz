import type { LeaderboardEntry } from '../api/types';

export function Leaderboard({ items }: { items: LeaderboardEntry[] }) {
  return (
    <div className="leaderboard">
      {items.map((item) => (
        <div className="leaderboard-row" key={item.participantId}>
          <strong>#{item.rank}</strong>
          <span>{item.displayName}</span>
          <span className="muted">streak {item.streak}</span>
          <b>{item.score}</b>
        </div>
      ))}
    </div>
  );
}
