"use client";

import Image from "next/image";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="login-body">
      <div className="container-fluid h-100">
        <div className="row no-gutter h-100">
          {/* LEFT SIDE */}
          <div className="col-md-6 bg-light">
            <div className="login d-flex align-items-center h-100">
              <div className="container">
                <div className="row">
                  <div className="d-flex justify-content-between align-items-end m-2 px-4">
                    <div className="flex flex-col items-center space-x-3">
                      <img
                        className="box shake-after-10s"
                        width="100"
                        src="/images/kissan_sathi_logo.png"
                        alt="Mithu"
                      />
                    </div>
                    <div className="flex align-items-end space-x-3">
                      <img
                        className=""
                        width="100"
                        src="/images/GenXAILatest.png"
                        alt="GenXAI"
                      />
                    </div>
                  </div>
                  <div className="col-lg-10 col-xl-7 mx-auto">
                    <h3 className="display-7 text-center my-3">{title}</h3>
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE IMAGE */}
          <div className="col-md-6 d-none d-md-flex bg-image"></div>
        </div>
      </div>

      <footer className="bg-dark login-footer text-white py-2 text-center">
        <p className="m-0">
          Developed and Maintained By
          <span className="px-2 d-inline-block text-white font-bold">
            GenXAI Analytics Pvt Ltd
          </span>
        </p>
      </footer>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
}
