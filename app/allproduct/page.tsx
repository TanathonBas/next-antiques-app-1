"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// 1. Import ไอคอน (เพิ่ม Search)
import {
    Store,
    ShoppingCart,
    ImageIcon,
    Filter,
    ArrowDownAZ,
    ArrowDownWideNarrow,
    Search, // 2. เพิ่มไอคอนค้นหา
    Plus, // 1. เพิ่มไอคอน Plus
    LogOut // เพิ่มไอคอน LogOut
} from 'lucide-react';
import { supabase } from "@/lib/supabaseclinet";
import { User } from "@supabase/supabase-js";

interface UserProfile {
    firstName: string;
    lastName: string;
    user_image_url: string | null;
}

// -- COMPONENT 1: Header (Navbar) --
function Header() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const loadSession = async () => {
            const { data } = await supabase.auth.getSession();
            setUser(data.session?.user ?? null);
        };

        loadSession();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) {
                setProfile(null);
                return;
            }

            setIsLoadingProfile(true);
            const { data, error } = await supabase
                .from("user_tb")
                .select("firstName,lastName,user_image_url")
                .eq("id", user.id)
                .maybeSingle(); // ใช้ maybeSingle() แทน single() เพื่อหลีกเลี่ยง error เมื่อไม่มีข้อมูล

            if (error) {
                console.error("Failed to load profile:", error);
                setProfile(null);
            } else if (data) {
                setProfile(data as UserProfile);
            } else {
                // ไม่มีข้อมูล แต่ไม่ใช่ error
                setProfile(null);
            }
            setIsLoadingProfile(false);
        };

        fetchProfile();
    }, [user?.id]);

    const profileName = profile
        ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "ผู้ใช้งาน"
        : user?.email;
    const profileImage =
        profile?.user_image_url || "https://placehold.co/64x64/8a4f1a/ffffff?text=U";

    // ฟังก์ชันสำหรับออกจากระบบ
    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error('Error signing out:', error);
                alert('เกิดข้อผิดพลาดในการออกจากระบบ');
            } else {
                // Clear local storage ถ้ามี
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('cart_items');
                }
                // Redirect ไปหน้า allproduct 
                router.push('/allproduct');
                router.refresh();
            }
        } catch (err: any) {
            console.error('Error during logout:', err);
            alert('เกิดข้อผิดพลาดในการออกจากระบบ');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <header className="bg-amber-900 text-white shadow-md sticky top-0 z-10">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* ส่วนด้านซ้าย โลโก้ และ เมนู */}
                <div className="flex items-center space-x-8">
                    {/* โลโก้ */}
                    <a href="#" className="flex items-center space-x-2">
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
                {/* ส่วนด้านขวา */}
                {user ? (
                    <div className="flex items-center space-x-4">
                        <img
                            src={profileImage}
                            alt="โปรไฟล์"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold">
                                {isLoadingProfile ? "กำลังโหลด..." : profileName}
                            </span>
                            <a
                                href={`/profile/${user.id}`}
                                className="text-xs text-amber-200 underline hover:text-white transition-colors"
                            >
                                ดูโปรไฟล์
                            </a>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="bg-white text-amber-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            <LogOut size={16} />
                            <span>{isLoggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-4">
                        <a href="/login" className="hover:text-yellow-300 transition-colors text-sm">Sign In</a>
                        <a
                            href="/register"
                            className="bg-white text-amber-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                            Sign Up
                        </a>
                    </div>
                )}
            </nav>
        </header>
    );
}

//  ประเภท Type Product 
interface Product {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
}

