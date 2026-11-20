import { useEffect } from "react";
import { Link, Navigate, NavLink, Route, Routes } from "react-router-dom";
import { BookOpen, ExternalLink, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import AreasAdmin from "./AreasAdmin";
import BooksAdmin from "./BooksAdmin";

const menu = [
  { to: "areas", label: "Areas of Impact", icon: LayoutGrid },
  { to: "books", label: "Books", icon: BookOpen },
];

/**
 * /super-admin — only available while `npm run dev` is running.
 * Changes are written straight to src/data/*.json; commit and push them yourself.
 */
const SuperAdmin = () => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Super Admin · The Terminals";
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link to="/super-admin" className="font-display font-bold text-foreground">
            Super Admin
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" target="_blank">
              <ExternalLink className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">View site</span>
            </Link>
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        <aside className="md:w-56 shrink-0">
          <nav className="flex md:flex-col gap-1">
            {menu.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  }`
                }
              >
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <Routes>
            <Route index element={<Navigate to="areas" replace />} />
            <Route path="areas" element={<AreasAdmin />} />
            <Route path="books" element={<BooksAdmin />} />
            <Route path="*" element={<Navigate to="areas" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default SuperAdmin;
