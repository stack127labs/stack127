with published_page as (
  insert into public.stack127_pages (
    slug,
    label,
    meta_title,
    meta_description,
    page_family,
    is_published,
    published_at,
    updated_at,
    page_type,
    sitemap_priority
  )
  values (
    'chmod-calculator',
    'Chmod calculator',
    'Chmod calculator: octal and rwx permissions | stack127',
    'Convert octal modes or permission checkboxes into rwx notation and a chmod command example. Check owner, group, others, and special bits without changing files.',
    'tool',
    true,
    now(),
    now(),
    'WebApplication',
    0.50
  )
  on conflict (slug) do update set
    label = excluded.label,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    page_family = excluded.page_family,
    is_published = true,
    published_at = coalesce(public.stack127_pages.published_at, excluded.published_at),
    updated_at = excluded.updated_at,
    page_type = excluded.page_type,
    sitemap_priority = excluded.sitemap_priority
  returning id
)
insert into public.stack127_tool_pages (
  page_id,
  title,
  intro_markdown,
  usage_markdown,
  content_markdown,
  content_revision,
  tool_version,
  tool_version_updated_at
)
select
  published_page.id,
  'Chmod calculator',
  $stack127_chmod_intro$Check what a chmod mode means, or build one from the permissions you want. Convert octal digits and permission checkboxes into rwx notation and a command example. This calculator does not change your files.$stack127_chmod_intro$,
  $stack127_chmod_usage$## Use the chmod calculator

Enter a mode using one to four digits from `0` to `7`, or choose permissions with the checkboxes. For example, a configuration file might need read and write permission for its owner, read permission for its group, and no permissions for others. Select those bits, then choose Calculate permissions. The examples replace all your selections, including special bits, so treat them as starting points rather than recommendations.

The answer shows four octal digits, including the leading special-bit digit. Its nine permission characters omit the file-type character that appears at the start of an `ls -l` listing. The table shows how each class digit adds up; a zero means no permissions are selected for that class.

Editing clears the previous answer until you calculate again. If the permission boxes are disabled, correct the numeric input or choose an example. Symbolic strings and expressions such as `u+x` are not accepted. Reset restores the initial `644` example. If copying fails, use the labeled text field that appears to copy the result manually.

Before using the command example, inspect your actual target with `ls -ld ./path/to/file`, replacing the placeholder and quoting the path if needed. Check the file type, owner, group, and displayed permissions. Inspect it again after any change you make. The [GNU ls manual](https://man7.org/linux/man-pages/man1/ls.1.html) documents this listing; it shows file information, not a complete verdict on who can access it.$stack127_chmod_usage$,
  $stack127_chmod_content$## What the permission digits mean

The last three digits describe the owner, group, and others, in that order. Each digit adds the selected permission values. Read plus write is `4 + 2`; selecting all three permissions adds up to `7`. The first digit records special bits, covered below. These weights follow the [GNU chmod definition](https://man7.org/linux/man-pages/man1/chmod.1.html).

The same bit has a different job on a directory. In particular, directory execute permission means search: reaching entries inside it. [Linux documents these permission bits](https://man7.org/linux/man-pages/man2/chmod.2.html), and the [GNU file permissions manual](https://raw.githubusercontent.com/coreutils/coreutils/master/doc/coreutils.texi) explains their file and directory meanings.

| Permission | Value | Regular file | Directory |
| --- | --- | --- | --- |
| Read | 4 | Read the file's contents. | List the names of entries. |
| Write | 2 | Change the file's contents. | Add, remove, or rename entries when search permission also allows it. |
| Execute | 1 | Run the file as a program, subject to its format and system rules. | Search the directory and access entries by name. |

Deleting a file depends on its containing directory's permissions and restrictions. Making the file read-only does not, by itself, prevent deletion. This is also why applying one mode recursively to both files and directories can break access.

## Special bits and uppercase letters

The leading digit adds the values of any enabled special bits. Their effects depend on the object and system policy; selecting a bit here only includes it in the calculated mode. The [Linux chmod manual](https://man7.org/linux/man-pages/man2/chmod.2.html) documents the identity and inheritance rules.

| Special bit | Leading-digit value | Meaning |
| --- | --- | --- |
| Setuid | 4 | On an executable file, requests execution with the file owner's effective user ID. System restrictions can prevent this. |
| Setgid | 2 | On an executable file, requests execution with the file group's effective group ID. On a directory, it makes new entries inherit the directory's group. |
| Sticky | 1 | On a directory, restricts deletion and renaming by unprivileged users to entries they own, unless they own the directory. |

In the symbolic output, `s` combines setuid or setgid with the corresponding execute bit. `S` means that special bit is set without execute. Likewise, `t` combines sticky with others execute, while `T` means sticky is set without it. These are the [GNU ls display conventions](https://raw.githubusercontent.com/coreutils/coreutils/master/doc/coreutils.texi). Uppercase does not mean the special bit is missing.

## Check the file, not just the number

A numeric mode describes a complete requested bit pattern. A symbolic expression such as `u+x` instead changes selected bits relative to an existing mode. This calculator converts the numeric pattern; it does not read the existing file or apply either kind of change.

The generated command uses a regular-file placeholder. GNU chmod can preserve a directory's existing setuid and setgid bits even when a four-digit numeric mode starts with zero. Do not assume that copying the example for a directory clears those bits. The [GNU chmod manual](https://man7.org/linux/man-pages/man1/chmod.1.html) explains this exception and the sticky directory restriction.

Actual access also depends on ownership, access control lists, mount options, and privileges. An [access control list](https://man7.org/linux/man-pages/man5/acl.5.html), or ACL, can describe permissions for named users and groups beyond the three classes shown here. A mode with the others write bit set deserves review, but the number alone cannot establish every user's access.

Umask is a separate part of file creation. It removes permissions from the mode requested when a file is created; a parent directory's default ACL can change how those permissions are determined. It does not retroactively change existing files, and this calculator does not apply it. See the [Linux umask manual](https://man7.org/linux/man-pages/man2/umask.2.html) when investigating creation defaults.

For the broader setup process, follow [self-hosting for beginners](/self-hosting-for-beginners). If you're choosing software to run, browse the [self-host apps directory](/self-host-apps).$stack127_chmod_content$,
  2,
  '1.0.0',
  now()
from published_page
on conflict (page_id) do update set
  title = excluded.title,
  intro_markdown = excluded.intro_markdown,
  usage_markdown = excluded.usage_markdown,
  content_markdown = excluded.content_markdown,
  content_revision = excluded.content_revision,
  tool_version = excluded.tool_version,
  tool_version_updated_at = case
    when public.stack127_tool_pages.tool_version is distinct from excluded.tool_version
      then excluded.tool_version_updated_at
    else public.stack127_tool_pages.tool_version_updated_at
  end;
