"use client";

import { useEffect, useState } from "react";
import ProfileSetup from "./ProfileSetup";
import Conversation from "./Conversation";
import type { Profile } from "@/lib/profile";

const STORAGE_KEY = "eikaiwa.profile";

export default function AppRoot() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setProfile(JSON.parse(raw));
    } catch {
      // localStorageが使えない場合は未設定として扱う
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveProfile = (p: Profile) => {
    setProfile(p);
    setIsEditing(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      // 保存に失敗しても操作は継続する
    }
  };

  if (!isLoaded) {
    return <main className="min-h-screen" />;
  }

  if (!profile || isEditing) {
    return (
      <ProfileSetup
        initial={profile?.ja}
        onComplete={saveProfile}
        onCancel={profile ? () => setIsEditing(false) : undefined}
      />
    );
  }

  return <Conversation profile={profile} onEditProfile={() => setIsEditing(true)} />;
}
