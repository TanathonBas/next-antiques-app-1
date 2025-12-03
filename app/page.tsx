import React from 'react';
import { Store } from 'lucide-react';

// คอมโพเนนต์หลักสำหรับหน้า Landing/Login
export default function LandingPage() {
  return (
    <>
      <style>{`
        .flip-container {
          perspective: 1000px;
          width: 96px;
          height: 96px;
        }
        
        .flip-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: rotateY 3s linear infinite;
        }
        
        .flip-front,
        .flip-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .flip-front {
          background-color: #92400e;
          color: white;
        }
        
        .flip-back {
          background-color: #92400e;
          transform: rotateY(180deg);
          overflow: hidden;
        }
        
        .flip-back img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
        
        @keyframes rotateY {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }
      `}</style>
      {/* จัดหน้าให้อยู่กึ่งกลางจอ และใช้พื้นหลังสีน้ำตาลอ่อน */}
      <div className="min-h-screen bg-amber-100 flex items-center justify-center p-4">

        {/* การ์ดสีขาวสำหรับแสดงโลโก้และปุ่ม */}
        <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg">

          {/* ส่วนโลโก้และชื่อเว็ป */}
          <div className="flex flex-col items-center mb-8">
            {/* โลโก้ หมุน - มีสองด้าน */}
            <div className="flip-container mb-4">
              <div className="flip-inner">
                {/* ด้านหน้า - โลโก้ */}
                <div className="flip-front">
                  <Store size={50} />
                </div>
                {/* ด้านหลัง - รูปภาพ */}
                <div className="flip-back">
                  <img src="/NINNIN.jpg" alt="Logo" />
                </div>
              </div>
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
    </>
  );
}