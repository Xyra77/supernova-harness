---
kind: upgrade-guide
description: "Creator mode replaces its four skills with one `snh-doc` skill, and the repository documentation skill becomes `snh-doc-writing`."
---

# `snh-doc` replaces the Creator mode skills

English | [中文](guide.zh.md)

## Change

Creator mode offered four skills from `@supernova-ai/snh-agent-preset`: `cordis-plugin-development`, `editing-cordis-compositions`, `cordis-composition-reference`, and `agent-experience`. It now offers one skill, `snh-doc`. Its former content is in files that `snh-doc` reads on demand, under `skills/snh-doc/references/` and `skills/snh-doc/templates/` of that package. The old skill names no longer appear in the skill catalog, and loading one by name fails.

In a SNH source checkout, the documentation-writing skill `.agents/skills/snh-doc` is now `.agents/skills/snh-doc-writing`, named `snh-doc-writing`.

This affects Creator mode users whose prompts, saved instructions, or own skills name an old skill, and compositions or scripts that read files at the old paths.

## Migration

1. Replace each old skill name in prompts, instructions, and skills with `snh-doc`; for the source checkout documentation skill, use `snh-doc-writing`.
2. Replace file paths under `@supernova-ai/snh-agent-preset/skills/` as follows:

   | Old path | New path |
   |---|---|
   | `cordis-plugin-development/SKILL.md` | `snh-doc/references/plugin-development.md` |
   | `cordis-plugin-development/references/<file>` | `snh-doc/references/<file>` |
   | `cordis-plugin-development/templates/<name>/` | `snh-doc/templates/<name>/` |
   | `editing-cordis-compositions/SKILL.md` | `snh-doc/references/compositions.md` |
   | `cordis-composition-reference/SKILL.md` | `snh-doc/references/composition-reference.md` |
   | `cordis-composition-reference/references/packages.md` | `snh-doc/references/packages.md` |
   | `agent-experience/SKILL.md` | `snh-doc/references/tool-design.md` |

3. A composition that sets `customSkillDirs` to the package's `skills` directory needs no change.
4. Rename or remove a skill named `snh-doc` in a project's `.snh/skills/` or `.agents/skills/`: project skills take precedence and would hide the packaged one. In a SNH source checkout, update the checkout to a revision that contains this change, which renames the repository skill.
5. Start a new Creator mode session with an installation or revision that contains this change, and confirm that the skill catalog lists `snh-doc` and none of the four skills this package shipped before.
