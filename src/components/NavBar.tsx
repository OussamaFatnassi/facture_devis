import Link from "next/link";
export default function NavBar() {
  return (
    <>
      {/* Navbar */}
      <nav className="bg-gray-900 text-white px-6 py-4 shadow-md flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          Invoice & Quote
        </Link>
        <div className="flex gap-4">
          <Link
            href="/quotation/list"
            className="text-sm bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Quotes
          </Link>
          <Link
            href="/invoice"
            className="text-sm bg-white text-gray-900 px-4 py-2 rounded hover:bg-gray-100 transition"
          >
            Invoices
          </Link>
        </div>
      </nav>
    </>
  );
}
