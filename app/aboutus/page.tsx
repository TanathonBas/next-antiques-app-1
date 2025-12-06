'use client';
import Header from "@/app/component/Header";

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