//  Product Card 
function ProductCard({ product, onAddToCart }: { product: Product, onAddToCart: (product: Product) => void }) {
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* รูปสินค้า  */}
            <Link href={`/product/${product.id}`} className="block cursor-pointer">
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // In case the image fails to load, show a placeholder
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; // Prevent infinite loop
                                target.src = `https://placehold.co/300x300/e2e8f0/8a4f1a?text=Image+Error`;
                            }}
                        />
                    ) : (
                        <ImageIcon size={48} className="text-gray-400" />
                    )}
                </div>
            </Link>
            {/* รายละเอียดสินค้า */}
            <div className="p-4">
                <Link href={`/product/${product.id}`} className="block cursor-pointer hover:text-amber-800 transition-colors">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2 truncate" title={product.name}>{product.name}</h3>
                </Link>

                {/* Flex container สำหรับราคาและปุ่มบวก */}
                <div className="flex justify-between items-center mt-2">
                    <p className="text-amber-800 font-bold text-lg">
                        {product.price.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
                    </p>

                    {/* ปุ่ม "บวก" สำหรับเพิ่มเข้าตะกร้า*/}
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // ป้องกันการ trigger การคลิกไปหน้า product detail
                            onAddToCart(product);
                        }}
                        className="bg-amber-800 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-amber-700 transition-colors shadow"
                        aria-label={`เพิ่ม ${product.name} ลงในตะกร้า`}
                        title="เพิ่มลงตะกร้า"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ข้อมูลสินค้า
const mockProducts: Product[] = [
    { id: 1, name: 'ตะเกียงโบราณ', price: 1200, imageUrl: '/product1.jpeg' },
    { id: 2, name: 'นาฬิกาพก', price: 3500, imageUrl: '/product2.jpeg' },
    { id: 3, name: 'กล้องฟิล์มเก่า', price: 2800, imageUrl: '/product3.jpeg' },
    { id: 4, name: 'เครื่องพิมพ์ดีด', price: 4100, imageUrl: '/product4.jpeg' },
    { id: 5, name: 'แสตมป์เก่า', price: 500, imageUrl: '/product5.jpeg' },
    { id: 6, name: 'ไหสังคโลก', price: 8900, imageUrl: '/product6.jpeg' },
    { id: 7, name: 'โทรศัพท์โบราณ', price: 2200, imageUrl: '/product7.jpeg' },
    { id: 8, name: 'เหรียญเก่า', price: 750, imageUrl: '/product8.jpeg' },
];

