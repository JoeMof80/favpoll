"use client";

import { useState, useTransition } from "react";
import {
  setCharityBankAccount,
  revealCharityBankAccount,
  type CharityBankAccountView,
} from "@/lib/actions/bank-accounts";
import { BANK_ACCOUNT_PROBLEM_LABELS } from "@/lib/bank-account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";

// THE FIELD THAT MAKES A CHARITY PAYABLE.
//
// favpoll collects as agent and remits directly, so an agreed charity is
// still unpayable until this is filled in. It sits under Consent because
// that is the order: they agree, then they can be paid.
//
// THE RULE IN THE FORM IS THE CONTROL. Payment diversion fraud arrives as a
// plausible email saying the bank details have changed, and no amount of
// validation catches it — the defence is procedural, so it is written where
// the details get typed rather than in a document nobody reopens.
//
// The whole account number is never rendered until somebody presses Reveal,
// because an action's return value is serialised to the client and a list
// payload is the wrong place for it.

const SOURCE_PLACEHOLDER = "e.g. reply from finance@charity.org, 12 Oct";

export function CharityBankAccount({
  charityId,
  account,
}: {
  charityId: string;
  account: CharityBankAccountView | null;
}) {
  const [editing, setEditing] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);

  const [accountName, setAccountName] = useState(account?.accountName ?? "");
  const [sortCode, setSortCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [source, setSource] = useState("");

  function save() {
    setError(null);
    setProblems([]);
    startTransition(async () => {
      const result = await setCharityBankAccount(
        charityId,
        { accountName, sortCode, accountNumber },
        { source },
      );
      if (result.problems.length > 0) {
        setProblems(result.problems.map((p) => BANK_ACCOUNT_PROBLEM_LABELS[p]));
        return;
      }
      if (result.error) {
        setError(result.error);
        return;
      }
      setEditing(false);
      setSortCode("");
      setAccountNumber("");
      setSource("");
    });
  }

  function reveal() {
    startTransition(async () => {
      const result = await revealCharityBankAccount(charityId);
      if (result.error) setError(result.error);
      else setRevealed(result.accountNumber);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Bank account:</span>

        {account ? (
          <>
            <span className="text-sm text-foreground">
              {account.accountName} · {account.sortCode} ·{" "}
              {revealed ?? account.accountNumberMasked}
            </span>
            {account.verifiedAt ? (
              <StatusBadge tone="success">
                Verified{" "}
                {new Date(account.verifiedAt).toLocaleDateString("en-GB")}
              </StatusBadge>
            ) : (
              // Honest default: nobody has checked this belongs to them.
              <StatusBadge tone="warning">Not yet verified</StatusBadge>
            )}
            {!revealed && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isPending}
                onClick={reveal}
              >
                Reveal
              </Button>
            )}
          </>
        ) : (
          <StatusBadge tone="warning">
            None on file — cannot be paid
          </StatusBadge>
        )}

        {!editing && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => setEditing(true)}
          >
            {account ? "Change" : "Add"}
          </Button>
        )}
      </div>

      {account?.source && !editing && (
        <p className="text-xs text-muted-foreground">
          From {account.source} · entered by {account.enteredBy}
        </p>
      )}

      {editing && (
        <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
          {/* The control that validation cannot provide. */}
          <p className="text-xs leading-relaxed text-muted-foreground">
            Only take details from a thread <strong>favpoll started</strong>, to
            the address on the register. Never from an inbound &ldquo;our bank
            details have changed&rdquo; email — that is how the fraud arrives.
            To change details already on file, ring the charity on a number from
            the register or their own site, never one in the email.
          </p>

          <Input
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Name on the account (often not the display name)"
            disabled={isPending}
          />
          <div className="flex gap-2">
            <Input
              value={sortCode}
              onChange={(e) => setSortCode(e.target.value)}
              placeholder="Sort code"
              inputMode="numeric"
              disabled={isPending}
            />
            <Input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Account number"
              inputMode="numeric"
              disabled={isPending}
            />
          </div>
          <Input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder={SOURCE_PLACEHOLDER}
            disabled={isPending}
          />

          {problems.map((p) => (
            <p key={p} className="text-xs text-destructive">
              {p}
            </p>
          ))}
          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={save}
            >
              {isPending ? "…" : "Save"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                setEditing(false);
                setProblems([]);
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
