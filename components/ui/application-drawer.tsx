"use client";

import { Sheet, SheetContent, SheetOverlay } from "@/components/ui/sheet";
import { useDiseaseId } from '../../lib/hooks/dashboard';
import { useEffect } from 'react';

interface ApplicationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicationDrawer({
  open,
  onOpenChange,
}: ApplicationDrawerProps) {
    const { handleIdentifyDisease } = useDiseaseId();
    
    useEffect(() => {
      if (open) {
        document.documentElement.style.overflow = 'hidden';
        const mainContent = document.querySelector('main');
        if (mainContent) {
          mainContent.style.width = 'calc(100% - 320px)';
          mainContent.style.transform = 'translateX(320px)';
          mainContent.style.transition = 'width 0.3s ease-in-out, transform 0.3s ease-in-out';
        }
      } else {
        document.documentElement.style.overflow = 'auto';
        const mainContent = document.querySelector('main');
        if (mainContent) {
          mainContent.style.width = '100%';
          mainContent.style.transform = 'translateX(0)';
          mainContent.style.transition = 'width 0.3s ease-in-out, transform 0.3s ease-in-out';
        }
      }
      return () => {
        document.documentElement.style.overflow = 'auto';
        const mainContent = document.querySelector('main');
        if (mainContent) {
          mainContent.style.width = '100%';
          mainContent.style.transform = 'translateX(0)';
        }
      };
    }, [open]);

    return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetOverlay className="!opacity-0" />
      <SheetContent side="left" className="w-80 bg-white z-[9999]">
        <div className="bg-white h-full p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Application Features
          </h2>
          <div className="flex flex-col space-y-2">
            <a
              href="/dashboard"
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition duration-150 text-decoration-none hover:border border-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-600 mr-3"
              >
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
              <span className="text-sm font-bold text-gray-900">
                Dashboard
              </span>
            </a>
            <a
              href="/market"
              className="flex items-center p-3 rounded-lg hover:bg-sky-50 transition duration-150 text-decoration-none hover:border border-sky-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-sky-blue mr-3"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span className="text-sm font-bold text-gray-900">
                Market Rates
              </span>
            </a>
            <a
              href="/advisories"
              // id="advisories-link"
              // onClick={(e) => {
              //   e.preventDefault();
              //   handleIdentifyDisease();
              // }}
              className="flex items-center p-3 rounded-lg hover:bg-green-50 transition duration-150 text-decoration-none hover:border border-primary-green"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-green mr-3"
              >
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
              <span className="text-sm font-bold text-gray-900">
                Advisories
              </span>
            </a>

            {/* UPDATED: Added redirection to /soil-analysis */}
            <a
              href="/soil"
              className="flex items-center p-3 rounded-lg hover:bg-yellow-50 transition duration-150 text-decoration-none hover:border border-soil-brown"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-soil-brown mr-3"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="18" x2="12" y2="10" />
                <path d="M15 13c-1.66 0-3 1.34-3 3s1.34 3 3 3" />
              </svg>
              <span className="text-sm font-bold text-gray-900">
                Soil Analysis
              </span>
            </a>

            <a
              href="/crop-guide"
              className="flex items-center p-3 rounded-lg hover:bg-yellow-50 transition duration-150 text-decoration-none hover:border border-yellow-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-yellow-600 mr-3"
              >
                <path d="M17 19c-1.1-1.46-3-4-5-4s-3.9-2.54-5-4c-1.1-1.46-1-4 0-4s3 2 5 2 3.9-2 5-2 1.1 2.54 0 4-3 4-5 4-3.9 2.54-5 4" />
                <path d="M12 2v20" />
              </svg>
              <span className="text-sm font-bold text-gray-900">
                Crop Guide
              </span>
            </a>
            <a
              href="/weather"
              className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition duration-150 text-decoration-none hover:border border-sky-blue"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-sky-blue mr-3"
              >
                <path d="M12 2v2M18 6l-1 1M20 12h-2M18 18l-1-1M12 20v2M6 18l1-1M4 12h2M6 6l1 1" />
                <path d="M15 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
              </svg>
              <span className="text-sm font-bold text-gray-900">Weather</span>
            </a>
            <a
              href="#"
              className="flex items-center p-3 rounded-lg hover:bg-orange-50 transition duration-150 text-decoration-none hover:border border-orange-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-orange-500 mr-3"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="10" y2="9" />
              </svg>
              <span className="text-sm font-bold text-gray-900">Scouting</span>
            </a>
            <a
              href="#"
              className="flex items-center p-3 rounded-lg hover:bg-purple-50 transition duration-150 text-decoration-none hover:border border-purple-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-600 mr-3"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" />
              </svg>
              <span className="text-sm font-bold text-gray-900">Reports</span>
            </a>
            <a
              href="#"
              className="flex items-center p-3 rounded-lg hover:bg-red-50 transition duration-150 text-decoration-none hover:border border-red-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500 mr-3"
              >
                <path d="M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                <path d="M19 12h2a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-8a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2" />
                <path d="M5 22h-2a1 1 0 0 1-1-1V13a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2" />
              </svg>
              <span className="text-sm font-bold text-gray-900">Services</span>
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
