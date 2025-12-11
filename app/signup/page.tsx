"use client";
 
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
 
export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // const [otp, setOtp] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
 
  const router = useRouter();
 
  const handleSignup = async (e: any) => {
    setLoading(true);
    e.preventDefault();
   
    if (password !== confirmPassword) return alert("Passwords do not match");
    try {
      console.log("Signup data--------------------", {
        email,
        password,
      });
 const res = await axios.post("http://localhost:4000/api/v1/auth/signup", {
  email,
  password,
  confirm_password: confirmPassword,
  full_name: name,
  phone_no: mobile,
});
 
      //const data = await res.json();
      console.log("data--------------------",res);
      setLoading(false);
 
      // if (res.ok) {
      //   alert("Signup Successful!");
 
      //   e.preventDefault();
      //   router.push("/login");
      // } else {
      //   alert(data.message || "Signup failed");
      // }
    } catch (err) {
      console.log(`Server error---------------------: ${err}`);
    } finally {
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
                      width={150}
                      height={150}
                      alt="Logo"
                      priority
                    />
                  </div>
 
                  <div className="col-lg-10 col-xl-7 mx-auto">
                    <h3 className="display-7 text-center my-3">Sign up</h3>
 
                    <form onSubmit={handleSignup}>
                      <div className="form-floating mb-3 floating-custom-label">
                        <input
                          className="form-control"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                        <label>Name</label>
                      </div>
 
                      {/* === EMAIL + SEND OTP === */}
                      <div className="d-flex align-items-center mb-3 gap-2">
                        {/* Floating Email Input */}
                        <div className="form-floating flex-grow-1 floating-custom-label">
                          <input
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                          <label>Email</label>
                        </div>
 
                        {/* SEND OTP button */}
                        <button
                          className="btn btn-outline-primary h-100 px-3"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          Send OTP
                        </button>
                      </div>
 
                      {/* === OTP INPUT + VERIFY === */}
                      <div className="d-flex align-items-center mb-3 gap-2">
                        {/* Floating OTP Input */}
                        <div className="form-floating flex-grow-1 floating-custom-label">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter OTP"
                          />
                          <label>OTP</label>
                        </div>
 
                        {/* VERIFY button */}
                        <button
                          className="btn btn-success h-100 px-3"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          Verify
                        </button>
                      </div>
 
                      <div className="form-floating mb-3 floating-custom-label">
                        <input
                          className="form-control"
                          required
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                        />
                        <label>Mobile (As Per Aadhaar) </label>
                      </div>
 
                      <div className="form-floating mb-3 floating-custom-label">
                        <input
                          type="password"
                          className="form-control"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <label>Password</label>
                      </div>
 
                      <div className="form-floating mb3 floating-custom-label">
                        <input
                          type="password"
                          className="form-control"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <label>Confirm Password</label>
                      </div>
 
                      <div className="d-flex justify-content-between align-items-center my-3">
                        <button className="btn btn-success text-uppercase rounded shadow-sm">
                          Sign up
                        </button>
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
 
 
 
 
 