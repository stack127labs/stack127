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

### Search intent and promise

Primary query: `chmod calculator`. Supporting intent includes `chmod 755 meaning`, octal to rwx conversion, building a numeric mode, and understanding special letters.

Title: `Chmod calculator`

Metadata direction: convert octal modes or permission checkboxes into rwx notation and a chmod command example without changing files.

### Useful guidance

- Explain the two input methods and that symbolic expressions are not accepted.
- Use one configuration-file task to explain choosing bits, calculating, reading the answer, and checking the real target with `ls -ld`.
- Explain canonical four-digit modes, owner/group/others order, and 4/2/1 arithmetic.
- Use a table for read, write, and execute meaning on regular files and directories.
- Use a table for setuid, setgid, sticky, and lowercase versus uppercase display letters.
- Explain that ownership, ACLs, mount options, privileges, and object type can change effective access.
- Explain that umask affects creation rather than retroactively changing a file.
- Link to `/self-hosting-for-beginners` and `/self-host-apps` only when they provide a useful next step.

Keep the live calculator more prominent than the article. Do not add a common-modes table, recursive repair guide, symbolic parser tutorial, or FAQ by default.
