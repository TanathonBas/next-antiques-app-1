"use client";
import React, { useState } from 'react';
// --- TypeScript Type Definition for Props ---
// กำหนดชนิดข้อมูลสำหรับ props ที่ PaymentOption ได้รับ
interface PaymentOptionProps {
  title: string;
  subtitle: string;
  methodKey: string;
  selectedMethod: string | null;
  onSelect: (methodKey: string) => void;
  disabled?: boolean; // '?' หมายความว่า prop นี้ไม่จำเป็นต้องส่งมา (optional)
  disabledText?: string;
}

// --- Reusable Payment Option Component ---
// นี่คือคอมโพเนนต์สำหรับตัวเลือกการชำระเงินแต่ละอัน
// We pass props to make this component reusable
const PaymentOption: React.FC<PaymentOptionProps> = ({ 
  title, 
  subtitle, 
  methodKey, 
  selectedMethod, 
  onSelect, 
  disabled = false, // ค่าเริ่มต้นคือ false ถ้าไม่ได้ส่งมา
  disabledText 
}) => {
  const isSelected = selectedMethod === methodKey;

  // Apply different styles based on whether this option is selected
  // ปรับสไตล์ตามสถานะ disabled
  const baseClasses = "border rounded-lg p-5 flex items-center justify-between transition-all duration-200";
  const selectedClasses = "border-blue-600 ring-2 ring-blue-500 bg-blue-50";
  const unselectedClasses = "border-gray-300 bg-white";
  const disabledClasses = "bg-gray-100 opacity-60 cursor-not-allowed";

  // Handle click event, only if not disabled
  const handleClick = () => {
    if (!disabled) {
      onSelect(methodKey);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        ${baseClasses} 
        ${isSelected ? selectedClasses : unselectedClasses} 
        ${disabled ? disabledClasses : "cursor-pointer hover:bg-gray-50"}
      `}
    >
      {/* Left side: Title and Subtitle */}
      <div>
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          {/* แสดงข้อความ "กำลังปรับปรุง" ถ้ามี */}
          {disabled && disabledText && (
            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
              {disabledText}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      {/* Right side: Button */}
      <button
        onClick={handleClick}
        className={`
          px-4 py-2 rounded-md text-sm font-medium
          ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}
          ${disabled ? 'bg-gray-300 text-gray-500' : ''}
        `}
        disabled={disabled} 
      >
        {isSelected ? 'เลือกแล้ว' : 'เลือก'}
      </button>
    </div>
  );
};
// --- Main Checkout Page Component ---
export default function CheckoutPage() {
  // ลบ const router = useRouter();
  // State to track the selected payment method
  // กำหนด Type ให้ State ว่าเป็น string หรือ null
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null); // 'cash' or 'qrcode'
  
  // เพิ่ม State สำหรับควบคุม Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Handler functions for bottom buttons
  const handleConfirm = () => {
    // Don't allow confirmation if QRcode is selected or nothing is selected
    if (!selectedMethod || selectedMethod === 'qrcode') {
      console.log("Please select a valid payment method.");
      return;
    }
    // --- เปลี่ยนเป็นเปิด Modal ---
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    console.log("Payment Cancelled");
    // router.push('/'); // กลับไปหน้าหลัก (หรือหน้าตะกร้าสินค้า)
    window.location.href = '/bucket';
  };
  // --- ฟังก์ชันใหม่สำหรับปิด Modal และเปลี่ยนหน้า ---
  const handleModalClose = () => {
    setIsModalOpen(false);
    window.location.href = '/allproduct'; // เปลี่ยนมาใช้ window.location.href
  };
  // Determine if the confirm button should be disabled
  const isConfirmDisabled = !selectedMethod || selectedMethod === 'qrcode';
  return (
    // Main container, centered on the page with a light background
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      
      {/* --- Modal Pop-up --- */}
      {/* จะแสดงผลเมื่อ isModalOpen เป็น true */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          {/* กล่อง Modal - ปรับ layout ให้แสดงตรงกลาง */}
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full flex flex-col items-center">
            
            {/* --- ไอคอนติ๊กถูก --- */}
            <svg className="w-20 h-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            
            {/* --- ข้อความยืนยันใหม่ --- */}
            <h3 className="text-xl font-semibold text-gray-900 mt-5">
              ชำระเงินสำเร็จ!
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {selectedMethod === 'cash' ? ' (ยืนยันแบบเก็บเงินปลายทาง) ' : ''}
            </p>

            <div className="mt-8 flex justify-center w-full">
              {/* ปุ่มปิด Modal - เรียกใช้ handleModalClose */}
              <button
                onClick={handleModalClose} 
                className="w-full px-5 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- End Modal Pop-up --- */}
      {/* Checkout Card - ปรับขนาดเป็น max-w-2xl และเพิ่ม padding/spacing */}
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6 w-full max-w-2xl">
        
        {/* Top Header */}
        <header className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            เลือกวิธีการชำระ
          </h1>
        </header>
        {/* Payment Options Area - เพิ่มช่องว่าง */}
        <div className="space-y-4">
          {/* Option 1: Cash */}
          <PaymentOption
            title="เงินสด"
            subtitle="เก็บเงินปลายทาง"
            methodKey="cash"
            selectedMethod={selectedMethod}
            onSelect={setSelectedMethod}
          />
          
          {/* Option 2: QRcode - เพิ่ม props disabled และ disabledText */}
          <PaymentOption
            title="QRcode"
            subtitle="PromPay หรือ ธนาคารใดๆ"
            methodKey="qrcode"
            selectedMethod={selectedMethod}
            onSelect={setSelectedMethod}
            disabled={true} 
            disabledText="กำลังปรับปรุง"
          />
        </div>
        {/* Bottom Buttons Area - เพิ่มช่องว่าง */}
        <footer className="pt-6 flex justify-between items-center space-x-4">
          {/* Confirm Button (Left) */}
          <button
            onClick={handleConfirm}
            // ปุ่มจะเป็นสีเทาถ้า isConfirmDisabled เป็น true
            className={`
              w-1/2 py-3 px-6 rounded-lg font-semibold text-white
              transition-colors duration-200
              ${isConfirmDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
            `}
            disabled={isConfirmDisabled}
          >
            ยืนยันการชำระ
          </button>
          
          {/* Cancel Button (Right) */}
          < button
            onClick={handleCancel}
            className="w-1/2 py-3 px-6 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
          >
            ยกเลิก
          </button>
        </footer>
      </div>
    </div>
  );
}