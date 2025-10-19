"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Quản lý phòng", href: "/rooms" },
    { label: "Khách hàng", href: "/customers" },
    { label: "Đặt phòng", href: "/booking" },
    { label: "Nhân viên", href: "/staff" },
    { label: "Dịch vụ", href: "/services" },
    { label: "Sử dụng dịch vụ", href: "/usage" },
    { label: "Hóa đơn", href: "/invoice" },
  ];

  return (
    <header className="bg-gray-900 text-white shadow-lg fixed top-0 left-0 w-full z-50">
      <div className="max-w-8xl mx-auto px-6 py-4 flex items-center space-x-8 overflow-x-auto no-scrollbar">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-wide whitespace-nowrap hover:text-blue-400 transition duration-200"
        >
             Hotel Management
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-6 text-base font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap hover:text-blue-400 transition-all duration-200 ${
                pathname === item.href
                  ? "text-blue-400 font-semibold border-b-2 border-blue-400 pb-1"
                  : "text-gray-200"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}