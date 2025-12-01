import React from 'react';
import { Store } from 'lucide-react';

// คอมโพเนนต์หลักสำหรับหน้า Landing/Login
export default function LandingPage() {
  return (
    // จัดหน้าให้อยู่กึ่งกลางจอ และใช้พื้นหลังสีน้ำตาลอ่อน
    <div className="min-h-screen bg-amber-100 flex items-center justify-center p-4">

      {/* การ์ดสีขาวสำหรับแสดงโลโก้และปุ่ม */}
      <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg">

        {/* ส่วนโลโก้และชื่อเว็ป */}
        <div className="flex flex-col items-center mb-8">
          {/* โลโก้ หมุน*/}
          <div
            className="bg-amber-800 text-white w-24 h-24 rounded-full flex items-center justify-center mb-4 animate-spin"
            style={{ animationDuration: '5s' }}
          >
            <Store size={60} />
          </div>
          {/* ชื่อเว็ป */}
          <h1 className="text-3xl font-bold text-amber-900">ของเก่าเล่าเรื่อง</h1>
          <p className="text-gray-600">ยินดีต้อนรับ</p>
        </div>

        {/* ส่วนปุ่ม (ช่องสี่เหลี่ยม) */}
        <div className="flex flex-col space-y-4">

          {/* ช่องสี่เหลี่ยมแรก: เข้าสู่เว็ป */}
          <a
            href="/allproduct" // นี่คือลิ้งค์ปเข้าสู่เว็ป
            className="w-full bg-amber-800 text-white py-3 rounded-md text-lg font-semibold hover:bg-amber-700 transition-colors text-center"
          >
            เข้าสู่เว็ป
          </a>

          {/* ช่องสี่เหลี่ยมที่สอง: เข้าสู่ระบบ */}
          <a
            href="/login" 
            className="w-full bg-amber-800 text-white py-3 rounded-md text-lg font-semibold hover:bg-amber-700 transition-colors text-center"
          >
            เข้าสู่ระบบ
          </a>

          {/* ช่องสี่เหลี่ยมที่สาม: สมัครสมาชิก */}
          <a
            href="/register" 
            className="w-full bg-amber-800 text-white py-3 rounded-md text-lg font-semibold hover:bg-amber-700 transition-colors text-center"
          >
            สมัครสมาชิก
          </a>


        </div>

      </div>
    </div>
  );
}