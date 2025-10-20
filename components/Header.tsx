import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-800 text-white py-3 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-semibold">Hotel Management</h1>
        <nav className="space-x-6">
          <Link href="/" className="hover:text-blue-300">Trang chủ</Link>
          <Link href="/rooms" className="hover:text-blue-300">Quản lý phòng</Link>
        </nav>
      </div>
    </header>
  );
}