'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Calendar, DollarSign, Trash2, ShoppingBag } from 'lucide-react';
import { supabase } from "@/lib/supabaseclinet";
import Header from "@/app/component/Header";

interface OrderItem {
    id: number;
    name: string;
    description: string;
    quantity: number;
    price: number;
    imageUrl: string;
}

interface Order {
    id: string;
    items: OrderItem[];
    total: number;
    date: string;
    status: string;
}


// Order Card Component
function OrderCard({ order }: { order: Order }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'กำลังเตรียมสินค้า':
                return 'bg-blue-100 text-blue-800';
            case 'กำลังจัดส่ง':
                return 'bg-yellow-100 text-yellow-800';
            case 'จัดส่งเรียบร้อย':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <Package className="w-5 h-5 text-amber-800" />
                        <h3 className="text-lg font-bold text-gray-800">คำสั่งซื้อ #{order.id}</h3>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{order.date}</span>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                </span>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-semibold text-gray-800 mb-3">รายการสินค้า:</h4>
                <div className="space-y-3">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg">
                            {item.imageUrl && (
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = `https://placehold.co/64x64/e2e8f0/8a4f1a?text=Image`;
                                    }}
                                />
                            )}
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-600">จำนวน: {item.quantity} ชิ้น</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-amber-800">
                                    ฿{(item.price * item.quantity).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-amber-800" />
                    <span className="text-gray-600">ยอดรวม:</span>
                </div>
                <span className="text-2xl font-bold text-amber-800">
                    ฿{order.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
            </div>
        </div>
    );
}

// Main Component
export default function PurchaseHistoryPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Reset orders when user logs out
    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                // Reset orders when user logs out
                setOrders([]);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('order_history');
                    localStorage.removeItem('order_items');
                }
            }
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const loadOrders = () => {
            try {
                // อ่านจาก order_history ก่อน (ประวัติการสั่งซื้อที่บันทึกแล้ว)
                const orderHistory = localStorage.getItem("order_history");
                if (orderHistory) {
                    const history: Order[] = JSON.parse(orderHistory);
                    if (history.length > 0) {
                        setOrders(history);
                        setIsLoading(false);
                        return;
                    }
                }
                
                // ถ้าไม่มีประวัติ ให้อ่านจาก order_items (สำหรับคำสั่งซื้อที่ยังไม่ได้ชำระเงิน)
                const storedOrders = localStorage.getItem("order_items");
                if (storedOrders) {
                    const orderItems: OrderItem[] = JSON.parse(storedOrders);
                    
                    if (orderItems.length > 0) {
                        // สร้าง order จาก order_items
                        const order: Order = {
                            id: `ORD-${Date.now()}`,
                            items: orderItems,
                            total: orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 50, // รวมค่าจัดส่ง 50 บาท
                            date: new Date().toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }),
                            status: 'กำลังเตรียมสินค้า'
                        };
                        setOrders([order]);
                    } else {
                        setOrders([]);
                    }
                } else {
                    setOrders([]);
                }
            } catch (error) {
                console.error("Failed to load orders:", error);
                setOrders([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadOrders();

        // ฟังการเปลี่ยนแปลงใน localStorage
        const handleStorage = (event: StorageEvent) => {
            if (event.key === "order_items" || event.key === "order_history") {
                loadOrders();
            }
        };

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    const handleClearOrders = () => {
        if (window.confirm('คุณต้องการล้างประวัติการสั่งซื้อทั้งหมดหรือไม่?')) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('order_history');
                localStorage.removeItem('order_items');
                setOrders([]);
            }
        }
    };

    const handleBuyMore = () => {
        router.push('/allproduct');
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans antialiased">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 py-8">
                <div className="mb-6">
                    <Link 
                        href="/allproduct"
                        className="inline-flex items-center space-x-2 text-amber-800 hover:text-amber-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>กลับไปหน้าหลัก</span>
                    </Link>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">ประวัติการสั่งซื้อ</h1>
                            <p className="text-gray-600">ดูรายละเอียดคำสั่งซื้อทั้งหมดของคุณ</p>
                        </div>
                        {orders.length > 0 && (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleBuyMore}
                                    className="inline-flex items-center space-x-2 bg-amber-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                                >
                                    <ShoppingBag size={18} />
                                    <span>ซื้อของเพิ่มเติม</span>
                                </button>
                                <button
                                    onClick={handleClearOrders}
                                    className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                >
                                    <Trash2 size={18} />
                                    <span>ล้างการสั่งซื้อ</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">ยังไม่มีประวัติการสั่งซื้อ</h2>
                        <p className="text-gray-600 mb-6">เมื่อคุณทำการสั่งซื้อสินค้า รายการจะแสดงที่นี่</p>
                        <Link
                            href="/allproduct"
                            className="inline-block bg-amber-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                        >
                            ไปช้อปปิ้ง
                        </Link>
                    </div>
                ) : (
                    <div>
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}