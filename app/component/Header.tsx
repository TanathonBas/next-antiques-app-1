'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, LogOut } from 'lucide-react';
import { supabase } from "@/lib/supabaseclinet";
import { User } from "@supabase/supabase-js";

interface UserProfile {
    firstName: string;
    lastName: string;
    user_image_url: string | null;
}

export default function Header() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const loadSession = async () => {
            const { data } = await supabase.auth.getSession();
            setUser(data.session?.user ?? null);
        };

        loadSession();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) {
                setProfile(null);
                return;
            }

            setIsLoadingProfile(true);
            const { data, error } = await supabase
                .from("user_tb")
                .select("firstName,lastName,user_image_url")
                .eq("id", user.id)
                .maybeSingle();

            if (error) {
                console.error("Failed to load profile:", error);
                setProfile(null);
            } else if (data) {
                setProfile(data as UserProfile);
            } else {
                setProfile(null);
            }
            setIsLoadingProfile(false);
        };

        fetchProfile();
    }, [user?.id]);

    const profileName = profile
        ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "ผู้ใช้งาน"
        : user?.email;
    const profileImage =
        profile?.user_image_url || "https://placehold.co/64x64/8a4f1a/ffffff?text=U";

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error('Error signing out:', error);
                alert('เกิดข้อผิดพลาดในการออกจากระบบ');
            } else {
                // Clear local storage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('cart_items');
                    localStorage.removeItem('order_items');
                    localStorage.removeItem('order_history');
                }
                router.push('/allproduct');
                router.refresh();
            }
        } catch (err: any) {
            console.error('Error during logout:', err);
            alert('เกิดข้อผิดพลาดในการออกจากระบบ');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <header className="bg-amber-900 text-white shadow-md sticky top-0 z-10">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* ส่วนด้านซ้าย โลโก้ และ เมนู */}
                <div className="flex items-center space-x-8">
                    {/* โลโก้ */}
                    <a href="/allproduct" className="flex items-center space-x-2">
                        <Store size={28} />
                        <span className="text-xl font-bold">ของเก่าเล่าเรื่อง</span>
                    </a>
                    {/* เมนู */}
                    <ul className="hidden md:flex items-center space-x-6">
                        <li>
                            <a href="/aboutus" className="hover:text-yellow-300 transition-colors">เกี่ยวกับเรา</a>
                        </li>
                        <li>
                            <a href="/history" className="hover:text-yellow-300 transition-colors font-semibold">ประวัติการสั่งซื้อ</a>
                        </li>
                    </ul>
                </div>
                {/* ส่วนด้านขวา */}
                {user ? (
                    <div className="flex items-center space-x-4">
                        <img
                            src={profileImage}
                            alt="โปรไฟล์"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold">
                                {isLoadingProfile ? "กำลังโหลด..." : profileName}
                            </span>
                            <a
                                href={`/profile/${user.id}`}
                                className="text-xs text-amber-200 underline hover:text-white transition-colors"
                            >
                                ดูโปรไฟล์
                            </a>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="bg-white text-amber-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            <LogOut size={16} />
                            <span>{isLoggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-4">
                        <a href="/login" className="hover:text-yellow-300 transition-colors text-sm">Sign In</a>
                        <a
                            href="/register"
                            className="bg-white text-amber-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                            Sign Up
                        </a>
                    </div>
                )}
            </nav>
        </header>
    );
}