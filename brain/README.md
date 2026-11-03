# Open the project brain

In Obsidian's vault switcher, choose **Open folder as vault** and select this
repository's `brain/` folder, not the repository root. Open [[Home]] first.
This keeps application dependencies and source trees outside the vault's index.

## Optional native setup

Only an empty `.obsidian/app.json` is preconfigured. There are no community plugins,
sync connections, account settings, or device-specific workspace layouts.

In **Settings → Core plugins**, enable **Templates** and **Daily notes** if needed:

1. In **Templates**, set the template folder to `Templates`.
2. In **Daily notes**, set date format to `YYYY-MM-DD`, location to `Daily`,
   and template to `Templates/Daily`.
3. Use **Open today's daily note** to create a dated note with the template.
   For decisions/features, create a suitably named note in its destination folder
   and run **Templates: Insert template**.

The templates use native `{{title}}` and quoted `{{date:YYYY-MM-DD}}` values.
Open them here: [[Templates/Daily]], [[Templates/Decision]], and [[Templates/Feature]].
Without that optional UI setup, all seeded notes and links still work; new-note
creation and template insertion are manual. No command or task runs automatically.

## Keep sources authoritative

Internal wikilinks stay inside this vault. Ordinary relative Markdown links open
source files outside it; those files are not copied into Obsidian. OS/editor handling
of external source files can vary. Use the repository directly if a link cannot open.

Notes are a knowledge snapshot, not live code or factory state. Update evidence and
verification dates deliberately. Keep secrets and personal account data out of notes;
ignored layouts/caches are not a substitute for reviewing what you commit.

Official guides: [vaults](https://obsidian.md/help/vault),
[links](https://obsidian.md/help/links),
[Daily notes](https://obsidian.md/help/plugins/daily-notes), and
[Templates](https://obsidian.md/help/plugins/templates).
