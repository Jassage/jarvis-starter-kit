export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold" style={{ color: "#D4537E" }}>
            ❤ Konekte
          </div>
          <p className="text-gray-500 text-sm mt-1">Trouve ta moitié en Haïti</p>
        </div>
        {children}
      </div>
    </div>
  );
}
