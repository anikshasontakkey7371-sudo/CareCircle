"use client";

import React, { useState } from "react";
import { KeyRound, Copy, Check, RefreshCw, Shield, Users, Mail } from "lucide-react";
import { CareCircle } from "@/types";

interface PasscodeManagerProps {
  circle: CareCircle;
  onResetPasscode: () => Promise<string | null>;
  onInviteMember: (email: string, relationship: string) => Promise<boolean>;
}

export function PasscodeManager({
  circle,
  onResetPasscode,
  onInviteMember,
}: PasscodeManagerProps) {
  const [copied, setCopied] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [activePin, setActivePin] = useState("482915"); // Initial demo/active PIN
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRelation, setInviteRelation] = useState("family");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const handleCopyPin = async () => {
    try {
      await navigator.clipboard.writeText(activePin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handleReset = async () => {
    if (!window.confirm("Generate a new 6-digit access code for this Care Circle?")) {
      return;
    }
    setResetting(true);
    try {
      const newPin = await onResetPasscode();
      if (newPin) setActivePin(newPin);
    } finally {
      setResetting(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || inviting) return;
    setInviting(true);
    try {
      const success = await onInviteMember(inviteEmail, inviteRelation);
      if (success) {
        setInviteSuccess(true);
        setInviteEmail("");
        setTimeout(() => setInviteSuccess(false), 4000);
      }
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 6-Digit Senior Passcode Card */}
      <section
        aria-label="Senior Passcode Access"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-parchment-300 shadow-warm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-terracotta-50 border border-terracotta-200 text-terracotta-600 flex items-center justify-center shrink-0">
              <KeyRound className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
                Senior Access Passcode
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-charcoal-800">
                Memorable 6-digit code for {circle.elderlyName} to sign in without passwords
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={resetting}
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-charcoal-900 font-bold text-sm transition-colors self-start sm:self-center"
          >
            <RefreshCw className={`w-4 h-4 ${resetting ? "animate-spin" : ""}`} aria-hidden="true" />
            <span>Generate New PIN</span>
          </button>
        </div>

        {/* PIN Display & Copy */}
        <div className="p-6 rounded-2xl bg-parchment-50 border border-parchment-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-800 block mb-1">
              Active Circle Code
            </span>
            <div className="flex items-center gap-2">
              {activePin.split("").map((digit, i) => (
                <span
                  key={i}
                  className="w-11 h-14 rounded-xl bg-white border-2 border-terracotta-300 font-black text-3xl text-charcoal-900 flex items-center justify-center shadow-sm"
                >
                  {digit}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyPin}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-extrabold text-sm transition-colors shadow-md btn-tactile"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-white" aria-hidden="true" />
                <span>Code Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" aria-hidden="true" />
                <span>Copy 6-Digit PIN</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Circle Members & Consent Management */}
      <section
        aria-label="Care Circle Members and Permissions"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-parchment-300 shadow-warm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-sage-50 border border-sage-200 text-sage-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
              Authorized Care Circle Members
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-charcoal-800">
              Consent-based access control and notifications for {circle.elderlyName}
            </p>
          </div>
        </div>

        {/* Existing Members List */}
        <div className="space-y-3 mb-8">
          {circle.members.map((member) => (
            <div
              key={member.userId}
              className="p-4 rounded-2xl bg-parchment-50 border border-parchment-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-charcoal-900 text-base">
                    {member.displayName}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 border border-sage-200">
                    {member.relationship.replace("_", " ")}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-parchment-300 text-charcoal-800">
                    {member.status}
                  </span>
                </div>
                <div className="text-xs text-charcoal-800 mt-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-charcoal-800" aria-hidden="true" />
                  <span>{member.email}</span>
                </div>
              </div>

              {/* Scoped Permissions Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {member.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-parchment-300 text-charcoal-800"
                  >
                    {perm.replace("_", " ")}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Invite New Member Form */}
        <div className="p-6 rounded-2xl bg-sage-50/60 border border-sage-200">
          <h3 className="text-lg font-black text-charcoal-900 mb-2">
            Invite Family Member or Nurse
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-charcoal-800 mb-4">
            Authorized members can view adherence, appointments, and receive missed-dose alerts.
          </p>

          <form onSubmit={handleInviteSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              placeholder="family.member@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-parchment-300 bg-white font-medium text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
            <select
              value={inviteRelation}
              onChange={(e) => setInviteRelation(e.target.value)}
              className="px-4 py-3 rounded-xl border border-parchment-300 bg-white font-bold text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              <option value="family">Family Member</option>
              <option value="nurse">Nurse / Aide</option>
              <option value="doctor">Attending Physician</option>
            </select>
            <button
              type="submit"
              disabled={inviting}
              className="px-6 py-3 rounded-xl bg-sage-700 hover:bg-sage-800 text-white font-extrabold text-sm transition-colors shadow-md btn-tactile"
            >
              {inviting ? "Sending Invite..." : "Send Invitation"}
            </button>
          </form>

          {inviteSuccess && (
            <p className="text-xs font-bold text-sage-800 mt-3 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-sage-700" aria-hidden="true" />
              Invitation successfully recorded and sent to caregiver email!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
