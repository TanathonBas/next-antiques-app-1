"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseclinet";

interface FormData {
    email: string;
    password: string;
}

export default function Page() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (signInError) {
                throw new Error(signInError.message);
            }

            router.push("/allproduct");
        } catch (err: any) {
            setError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`flex min-h-screen items-center justify-center p-6 sm:p-24 transition-colors duration-1000`}>
            <div className="flex flex-col items-center w-full max-w-md p-8 bg-white bg-opacity-80 rounded-3xl shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-amber-900 tracking-tight mb-2">
                        ล็อกอินเข้าสู่ระบบ
                    </h1>
                    <p className="text-amber-600 text-sm">
                        กรอกชื่อผู้ใช้งานและรหัสผ่าน
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="w-full space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                            อีเมล์
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-full border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 p-3"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                            รหัสผ่าน
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-full border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 p-3"
                        />
                    </div>
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 mt-6 text-lg font-semibold text-white bg-amber-600 hover:bg-sky-600 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "กำลังเข้าสู่ระบบ..." : "ล็อกอิน"}
                    </button>
                </form>
                <div className="mt-8 text-sm">
                    <p className="text-gray-600">
                        ยังไม่มีบัญชีใช่ไหม?
                        <Link href="/register" className="font-semibold text-sm text-amber-600 hover:text-blue-800 transition.duration-150 ml-1">
                            ลงทะเบียนที่นี่
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}