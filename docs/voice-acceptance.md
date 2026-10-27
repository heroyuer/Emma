# Native Voice acceptance for 0.2.4

Run this on a fresh parent test chat with the candidate explicitly selected before any child rollout. Use synthetic conversation and the parent-test profile. Do not copy learner records into source control. A local unit test cannot establish these results.

1. Start with Hi Emma. Confirm the actual loaded version is 0.2.4, local session ID exists if execution is available, and host_surface/instruction_loading/transcript_delivery reflect actual observations. Record unavailable capabilities as unknown. Confirm the actual parent instruction revision separately.
2. Discuss one game decision. After one recast, offer a clear short answer. Emma should follow its meaning rather than demand another full-sentence repeat.
3. Say What is next? Emma should lead into a fresh idea or activity. A puzzle-design discussion should include useful context and one doable learner contribution.
4. Pause in the middle of a thought, then finish it. Check the actual audio experience for premature feedback; fragmented text alone cannot establish an interruption.
5. End the test. Check that both actual speaker streams available to the host appear in order, the closing tail is retained once, and any unavailable words are labelled partial rather than reconstructed.
6. Inspect the evidence-based summary and quality report. A missing summary or missing speaker must stay visibly limited. Verify uploaded bytes and receipt separately with the connected tools. Storage verification must not clear quality warnings.
7. Compare startup, during-lesson and final capture evidence. If the host provides learner-only text or does not delegate turns, retain that limitation and do not mark Voice accepted or promote stable. The next decision is whether the chosen host can supply the needed instruction context and both speaker streams; more skill text cannot guarantee this.

Record the observed host, candidate commit, loaded version, capture limits and pass/fail outcomes in the release acceptance record without private transcript or account identifiers. Existing child installations are not changed by this source branch.
