# Emma

Independent coaching plugin source for teenage beginner English learners. **0.1.1 preview package; child-account installation, native Voice and Drive save are not yet verified.** No Sites server or old hosted-coach tools. The original project and its records remain preserved.

Emma follows school puzzles, hobbies and curiosity in approachable English, welcomes Chinese when stuck, gently recasts without echo drills, and uses short verified readings/videos or labelled original passages. “Hi Emma,” “Start English learning today,” “Start today” and “English today” are discovery cues, not guaranteed global Voice commands. The approved fictional anime portrait is included unchanged; it does not select a spoken voice.

- [Installation and one-prompt bootstrap](docs/installation.md)
- [Automatic updates and rollback](docs/updates.md)
- [Architecture, Drive archive and local dashboard](docs/architecture.md)
- [Canonical split implementation plan](docs/split-plan.md)
- [Change record](docs/changes/CR-0001-extraction.md)

Run `node --test tests/*.test.mjs`, `node scripts/verify.mjs`, and `node scripts/package.mjs`. There are no Node package dependencies. Package archive contains only `plugin/` contents, never configuration or learner data.

The new Drive root is runtime configuration supplied by the parent, not committed here. Each child connects their own Google account; directory/repo access grants neither Drive permission nor ChatGPT eligibility. Root sharing may allow siblings to read each other's files. The parent's separate **[Emma Dashboard](https://github.com/heroyuer/Emma-dashboard)** runs locally and imports when the laptop is awake, after parent-owned Drive authentication is configured. A local process cannot borrow a ChatGPT connector token.
