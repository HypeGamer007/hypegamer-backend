import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/empty-state/EmptyState";

describe("EmptyState", () => {
  it("renders title, body, and primary action", () => {
    render(
      <EmptyState
        analyticsId="test-empty"
        title="Nothing here yet"
        body="Add data to see results."
        primaryCta={{ label: "Get started", action: "start" }}
      />
    );
    expect(screen.getByRole("heading", { name: "Nothing here yet" })).toBeInTheDocument();
    expect(screen.getByText("Add data to see results.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get started" })).toBeInTheDocument();
  });
});
