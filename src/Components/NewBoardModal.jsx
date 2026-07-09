import { useEffect, useRef } from "react";

export default function NewBoardModal({ open, onClose, onCreate }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  const handleCreate = () => {
    const name = inputRef.current.value.trim();
    if (!name) return;
    onCreate(name);
  };

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <h2>New board</h2>
        <input
          ref={inputRef}
          type="text"
          placeholder="Board name"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
        />
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleCreate}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
