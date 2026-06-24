import { Outlet } from "react-router-dom";
function AuthLayout() {
  return <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-brand-800 p-10 text-white md:flex">
        <div className="text-2xl font-semibold">Equine Elite</div>
        <div>
          <h2 className="text-3xl font-semibold leading-tight">Quản lý giải đua ngựa<br />chuyên nghiệp</h2>
          <p className="mt-3 max-w-sm text-white/70">Đăng nhập để quản lý ngựa, nài, giải đấu và theo dõi đua trực tiếp.</p>
        </div>
        <p className="text-sm text-white/50">© 2026 Equine Elite</p>
      </div>
      <div className="flex items-center justify-center bg-bg p-6">
        <div className="w-full max-w-md"><Outlet /></div>
      </div>
    </div>;
}
export {
  AuthLayout
};
