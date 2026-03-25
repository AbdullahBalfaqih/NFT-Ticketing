"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useAuth } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { AuthModal } from "@/components/auth-modal";
import { useState } from "react";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const isAdmin = pathname.startsWith("/admin");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const navLinks = [
    { href: "/marketplace", label: "السوق الموثق" },
    { href: "/developers", label: "المطورين" },
    { href: "/verify", label: "مركز التحقق" },
    ...(isAdmin ? [{ href: "/admin/scanner", label: "الماسح الميداني" }] : []),
  ];

  return (
    <header className="w-full bg-black sticky top-0 z-[55] border-b border-white/5 overflow-x-hidden" dir="rtl">
      <div className="w-full h-20 flex justify-center items-center">
        <div className="container mx-auto px-4 flex items-center justify-between h-full max-w-full">
          
          {/* Left Section: Logo Only - Bigger Size */}
          <div className="flex items-center justify-start flex-1 h-full">
            <Link href="/" className="flex items-center group h-full">
              <div className="relative w-36 h-full transition-transform duration-300 group-hover:scale-105">
                <Image 
                  src="https://res.cloudinary.com/ddznxtb6f/image/upload/v1774396174/image-removebg-preview_75_yghhlp.png" 
                  alt="Logo" 
                  fill 
                  className="object-contain" 
                />
              </div>
            </Link>
          </div>

          {/* Center Section: Navigation Links */}
          <div className="hidden md:flex items-center gap-8 justify-center flex-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={cn(
                  "text-[13px] font-black transition-colors hover:text-primary whitespace-nowrap",
                  pathname === link.href ? "text-primary" : "text-neutral-400"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section: Action Buttons */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            {user ? (
              <div className="flex items-center gap-2">
                <Button 
                  asChild
                  variant="secondary"
                  className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border-none font-black text-xs transition-all"
                >
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <span className="hidden sm:inline">خزنتي</span>
                    <Avatar className="h-6 w-6 border border-primary/20">
                      <AvatarImage src={user.photoURL || ""} />
                      <AvatarFallback className="bg-primary/20 text-[8px] font-bold">
                        {user.email?.substring(0, 2).toUpperCase() || "ET"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="h-10 w-10 text-neutral-400 hover:text-destructive rounded-xl hidden md:inline-flex">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setIsAuthOpen(true)}
                className="h-10 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-primary font-black text-xs shadow-sm transition-all"
              >
                دخول البروتوكول
              </Button>
            )}

            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-neutral-400 hover:text-primary">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-[#0a0a0a] border-white/5 p-0 w-72" dir="rtl">
                  <SheetTitle className="sr-only">قائمة التنقل</SheetTitle>
                  <div className="flex flex-col h-full pt-20 px-6 space-y-6">
                    {navLinks.map((link) => (
                      <Link 
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "text-xl font-black transition-colors hover:text-primary",
                          pathname === link.href ? "text-primary" : "text-white"
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="pt-6 border-t border-white/5">
                      {user ? (
                        <Button onClick={handleLogout} variant="destructive" className="w-full h-12 rounded-xl font-black gap-2">
                          <LogOut className="h-4 w-4" /> خروج
                        </Button>
                      ) : (
                        <Button onClick={() => setIsAuthOpen(true)} className="w-full h-12 rounded-xl bg-primary text-white font-black">
                          دخول البروتوكول
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
}