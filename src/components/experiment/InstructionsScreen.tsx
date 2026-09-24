interface InstructionsScreenProps {
  onBegin: () => void;
}

export function InstructionsScreen({ onBegin }: InstructionsScreenProps) {
  return (
    <section className="intro-screen" aria-labelledby="instructions-title">
      <div className="intro-panel instructions-panel">
        <p className="eyebrow">Instructions</p>
        <h1 id="instructions-title">Get ready</h1>
        <div className="instructions-copy">
          <p>You will see a fixation cross, followed by a baby image and an adult image.</p>
          <p>The images will disappear. A dot will then appear on the left or right.</p>
          <p>Press <strong>Q</strong> when the dot is on the LEFT. Press <strong>O</strong> when the dot is on the RIGHT.</p>
          <p>Respond as quickly and accurately as possible.</p>
        </div>
        <button type="button" onClick={onBegin}>
          Begin experiment
        </button>
      </div>
    </section>
  );
}