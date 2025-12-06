'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Plus, ShoppingCart } from 'lucide-react';
import { supabase } from "@/lib/supabaseclinet";
import Header from "@/app/component/Header";

// ข้อมูลสินค้าจำลอง - เพิ่มคำอธิบาย (descriptionTh) และราคา
const initialProducts = [
  { id: 1, nameEn: 'Antique Lamp', nameTh: 'ตะเกียงโบราณ', descriptionTh: 'ตะเกียงน้ำมันทองเหลืองเก่าแก่จากยุควิกตอเรีย สภาพสมบูรณ์พร้อมใช้งาน มีลวดลายแกะสลักสวยงาม เหมาะสำหรับนักสะสม หรือใช้ประดับตกแต่งบ้านให้ได้บรรยากาศคลาสสิก', image: '/product1.jpeg', price: 1200},
  { id: 2, nameEn: 'Pocket Watch', nameTh: 'นาฬิกาพก', descriptionTh: 'นาฬิกาพกสไตล์วินเทจ ตัวเรือนสีเงินเงางาม หน้าปัดสีขาวพร้อมตัวเลขโรมันสุดคลาสสิก มาพร้อมเข็มวินาทีแยกด้านล่าง ดีไซน์เรียบหรู เหมาะสำหรับพกพาเป็นไอเท็มเสริมลุคหรือเก็บสะสม', image: '/product2.jpeg', price: 3500},
  { id: 3, nameEn: 'Film Camera', nameTh: 'กล้องฟิล์มเก่า', descriptionTh: 'กล้องฟิล์ม Canon แบบเรนจ์ไฟน์เดอร์ดีไซน์คลาสสิก ตัวบอดี้ทำจากโลหะผสม ให้ความแข็งแรงและสัมผัสแนววินเทจ มาพร้อมเลนส์ Canon Lens 40mm f/1.7 ที่ให้ภาพคมชัด รับแสงได้ดี เหมาะสำหรับถ่ายสตรีท ถ่ายบุคคล และงานศิลป์ทั่วไป', image: '/product3.jpeg', price: 2800 },
  { id: 4, nameEn: 'Typewriter', nameTh: 'เครื่องพิมพ์ดีด', descriptionTh: 'เครื่องพิมพ์ดีดแบบแมนนวลสไตล์วินเทจ ดีไซน์คลาสสิก ตัวบอดี้เป็นโลหะให้ความทนทาน พร้อมปุ่มกดกลไกแบบดั้งเดิมที่ให้สัมผัสการพิมพ์ที่เป็นเอกลักษณ์ เหมาะสำหรับนักสะสม ผู้ชื่นชอบงานเขียน หรือใช้เป็นพร็อปถ่ายภาพและตกแต่งบ้าน',image: '/product4.jpeg', price: 4100 },
  { id: 5, nameEn: 'Old Stamp', nameTh: 'แสตมป์เก่า', descriptionTh: 'แสตมป์สะสมจากสหรัฐอเมริกาดีไซน์คลาสสิก พิมพ์ด้วยลายภาพบุคคลสำคัญทางประวัติศาสตร์ในโทนสีน้ำเงิน ตัวแสตมป์มีลักษณะเป็นฟันเฟืองรอบขอบตามแบบดั้งเดิม เหมาะสำหรับนักสะสมหรือใช้ประกอบงานศิลป์ วัสดุเป็นกระดาษพิมพ์เฉพาะทางสำหรับแสตมป์ ให้ความรู้สึกวินเทจและคลาสสิก', image: '/product5.jpeg', price: 500},
  { id: 6, nameEn: 'Pottery', nameTh: 'ไหสังคโลก', descriptionTh: 'ไหสังคโลกเป็นเครื่องปั้นดินเผาโบราณจากยุคสุโขทัย โดดเด่นด้วยลวดลายเขียนสีแบบดั้งเดิม เนื้อดินเผาแข็งแกร่ง เคลือบสีเขียวอมฟ้า/น้ำตาล (ขึ้นอยู่กับชิ้นงาน) นิยมสะสมเพราะเป็นงานหัตถศิลป์เก่าแก่ที่มีคุณค่าเชิงประวัติศาสตร์และศิลปกรรม', image: '/product6.jpeg', price: 8900},
  { id: 7, nameEn: 'Old Phone', nameTh: 'โทรศัพท์โบราณ', descriptionTh: 'โทรศัพท์โบราณระบบหมุน (Rotary Dial) ดีไซน์คลาสสิก ตัวเครื่องทำจากวัสดุแข็งแรง น้ำหนักดี ให้ความรู้สึกแนวเรโทรแบบยุคเก่า เหมาะสำหรับนักสะสม ของตกแต่งบ้าน ร้านกาแฟ หรือผู้ที่ชื่นชอบของวินเทจ ตัวเลขบนหน้าปัดอ่านง่าย กลไกหมุนลื่น และตัวเครื่องออกแบบอย่างสวยงาม',image: '/product7.jpeg', price: 2200 },
  { id: 8, nameEn: 'Old Coin', nameTh: 'เหรียญเก่า', descriptionTh: 'เหรียญดอลลาร์สหรัฐแบบเก่า ผลิตในช่วงยุคก่อนตามรุ่นของเหรียญ มีลักษณะการออกแบบสไตล์โบราณ รายละเอียดบนเหรียญยังมองเห็นชัดเจนตามสภาพการใช้งาน วัสดุทำจากโลหะผสมตามมาตรฐานสมัยนั้น มีความคลาสสิกและเหมาะอย่างยิ่งสำหรับนักสะสมเหรียญหรือผู้ที่สนใจประวัติศาสตร์สกุลเงิน', image: '/product8.jpeg', price: 750 },
];