//  Product Grid 
// ส่วนนี้คือส่วนที่เราเพิ่ม Logic การค้นหาและจัดเรียง
function ProductGrid({ onAddToCart }: { onAddToCart: (product: Product) => void }) {

    // สถานะสำหรับจัดเรียง
    const [sortState, setSortState] = useState(0); // 0: default, 1: name, 2: price

    // เพิ่ม State สำหรับเก็บค่าในช่องค้นหา
    const [searchTerm, setSearchTerm] = useState("");

    //  อัปเดต useMemo ให้กรองข้อมูล (filter) ก่อน แล้วจึงจัดเรียง (sort)
    const filteredAndSortedProducts = useMemo(() => {

        //  กรองตาม searchTerm ก่อน
        const filteredProducts = mockProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        //  จัดเรียง
        if (sortState === 0) {
            return filteredProducts; 
        }

        // สร้าง Array ใหม่จากข้อมูลที่กรองแล้วเพื่อจัดเรียง
        const sorted = [...filteredProducts];

        if (sortState === 1) { // 1 = เรียงตามชื่อ
            sorted.sort((a, b) => a.name.localeCompare(b.name, 'th'));
        } else if (sortState === 2) { // 2 = เรียงตามราคา
            sorted.sort((a, b) => a.price - b.price);
        }

        return sorted;
    }, [sortState, searchTerm]); // เพิ่ม searchTerm ใน dependencies

    // ฟังก์ชันสำหรับสลับการจัดเรียง
    const toggleSort = () => {
        setSortState((currentState) => (currentState + 1) % 3);
    };

    // ฟังก์ชันช่วยสำหรับแสดงไอคอนและข้อความของปุ่ม
    const getSortInfo = () => {
        if (sortState === 1) {
            return { icon: <ArrowDownAZ size={16} />, text: 'ตามชื่อ', active: true };
        }
        if (sortState === 2) {
            return { icon: <ArrowDownWideNarrow size={16} />, text: 'ตามราคา', active: true };
        }
        return { icon: <Filter size={16} />, text: 'จัดเรียง', active: false };
    };

    const sortInfo = getSortInfo();

    return (
        <main className="container mx-auto px-4 sm:px-6 py-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">

                {/* ปรับ Layout ส่วนหัว */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-800 shrink-0">สินค้าน่าสนใจ</h2>

                    {/* เพิ่ม Container สำหรับช่องค้นหาและปุ่มจัดเรียง */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">

                        {/* ช่องค้นหา */}
                        <div className="relative w-full sm:w-auto">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Search size={18} />
                            </span>
                            <input
                                type="text"
                                placeholder="ค้นหาด้วยชื่อ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-gray-300 rounded-full px-4 py-2 text-sm pl-10 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* ปุ่มจัดเรียง */}
                        <button
                            onClick={toggleSort}
                            title="จัดเรียงสินค้า"
                            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-full text-sm transition-colors w-full sm:w-auto ${sortInfo.active
                                ? 'bg-amber-800 text-white shadow-md'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}
                        >
                            <div className="shrink-0 w-4 h-4">{sortInfo.icon}</div>
                            <span>{sortInfo.text}</span>
                        </button>
                    </div>
                </div>

                {/* ตารางสินค้า */}
                {/* เพิ่มการตรวจสอบว่ามีสินค้าหรือไม่ */}
                {filteredAndSortedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAndSortedProducts.map(product => (
                            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
                        ))}
                    </div>
                ) : (
                    // แสดงข้อความเมื่อไม่พบสินค้า
                    <div className="text-center text-gray-500 py-16">
                        <p className="text-lg font-semibold">ไม่พบสินค้าที่ตรงกัน</p>
                        {searchTerm && (
                            <p className="text-sm mt-1">
                                จากคำค้นหา: {searchTerm}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

// Floating Cart Button
function CartButton({ itemCount, disabled }: { itemCount: number; disabled: boolean }) { 
    const router = useRouter();

    const handleClick = () => {
        if (disabled) return;
        router.push("/bucket");
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className={`fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                disabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-amber-800 text-white hover:bg-amber-700 hover:scale-110"
            }`}
            aria-label="เปิดตะกร้าสินค้า"
        >
            <ShoppingCart size={28} />

            {/* เพิ่ม Badge แสดงจำนวนสินค้า */}
            {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                    {itemCount}
                </span>
            )}
        </button>
    );
}

// MAIN APP COMPONENT
export default function AntiqueShopPage() {
    const [cartItemCount, setCartItemCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = localStorage.getItem("cart_items");
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as { quantity?: number }[];
                const total = parsed.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
                setCartItemCount(total);
            } catch (error) {
                console.error("Failed to parse cart items:", error);
            }
        }
    }, []);

    const handleAddToCart = (product: Product) => {
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
                name: product.name,
                description: "",
                price: product.price,
                quantity: 1,
                imageUrl: product.imageUrl,
            });
        }

        localStorage.setItem("cart_items", JSON.stringify(cart));

        const total = cart.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
        setCartItemCount(total);
    };

    useEffect(() => {
        const syncSession = async () => {
            const { data } = await supabase.auth.getSession();
            setIsLoggedIn(!!data.session);
        };

        syncSession();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
        });

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

    return (
        // ใช้ Inter font และ anti-aliased เพื่อความสวยงาม
        <div className="min-h-screen bg-gray-100 font-sans antialiased">
            <Header />
            {/* ส่งฟังก์ชัน onAddToCart และ itemCount ไปยัง Component ลูก */}
            <ProductGrid onAddToCart={handleAddToCart} />
            <CartButton itemCount={cartItemCount} disabled={!isLoggedIn} />
        </div>
    );
}