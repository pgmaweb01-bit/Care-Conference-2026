import { createFileRoute } from "@tanstack/react-router";
import { RegistrationsTable } from "./admin.attendees";

export const Route = createFileRoute("/admin/speakers")({
  component: () => <RegistrationsTable kind="speaker" />,
});