// กำหนดสีหลักที่ใช้สำหรับเน้น (ตามที่ผู้ใช้ต้องการ: #7B3F0C)
const ACCENT_COLOR = '#7B3F0C';
const CARD_BG_COLOR = '#E9ECF0'; // สีพื้นหลังของการ์ด
const MAIN_BG_COLOR = '#F5F5F5'; // สีพื้นหลังโดยรวม

interface Product {
    id: number;
    nameEn: string;
    nameTh: string;
    descriptionTh: string;
    image?: string;
    price?: number;
}

/**
 * คอมโพเนนต์หลักของแอปพลิเคชัน
 */
export default function App() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id ? parseInt(params.id as string) : null;
  
  // หาสินค้าตาม id
  const product = productId ? initialProducts.find(p => p.id === productId) : null;

  // ฟังก์ชันเพิ่มสินค้าลงตะกร้า
  const handleAddToCart = () => {
    if (!product) return;
    
    if (typeof window === "undefined") {
      return;
    }

    const stored = localStorage.getItem("cart_items");
    let cart: any[] = [];
    if (stored) {
      try {
        cart = JSON.parse(stored);
      } catch (error) {
        console.error("Failed to parse cart items:", error);
      }
    }

    const existingIndex = cart.findIndex((item) => item.id === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      cart.push({
        id: product.id,
        name: product.nameTh,
        description: product.descriptionTh,
        price: product.price || 0,
        quantity: 1,
        imageUrl: product.image,
      });
    }

    localStorage.setItem("cart_items", JSON.stringify(cart));
    alert('เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว');
  };

  // ถ้าไม่พบสินค้า
  if (!product) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: MAIN_BG_COLOR }}>
        <Header />
        <div className="p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4" style={{ color: ACCENT_COLOR }}>
                ไม่พบสินค้า
              </h2>
              <p className="text-gray-600 mb-6">ไม่พบสินค้าที่คุณกำลังมองหา</p>
              <button
                onClick={() => router.push('/allproduct')}
                className="px-6 py-2 rounded-lg text-white hover:opacity-90 transition-colors"
                style={{ backgroundColor: ACCENT_COLOR }}
              >
                กลับไปหน้าสินค้าทั้งหมด
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: MAIN_BG_COLOR }}>
      <Header />
      <div className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* ปุ่มกลับ */}
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>กลับ</span>
          </button>

          {/* ส่วนแสดงรายละเอียดสินค้า */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
              {/* ส่วนรูปภาพ */}
              <div className="w-full">
                <div 
                  className="w-full h-96 md:h-[500px] flex items-center justify-center overflow-hidden rounded-lg"
                  style={{ backgroundColor: CARD_BG_COLOR }}
                >
                  {product.image ? (
                    <Image 
                      src={product.image} 
                      alt={product.nameTh}
                      width={600}
                      height={600}
                      className="w-full h-full object-cover object-center"
                      unoptimized
                    />
                  ) : (
                    <span 
                      className="text-4xl font-bold text-center select-none"
                      style={{ color: ACCENT_COLOR }}
                    >
                      {product.nameEn}
                    </span>
                  )}
                </div>
              </div>

              {/* ส่วนรายละเอียด */}
              <div className="flex flex-col justify-between">
                <div>
                  {/* ชื่อภาษาไทย */}
                  <h1 
                    className="text-3xl md:text-4xl font-bold mb-4"
                    style={{ color: ACCENT_COLOR }}
                  >
                    {product.nameTh}
                  </h1>
                  
                  {/* ชื่อภาษาอังกฤษ */}
                  <p className="text-lg text-gray-600 mb-6">
                    {product.nameEn}
                  </p>

                  {/* ราคา */}
                  {product.price && (
                    <div className="mb-6">
                      <p className="text-2xl font-bold" style={{ color: ACCENT_COLOR }}>
                        {product.price.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                      </p>
                    </div>
                  )}

                  {/* คำอธิบาย */}
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3" style={{ color: ACCENT_COLOR }}>
                      รายละเอียดสินค้า
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {product.descriptionTh}
                    </p>
                  </div>
                </div>

                {/* ปุ่มเพิ่มลงตะกร้า */}
                <div className="mt-6">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-4 px-6 rounded-lg text-white font-semibold text-lg flex items-center justify-center space-x-2 hover:opacity-90 transition-all shadow-lg"
                    style={{ backgroundColor: ACCENT_COLOR }}
                  >
                    <ShoppingCart size={24} />
                    <span>เพิ่มลงตะกร้า</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}