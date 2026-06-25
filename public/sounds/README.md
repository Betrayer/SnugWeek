# Sound assets

Optional sampled sounds. When a file is missing the app falls back to a
synthesized tone, so the build never fails on absent assets.

Expected files:

- `flip.webm` / `flip.mp3` — week page turn (falls back to a synth swoosh)
- `pencil-1.webm` / `pencil-1.mp3` — task completion (falls back to a synth scratch)
- `pencil-2.webm` / `pencil-2.mp3` — task completion
- `pencil-3.webm` / `pencil-3.mp3` — task completion

A random pencil sample plays each time a task is completed.
