# Maternal-Visual-Attention_nonPsychoPy
A browser-based visual attention and reaction-time experiment for maternal cognitive research, designed as a lightweight alternative to PsychoPy with local data collection, SQLite storage, and researcher-side analysis tools.

## Dataset setup

1. Put adult images in `public/stimuli/adults/`.
2. Put baby images in `public/stimuli/babies/`.
3. Run `npm install`, then `npm run dev`.
4. Open the localhost application shown in the terminal.

Supported image formats are `.jpg`, `.jpeg`, `.png`, and `.webp`. The application scans both folders when a participant starts; no filename list needs to be updated. The existing `public/test-stimuli/` assets remain separate from the real datasets.
