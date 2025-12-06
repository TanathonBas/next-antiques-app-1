'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseclinet";

// Interfaces for type safety
interface FormData {
    firstName: string;
    lastName: string;
    address: string;
    email: string;
    password: string;
    gender: "male" | "female" | "other" | "";
    profilePic: File | null;
}

export default function Page() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        address: "",
        email: "",
        password: "",
        gender: "",
        profilePic: null,
    });

    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, gender: e.target.value as "male" | "female" | "other" }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFormData((prev) => ({ ...prev, profilePic: file }));
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // 1. สร้างผู้ใช้ใน Supabase Auth (เพื่อให้สามารถ login ได้)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) {
                throw new Error(authError.message);
            }

            if (!authData.user) {
                throw new Error("ไม่สามารถสร้างบัญชีผู้ใช้ได้");
            }

            let profilePicUrl: string | null = null;

            // 2. อัปโหลดรูปโปรไฟล์ไปยัง user_bk bucket (ถ้ามี)
            if (formData.profilePic) {
                const fileExt = formData.profilePic.name.split('.').pop();
                const fileName = `${authData.user.id}_${Date.now()}.${fileExt}`;
                const filePath = `profiles/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('user_bk')
                    .upload(filePath, formData.profilePic, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error("Error uploading profile picture:", uploadError);
                    // ไม่ throw error เพราะการอัปโหลดรูปไม่ใช่สิ่งที่สำคัญที่สุด
                } else {
                    // ดึง URL ของรูปภาพ
                    const { data: urlData } = supabase.storage
                        .from('user_bk')
                        .getPublicUrl(filePath);

                    if (urlData) {
                        profilePicUrl = urlData.publicUrl;
                    }
                }
            }

            // 3. บันทึกข้อมูลผู้ใช้ลงในตาราง user_tb
            const { error: dbError } = await supabase
                .from('user_tb')
                .insert({
                    id: authData.user.id,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    address: formData.address,
                    gender: formData.gender,
                    user_image_url: profilePicUrl,
                });

            if (dbError) {
                throw new Error(dbError.message);
            }

            setSuccess(true);

            // รอ 2 วินาทีแล้ว redirect ไปหน้า login
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err: any) {
            setError(err.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`flex min-h-screen items-center justify-center p-6 sm:p-24 transition-colors duration-1000`}>
            <div className="flex flex-col items-center w-full max-w-md p-8 bg-white bg-opacity-80 rounded-3xl shadow-2xl">
                <h1 className="text-4xl font-extrabold text-amber-900 tracking-tight mb-6">
                    ลงทะเบียนผู้ใช้
                </h1>
                <form onSubmit={handleSubmit} className="w-full space-y-6">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-900">
                            ชื่อ
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-full border-gray-500 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3"
                        />
                    </div>
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-900">
                            นามสกุล
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-full border-gray-500 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3"
                        />
                    </div>
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
                            className="mt-1 block w-full rounded-full border-gray-500 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3"
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
                            className="mt-1 block w-full rounded-full border-gray-500 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            เพศ
                        </label>
                        <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    required
                                    checked={formData.gender === "male"}
                                    onChange={handleGenderChange}
                                    className="form-radio h-5 w-5 text-emerald-600 rounded-full"
                                />
                                <span className="ml-2 text-gray-900">ชาย</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    required
                                    checked={formData.gender === "female"}
                                    onChange={handleGenderChange}
                                    className="form-radio h-5 w-5 text-emerald-600 rounded-full"
                                />
                                <span className="ml-2 text-gray-900">หญิง</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="other"
                                    required
                                    checked={formData.gender === "other"}
                                    onChange={handleGenderChange}
                                    className="form-radio h-5 w-5 text-emerald-600 rounded-full"
                                />
                                <span className="ml-2 text-gray-900">อื่น ๆ</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700">
                            รูปโปรไฟล์
                        </label>
                        <input
                            type="file"
                            name="profilePic"
                            id="profilePic"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mt-1 block w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                        />
                    </div>
                    {imagePreviewUrl && (
                        <div className="flex flex-col items-center mt-4">
                            <p className="text-gray-600 mb-2">พรีวิวรูปภาพ:</p>
                            <img
                                src={imagePreviewUrl}
                                alt="Image Preview"
                                className="w-32 h-32 object-cover rounded-full shadow-lg border-2 border-emerald-500"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-900">
                            ที่อยู่
                        </label>
                        <input
                            type="text"
                            name="address"
                            id="address"
                            required
                            value={formData.address}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-full border-gray-500 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3"
                        />
                    </div>
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                            สมัครสมาชิกสำเร็จ! กำลังนำคุณไปหน้าเข้าสู่ระบบ...
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 mt-6 text-lg font-semibold text-white bg-amber-600 hover:bg-blue-600 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
                    </button>
                </form>
                <div className="mt-8 text-sm">
                    <p className="text-gray-900">
                        มีบัญชีอยู่แล้ว?
                        <a href="/login" className="font-semibold text-amber-600 hover:text-sky-700 ml-1">
                            เข้าสู่ระบบที่นี่
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}