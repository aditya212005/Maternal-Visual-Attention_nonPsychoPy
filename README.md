# Maternal Visual Attention

Maternal Visual Attention is a browser-based research experiment for presenting infant and adult facial stimuli. It controls the presentation of one baby image and one adult image, displays a response cue, and records participants' responses and reaction times.

The application is being developed as a web-based, non-PsychoPy implementation. The repository does not specify a particular university or Psychology department affiliation.

## Research Context

The experiment presents baby and adult facial images in controlled trials to support research on visual attention. After each image pair is shown, the images disappear and a dot appears on the left or right. The application records the participant's key response, whether it was correct, and the response time for later review. The application reports descriptive data; it does not interpret scientific results.

## Features

- Participant enters an ID, reads the instructions, and completes the experiment.
- Each participant completes 20 trials.
- Every trial presents one baby image and one adult image side by side. Their left/right positions are randomized.
- Image presentation lasts 1,200 ms. The configured trial also includes an 800 ms fixation display and a 500 ms blank interval before the response cue. These are development configuration values and should be checked against the approved study protocol before data collection.
- A dot appears on the left or right. Press `Q` for left and `O` for right.
- Reaction time is measured from the response cue appearing until the participant presses a response key. The application records the response, accuracy, reaction time, stimulus paths, positions, and timestamp.
- The completion screen reports the number of recorded trials, correct responses, and average reaction time.
- Adult and baby images are discovered from `public/stimuli/adults/` and `public/stimuli/babies/`. Supported formats are `.jpg`, `.jpeg`, `.png`, and `.webp`. Put image files directly in these folders; no filename list needs to be edited. The application avoids repeating an adult/baby image pair until all available pairs have been used.
- The researcher area provides an overview of stored data, participant and session details, descriptive summaries, trial filtering, and CSV export.
- Experiment results are stored locally in SQLite. The researcher area can permanently clear all research records; use that control carefully.

## Technology Stack

- **Next.js 16** for the web application and server API routes.
- **React 19** for the user interfaces.
- **TypeScript 5** for application code and types.
- **SQLite**, accessed through `better-sqlite3`, for participant, session, and trial records.
- **Node.js and npm** to install dependencies and run the application.
- **ESLint** for the project's lint command.

This version does not require PsychoPy or Python. It does not require a separately installed database server; the application uses a local SQLite file.

## Requirements

- **Node.js LTS**, which includes npm. Download the Windows installer from [nodejs.org](https://nodejs.org/).
- **Git for Windows** only if you need Git to download or update the project. It is not needed to run a project folder you already have. PowerShell, Command Prompt, and the VS Code terminal can all run the commands below; Git Bash is not required.

After installing Node.js (and Git, if you plan to use it), open PowerShell or the VS Code terminal and check the installations:

```powershell
node --version
npm --version
git --version
```

The Git command is optional when Git is not installed.

## Set Up the Image Datasets

1. Open the project folder in File Explorer or VS Code.
2. Put adult images in `public/stimuli/adults/`.
3. Put baby images in `public/stimuli/babies/`.
4. Use `.jpg`, `.jpeg`, `.png`, or `.webp` files. Place the files directly in the correct folder, not in a nested subfolder.
5. Make sure each folder contains at least one supported image. If either folder has no supported images, the application will show an error and will not start a participant session.

The existing test images in `public/test-stimuli/` are separate and are not used as the real datasets.

## Run the Application on Windows

1. In VS Code, choose **File > Open Folder** and open `Maternal-Visual-Attention_nonPsychoPy`.
2. Open a terminal using **Terminal > New Terminal**. Confirm that the terminal is in the project folder, the one containing `package.json`.
3. Install the project dependencies:

	```powershell
	npm install
	```

4. Start the development application:

	```powershell
	npm run dev
	```

5. Open the localhost address printed in the terminal. It is usually [http://localhost:3000](http://localhost:3000). If that port is already in use, Next.js may print a different address; use the address shown in your terminal.
6. To stop the development server, return to the terminal and press **Ctrl+C**.

## Use the Application

- **Participant experiment:** Open the main localhost address, enter a participant ID, and select **Start**. Read the instructions and select **Begin experiment**. The participant then completes 20 trials.
- **Researcher overview:** Open `/researcher` after the development server is running. The overview shows database totals and a link to export all trial data as CSV.
- **Participants and sessions:** Open `/researcher/participants` to find participant records, then select a participant or session to inspect details. Session pages include trial records and descriptive statistics, with an option to export that session as CSV.

The researcher pages display descriptive summaries only and do not provide scientific interpretation. The participant page and researcher pages are part of the same local application; the repository does not document account login or access controls.

## Data Storage

By default, participant IDs, sessions, and trial results are stored in `data/research.db`. The database is created by the application when needed. Image files stay in the `public/stimuli/` folders and are not stored in SQLite. The database location can be changed with the `MVA_DATABASE_PATH` environment variable.
