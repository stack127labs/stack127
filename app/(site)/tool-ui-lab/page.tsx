import { notFound } from "next/navigation";
import { ToolUiLab } from "./tool-ui-lab";

export default function ToolUiLabPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return <ToolUiLab />;
}
