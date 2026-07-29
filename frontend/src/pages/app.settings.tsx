import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Palette,
  Volume2,
  Sparkles,
  Bell,
  Accessibility,
  Keyboard,
  Info,
  Rocket,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import type { ComponentType } from "react";
import { GlassPanel } from "@/components/app/primitives";
import { RequireAuth } from "@/components/auth/require-auth";
import { useDeleteAccount } from "@/hooks/useUpdateProfile";
import { useAudio } from "@/hooks/useAudio";
import { AnimatePresence, motion } from "motion/react";
import { TextInput } from "@/components/auth/auth-shell";
import { createPortal } from "react-dom";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings â€” ZEKROS" }] }),
  component: SettingsRoute,
});

function SettingsRoute() {
  return (
    <RequireAuth>
      <SettingsPage />
    </RequireAuth>
  );
}

function SettingsPage() {
  const deleteAccount = useDeleteAccount();
  const audio = useAudio();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tune ZEKROS to your preferences. Changes are local â€” sync arrives
          with accounts.
        </p>
      </div>

      <SettingsGroup title="Appearance" icon={Palette}>
        <Row label="Theme" hint="Dark is the canonical ZEKROS theme.">
          <Segmented options={["Dark", "System", "Light"]} value="Dark" />
        </Row>
        {/* <Row label="Accent" hint="Monochrome by design.">
          <Segmented options={["Bone", "Smoke", "Ash"]} value="Bone" />
        </Row> */}
        {/* <Row label="Density" hint="Compact UI for power users.">
          <Segmented options={["Comfortable", "Compact"]} value="Comfortable" />
        </Row> */}
      </SettingsGroup>

      <SettingsGroup title="Sound" icon={Volume2}>
        <Row label="Mute all" hint="Instantly silence all audio output.">
          <Toggle
            checked={audio.settings.muted}
            onChange={() => audio.toggleMute()}
          />
        </Row>
        <Row label="Master volume" hint="0 mutes everything.">
          <Slider
            value={audio.settings.masterVolume}
            onChange={(val) => audio.setMasterVolume(val)}
          />
        </Row>
        <Row label="SFX volume" hint="Game cues and UI clicks volume.">
          <Slider
            value={audio.settings.sfxVolume}
            onChange={(val) => audio.setSfxVolume(val)}
          />
        </Row>
        <Row label="Music volume" hint="Background music volume setting.">
          <Slider
            value={audio.settings.musicVolume}
            onChange={(val) => audio.setMusicVolume(val)}
          />
        </Row>
        <Row label="UI sounds" hint="Subtle clicks and navigation.">
          <Toggle
            checked={audio.settings.uiSoundsEnabled}
            onChange={(val) => audio.setUiSoundsEnabled(val)}
          />
        </Row>
        <Row label="Match cues" hint="Place, capture, victory.">
          <Toggle
            checked={audio.settings.matchCuesEnabled}
            onChange={(val) => audio.setMatchCuesEnabled(val)}
          />
        </Row>
      </SettingsGroup>

      {/* <SettingsGroup title="Animations" icon={Sparkles}>
        <Row label="Motion" hint="Disable to honor system reduce-motion.">
          <Segmented options={["Full", "Reduced", "Off"]} value="Full" />
        </Row>
        <Row label="Board transitions" hint="Animate placement and vanishes.">
          <Toggle defaultOn />
        </Row>
      </SettingsGroup> */}

      {/* <SettingsGroup title="Notifications" icon={Bell}>
        <Row label="In-app" hint="Banners for invites and results.">
          <Toggle defaultOn />
        </Row>
        <Row
          label="Match starts"
          hint="Notify when a multiplayer match starts."
        >
          <Toggle defaultOn />
        </Row>
        <Row label="Friend activity" hint="Coming soon â€” requires social.">
          <Toggle />
        </Row>
      </SettingsGroup> */}

      {/* <SettingsGroup title="Accessibility" icon={Accessibility}>
        <Row label="High contrast" hint="Stronger borders and focus rings.">
          <Toggle />
        </Row>
        <Row label="Larger text" hint="Bumps base type one step.">
          <Toggle />
        </Row>
        <Row label="Color-blind symbols" hint="Adds shape badges to X / O.">
          <Toggle defaultOn />
        </Row>
      </SettingsGroup> */}

      {/* <SettingsGroup title="Keyboard shortcuts" icon={Keyboard}>
        <Shortcut keys={["âŒ˜", "K"]} label="Open command bar" />
        <Shortcut keys={["âŒ˜", "/"]} label="Focus search" />
        <Shortcut keys={["G", "P"]} label="Go to Play" />
        <Shortcut keys={["G", "H"]} label="Go to History" />
        <Shortcut keys={["?"]} label="Show shortcuts" />
      </SettingsGroup> */}

      <SettingsGroup title="About ZEKROS" icon={Info}>
        <Row label="Build" hint="Current preview build.">
          <span className="font-mono text-xs text-muted-foreground">
            0.1.0-preview.3
          </span>
        </Row>
        <Row label="Engine" hint="Backend system in development.">
          <span className="font-mono text-xs text-muted-foreground">
            D3T Â· pre-alpha
          </span>
        </Row>
        <Row label="Company" hint="Crafted by ZEROTH Labs.">
          <span className="text-xs text-muted-foreground">ZEROTH Labs</span>
        </Row>
      </SettingsGroup>

      <SettingsGroup title="Future features" icon={Rocket}>
        <Row label="Friends & parties" hint="Coming with the social system.">
          <Badge>Soon</Badge>
        </Row>
        <Row label="Ranked seasons" hint="Season 01 ladder, MMR, rewards.">
          <Badge>Soon</Badge>
        </Row>
        <Row label="Replay analyzer" hint="Per-move heatmaps and reviews.">
          <Badge>Soon</Badge>
        </Row>
        <Row label="Tournaments" hint="Community-run brackets.">
          <Badge>Planned</Badge>
        </Row>
      </SettingsGroup>

      {/* Danger Zone: Delete Account */}
      <SettingsGroup title="Danger zone" icon={Trash2}>
        <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Delete Account
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Permanently delete your profile and matches data.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmText("");
                setShowDeleteModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 active:scale-[0.98] transition-all"
            >
              <Trash2 className="size-3.5" /> Delete Account
            </button>
          </div>
        </div>
      </SettingsGroup>

      {/* Delete Account Double Confirmation Modal */}
      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="glass-strong relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-red-500/20 p-6 shadow-[0_0_50px_rgba(239,68,68,0.1)]"
              >
                <div className="flex items-start gap-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-500">
                    <AlertTriangle className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display text-base font-bold text-foreground">
                      Delete Account Permanently?
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      This action is final. Your record, ratings, and statistics will be wiped forever. Opponent matches will preserve your historic games under "Deleted User".
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3.5">
                  <p className="text-[11px] text-muted-foreground">
                    To confirm, type <span className="font-mono text-red-400 font-bold select-none">"delete my account"</span> below:
                  </p>

                  <TextInput
                    type="text"
                    placeholder="Type verification phrase"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="!border-red-500/30 focus:!border-red-500/60 focus:!ring-red-500/10"
                  />

                  {deleteAccount.errorMessage && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
                      {deleteAccount.errorMessage}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(false)}
                      className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={deleteConfirmText.toLowerCase() !== "delete my account" || deleteAccount.isPending}
                      onClick={() => deleteAccount.mutate()}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-red-500 px-4 text-xs font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {deleteAccount.isPending ? "Deleting..." : "Permanently Delete"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function SettingsGroup({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 inline-flex items-center gap-2">
        <Icon className="size-3.5 text-muted-foreground" />
        <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </h3>
      </div>
      <GlassPanel className="divide-y divide-white/5">{children}</GlassPanel>
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Segmented({ options, value }: { options: string[]; value: string }) {
  const [v, setV] = useState(value);
  return (
    <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => setV(o)}
          className={`rounded-md px-3 py-1 text-xs transition-colors ${v === o ? "bg-white/[0.10] text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  defaultOn = false,
  checked,
  onChange,
}: {
  defaultOn?: boolean;
  checked?: boolean;
  onChange?: (val: boolean) => void;
}) {
  const [internalOn, setInternalOn] = useState(defaultOn);
  const isControlled = typeof checked === "boolean";
  const on = isControlled ? checked : internalOn;

  const handleClick = () => {
    const next = !on;
    if (!isControlled) setInternalOn(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={on}
      className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-white" : "bg-white/10"}`}
    >
      <span
        className={`absolute top-0.5 size-4 rounded-full transition-all ${on ? "left-[18px] bg-black" : "left-0.5 bg-white/80"}`}
      />
    </button>
  );
}

function Slider({
  defaultValue = 50,
  value,
  onChange,
}: {
  defaultValue?: number;
  value?: number;
  onChange?: (val: number) => void;
}) {
  const [internalV, setInternalV] = useState(defaultValue);
  const isControlled = typeof value === "number";
  const v = isControlled ? value : internalV;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    if (!isControlled) setInternalV(next);
    onChange?.(next);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={0}
        max={100}
        value={v}
        onChange={handleChange}
        className="w-32 accent-white"
      />
      <span className="w-8 text-right font-mono text-xs text-muted-foreground">
        {v}
      </span>
    </div>
  );
}

function Shortcut({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 p-4">
      <div className="text-sm">{label}</div>
      <div className="flex items-center gap-1">
        {keys.map((k, i) => (
          <kbd
            key={i}
            className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-muted-foreground"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
  );
}
