"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import AuthLayout from "components/auth/AuthLayout";
import FormField from "components/ui/form-field";
import { sendOTP, verifyOTP, signup } from "lib/auth";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const router = useRouter();

  const handleSendOTP = async () => {
    if (!email || !name) {
      toast.error("Please enter email and name");
      return;
    }
    const success = await sendOTP(email, name);
    if (success) {
      setOtpSent(true);
    }
  };

  const handleVerifyOTP = async () => {
    if (!email || !otp) {
      toast.error("Please enter email and OTP");
      return;
    }
    const success = await verifyOTP(email, otp);
    if (success) {
      setOtpVerified(true);
    }
  };

  const handleSignup = async (e: any) => {
    setLoading(true);
    e.preventDefault();

    if (!otpVerified) {
      toast.error("Please verify your OTP first");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      setPassword("");
      setConfirmPassword("");
      setLoading(false);
      return;
    }

    const success = await signup({
      email,
      password,
      confirm_password: confirmPassword,
      name: name,
      phone_no: mobile,
    });

    if (success) {
      router.push("/login");
    }

    setName("");
    setEmail("");
    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setMobile("");
    setLoading(false);
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
  };

  return (
    <AuthLayout title="Sign up">
      <div className="col-lg-10 col-xl-7 mx-auto">
        <form onSubmit={handleSignup}>
          <FormField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
              type="button"
              className="btn btn-outline-primary h-100 px-3"
              style={{ whiteSpace: "nowrap" }}
              onClick={handleSendOTP}
              disabled={otpVerified}
            >
              {otpSent ? "Resend OTP" : "Send OTP"}
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
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <label>OTP</label>
            </div>

            {/* VERIFY button */}
            <button
              type="button"
              className="btn btn-success h-100 px-3"
              style={{ whiteSpace: "nowrap" }}
              onClick={handleVerifyOTP}
              disabled={otpVerified}
            >
              Verify
            </button>
          </div>

          <FormField
            label="Mobile (As Per Aadhaar)"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />

          <FormField
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <FormField
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="d-flex justify-content-between align-items-center my-3">
            <button className="btn btn-success text-uppercase rounded shadow-sm w-100">
              {loading ? (
                <div className="spinner-border text-light" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                "Sign up"
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
