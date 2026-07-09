const DOT_COLORS = ["#8fb996", "#4a5468", "#2f3542", "#c7c4bd"];

export default function BoardCard({ board, onClick }) {
  const badgeClass = board.status === "on-track" ? "on-track" : "at-risk";
  const badgeText = board.status === "on-track" ? "On track" : "At risk";

  return (
    <div className="card" onClick={onClick}>
      <div className="card-top">
        <h3>{board.name}</h3>
        <span className={`badge ${badgeClass}`}>{badgeText}</span>
      </div>
      <div className="meta">
        {board.tasks} tasks &middot; updated {board.updated}
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${board.progress}%` }}
        />
      </div>
      <div className="avatars">
        {Array.from({ length: board.avatars }).map((_, i) => (
          <div
            key={i}
            className="dot"
            style={{ background: DOT_COLORS[i % DOT_COLORS.length] }}
          />
        ))}
      </div>
    </div>
  );
}

export function NewBoardCard({ onClick }) {
  return (
    <div className="card new-board" onClick={onClick}>
      <div className="plus">+</div>
      <div>Start a new board</div>
    </div>
  );
}
