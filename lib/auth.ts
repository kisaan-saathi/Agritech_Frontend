import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:4000/api/v1/auth";

export const sendOTP = async (email: string, name: string) => {
  try {
    const res = await axios.post(
      `${API_BASE}/send-verification-mail`,
      { email, name },
      { headers: { "Content-Type": "application/json" } }
    );
    if (res.data.statusCode == 200) {
      toast.success(res.data.message);
      return true;
    } else {
      toast.error(res.data.message);
      return false;
    }
  } catch (err: any) {
    console.log("Send OTP error", err);
    toast.error(`${err.message}`);
    return false;
  }
};

export const verifyOTP = async (email: string, otp: string) => {
  try {
    const res = await axios.post(
      `${API_BASE}/verify-otp`,
      { email, otp },
      { headers: { "Content-Type": "application/json" } }
    );
    if (res.data.statusCode == 200) {
      toast.success(res.data.message);
      return true;
    } else {
      toast.error(res.data.message);
      return false;
    }
  } catch (err: any) {
    console.log("Verify OTP error", err);
    toast.error(`${err.message}`);
    return false;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const res = await axios.post(
      `${API_BASE}/login`,
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );
    if (res.data.statusCode == 200) {
      localStorage.setItem("refreshToken", res.data.data.refreshToken);
      localStorage.setItem("accessToken", res.data.data.accessToken);
      toast.success(res.data.message);
      return true;
    } else {
      toast.error(res.data.message);
      return false;
    }
  } catch (err: any) {
    console.log("Login error", err);
    toast.error(`${err.message}`);
    return false;
  }
};

export const signup = async (data: {
  email: string;
  password: string;
  confirm_password: string;
  name: string;
  phone_no: string;
}) => {
  try {
    console.log("Signup data", data);
    const res = await axios.post(`${API_BASE}/signup`, data, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("Signup response", res);
    if (res.data.statusCode == 200) {
      toast.success(res.data.message);
      return true;
    } else {
      toast.error(res.data.message);
      return false;
    }
  } catch (err: any) {
    console.log("Signup error", err);
    toast.error(`${err.message}`);
    return false;
  }
};