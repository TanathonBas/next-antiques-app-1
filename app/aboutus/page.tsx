'use client';
import { Store } from 'lucide-react';

// -- COMPONENT 2: Header (Navbar) --
// ส่วนหัวของเว็ป (Navbar)
function Header() {
    return (
        <header className="bg-amber-900 text-white shadow-md sticky top-0 z-10">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* ส่วนด้านซ้าย: โลโก้ และ เมนู */}
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
                    </ul>
                </div>

                {/* ส่วนด้านขวา: Sign in / Sign up */}
                <div className="flex items-center space-x-4">
                    <a href="/login" className="hover:text-yellow-300 transition-colors text-sm">Sign In</a>
                    <a
                        href="/register"
                        className="bg-white text-amber-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                        Sign Up
                    </a>
                </div>
            </nav>

            {/* Mockup สำหรับข่าวสารและเกี่ยวกับเรา (จะแสดงเมื่อคลิกเมนูจริงๆ) */}
            {/* ในตัวอย่างนี้เราจะยังไม่ทำระบบ routing/modal ครับ */}
        </header>
    );
}

export default function page() {
    return (
        <div>
            <Header />
            <div className="container mx-auto px-4 py-16 sm:py-24">
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 sm:p-12">

                    {/*หัวเรื่อง "เกี่ยวกับพวกเรา" */}
                    <h1 className="text-4xl sm:text-5xl font-bold text-[#5a3821] mb-8">
                        เกี่ยวกับพวกเรา
                    </h1>

                    {/* เนื้อหาส่วนแรก */}
                    <p className="text-3xl text-black-700 leading-relaxed mb-4 mx-auto">
                        เราขายเกี่ยวกับของเก่าที่มีประวัติของตัวสินค้าเอง และเรื่องราวของสินค้า พวกเราชอบเรื่องราวและความเก่าแก่ของ สิ่งของและความ Retro และความ Vintage
                    </p>

                    {/* เนื้อหาส่วนสอง */}
                    <p className="text-2xl text-black-700 leading-relaxed mb-4 mx-auto">
                        เราเลยอยากให้ทุกคนที่ชอบของเก่า ของย้อนยุคได้มาเยี่ยมชมเว็ปไซต์ของเรา มาซื้อสินค้ากันและมาหาประสบการ์ณดีๆ ด้วยกัน ขอให้เยี่ยมชมสินค้าอย่างมีความสุข
                    </p>

                    {/* ส่วนท้ายชื่อผู้จัดทำ */}
                    <div className="mt-16 text-sm text-black-500">
                        <p>BY DTI Student</p>
                        <p>SAU</p>
                    </div>


                </div>
            </div>
        </div>

    )
}
