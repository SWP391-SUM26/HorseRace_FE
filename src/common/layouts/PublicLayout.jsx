import { Link, Outlet } from "react-router-dom";
import { Footer } from "@/common/components/Footer";
import { Button } from "@/common/ui/Button";
function PublicLayout() {
  return <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
        <Link to="/" className="text-lg font-semibold text-brand-800">Equine Elite</Link>
        <Link to="/login"><Button size="sm">Đăng nhập</Button></Link>
      </header>
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>;
}
export {
  PublicLayout
};
