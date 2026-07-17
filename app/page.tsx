import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        مرحبًا بك في أكاديمية عمرو مسعود
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        منصة إدارة اللاعبين والمدربين والمدفوعات
      </p>
      <Link
        href="/login"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
      >
        تسجيل الدخول
      </Link>
    </div>
  );
}