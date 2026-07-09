const COLUMNS = [
  {
    title: "To do",
    tasks: ["Wait for tonight", "Try to take over the world!"],
  },
  {
    title: "In progress",
    tasks: ["Project Hijack Sitter Service", "Mobile breakpoints"],
  },
  { title: "Done", tasks: ["Kickoff meeting", "Competitor research"] },
];

export default function Kanban() {
  return (
    <div>
      <div className="main-header">
        <h1>Kanban board</h1>
      </div>
      <div className="kanban">
        {COLUMNS.map((col) => (
          <div className="kcol" key={col.title}>
            <h4>{col.title}</h4>
            {col.tasks.map((task) => (
              <div className="ktask" key={task}>
                {task}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
