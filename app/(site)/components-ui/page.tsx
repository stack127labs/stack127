import { notFound } from "next/navigation";
import { ComponentGallery } from "./component-gallery";
import "@/app/ui/directories/directory.css";

export default function ComponentGalleryPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return <ComponentGallery />;
}
