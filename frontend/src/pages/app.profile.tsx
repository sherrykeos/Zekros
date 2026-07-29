import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState, useEffect } from "react";
import {
  Trophy,
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  UserPlus,
  Calendar,
  Sparkles,
  Pencil,
  Crown,
  Play,
  History as HistoryIcon,
  Lock,
  X,
  Check,
} from "lucide-react";
import {
  EmptyState,
  GlassPanel,
  SectionHeader,
  StatCard,
} from "@/components/app/primitives";
import { RequireAuth } from "@/components/auth/require-auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMatchList } from "@/hooks/match";
import type { MatchHistoryItem } from "@/services/api/matchService";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { PRESET_AVATARS } from "@/lib/avatar-presets";
import { FormField, TextInput, PrimaryButton } from "@/components/auth/auth-shell";
import { authApi } from "@/api/auth.api";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [{ title: "Profile - ZEKROS" }],
  }),
  component: ProfileRoute,
});

function ProfileRoute() {
  return (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  );
}

function initials(name?: string | null) {
  if (!name) return "ZK";

  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ZK"
  );
}

function formatDate(value?: string) {
  if (!value) return "Account active";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function ProfilePage() {
  const { data: user } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  const googleAvatar = user ? localStorage.getItem(`google_avatar_${user.id}`) : null;

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setSelectedAvatar(user.avatar || "");
    }
  }, [user, isEditing]);

  if (!user) return null;

  const handleSaveProfile = () => {
    if (!username.trim()) return;

    updateProfile.mutate({
      username: username.trim(),
      email: email.trim(),
      avatar: selectedAvatar || undefined,
    }, {
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (!currentPassword || !newPassword) {
      setPwdError("All fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setPwdError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("Passwords do not match.");
      return;
    }

    setPwdLoading(true);
    try {
      const response = await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      if (response.success) {
        setPwdSuccess("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setShowPasswordChange(false), 2000);
      } else {
        setPwdError(response.message || "Failed to change password.");
      }
    } catch (err: any) {
      setPwdError(err.response?.data?.error?.message || err.message || "Failed to change password.");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <GlassPanel className="overflow-hidden p-6">
        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              key="view-profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap items-start gap-5"
            >
              <div className="relative grid size-20 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-white/30 to-white/5 font-display text-xl font-semibold ring-1 ring-white/15">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-full object-cover"
                  />
                ) : (
                  initials(user.username)
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-semibold tracking-tight">
                    {user.username}
                  </h1>
                  <Badge tone="solid">
                    {user.isEmailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {user.email}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5" /> Joined{" "}
                    {formatDate(user.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Crown className="size-3.5" /> Provider:{" "}
                    {user.provider ?? "LOCAL"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm hover:bg-white/[0.06] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Pencil className="size-3.5" /> Edit Profile
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="edit-profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  Edit Profile
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Column 1: Avatar Selector */}
                <div className="space-y-3">
                  <span className="text-xs font-medium text-foreground">
                    Choose Avatar
                  </span>

                  {/* Selected Preview */}
                  <div className="flex justify-center md:justify-start">
                    <div className="relative grid size-24 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-white/30 to-white/5 ring-2 ring-primary/40 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                      {selectedAvatar ? (
                        <img
                          src={selectedAvatar}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="size-full object-cover"
                        />
                      ) : (
                        initials(username || user.username)
                      )}
                    </div>
                  </div>

                  {/* Grid Selector */}
                  <div className="grid grid-cols-4 gap-2.5 pt-2">
                    {user.provider?.toUpperCase() === "GOOGLE" && googleAvatar && (
                      <button
                        type="button"
                        onClick={() => setSelectedAvatar(googleAvatar)}
                        className={`relative size-11 overflow-hidden rounded-full ring-2 transition-all hover:scale-105 ${
                          selectedAvatar === googleAvatar
                            ? "ring-primary scale-105 shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                            : "ring-white/10 opacity-70 hover:opacity-100"
                        }`}
                        title="Gmail Profile Photo"
                      >
                        <img
                          src={googleAvatar}
                          alt="Google"
                          referrerPolicy="no-referrer"
                          className="size-full object-cover"
                        />
                      </button>
                    )}

                    {PRESET_AVATARS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedAvatar(preset.dataUrl)}
                        className={`relative size-11 overflow-hidden rounded-full ring-2 transition-all hover:scale-105 ${
                          selectedAvatar === preset.dataUrl
                            ? "ring-primary scale-105 shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                            : "ring-white/10 opacity-70 hover:opacity-100"
                        }`}
                        title={preset.name}
                      >
                        <img
                          src={preset.dataUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Column 2: Account Details */}
                <div className="space-y-4 md:col-span-2">
                  <FormField label="Username">
                    <TextInput
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </FormField>

                  <FormField
                    label="Email Address"
                    hint={<span className="text-[10px] text-yellow-500 font-semibold uppercase tracking-wider">Mock Mode</span>}
                  >
                    <TextInput
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormField>

                  {updateProfile.errorMessage && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
                      {updateProfile.errorMessage}
                    </div>
                  )}

                  {/* Password section for LOCAL accounts */}
                  {user.provider?.toUpperCase() === "LOCAL" ? (
                    <div className="border-t border-white/10 pt-4 mt-2">
                      {!showPasswordChange ? (
                        <button
                          type="button"
                          onClick={() => setShowPasswordChange(true)}
                          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Lock className="size-3.5" /> Change Password
                        </button>
                      ) : (
                        <form onSubmit={handlePasswordChange} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground">
                              Change Password
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setShowPasswordChange(false);
                                setPwdError(null);
                                setPwdSuccess(null);
                              }}
                              className="text-[10px] text-muted-foreground hover:text-foreground"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <TextInput
                              type="password"
                              placeholder="Current Password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <div className="space-y-2">
                              <TextInput
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                              <TextInput
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                              />
                            </div>
                          </div>

                          {pwdError && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs text-destructive-foreground">
                              {pwdError}
                            </div>
                          )}

                          {pwdSuccess && (
                            <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs text-green-400 flex items-center gap-1.5">
                              <Check className="size-3.5" /> {pwdSuccess}
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={pwdLoading}
                            className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-4 text-xs font-semibold text-black transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                          >
                            {pwdLoading ? "Saving..." : "Update Password"}
                          </button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="border-t border-white/10 pt-4 mt-2">
                      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Lock className="size-3.5" /> Password changes managed by Google.
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <PrimaryButton
                      onClick={handleSaveProfile}
                      loading={updateProfile.isPending}
                      className="!w-auto !px-5 text-xs"
                    >
                      Save Changes
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPanel>

      <section>
        <SectionHeader
          title="Lifetime statistics"
          description="Your real gameplay metrics calculated from recorded match history."
        />
        <ProfileStats />
      </section>

      <section>
        <div className="flex items-center justify-between">
          <SectionHeader title="Recent matches" />
          <Link
            to="/app/history"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all history →
          </Link>
        </div>
        <ProfileRecentMatches />
      </section>

      <section>
        <SectionHeader title="Friends" />
        <EmptyState
          icon={UserPlus}
          title="No friends yet"
          description="Once the friends API is connected, friends and party invites appear here."
          action={
            <button className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-muted-foreground">
              Coming soon
            </button>
          }
        />
      </section>
    </div>
  );
}

function ProfileStats() {
  const { data: user } = useCurrentUser();
  const { data: response } = useMatchList(user?.id ? { userId: user.id, limit: 200 } : { limit: 100 });
  const matches: MatchHistoryItem[] = response?.data ?? [];

  const stats = useMemo(() => {
    const totalGames = matches.length;
    if (totalGames === 0) {
      return [
        { label: "Games Played", value: "0", hint: "all-time", icon: BarChart3 },
        { label: "Wins", value: "0", icon: Trophy },
        { label: "Losses", value: "0", icon: TrendingUp },
        { label: "Win Rate", value: "0%", icon: TrendingUp },
        { label: "Favorite Mode", value: "-", hint: "no games played", icon: Target },
        { label: "Longest Match", value: "-", icon: Clock },
        { label: "Avg. Match Time", value: "-", icon: Clock },
      ];
    }

    let wins = 0;
    let losses = 0;
    let totalDurationMs = 0;
    let maxDurationMs = 0;
    let durationCount = 0;

    const modeCounts: Record<string, number> = {};

    for (const m of matches) {
      // Game mode tracking
      const mode =
        m.gameMode === "PBOT"
          ? "Perfect Bot"
          : m.gameMode === "NBOT"
          ? "Smart Bot"
          : m.gameMode === "ONLINE"
          ? "Online"
          : "Local";
      modeCounts[mode] = (modeCounts[mode] ?? 0) + 1;

      // Win / loss tracking
      const userParticipant = m.participants?.find((p) => p.userId === user?.id);
      if (userParticipant) {
        if (userParticipant.isWinner) wins++;
        else if (m.result) losses++;
      } else {
        // Fallback if local/guest match
        if (m.result === "PLAYER_X") wins++;
        else if (m.result === "PLAYER_O") losses++;
      }

      // Duration tracking
      if (m.durationMs) {
        totalDurationMs += m.durationMs;
        durationCount++;
        if (m.durationMs > maxDurationMs) maxDurationMs = m.durationMs;
      }
    }

    const winRate = totalGames > 0 ? `${Math.round((wins / totalGames) * 100)}%` : "0%";

    let favMode = "-";
    let maxModeCount = 0;
    for (const [mode, count] of Object.entries(modeCounts)) {
      if (count > maxModeCount) {
        maxModeCount = count;
        favMode = mode;
      }
    }

    const formatMs = (ms: number) => {
      const sec = Math.round(ms / 1000);
      if (sec < 60) return `${sec}s`;
      const min = Math.floor(sec / 60);
      const remSec = sec % 60;
      return `${min}m ${remSec}s`;
    };

    const longest = maxDurationMs > 0 ? formatMs(maxDurationMs) : "-";
    const avgTime = durationCount > 0 ? formatMs(totalDurationMs / durationCount) : "-";

    return [
      { label: "Games Played", value: String(totalGames), hint: "all-time", icon: BarChart3 },
      { label: "Wins", value: String(wins), icon: Trophy },
      { label: "Losses", value: String(losses), icon: TrendingUp },
      { label: "Win Rate", value: winRate, icon: TrendingUp },
      { label: "Favorite Mode", value: favMode, icon: Target },
      { label: "Longest Match", value: longest, icon: Clock },
      { label: "Avg. Match Time", value: avgTime, icon: Clock },
    ];
  }, [matches, user?.id]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}

function Badge({
  children,
  tone = "soft",
}: {
  children: React.ReactNode;
  tone?: "soft" | "solid";
}) {
  return (
    <span
      className={
        tone === "solid"
          ? "rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-black"
          : "rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-muted-foreground"
      }
    >
      {children}
    </span>
  );
}

function ProfileRecentMatches() {
  const { data: user } = useCurrentUser();
  const { data: response, isLoading } = useMatchList(user?.id ? { userId: user.id, limit: 5 } : { limit: 5 });
  const matches: MatchHistoryItem[] = response?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((n) => (
          <GlassPanel key={n} className="h-20 animate-pulse p-4" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <EmptyState
        icon={HistoryIcon}
        title="No match history"
        description="Your recent matches will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((m) => {
        const playerX = m.participants?.find((p) => p.symbol === "X");
        const playerO = m.participants?.find((p) => p.symbol === "O");
        const nameX = playerX?.user?.displayName || playerX?.user?.username || playerX?.guestName || "X";
        const nameO = playerO?.user?.displayName || playerO?.user?.username || playerO?.guestName || "O";

        return (
          <GlassPanel key={m.id} className="flex items-center justify-between p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span>{m.gameMode}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{m.boardSize}×{m.boardSize}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {nameX} vs {nameO}
              </div>
            </div>
            <Link
              to="/app/replay/$id"
              params={{ id: m.id }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white hover:text-black transition-colors"
            >
              <Play className="size-3 fill-current" /> Replay
            </Link>
          </GlassPanel>
        );
      })}
    </div>
  );
}
