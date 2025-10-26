"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Quản lý phòng", href: "/rooms" },
    { label: "Khách hàng", href: "/customer" },
    { label: "Đặt phòng", href: "/booking" },
    { label: "Nhân viên", href: "/employee" },
    { label: "Dịch vụ", href: "/Service" },
    { label: "Sử dụng dịch vụ", href: "/ServiceUse" },
    { label: "Hóa đơn", href: "/bill" },
  ];

  return (
    <header className="nav-header">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          Hotel Management
        </Link>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? "is-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
