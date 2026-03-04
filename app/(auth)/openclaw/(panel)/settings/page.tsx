"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { toast } from "react-toastify";
import {
  User, AlertTriangle, Mail, Save, Shield, Trash2,
} from "lucide-react";

type TabType = "profile" | "danger";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Danger zone state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load user data
  useEffect(() => {
    if (session?.user?.name) {
      setDisplayName(session.user.name);
    }
  }, [session]);

  // Save profile
  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      await updateSession({ user: { name: displayName.trim() } });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }

      toast.success("Account deleted successfully");
      setTimeout(() => signOut({ callbackUrl: "/" }), 1500);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete account"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "danger", label: "Danger Zone", icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-gray-900 text-[24px] font-bold">Settings</h1>
          <p className="text-gray-400 text-[14px] mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200/80">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-t-lg transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-gray-900 border border-gray-200/80 border-b-white -mb-px shadow-sm"
                : tab.id === "danger"
                  ? "text-gray-400 hover:text-red-500 hover:bg-red-50/50"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-100/50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-8 shadow-sm">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-50 to-purple-50 border border-orange-200/60 flex items-center justify-center">
              <User className="w-4.5 h-4.5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-gray-900 text-[16px] font-semibold">Profile Information</h2>
              <p className="text-gray-400 text-[12px]">Update your personal details</p>
            </div>
          </div>

          <div className="space-y-6 max-w-lg">
            {/* Display Name */}
            <div>
              <label className="block text-gray-500 text-[13px] font-medium mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isSaving}
                placeholder="Enter your display name"
                className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 text-[14px] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-gray-500 text-[13px] font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={session?.user?.email || ""}
                  disabled
                  className="w-full px-4 py-2.5 pr-10 bg-gray-50/80 border border-gray-200 rounded-xl text-gray-400 text-[14px] cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Mail className="w-4 h-4 text-gray-300" />
                </div>
              </div>
              <p className="text-gray-300 text-[12px] mt-1.5">
                Email cannot be changed
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={
                  isSaving ||
                  !displayName.trim() ||
                  displayName.trim() === session?.user?.name
                }
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                style={{
                  background: isSaving
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #f97316 0%, #a855f7 50%, #3b82f6 100%)",
                  boxShadow: isSaving
                    ? "none"
                    : "0 2px 10px rgba(249,115,22,0.25), 0 2px 6px rgba(168,85,247,0.15)",
                }}
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "danger" && (
        <div className="rounded-2xl border border-red-200/80 bg-red-50/30 backdrop-blur-xl p-8 shadow-sm">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200/60 flex items-center justify-center">
              <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
            </div>
            <div>
              <h2 className="text-red-600 text-[16px] font-semibold">Delete Account</h2>
              <p className="text-gray-400 text-[12px]">Permanently remove your account and data</p>
            </div>
          </div>

          <p className="text-gray-500 text-[13px] mb-6 leading-relaxed max-w-lg">
            Permanently delete your account and all associated data. This
            action cannot be undone. All your projects, employees, chats, and
            workspace data will be permanently removed.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[13px] font-semibold transition-all duration-200 active:scale-[0.98] shadow-sm shadow-red-200/50"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          ) : (
            <div className="space-y-4 p-5 bg-white/80 border border-red-200/80 rounded-xl max-w-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                <p className="text-red-600 text-[13px] font-semibold">
                  Are you sure? This action is irreversible.
                </p>
              </div>
              <p className="text-gray-500 text-[13px]">
                Type{" "}
                <span className="font-mono font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                  DELETE
                </span>{" "}
                to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-4 py-2.5 bg-gray-50/80 border border-red-200 rounded-xl text-gray-900 text-[14px] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all"
              />
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmText !== "DELETE"}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[13px] font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm shadow-red-200/50"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeleting ? "Deleting..." : "Permanently Delete"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                  }}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-[13px] font-medium transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}


