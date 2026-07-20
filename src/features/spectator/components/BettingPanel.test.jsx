import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BettingPanel } from "./BettingPanel";

const baseProps = {
  raceStatus: "CLOSED",
  selectionLabel: "Thunder Bolt · WIN",
  stake: 50_000,
  onStakeChange: vi.fn(),
  onConfirm: vi.fn(),
  submitting: false,
  estimatedPayoutPerUnit: 3.5,
  poolTotalStake: 1_000_000,
};

describe("BettingPanel — pool gating", () => {
  it("renders an enabled CONFIRM PREDICTION button when the race is CLOSED (locked) and a valid stake is set", () => {
    render(<BettingPanel {...baseProps} />);
    expect(
      screen.getByRole("button", { name: /confirm prediction/i }),
    ).toBeEnabled();
  });

  it('renders a "Betting closed" block and NO confirm button when the race has started', () => {
    render(<BettingPanel {...baseProps} raceStatus="RUNNING" />);
    expect(screen.getByText(/betting closed/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /confirm prediction/i }),
    ).toBeNull();
  });
});

describe("BettingPanel — VND + min-stake + live estimated odds", () => {
  it("labels the stake input in VND (not Tokens)", () => {
    render(<BettingPanel {...baseProps} />);
    expect(screen.getByText(/stake \(vnd\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/token/i)).toBeNull();
  });

  it("disables confirm and shows a minimum-stake message when the stake is below 10,000", () => {
    render(<BettingPanel {...baseProps} stake={5_000} />);
    expect(
      screen.getByRole("button", { name: /confirm prediction/i }),
    ).toBeDisabled();
    expect(screen.getByText(/minimum stake is/i)).toBeInTheDocument();
    // The message states the 10,000 VND floor.
    expect(screen.getByText(/10\.000/)).toBeInTheDocument();
  });

  it("enables confirm exactly at the 10,000 floor", () => {
    render(<BettingPanel {...baseProps} stake={10_000} />);
    expect(
      screen.getByRole("button", { name: /confirm prediction/i }),
    ).toBeEnabled();
    expect(screen.queryByText(/minimum stake is/i)).toBeNull();
  });

  it('renders live pool odds labeled "estimated" and no fixed-odds preview', () => {
    render(<BettingPanel {...baseProps} />);
    // Live estimated odds shown (3.5×), labeled Estimated.
    expect(screen.getByText(/3\.50×/)).toBeInTheDocument();
    expect(screen.getAllByText(/estimated/i).length).toBeGreaterThan(0);
    // Estimated return derives from the LIVE payout-per-unit (50,000 × 3.5 = 175,000), not a fixed odds preview.
    expect(screen.getByText(/175\.000/)).toBeInTheDocument();
  });

  it("shows a dash for odds/return when the pool has no live stake on the runner yet", () => {
    render(
      <BettingPanel
        {...baseProps}
        estimatedPayoutPerUnit={null}
        poolTotalStake={null}
      />,
    );
    // No numeric estimated return when there are no live odds.
    expect(screen.queryByText(/175\.000/)).toBeNull();
  });
});
