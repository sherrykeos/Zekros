import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/prep")({
  component: AppPrep,
});

function AppPrep() {
  return <div></div>;
}
