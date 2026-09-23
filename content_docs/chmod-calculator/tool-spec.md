# Chmod calculator

Route: `/chmod-calculator`

## Research

### User job

Convert a numeric Unix mode or a selected set of permission bits into a clear four-digit mode, `rwx` notation, class arithmetic, and a command example. The user needs to check the mode before adapting a command to a real path.

### Competitor patterns

Ten direct calculators were operated on 20 September 2026 after searches for the calculator, conversion job, symbolic and octal variants, special bits, umask mistakes, and common mode meanings.

| Competitor | Useful pattern | Gap or friction |
| --- | --- | --- |
| [TabUtils](https://www.tabutils.com/tools/chmod-calculator) | Grid, special bits, target, copies | Octal editing behaved inconsistently in the operated run |
| [Dev Kraken](https://devkraken.com/tools/chmod-calculator/) | Accessible grid and bidirectional fields | No target field or operated special-bit controls |
| [Internet Tool Wizard](https://www.internettoolwizard.com/tools/chmod-calculator/) | Filename, special bits, copy actions | Recursive output can encourage one mode for mixed trees |
| [DevToolbox](https://devtoolz.dev/tools/chmod-calc) | Useful preset breadth | Large navigation and no symbolic input |
| [HandyTools Hub](https://www.onlinehandytools.com/tools/chmod-calculator/) | Assignment notation output | Mobile page overflowed in the operated run |
| [PureUtil](https://www.pureutil.org/tools/chmod-calculator/) | Clear class summary and local-processing boundary | No special bits or filename editing |
| [clic.tools](https://clic.tools/en/tools/chmod-calculator/) | Fast basic lookup | No special bits or reverse symbolic input |
| [ETEAO](https://everytooleverywhereallatonce.com/en/tools/chmod-calculator/) | Special bits, filename, copies | Large site and consent UI around a small tool |
| [BeeForge](https://beeforge.dev/tools/chmod-calculator/) | Honest basic-rwx scope | No special bits or verified free-form parser |
| [FireLinux](https://www.firelinux.com/tools/chmod-calculator/) | Explicit apply, reset, command copy | Extra state transition and no operated special bits |

The common useful core is an octal field, permission grid, synchronized result, presets, and copyable output. Special bits and clear limits distinguish a trustworthy calculator. The tool should not add recursive commands, symbolic-expression parsing, filesystem access, or claims about effective access.

### User problems

- Broad `chmod -R 777` and `chmod -R +x` changes are hard to reverse. See [wrongly set 777](https://unix.stackexchange.com/questions/12998/wrongly-set-chmod-777-problems) and [recursive execute recovery](https://unix.stackexchange.com/questions/1323/i-accidentally-chmod-r-x-on-a-directory-how-do-i-restore-the-correct-permissi?noredirect=1).
- One mode across files and directories can remove directory search or add unsafe permissions. See [`chmod -R 644`](https://unix.stackexchange.com/questions/24662/chmod-r-644-documents).
- Beginners mix up absolute modes, symbolic changes, and umask. The page must separate conversion from file creation and effective access.

### Technical facts and sources

- [GNU chmod](https://man7.org/linux/man-pages/man1/chmod.1.html) accepts one to four octal digits. The leading digit represents setuid, setgid, and sticky. The remaining digits use read 4, write 2, and execute 1.
- [Linux chmod](https://man7.org/linux/man-pages/man2/chmod.2.html) defines the permission bits and explains directory execute as search.
- [Linux inode](https://man7.org/linux/man-pages/man7/inode.7.html) explains setgid behavior on directories and executable files and sticky-bit behavior on directories.
- [Linux umask](https://man7.org/linux/man-pages/man2/umask.2.html) applies to creation modes and can be affected by default ACLs. It is not a retroactive chmod calculation.
- [Linux ACL](https://man7.org/linux/man-pages/man5/acl.5.html) explains why mode bits alone do not prove effective access.
- [GNU coreutils](https://raw.githubusercontent.com/coreutils/coreutils/master/doc/coreutils.texi) documents the `s`, `S`, `t`, and `T` display forms.

No API, account, maintained dataset, background job, or paid service is needed.

## Product

### Promise and scope

The tool accepts one to four ASCII octal digits or twelve visible bit controls. It returns:

- a canonical four-digit mode;
- nine permission characters without the file-type prefix;
- owner, group, and others arithmetic;
- special-bit explanations when active;
- a fixed regular-file command example;
- copy actions for the mode and command.

Presets are examples, not recommendations. The tool does not inspect or change files, parse symbolic expressions such as `u+x`, calculate umask, edit ACLs, diagnose ownership, generate recursive repair commands, or claim effective access.

### Technical contract

- Trim outer whitespace. Accept only one to four characters in `0` through `7`.
- Preserve the raw draft while editing. Pad a valid value to four digits for calculation.
- The leading digit uses setuid 4, setgid 2, and sticky 1.
- Owner, group, and others use read 4, write 2, and execute 1.
- Setuid replaces owner execute with `s` when execute is present and `S` when absent.
- Setgid replaces group execute with `s` when execute is present and `S` when absent.
- Sticky replaces others execute with `t` when execute is present and `T` when absent.
- Invalid text clears stale results and disables bit editing until corrected or replaced with a preset.
- Every input change clears the committed result. Calculate commits the current valid draft.
- Reset returns to the initial `644` example with no result.
- Query parameters, storage, analytics, network requests, and filesystem calls never provide input or preserve state.
- Clipboard failure keeps the result and exposes selectable fallback text.

### Known examples

| Input | Canonical | Symbolic | Important point |
| --- | --- | --- | --- |
| `640` | `0640` | `rw-r-----` | Owner read and write, group read |
| `1777` | `1777` | `rwxrwxrwt` | Sticky plus all ordinary bits |
| `4640` | `4640` | `rwSr-----` | Setuid without owner execute uses uppercase `S` |
| `7777` | `7777` | `rwsrwsrwt` | All special and ordinary bits |
| `648` | invalid | no result | Digit 8 is not octal |

### Ownership

- Route: `app/(site)/(tools)/chmod-calculator/page.tsx`
- Engine: `app/(site)/(tools)/chmod-calculator/chmod-calculator-engine.ts`
- Component: `app/(site)/(tools)/chmod-calculator/chmod-calculator.tsx`
- Styles: `app/(site)/(tools)/chmod-calculator/chmod-calculator.module.css`
- Focused test: `tests/pages/chmod-calculator/chmod-calculator.test.mjs`
- Development content helper: `scripts/chmod-calculator/preview-local-page.mjs`
- Content: `public.stack127_tool_pages`

## Interface

### Flow

The question is: what does this permission mode mean, or which mode matches these bits?

The octal field and examples come first, followed by the owner, group, others, and special-bit controls. `Calculate permissions` is the only primary action. The lead answer states the canonical mode and symbolic string. Class arithmetic, special-bit notes, and the command example follow.

### Components and states

- Reuse the shared tool workbench, field, button, checkbox, copy action, status, and result patterns.
- Keep visible labels and native fieldset meaning for each permission class.
- Cover initial, valid draft, valid result, invalid draft, clipboard failure, calculation failure, reset, and long-value states.
- Do not add loading UI because calculation is local and synchronous.
- Show an invalid message beside the octal field once. Preserve the draft and provide a clear way to choose a valid example.
- Announce committed results, resets, and copy outcomes. Move focus to the result only after calculation.

### Responsive and accessible behavior

Permission groups can share a row on wide screens and stack below the available width. The page must not scroll horizontally. Tables and code may scroll inside their own containers. Long drafts and fallback text remain contained. Keyboard order follows the visible flow, focus remains visible, and each checkbox has a group and permission label.

## Content

### Search intent and metadata direction

Primary query: `chmod calculator`. Supporting intent includes `chmod 755 meaning`, octal to rwx conversion, building a numeric mode, and understanding special letters.

Title direction: `Chmod calculator`.

Description direction: convert octal modes or permission checkboxes into `rwx` notation and a `chmod` command example without changing files.

### Page promise

After using the page, the reader can translate a numeric mode or selected bits into the other form, understand the owner/group/others and special-bit parts, and adapt an example command to a real path. The page makes clear that this calculator only explains a mode; it does not inspect or change a file.

### Content completeness map

| Reader question | Where answered | What the writing must add |
| --- | --- | --- |
| What does `755` mean? | Lead result and supporting content | Owner `7`, group `5`, others `5`; `7 = 4 + 2 + 1`, `5 = 4 + 1`. Explain the leading zero in `0755`. |
| How do I choose or convert a mode? | Tool controls and short usage guide | Enter one to four octal digits or select the twelve bits, calculate, and read the result. Symbolic expressions such as `u+x` are outside this input. |
| What do read, write, and execute mean? | Supporting content | Separate regular-file meanings from directory meanings; directory execute allows search/access through the directory. |
| What do `s`, `S`, `t`, and `T` mean? | Special-bit result and supporting content | Connect each letter to setuid, setgid, or sticky; explain the relevant file or directory behavior and lowercase versus uppercase when execute is present or absent. |
| Did this change my files? | Introduction and usage guide | No. The calculation is local; the generated command is only an example with a placeholder path. |
| Why might actual access differ? | Limits and next step | Mode bits alone do not resolve ownership, ACLs, privileges, mount behavior, or target type. Check the real target. |
| Is this the same as umask? | Supporting content | No. Umask affects creation modes; this tool explains a mode and does not calculate umask. |

### Recommended outline and formats

Keep the calculator and its result above the supporting explanation. Draft the introduction and usage guide as short task guidance, then use these sections only if they add to what the live result shows:

1. **How to use the chmod calculator:** one configuration-file example, input choices, result reading, and adapting the example command.
2. **How chmod numbers work:** owner/group/others order, `4/2/1` arithmetic, and the optional leading special-bit digit.
3. **What permissions mean for files and directories:** a compact table comparing read, write, and execute.
4. **What the special letters mean:** a compact table for setuid, setgid, sticky, and lowercase/uppercase forms.
5. **Chmod, umask, and actual access:** the key distinction, limits, and next check.

No decorative figure is needed for the arithmetic already shown in the result. Do not add a common-modes table, recursive repair guide, symbolic parser tutorial, glossary, or FAQ by default.

### Concepts and result interpretation

- **Mode arithmetic:** `7 = 4` read `+ 2` write `+ 1` execute. In `755`, owner gets `7`; group and others get `5` (`4 + 1`). The displayed `0755` adds the zero special-bit digit; it does not change the ordinary permissions. Use GNU and Linux chmod sources in Research.
- **Directory execute:** it means search/access through a directory, not execution of that directory as a regular file. Read and write also have different directory effects; make the file/directory table precise. Use Linux chmod in Research.
- **Special-bit display:** `s` or `t` appears where the corresponding execute bit is present; `S` or `T` appears when it is absent. The `4640` example becomes `rwSr-----` because setuid is on while owner execute is off. The letter is a compact display of two facts, not a new permission class. Use GNU coreutils in Research.
- **Special-bit behavior:** on an executable file, setuid and setgid can affect the effective user or group ID during execution. On a directory, setgid makes newly created entries inherit the directory's group, while sticky restricts who can rename or delete entries. The tool cannot determine whether or how these effects apply to a particular path. Use Linux chmod and Linux inode in Research.
- **Canonical mode:** the normalized four-digit octal result, including the leading special-bit digit, even when the input had fewer digits. It is a representation of the selected bits, not a reading from disk.
- **Symbolic permissions:** the nine-character `rwx`-style result for owner, group, and others, with special-bit letters when relevant. It omits the file-type character that appears at the start of an `ls -l` listing.
- **Class arithmetic and special-bit notes:** explain the selected bit values and active special bits. Their presence describes the chosen mode, not whether a particular user can access a particular file.
- **Command example:** `chmod <mode> ./path/to/file` uses a fixed placeholder path. It is neither executed nor a recommendation for every file or directory; the reader must inspect the real target and adapt the path and mode.

### Usage, limits, and next step

Use a configuration-file task to connect the steps: choose the desired owner/group/others bits or enter the intended octal mode, calculate, compare the four-digit mode and nine-character display, then review the example command. If the octal input contains `8`, another non-octal character, or too many digits, explain the correction; the tool clears the stale result until the input is valid.

Do not claim the tool checks effective access, ownership, ACLs, mount options, privileges, or the current mode of a path. Do not imply that a preset is a security recommendation, that one mode fits a mixed directory tree, or that the example command should be run without checking its target. Do not suggest recursive repairs. Explain that umask concerns file creation, rather than a retroactive conversion of an existing mode.

Next step: check the actual target with `ls -ld <path>`, account for ownership or ACLs if access still differs, and replace the example path only after choosing the intended target and mode. Link to `/self-hosting-for-beginners` or `/self-host-apps` only when it helps the reader's next task.

### Source roles and links

- GNU chmod in Research controls octal syntax and the command example.
- Linux chmod controls permission-bit and directory-search semantics.
- Linux inode controls setgid behavior on directories and sticky-directory behavior.
- GNU coreutils controls the `s`, `S`, `t`, and `T` display explanation.
- Linux umask controls the file-creation distinction.
- Linux ACL controls the claim that mode bits alone do not prove effective access.

Use the verified URLs in Research as the external links; recheck them if the command semantics or cited behavior changes. The competitor review is dated 20 September 2026 and informs layout and scope, not technical permission claims.
