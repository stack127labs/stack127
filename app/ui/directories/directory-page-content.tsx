import { Fragment } from "react";
import { directoryTitleParts } from "@/lib/directory-page-content";

export function DirectoryPageTitle({ title }: { title: string }) {
  return directoryTitleParts(title).map((part, index) => part.marked
    ? <mark key={index}>{part.text}</mark>
    : <Fragment key={index}>{part.text}</Fragment>);
}
