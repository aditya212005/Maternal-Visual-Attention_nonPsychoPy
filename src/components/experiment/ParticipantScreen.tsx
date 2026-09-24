interface ParticipantScreenProps {
  participantId: string;
  onParticipantIdChange: (value: string) => void;
  onStart: () => void;
  isStarting: boolean;
  error: string | null;
}

export function ParticipantScreen({
  participantId,
  onParticipantIdChange,
  onStart,
  isStarting,
  error,
}: ParticipantScreenProps) {
  return (
    <section className="intro-screen" aria-labelledby="participant-title">
      <div className="intro-panel">
        <p className="eyebrow">Research study</p>
        <h1 id="participant-title">Maternal Visual Attention</h1>
        <p className="intro-copy">Enter your participant ID to begin.</p>
        <form
          className="participant-form"
          onSubmit={(event) => {
            event.preventDefault();
            onStart();
          }}
        >
          <label htmlFor="participant-id">Participant ID</label>
          <input
            id="participant-id"
            type="text"
            value={participantId}
            onChange={(event) => onParticipantIdChange(event.target.value)}
            autoComplete="off"
            autoFocus
            required
          />
          <button type="submit" disabled={!participantId.trim() || isStarting}>
            {isStarting ? "Starting..." : "Start"}
          </button>
          {error && <p className="form-error" role="alert">{error}</p>}
        </form>
      </div>
    </section>
  );
}