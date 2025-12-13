"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e: any) => {
    setLoading(true);
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/auth/login",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (res.data.statusCode == 200) {
        localStorage.setItem("refreshToken", res.data.data.refreshToken);
        localStorage.setItem("accessToken", res.data.data.accessToken);
        toast.success(res.data.message);
        setPassword("");
        setLoading(false);
        router.push("/dashboard");
      } else {
        console.log("Login failed");
        setPassword("");
        setLoading(false);
        toast.error(res.data.message);
      }
    } catch (err: any) {
      console.log("Login error", err);
      toast.error(`${err.message}`);
      setPassword("");
      setLoading(false);
    }
  };

  return (
    <div className="login-body">
      <div className="container-fluid h-100">
        <div className="row no-gutter h-100">
          {/* LEFT SIDE */}
          <div className="col-md-6 bg-light">
            <div className="login d-flex align-items-center h-100">
              <div className="container">
                <div className="row">
                  <div className="text-center pb-3">
                    <Image
                      src="/images/GenXAILatest.png"
                      alt="Logo"
                      width={150}
                      height={150}
                      className="login-logo"
                      priority
                    />
                  </div>

                  <div className="col-lg-10 col-xl-7 mx-auto">
                    <h3 className="display-7 text-center my-3">LOGIN</h3>

                    <form onSubmit={handleLogin}>
                      <div className="form-floating mb-3 floating-custom-label">
                        <input
                          type="email"
                          className="form-control"
                          placeholder="email"
                          required
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <label>Email Address</label>
                      </div>

                      <div className="form-floating mb-3 floating-custom-label">
                        <input
                          type="password"
                          className="form-control"
                          placeholder="password"
                          required
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <label>Password</label>
                      </div>

                      <div className="d-flex justify-content-between align-items-center my-3">
                        <button
                          className="btn btn-success text-uppercase rounded shadow-sm"
                          type="submit"
                        >
                          {loading ? (
                            <div
                              className="spinner-border text-light"
                              role="status"
                            >
                              <span className="sr-only">Loading...</span>
                            </div>
                          ) : (
                            "Login"
                          )}
                        </button>

                        <a
                          href="/signup"
                          className="btn btn-outline-primary text-uppercase rounded shadow-sm"
                        >
                          Sign Up
                        </a>

                        <a href="#" className="text-decoration-none">
                          Forgot password?
                        </a>
                      </div>
                    </form>
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
    </div>
  );
}
