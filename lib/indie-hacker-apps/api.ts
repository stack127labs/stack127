import { appDirectoryEdgeTag } from "./directories";

/** Cache-Tag for a directory's JSON routes: purged with the directory page by its family tag. */
export const appDirectoryCacheTags = (slug: string) =>
  `stack127-public,page:${slug},page:api:app-directories:${slug},${appDirectoryEdgeTag(slug)}`;
