'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Home, ArrowLeft, PenTool, Hash } from 'lucide-react';
import { supabase } from '@/lib/supabaseclinet';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Interface สำหรับข้อมูลโปรไฟล์
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  gender: string;
  user_image_url: string | null;
}

// Component สำหรับแสดงข้อมูลแต่ละบรรทัด
const ProfileDetailItem = ({ label, value, Icon }: { label: string; value: string; Icon: React.ComponentType<{ className?: string }> }) => (
  // ใช้สีพื้นหลังและสีไอคอนในโทนน้ำตาลอ่อน (Stone/Amber)
  <div className="flex items-center space-x-4 p-4 bg-stone-50 rounded-xl shadow-md w-full transition duration-200 ease-in-out hover:bg-amber-50 border border-stone-200">
    <Icon className="w-6 h-6 text-amber-600 flex-shrink-0" />
    <div className="flex flex-col">
      <span className="text-sm font-medium text-stone-500">{label}</span>
      <span className="text-base font-semibold text-stone-800 break-words">{value}</span>
    </div>
  </div>
);

// ฟังก์ชันแปลง gender เป็นภาษาไทย
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

// Component หลักสำหรับหน้า Profile
const App = () => {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันสำหรับโหลดข้อมูลโปรไฟล์
  const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // ดึง session และ user
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(sessionError.message);
        }

        if (!sessionData.session?.user) {
          throw new Error('กรุณาเข้าสู่ระบบก่อน');
        }

        const currentUser = sessionData.session.user;
        setUser(currentUser);

        console.log('=== Profile Loading Debug ===');
        console.log('Current User ID:', currentUser.id);
        console.log('Current User Email:', currentUser.email);

        // ลอง query ด้วย ID ก่อน
        const { data: checkDataById, error: checkErrorById } = await supabase
          .from('user_tb')
          .select('*')
          .eq('id', currentUser.id)
          .limit(1);
        
        console.log('Query by ID - Full result:', checkDataById);
        console.log('Query by ID - Error:', checkErrorById);
        console.log('Query by ID - Has data:', !!checkDataById);
        console.log('Query by ID - Data length:', checkDataById?.length || 0);
        if (checkDataById && checkDataById.length > 0) {
          console.log('Query by ID - First record:', checkDataById[0]);
          console.log('Query by ID - Record keys:', Object.keys(checkDataById[0]));
        }

        // ถ้าไม่เจอด้วย ID ลอง query ด้วย email
        let checkData = checkDataById;
        let checkError = checkErrorById;

        if ((!checkData || checkData.length === 0) && currentUser.email) {
          console.log('Not found by ID, trying to query by email...');
          const { data: checkDataByEmail, error: checkErrorByEmail } = await supabase
            .from('user_tb')
            .select('*')
            .eq('email', currentUser.email)
            .limit(1);
          
          console.log('Query by Email - Full result:', checkDataByEmail);
          console.log('Query by Email - Error:', checkErrorByEmail);
          console.log('Query by Email - Has data:', !!checkDataByEmail);
          console.log('Query by Email - Data length:', checkDataByEmail?.length || 0);
          if (checkDataByEmail && checkDataByEmail.length > 0) {
            console.log('Query by Email - First record:', checkDataByEmail[0]);
            console.log('Query by Email - Record keys:', Object.keys(checkDataByEmail[0]));
          }

          if (checkDataByEmail && checkDataByEmail.length > 0) {
            checkData = checkDataByEmail;
            checkError = checkErrorByEmail;
            console.warn('⚠️ Found data by email but ID mismatch!');
            console.warn('Logged in User ID:', currentUser.id);
            console.warn('Database User ID:', checkDataByEmail[0].id);
          }
        }

        // ถ้ามี error ในการ query
        if (checkError) {
          console.error('Query error details:', {
            code: checkError.code,
            message: checkError.message,
            details: checkError.details,
            hint: checkError.hint
          });
          throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${checkError.message || 'Unknown error'}`);
        }

        // ถ้าไม่มีข้อมูลเลย
        if (!checkData || checkData.length === 0) {
          console.error('❌ No profile data found!');
          console.error('Searched User ID:', currentUser.id);
          console.error('Searched Email:', currentUser.email);
          console.error('This might be due to:');
          console.error('1. User not registered in user_tb table');
          console.error('2. Row Level Security (RLS) blocking the query');
          console.error('3. User ID mismatch between auth.users and user_tb');
          
          throw new Error(`ไม่พบข้อมูลโปรไฟล์สำหรับผู้ใช้ ${currentUser.email || currentUser.id}. กรุณาตรวจสอบว่าลงทะเบียนเรียบร้อยแล้ว หรือติดต่อผู้ดูแลระบบ`);
        }

        // มีข้อมูล ใช้ข้อมูลแรก
        const firstRecord = checkData[0];
        console.log('Found profile data:', {
          keys: Object.keys(firstRecord),
          hasFirstName: !!firstRecord.firstName,
          hasFristName: !!firstRecord.fristName,
          record: firstRecord
        });

        // แก้ไข URL รูปภาพให้เป็น public URL ถ้ายังไม่ใช่
        let imageUrl = firstRecord.user_image_url;
        
        if (imageUrl) {
          console.log('Original image URL from DB:', imageUrl);
          
          // ตรวจสอบว่าเป็น full URL หรือ path
          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            // เป็น URL แล้ว ตรวจสอบว่าเป็น Supabase URL หรือไม่
            if (imageUrl.includes('supabase.co') || imageUrl.includes('/storage/v1/object/public/')) {
              // URL ถูกต้องแล้ว
              console.log('Using existing Supabase URL');
            } else {
              // URL แต่อาจไม่ถูกต้อง ลองใช้ตามเดิม
              console.log('Using existing URL (may not be Supabase)');
            }
          } else {
            // เป็น path ให้สร้าง public URL
            console.log('Converting path to public URL:', imageUrl);
            const { data: urlData } = supabase.storage
              .from('user_bk')
              .getPublicUrl(imageUrl);
            if (urlData?.publicUrl) {
              imageUrl = urlData.publicUrl;
              console.log('Generated public URL:', imageUrl);
            } else {
              console.warn('Failed to generate public URL for:', imageUrl);
            }
          }
        }

        console.log('Final image URL:', imageUrl);

        // Map ข้อมูลให้ตรงกับ interface โดยรองรับทั้ง firstName และ fristName
        const mappedProfile: UserProfile = {
          firstName: (firstRecord.firstName || firstRecord.fristName || '') as string,
          lastName: firstRecord.lastName || '',
          email: firstRecord.email || currentUser.email || '',
          address: firstRecord.address || '',
          gender: firstRecord.gender || '',
          user_image_url: imageUrl || null,
        };

        console.log('Mapped profile:', mappedProfile);
        setProfile(mappedProfile);
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์');
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    loadProfile();

    // ฟังการเปลี่ยนแปลงสถานะ authentication
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Reload ข้อมูลเมื่อกลับมาหน้า (เช่น กลับมาจาก editprofile)
  useEffect(() => {
    const handleFocus = () => {
      loadProfile();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // แสดง loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-xl bg-white p-6 sm:p-10 shadow-xl rounded-3xl border border-stone-300 text-center">
          <div className="text-stone-600 text-lg">กำลังโหลดข้อมูลโปรไฟล์...</div>
        </div>
      </div>
    );
  }

  // แสดง error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-stone-100 p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-xl bg-white p-6 sm:p-10 shadow-xl rounded-3xl border border-stone-300 text-center">
          <div className="text-red-600 text-lg mb-4">{error || 'ไม่พบข้อมูลโปรไฟล์'}</div>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition duration-300"
          >
            ไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  // สร้าง URL รูปโปรไฟล์
  const getProfileImageUrl = () => {
    if (profile.user_image_url) {
      // ตรวจสอบว่า URL ถูกต้องหรือไม่
      if (profile.user_image_url.includes('supabase.co') || profile.user_image_url.startsWith('http')) {
        return profile.user_image_url;
      } else {
        // ถ้าไม่ใช่ URL ที่ถูกต้อง ให้สร้าง public URL ใหม่
        const { data: urlData } = supabase.storage
          .from('user_bk')
          .getPublicUrl(profile.user_image_url);
        return urlData?.publicUrl || profile.user_image_url;
      }
    }
    return `https://placehold.co/150x150/d97706/ffffff?text=${profile.firstName?.[0] || 'U'}${profile.lastName?.[0] || ''}`;
  };

  const profileImageUrl = getProfileImageUrl();

  return (
    // เปลี่ยนพื้นหลังเป็นสีน้ำตาลอ่อนมาก (Stone-100)
    <div className="min-h-screen bg-stone-100 p-4 sm:p-8 flex items-start justify-center">
      {/* สี่เหลี่ยมใหญ่เป็น card ครอบไว้ */}
      <div className="w-full max-w-xl bg-white p-6 sm:p-10 shadow-xl rounded-3xl border border-stone-300">
        
        {/* หัวข้อ */}
        <h1 className="text-3xl font-extrabold text-stone-800 mb-8 text-center border-b pb-4">
          ข้อมูลโปรไฟล์
        </h1>

        {/* ส่วนรูปโปรไฟล์และปุ่มแก้ไข (แนวตั้ง) */}
        <div className="flex flex-col items-center justify-center mb-10">
          {/* วงกลมเป็นรูปโปรไฟล์ */}
          <div className="relative">
            <img 
              className="h-32 w-32 rounded-full object-cover border-4 border-amber-500 shadow-xl mb-6"
              src={profileImageUrl}
              alt="Profile"
              onError={(e) => {
                console.error('Image load error for URL:', profileImageUrl);
                console.error('This might be due to:');
                console.error('1. Storage bucket is not public');
                console.error('2. RLS policy blocking access');
                console.error('3. File does not exist at the path');
                const target = e.target as HTMLImageElement;
                // ใช้ placeholder แทน
                const placeholderUrl = `https://placehold.co/150x150/d97706/ffffff?text=${profile.firstName?.[0] || 'U'}${profile.lastName?.[0] || ''}`;
                target.src = placeholderUrl;
                target.onerror = null; // ป้องกัน infinite loop
              }}
              onLoad={() => {
                console.log('✅ Image loaded successfully:', profileImageUrl);
              }}
            />
          </div>

          {/* สี่เหลี่ยมข้างวงกลม เป็นปุ่มแก้ไขโปรไฟล์ เชื่อมไปยัง editprofile */}
          <button
            onClick={() => router.push('/editprofile')}
            // ปุ่มสีน้ำตาล/ส้มเข้ม (Amber)
            className="px-8 py-3 bg-amber-600 text-white font-bold rounded-xl shadow-lg hover:bg-amber-700 transition duration-300 transform hover:scale-105 flex items-center space-x-2"
          >
            <PenTool className="w-5 h-5" />
            <span>แก้ไขโปรไฟล์</span>
          </button>
        </div>
        
        {/* รายละเอียดโปรไฟล์ (เน้นแนวตั้งโดยใช้ flex-col และ space-y) */}
        <div className="flex flex-col space-y-4 mb-10">
          
          {/* สี่เหลี่ยมต่อมาเป็น firstname ของโปรไฟล์ */}
          <ProfileDetailItem 
            label="First Name (ชื่อ)" 
            value={profile.firstName || '-'} 
            Icon={User}
          />
          
          {/* สี่เหลี่ยมต่อมาเป็น lastname ของโปรไฟล์ */}
          <ProfileDetailItem 
            label="Last Name (นามสกุล)" 
            value={profile.lastName || '-'} 
            Icon={User}
          />
          
          {/* สี่เหลี่ยมต่อมาเป็น Email ของโปรไฟล์ */}
          <ProfileDetailItem 
            label="Email" 
            value={profile.email || user?.email || '-'} 
            Icon={Mail}
          />
          
          {/* สี่เหลี่ยมต่อมาเป็น address ของโปรไฟล์ */}
          <ProfileDetailItem 
            label="Address (ที่อยู่)" 
            value={profile.address || '-'} 
            Icon={Home}
          />

          {/* สี่เหลี่ยมต่อมาเป็น gender ของโปรไฟล์ */}
          <ProfileDetailItem 
            label="Gender (เพศ)" 
            value={getGenderThai(profile.gender) || '-'} 
            Icon={Hash} // ใช้ Hash หรือ icon อื่นที่เหมาะสม
          />
        </div>

        {/* สี่เหลี่ยมล่างสุดเป็นปุ่มกลับไปหน้า allproduct */}
        <div className="flex justify-center pt-6 border-t border-stone-200">
          <button
            onClick={() => router.push('/allproduct')}
            // ปุ่มสีน้ำตาลเข้ม (Stone)
            className="w-full sm:w-auto px-10 py-3 bg-stone-700 text-white font-bold rounded-xl shadow-lg hover:bg-stone-800 transition duration-300 transform hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>ย้อนกลับ</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default App;