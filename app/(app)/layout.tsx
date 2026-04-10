"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useClerk, useUser, UserButton } from '@clerk/nextjs';
import {
  Upload,
  Video,
  LogOutIcon,
  MenuIcon,
  LayoutDashboardIcon,
  Share2Icon,
  UploadIcon,
  Image,
} from 'lucide-react';

const sidebarItems = [
  { href: '/home', label: 'Home Page', icon: LayoutDashboardIcon },
  { href: '/social-share', label: 'Social Share', icon: Share2Icon },
  { href: '/video-upload', label: 'Video Upload', icon: UploadIcon },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#141416] border-r border-[#262626] hidden md:flex flex-col">
        <div className="p-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[#1a1a1c] border border-gray-800 rounded-xl flex items-center justify-center mb-6 shadow-md">
            <Image className="text-blue-500" size={32} />
          </div>
          <div className="w-full flex space-x-2 justify-center pb-2">
           {/* Custom header area inside sidebar if needed */}
          </div>
        </div>

        <nav className="flex-1 px-4 mt-2 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-gray-400 hover:bg-[#202022] hover:text-white'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        {/* Top Header */}
        <header className="h-20 bg-[#0a0a0a] border-b border-[#262626] flex items-center justify-between px-8 z-10 w-full">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold tracking-tight text-white">Cloudinary Showcase</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3 bg-[#141416] py-1.5 px-3 rounded-full border border-[#262626]">
                <UserButton />
                <span className="text-sm font-medium text-gray-300 hidden md:block">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-red-500/10 rounded-full transition-colors ml-2"
                  title="Sign out"
                >
                  <LogOutIcon size={16} />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}