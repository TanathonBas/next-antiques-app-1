"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseclinet";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Interfaces for type safety
interface ProfileData {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    gender: string;
    profileImage: File | null;
}

export default function Page() {
    const router = useRouter();
    
    // State for form data
    const [formData, setFormData] = useState<ProfileData>({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        gender: "male",
        profileImage: null,
    });
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
        "https://placehold.co/150x150/ffffff/000000?text=Profile"
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [user, setUser] = useState<SupabaseUser | null>(null);

    // Reference for the file input element
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ฟังก์ชันแปลง gender จาก database เป็นภาษาไทย
    const getGenderThai = (gender: string): string => {
        switch (gender) {
            case 'male':
                return 'ชาย';
            case 'female':
                return 'หญิง';
            case 'other':
                return 'อื่น ๆ';
            default:
                return gender;
        }
    };

    // ฟังก์ชันแปลง gender จากภาษาไทยเป็น database format
    const getGenderFromThai = (genderThai: string): string => {
        switch (genderThai) {
            case 'ชาย':
                return 'male';
            case 'หญิง':
                return 'female';
            case 'อื่น ๆ':
                return 'other';
            default:
                return genderThai;
        }
    };

    // ดึงข้อมูลโปรไฟล์เมื่อโหลดหน้า
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoadingProfile(true);
                setError(null);

                // ดึง session และ user
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) {
                    throw new Error(sessionError.message);
                }

                if (!sessionData.session?.user) {
                    router.push('/login');
                    return;
                }

                const currentUser = sessionData.session.user;
                setUser(currentUser);

                // ดึงข้อมูลโปรไฟล์จากตาราง user_tb
                const { data: profileData, error: profileError } = await supabase
                    .from('user_tb')
                    .select('*')
                    .eq('id', currentUser.id)
                    .maybeSingle();

                if (profileError) {
                    throw new Error(profileError.message);
                }

                if (!profileData) {
                    throw new Error('ไม่พบข้อมูลโปรไฟล์');
                }

                // Map ข้อมูลให้ตรงกับ form
                setFormData({
                    firstName: profileData.firstName || profileData.fristName || '',
                    lastName: profileData.lastName || '',
                    email: profileData.email || currentUser.email || '',
                    address: profileData.address || '',
                    gender: profileData.gender || 'male',
                    profileImage: null,
                });

                // ตั้งค่ารูปภาพ - แก้ไข URL ให้เป็น public URL
                if (profileData.user_image_url) {
                    let imageUrl = profileData.user_image_url;
                    
                    // ตรวจสอบว่า URL ถูกต้องหรือไม่
                    if (!imageUrl.includes('supabase.co') && !imageUrl.startsWith('http')) {
                        // ถ้าเป็น path แทน URL ให้สร้าง public URL
                        const { data: urlData } = supabase.storage
                            .from('user_bk')
                            .getPublicUrl(imageUrl);
                        if (urlData) {
                            imageUrl = urlData.publicUrl;
                        }
                    } else if (imageUrl.includes('profiles/') && !imageUrl.includes('supabase.co')) {
                        // ถ้าเป็น path ให้สร้าง public URL
                        const { data: urlData } = supabase.storage
                            .from('user_bk')
                            .getPublicUrl(imageUrl);
                        if (urlData) {
                            imageUrl = urlData.publicUrl;
                        }
                    }
                    
                    console.log('Original image URL from DB:', profileData.user_image_url);
                    console.log('Processed image URL:', imageUrl);
                    setImagePreviewUrl(imageUrl);
                }

            } catch (err: any) {
                console.error('Error loading profile:', err);
                setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์');
            } finally {
                setIsLoadingProfile(false);
            }
        };

        loadProfile();
    }, [router]);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle image file selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, profileImage: file }));
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (!user?.id) {
                throw new Error('กรุณาเข้าสู่ระบบก่อน');
            }

            let profilePicUrl: string | null = null;

            // 1. อัปโหลดรูปโปรไฟล์ใหม่ (ถ้ามี)
            if (formData.profileImage) {
                const fileExt = formData.profileImage.name.split('.').pop();
                const fileName = `${user.id}_${Date.now()}.${fileExt}`;
                const filePath = `profiles/${fileName}`;

                // ลบรูปเก่าก่อน (ถ้ามี)
                const { data: oldProfile } = await supabase
                    .from('user_tb')
                    .select('user_image_url')
                    .eq('id', user.id)
                    .single();

                if (oldProfile?.user_image_url) {
                    // แยก path จาก URL
                    const oldPath = oldProfile.user_image_url.split('/').slice(-2).join('/');
                    if (oldPath) {
                        await supabase.storage
                            .from('user_bk')
                            .remove([oldPath]);
                    }
                }

                // อัปโหลดรูปใหม่
                const { error: uploadError } = await supabase.storage
                    .from('user_bk')
                    .upload(filePath, formData.profileImage, {
                        cacheControl: '3600',
                        upsert: true
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

            // 2. อัปเดตข้อมูลในตาราง user_tb
            const updateData: any = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                address: formData.address,
                gender: formData.gender,
            };

            // เพิ่ม user_image_url ถ้ามีรูปใหม่
            if (profilePicUrl) {
                updateData.user_image_url = profilePicUrl;
            }

            const { error: updateError } = await supabase
                .from('user_tb')
                .update(updateData)
                .eq('id', user.id);

            if (updateError) {
                throw new Error(updateError.message);
            }

            setSuccess(true);

            // รอ 1.5 วินาทีแล้ว redirect ไปหน้า profile พร้อม refresh
            setTimeout(() => {
                router.push(`/profile/${user.id}`);
                router.refresh(); // Force refresh เพื่อให้ข้อมูลใหม่แสดง
            }, 1500);

        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setIsLoading(false);
        }
    };

    // แสดง loading state
    if (isLoadingProfile) {
        return (
            <div className="min-h-screen bg-stone-100 p-4 sm:p-8 flex items-center justify-center">
                <div className="w-full max-w-xl bg-white p-6 sm:p-10 shadow-xl rounded-3xl border border-stone-300 text-center">
                    <div className="text-stone-600 text-lg">กำลังโหลดข้อมูลโปรไฟล์...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-100 p-4 sm:p-8 flex items-start justify-center">
            <div className="w-full max-w-xl bg-white p-6 sm:p-10 shadow-xl rounded-3xl border border-stone-300">
                <h1 className="text-3xl font-extrabold text-stone-800 mb-8 text-center border-b pb-4">
                    แก้ไขโปรไฟล์
                </h1>
                <form onSubmit={handleSubmit} className="w-full space-y-6">
                    {/* Profile Image and Input */}
                    <div className="flex flex-col items-center space-y-4 mb-6">
                        <div className="relative">
                            <img
                                src={imagePreviewUrl || `https://placehold.co/150x150/d97706/ffffff?text=${formData.firstName?.[0] || 'U'}${formData.lastName?.[0] || ''}`}
                                alt="Profile Preview"
                                className="h-32 w-32 rounded-full object-cover border-4 border-amber-500 shadow-xl"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                        </div>
                        <input
                            type="file"
                            name="profileImage"
                            id="profileImage"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            className="hidden"
                        />
                    </div>

                    {/* First and Last Name Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-stone-700">
                                ชื่อ
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                id="firstName"
                                required
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-full border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3"
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-stone-700">
                                นามสกุล
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                id="lastName"
                                required
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-full border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3"
                            />
                        </div>
                    </div>

                    {/* Email and Address Input */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                                อีเมล์
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-full border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3"
                            />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-stone-700">
                                ที่อยู่
                            </label>
                            <input
                                type="text"
                                name="address"
                                id="address"
                                required
                                value={formData.address}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-full border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3"
                            />
                        </div>
                    </div>

                    {/* Gender Selection */}
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-stone-700">
                            เพศ
                        </label>
                        <select
                            name="gender"
                            id="gender"
                            required
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-full border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-3"
                        >
                            <option value="male">ชาย</option>
                            <option value="female">หญิง</option>
                            <option value="other">อื่น ๆ</option>
                        </select>
                    </div>

                    {/* Error and Success Messages */}
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                            บันทึกข้อมูลสำเร็จ! กำลังนำคุณไปหน้าโปรไฟล์...
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-center pt-6 border-t border-stone-200 mt-8">
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <button
                                type="submit"
                                disabled={isLoading || isLoadingProfile}
                                className="px-8 py-3 bg-amber-600 text-white font-bold rounded-xl shadow-lg hover:bg-amber-700 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                <span>{isLoading ? 'กำลังบันทึก...' : 'บันทึก'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push(user ? `/profile/${user.id}` : '/allproduct')}
                                disabled={isLoading}
                                className="px-10 py-3 bg-stone-700 text-white font-bold rounded-xl shadow-lg hover:bg-stone-800 transition duration-300 transform hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                <span>ย้อนกลับ</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}