"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthLayout from "components/auth/AuthLayout";
import FormField from "components/ui/form-field";
import { login } from "lib/auth";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e: any) => {
    setLoading(true);
    e.preventDefault();

    const success = await login(email, password);

    if (success) {
      router.push("/dashboard");
    }

    setPassword("");
    setLoading(false);
  };

  return (
    <AuthLayout title="LOGIN">
      <div className="col-lg-10 col-xl-7 mx-auto">
        <form onSubmit={handleLogin}>
          <FormField
            type="email"
            placeholder="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <FormField
            type="password"
            placeholder="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

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
   </AuthLayout>
  );
}
