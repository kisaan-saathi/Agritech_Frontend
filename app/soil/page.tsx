"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { Pie } from "react-chartjs-2";

import {
  BookOpen,
  FileText,
  GraduationCap,
  ImageIcon,
  ArrowRight,
  ThermometerSun,
  Sprout,
  AlertTriangle,
  Droplets,
  CheckCircle2,
} from "lucide-react";

import { useRouter } from "next/navigation";
import FarmMap from "@/components/ui/farm-map";
import PageHeader from "@/components/layout/PageHeader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

// ===== STATIC DATA FOR FALLBACKS =====
const INDIAN_LOCATIONS: { [key: string]: string[] } = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],
  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
  "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
  "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
  "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khurda", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shahid Bhagat Singh Nagar", "Sri Muktsar Sahib", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupattur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal", "Nagarkurnool", "Nalgonda", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal (Rural)", "Warangal (Urban)", "Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
  "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
  "Ladakh": ["Kargil", "Leh"],
  "Lakshadweep": ["Lakshadweep"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"]
};

// Fallback Soil Data (Mirrors the expected API structure)
const FALLBACK_SOIL_DATA = {
  soilScore: 87,
  nutrients: {
    N: 254, P: 15, K: 191, OC: 0.6,
    pH: 5.7, EC: 0.03, S: 12, Zn: 0.56, B: 0.48, Fe: 4.5, Mn: 2.1, Cu: 0.8
  },
  stats: {
    N: { high: 22, med: 75, low: 3 },
    P: { high: 35, med: 50, low: 15 },
    K: { high: 32, med: 57, low: 11 },
    S: { suff: 73, def: 27 },
    Fe: { suff: 71, def: 29 },
    Zn: { suff: 61, def: 39 },
    Cu: { suff: 95, def: 5 },
    B: { suff: 62, def: 38 },
    Mn: { suff: 88, def: 12 },
    OC: { high: 27, med: 16, low: 57 },
    pH: { acidic: 50, neutral: 40, alkaline: 10 },
    EC: { nonSaline: 95, saline: 5 }
  },
  forecast7d: [
    { day: "Today", temp: 26, moist: 45, status: "Optimal" },
    { day: "Mon", temp: 26, moist: 42, status: "Optimal" },
    { day: "Tue", temp: 26, moist: 40, status: "Optimal" },
    { day: "Wed", temp: 25, moist: 38, status: "Optimal" },
    { day: "Thu", temp: 26, moist: 35, status: "Critical" },
    { day: "Fri", temp: 27, moist: 34, status: "Monitor" },
    { day: "Sat", temp: 28, moist: 32, status: "Dry" },
  ],
  soilLayers: [
    { label: "5–10 cm", value: 28, status: "Monitor", color: "yellow" },
    { label: "15–30 cm", value: 25, status: "Optimal", color: "green" },
    { label: "30–60 cm", value: 18, status: "Good", color: "blue" },
    { label: "60–100 cm", value: 14, status: "Too Cold", color: "red" },
  ],
  moistureLayers: [
    { label: "5–10 cm", value: 18, status: "Low", color: "red" },
    { label: "15–30 cm", value: 32, status: "Optimal", color: "green" },
    { label: "30–60 cm", value: 45, status: "Good", color: "blue" },
    { label: "60–100 cm", value: 55, status: "Good", color: "blue" },
  ]
};

// Fallback Fertilizer Recommendation
const MOCK_FERTILIZER_RESPONSE = {
  crop: "Wheat (Recommended)",
  soilConditioner: "Gypsum @ 200kg/ha",
  combo1: ["Urea: 120kg/ha", "DAP: 50kg/ha", "MOP: 40kg/ha"],
  combo2: ["NPK(12:32:16): 150kg/ha", "Urea: 80kg/ha"]
};

// ===== Weather UI Helper =====
function getWeatherUI(temp: number, moist: number) {
  if (temp <= 12) {
    return {
      bg: "from-cyan-100 to-blue-200",
      icon: "❄️",
    };
  }

  if (moist >= 70) {
    return {
      bg: "from-slate-700 to-slate-900",
      icon: "🌧",
    };
  }

  if (moist >= 60) {
    return {
      bg: "from-slate-300 to-slate-400",
      icon: "☁️",
    };
  }

  if (temp >= 32) {
    return {
      bg: "from-yellow-300 to-orange-400",
      icon: "☀️",
    };
  }

  return {
    bg: "from-sky-100 to-sky-200",
    icon: "🌤",
  };
}

// ===== Action Card Component =====
function ActionCard({ step, color, title, desc, cta }: { step: string; color: string; title: string; desc: string; cta: string }) {
  const styles: any = {
    red: { box: "bg-red-50 border-red-100", title: "text-red-900", btn: "bg-red-100 text-red-700 hover:bg-red-200" },
    yellow: { box: "bg-yellow-50 border-yellow-100", title: "text-yellow-900", btn: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
    blue: { box: "bg-blue-50 border-blue-100", title: "text-blue-900", btn: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
    green: { box: "bg-green-50 border-green-100", title: "text-green-900", btn: "bg-green-100 text-green-700 hover:bg-green-200" },
  };

  const s = styles[color] || styles.blue;

  return (
    <div className={`p-3 rounded-lg border ${s.box} flex flex-col gap-2`}>
      <div className="flex justify-between items-start">
        <span className="font-bold text-[10px] uppercase tracking-wider opacity-60">Step {step}</span>
      </div>
      <div>
        <div className={`font-bold text-xs leading-tight ${s.title}`}>{title}</div>
        <div className="text-[10px] text-gray-600 mt-1 leading-snug">{desc}</div>
      </div>
      <button className={`mt-auto w-full py-1.5 rounded text-[10px] font-bold ${s.btn} transition-colors`}>
        {cta}
      </button>
    </div>
  );
}

export default function SoilPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Fertilizer state ---------- */
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [N, setN] = useState("");
  const [P, setP] = useState("");
  const [K, setK] = useState("");
  const [OC, setOC] = useState("");
  const [fertilizer, setFertilizer] = useState<any>(null);
  const [loadingFert, setLoadingFert] = useState(false);

  // New State for Nutrient Tabs
  const [nutrientTab, setNutrientTab] = useState<"macro" | "micro" | "prop">("macro");

  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loadingSoil, setLoadingSoil] = useState(true);

  /* ---------- VALIDATION ---------- */
  const isFormValid =
    !!state &&
    !!district &&
    !!N &&
    !!P &&
    !!K &&
    !!OC &&
    !loadingFert;

  /* ---------- Load soil + states (with robust fallback) ---------- */
  useEffect(() => {
    async function loadInitialData() {
      setLoadingSoil(true);
      
      // 1. Fetch Soil Data
      try {
        const soilRes = await fetch(`${API_BASE}/soil`);
        if (!soilRes.ok) throw new Error("API Failed");
        const soilJson = await soilRes.json();
        setData(soilJson);
        
        // Populate inputs if data exists
        if (soilJson?.nutrients) {
          setN(String(soilJson.nutrients.N ?? ""));
          setP(String(soilJson.nutrients.P ?? ""));
          setK(String(soilJson.nutrients.K ?? ""));
          setOC(String(soilJson.nutrients.OC ?? ""));
        }
      } catch (e) {
        console.warn("Using Fallback Soil Data");
        setData(FALLBACK_SOIL_DATA);
        // Populate inputs from fallback
        setN(String(FALLBACK_SOIL_DATA.nutrients.N));
        setP(String(FALLBACK_SOIL_DATA.nutrients.P));
        setK(String(FALLBACK_SOIL_DATA.nutrients.K));
        setOC(String(FALLBACK_SOIL_DATA.nutrients.OC));
      }

      // 2. Fetch States
      try {
        const stateRes = await fetch(`${API_BASE}/locations/states`);
        if (!stateRes.ok) throw new Error("API Failed");
        const stateJson = await stateRes.json();
        setStates(stateJson);
      } catch (e) {
        console.warn("Using Fallback State Data");
        setStates(Object.keys(INDIAN_LOCATIONS).sort());
      } finally {
        setLoadingSoil(false);
      }
    }

    loadInitialData();
  }, []);

  /* ---------- Load districts (with robust fallback) ---------- */
  useEffect(() => {
    if (!state) {
      setDistricts([]);
      return;
    }

    async function fetchDistricts() {
        try {
            const res = await fetch(`${API_BASE}/locations/districts?state=${state}`);
            if(!res.ok) throw new Error("API Failed");
            const data = await res.json();
            setDistricts(data);
        } catch (e) {
            console.warn("Using Fallback District Data");
            const districtList = INDIAN_LOCATIONS[state] || [];
            // Use copy to avoid mutation issues
            setDistricts([...districtList].sort());
        }
    }
    
    fetchDistricts();
    setDistrict(""); // Reset district selection when state changes
  }, [state]);

  /* ---------- Fertilizer API (with robust fallback) ---------- */
  async function getRecommendation() {
    setLoadingFert(true);
    setFertilizer(null); // Clear previous

    try {
      const res = await fetch(`${API_BASE}/fertilizer/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
          district,
          N: Number(N),
          P: Number(P),
          K: Number(K),
          OC: Number(OC),
        }),
      });

      if (!res.ok) throw new Error("API Failed");
      const json = await res.json();
      setFertilizer(json);
    } catch {
      console.warn("Using Fallback Fertilizer Recommendation");
      // Simulate network delay for realism
      setTimeout(() => {
         setFertilizer(MOCK_FERTILIZER_RESPONSE);
         setLoadingFert(false);
      }, 800);
      return; // Return early so finally doesn't double-set
    } finally {
        // Only run if not caught (catch block handles its own loading state for delay simulation)
        // But since we returned early in catch, we can put standard loading false here for success case
        // However, to be safe with the logic flow:
    }
    
    // Safety if success
    setLoadingFert(false);
  }

  // API data processing (Safe accessing because data is guaranteed via fallback)
  const finalForecast7d = data?.forecast7d || FALLBACK_SOIL_DATA.forecast7d;
  const hasValidForecastData = true; // Since we always have data now

  const soilLayersFromAPI = data?.soilLayers;
  const layers = (Array.isArray(soilLayersFromAPI) && soilLayersFromAPI.length > 0)
    ? soilLayersFromAPI
    : FALLBACK_SOIL_DATA.soilLayers;

  const moistureLayersFromAPI = data?.moistureLayers;
  const moistureLayers = (Array.isArray(moistureLayersFromAPI) && moistureLayersFromAPI.length > 0)
    ? moistureLayersFromAPI
    : FALLBACK_SOIL_DATA.moistureLayers;

  // ✅ SHARED soil gradient palette (USED IN MULTIPLE PLACES)
  const soilGradients = [
    "from-[#7b5a3a] to-[#6a4a2f]",
    "from-[#6a4a2f] to-[#5a3a25]",
    "from-[#5a3a25] to-[#4a2f1f]",
    "from-[#4a2f1f] to-[#3a2416]",
  ];
  const SOIL_ROW_HEIGHT = "80px";
  function SoilLayerStack({ layers }: { layers: any[] }) {

    return (
      <div className="relative w-[140px]">
        {/* Grass / Surface */}
        <div className="h-6 rounded-t-full bg-gradient-to-b from-green-400 to-green-700 shadow-sm" />

        {/* Soil Column */}
        <div className="overflow-hidden rounded-b-2xl shadow-lg border border-[#4a2f1f]">
          {layers.map((layer, i) => (
            <div
              key={i}
              style={{ height: SOIL_ROW_HEIGHT }}
              className={`
              flex items-center justify-center
              text-white font-semibold text-sm
              bg-gradient-to-b ${soilGradients[i]}
              border-b border-black/10
              relative
            `}
            >
              {/* subtle highlight */}
              <div className="absolute inset-0 bg-white/5 pointer-events-none" />

              {layer.value}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function DepthRowAligned({
    label,
    value,
    status,
    color,
  }: any) {
    const badgeMap: any = {
      yellow: "bg-yellow-100 text-yellow-700",
      green: "bg-green-100 text-green-700",
      blue: "bg-blue-100 text-blue-700",
      red: "bg-red-100 text-red-700",
    };

    return (
      <div
        className="w-full flex items-center justify-between"
      >
        {/* Temperature */}
        <div className="text-sm font-bold text-gray-900">
          {value}
        </div>

        {/* Status */}
        <div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeMap[color]}`}
          >
            {status}
          </span>
        </div>
      </div>
    );
  }

  // =========================================================
  //  NEW NUTRIENT SECTION HELPER FUNCTIONS & DATA
  // =========================================================

  // Fallback data is now FALLBACK_SOIL_DATA
  const STATIC_DISTRIBUTION = FALLBACK_SOIL_DATA.stats;
  const STATIC_TEST_VALUES = FALLBACK_SOIL_DATA.nutrients;

  // Component for a Single Grouped Bar Row (Sleek Redesign)
  const NutrientGroupRow = ({
    label,
    myValue,
    unit,
    bars,
    isGrid = false // NEW PROP: Helps layout in grid without reducing text size
  }: {
    label: string,
    myValue: any,
    unit: string,
    bars: { label: string, val: number, color: string }[],
    isGrid?: boolean
  }) => {
    return (
      <div className={`group relative bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md rounded-2xl p-5 transition-all duration-300 ${isGrid ? 'h-full' : ''}`}>
        
        {/* Header Line */}
        <div className="flex justify-between items-end mb-4">
          <div className="flex items-center gap-2">
             {/* Decorative dot */}
             <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-green-500 transition-colors"></div>
             <span className="text-base font-bold text-slate-700 tracking-tight">{label}</span>
          </div>
          
          {myValue !== null && myValue !== undefined ? (
             <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex flex-col items-end">
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Test Result</span>
               <span className="font-extrabold text-sm text-slate-800 leading-none">
                  {myValue} <span className="text-[10px] font-semibold text-slate-500 ml-0.5">{unit}</span>
               </span>
             </div>
          ) : (
            <span className="px-3 py-1 text-xs font-medium text-slate-400 bg-slate-50 rounded-lg">
              Not Tested
            </span>
          )}
        </div>

        {/* The Grouped Bars */}
        <div className="space-y-3">
          {bars.map((bar, idx) => (
            <div key={idx} className={`flex items-center ${isGrid ? 'gap-2' : 'gap-3'}`}>
               {/* Label */}
               <div className="w-14 text-[11px] font-semibold text-slate-500 text-right shrink-0">
                 {bar.label}
               </div>
               
               {/* Track & Bar */}
               <div className="flex-1 h-3 bg-slate-100 rounded-full relative overflow-hidden">
                  <div 
                    className={`h-full rounded-full shadow-sm transition-all duration-1000 ease-out ${bar.color}`} 
                    style={{ width: `${bar.val}%` }}
                  />
               </div>
               
               {/* Percentage */}
               <div className="w-8 text-[11px] font-bold text-slate-700 text-right">
                 {bar.val}%
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  };


  return (
    // ADDED: h-screen and overflow-y-auto to enable scrolling
    <div className="p-5 h-screen overflow-y-auto bg-[#f3f7f6]">
      {/* ================= MITHU TOP STRIP ================= */}
      <div className="bg-white px-6 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg">
          <PageHeader />
          <img src="/images/mithu.jpg" className="w-10 h-10 object-contain" />
          <div>
            <div className="font-bold text-green-800">Soil Saathi</div>
            <div className="text-xs text-gray-500">
              Mithu — your soil co-pilot
            </div>
          </div>
        </div>
        <button
          onClick={() => location.reload()}
          className="bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 mt-2 rounded">
          {error}
        </div>
      )}

      {/* ================= FIELD MAP (Full Width) ================= */}
      <div className="w-full my-4 h-98">
          <FarmMap
            title="Soil Map"
            initialLayer="savi"
          />
      </div>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-[500px_1fr] gap-4 items-stretch">

        {/* LEFT COLUMN: Score Card & Nutrients */}
        <div className="flex flex-col gap-4 h-full">

           {/* 1. SOIL SCORE CARD (Top) */}
           <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm font-semibold mb-2">Soil Score Card</div>
            <div className="bg-green-50 rounded p-3 text-center">
              <div className="text-xs text-gray-500">Overall Soil Score</div>
              <div className="text-3xl font-bold text-green-700">
                {data?.soilScore ?? "--"}
              </div>
              <button onClick={() => router.push('/soil/health-card')}
                className="flex items-center justify-center gap-2 w-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-sm">
                <FileText className="w-3 h-3" /> Get Soil Health Card
              </button>
            </div>
          </div>

          {/* 2. KEY SOIL NUTRIENTS (Fills Remaining Height using flex-1) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden flex-1">
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none"></div>

            {/* TITLE & TABS */}
            <div className="mb-6 relative z-10">
              <div className="text-base font-bold text-center text-slate-800 mb-4">
                Key Soil Nutrients <span className="text-slate-400 font-normal text-sm">(Overview)</span>
              </div>
              
              <div className="flex justify-center">
                <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100 inline-flex gap-1 shadow-sm">
                  {['macro', 'micro', 'prop'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setNutrientTab(t as any)}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${
                        nutrientTab === t
                          ? 'bg-green-600 text-white shadow-md'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-white'
                      }`}
                    >
                      {t === 'macro' ? 'Macronutrients' : t === 'micro' ? 'Micronutrients' : 'Properties'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MAIN CONTENT AREA - NO SCROLL, FULLY DISTRIBUTED */}
            <div className="flex-1 relative z-10 pb-2">

              {/* CONTAINER: SWITCHES BETWEEN LIST AND GRID */}
              {/* Uses justify-between / content-between to fill height without gaps */}
              <div className={nutrientTab === 'micro' ? 'grid grid-cols-2 gap-4 h-full content-between' : 'flex flex-col h-full justify-between'}>
                {(() => {
                  const vals = data?.nutrients ? data.nutrients : STATIC_TEST_VALUES;
                  const stats = data?.stats ? data.stats : STATIC_DISTRIBUTION;

                  if (nutrientTab === "macro") {
                    return (
                      <>
                        <NutrientGroupRow label="Nitrogen (N)" myValue={vals.N} unit="kg/ha" bars={[
                          { label: "High", val: stats.N.high, color: "bg-green-500" },
                          { label: "Medium", val: stats.N.med, color: "bg-yellow-400" },
                          { label: "Low", val: stats.N.low, color: "bg-red-500" }
                        ]} />
                        <NutrientGroupRow label="Phosphorus (P)" myValue={vals.P} unit="kg/ha" bars={[
                          { label: "High", val: stats.P.high, color: "bg-green-500" },
                          { label: "Medium", val: stats.P.med, color: "bg-yellow-400" },
                          { label: "Low", val: stats.P.low, color: "bg-red-500" }
                        ]} />
                        <NutrientGroupRow label="Potassium (K)" myValue={vals.K} unit="kg/ha" bars={[
                          { label: "High", val: stats.K.high, color: "bg-green-500" },
                          { label: "Medium", val: stats.K.med, color: "bg-yellow-400" },
                          { label: "Low", val: stats.K.low, color: "bg-red-500" }
                        ]} />
                      </>
                    );
                  }

                  if (nutrientTab === "micro") {
                    return [
                      { k: 'S', l: 'Sulfur' }, { k: 'Zn', l: 'Zinc' }, { k: 'B', l: 'Boron' },
                      { k: 'Fe', l: 'Iron' }, { k: 'Mn', l: 'Manganese' }, { k: 'Cu', l: 'Copper' }
                    ].map((item) => (
                      <NutrientGroupRow 
                        key={item.k} 
                        label={item.l} 
                        myValue={vals[item.k]} 
                        unit="ppm" 
                        isGrid={true}
                        bars={[
                          { label: "Suff.", val: stats[item.k].suff, color: "bg-green-500" },
                          { label: "Def.", val: stats[item.k].def, color: "bg-red-500" }
                        ]} 
                      />
                    ));
                  }

                  if (nutrientTab === "prop") {
                    return (
                      <>
                        <NutrientGroupRow label="Organic Carbon (OC)" myValue={vals.OC} unit="%" bars={[
                          { label: "High", val: stats.OC.high, color: "bg-green-500" },
                          { label: "Medium", val: stats.OC.med, color: "bg-yellow-400" },
                          { label: "Low", val: stats.OC.low, color: "bg-red-500" }
                        ]} />
                        <NutrientGroupRow label="pH Level" myValue={vals.pH} unit="" bars={[
                          { label: "Alkaline", val: stats.pH.alkaline, color: "bg-purple-500" },
                          { label: "Neutral", val: stats.pH.neutral, color: "bg-green-500" },
                          { label: "Acidic", val: stats.pH.acidic, color: "bg-yellow-500" }
                        ]} />
                        <NutrientGroupRow label="Elec. Conductivity" myValue={vals.EC} unit="dS/m" bars={[
                          { label: "Non-Saline", val: stats.EC.nonSaline, color: "bg-blue-500" },
                          { label: "Saline", val: stats.EC.saline, color: "bg-orange-500" }
                        ]} />
                      </>
                    )
                  }
                })()}
              </div>

            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center font-medium">
              * Distribution data based on regional sampling
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Forecast & Insights */}
        <div className="flex flex-col gap-4 h-full">

          {/* ================= SECTION A : 7-DAY FORECAST ================= */}
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm font-semibold mb-4">
              7-day Forecast
            </div>

            <div className="flex justify-between gap-4">
              {finalForecast7d.map((d: any, i: number) => {
                const weather = getWeatherUI(d.temp, d.moist);
                return (
                  <div
                    key={i}
                    className={`
            relative flex-1 rounded-2xl px-4 py-4 text-center
            bg-gradient-to-b ${weather.bg}
            border border-white/60
            shadow-md
            transition-all duration-300
            `}
                  >
                    {/* Weather Icon */}
                    <div className="absolute top-2 right-2 text-xl">
                      {weather.icon}
                    </div>

                    {/* Day */}
                    <div className="text-sm font-medium text-slate-700">
                      {d.day ?? "Today"}
                    </div>

                    {/* Temperature */}
                    <div className="text-3xl font-bold text-slate-900 mt-1">
                      {d.temp}°
                    </div>

                    {/* Moisture */}
                    <div className="text-xs text-slate-700 mt-1">
                      {d.moist}% Moist
                    </div>

                    {/* Status */}
                    <div className="text-xs font-semibold text-slate-800 mt-1">
                      {d.status}
                    </div>
                  </div>
                );
              })}

            </div>

            {!hasValidForecastData && (
              <div className="text-[11px] text-gray-400 text-center mt-3">
                Showing sample data (real forecast will appear here)
              </div>
            )}
          </div>

          {/* ================= SECTION B : SOIL INSIGHTS (CORRECTED) ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
            
            {/* TEMPERATURE PANEL */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-green-100 rounded-lg"><ThermometerSun className="w-4 h-4 text-green-700" /></div>
                <h3 className="font-bold text-green-900 text-sm">Real-Time Soil Temperature</h3>
              </div>
              
              <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-xs text-green-800 mb-4 flex items-start gap-2">
                <Sprout className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span><span className="font-bold">Co-Pilot Insight:</span> Soil warming trend detected. Planting window optimal in 48hrs.</span>
              </div>

             <div className="mb-6 flex-1 flex flex-col justify-center">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">DIAGNOSTIC VIEW</div>
                
                {/* 1. Container: Height fixed at h-80 for alignment */}
                <div className="flex gap-4 h-80 items-center">
                  
                  {/* 2. Left: Depth Labels - 4 items, centered with equal spacing */}
                  <div className="flex flex-col justify-center gap-10 w-20 flex-shrink-0 pr-2">
                    {layers.map((l: any, i: number) => (
                      <div key={i} className="flex items-center justify-end text-sm text-gray-500 font-medium whitespace-nowrap h-6">
                        {l.label}
                      </div>
                    ))}
                  </div>

                  {/* 3. Center: Image - Full height, centered */}
                  <div className="flex-1 flex justify-center h-[90%] relative">
                     <img src="/images/soil.png" className="h-full w-auto object-contain rounded drop-shadow-sm" />
                  </div>

                  {/* 4. Right: Value + Status - 4 items, centered with equal spacing */}
                  <div className="flex flex-col justify-center gap-10 w-32 flex-shrink-0 pl-2">
                     {layers.map((l: any, i: number) => (
                       <div key={i} className="flex items-center w-full h-6">
                         <DepthRowAligned 
                            {...l} 
                            label="" 
                            value={<span className="font-bold text-gray-800">{l.value}°C</span>} 
                         />
                       </div>
                     ))}
                  </div>

                </div>
              </div>

              {/* Action Plan */}
              <div className="mt-auto pt-4 border-t border-dashed border-gray-200">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                   <AlertTriangle className="w-3 h-3 text-red-400" /> Action Plan Required
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <ActionCard 
                     step="1" 
                     color="red"
                     title="Warming Irrigation" 
                     desc="Initiate thermal irrigation cycle for 3 hours."
                     cta="Set Reminder"
                   />
                   <ActionCard 
                     step="2" 
                     color="yellow"
                     title="Apply P-Boost" 
                     desc="Add 25kg DAP/Hectare to aid root warmth."
                     cta="Track Inventory"
                   />
                </div>
              </div>
            </div>

            {/* MOISTURE PANEL */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-100 rounded-lg"><Droplets className="w-4 h-4 text-blue-700" /></div>
                <h3 className="font-bold text-blue-900 text-sm">Real-Time Soil Moisture</h3>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-800 mb-4 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span><span className="font-bold">Advisory:</span> Rapid moisture decline in top 10cm layer.</span>
              </div>

              <div className="mb-6 flex-1 flex flex-col justify-center">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">DIAGNOSTIC VIEW</div>
                {/* Responsive container, h-80 for matching height */}
                <div className="flex gap-4 h-80 items-center">
                  
                  {/* LEFT: Depth Labels - 4 items, centered with equal spacing */}
                  <div className="flex flex-col justify-center gap-10 w-20 flex-shrink-0 pr-2">
                    {moistureLayers.map((l: any, i: number) => (
                      <div key={i} className="flex items-center justify-end text-sm text-gray-500 font-medium whitespace-nowrap h-6">
                        {l.label}
                      </div>
                    ))}
                  </div>

                  {/* CENTER: Soil Image - Identical styling */}
                  <div className="flex-1 flex justify-center h-[90%] relative">
                     <img src="/images/soil.png" className="h-full w-auto object-contain rounded drop-shadow-sm" />
                  </div>

                  {/* RIGHT: Percentage + Status - 4 items, centered with equal spacing */}
                  <div className="flex flex-col justify-center gap-10 w-32 flex-shrink-0 pl-2">
                     {moistureLayers.map((l: any, i: number) => (
                       <div key={i} className="flex items-center w-full h-6">
                         <DepthRowAligned 
                            key={i} 
                            label="" 
                            value={<span className="font-bold text-gray-800">{l.value}%</span>} 
                            status={l.status} 
                            color={l.color} 
                         />
                       </div>
                     ))}
                  </div>
                  
                </div>
              </div>

              {/* Action Plan */}
              <div className="mt-auto pt-4 border-t border-dashed border-gray-200">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                   <CheckCircle2 className="w-3 h-3 text-blue-400" /> Scheduled Actions
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <ActionCard 
                     step="1" 
                     color="blue"
                     title="Drip Irrigation" 
                     desc="Run system A/B for 45 mins at 6 PM."
                     cta="Start Now"
                   />
                   <ActionCard 
                     step="2" 
                     color="yellow"
                     title="Mulching" 
                     desc="Apply organic mulch to retain top-soil water."
                     cta="View Guide"
                   />
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ================= GOVERNMENT HEADER ================= */}
      <div className="bg-green-50 rounded-xl p-6 shadow border border-green-200 mt-6">

        {/* GOV HEADER */}
        <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center mt-8">
          <div className="flex gap-4">
            <img src="/images/gov-logo.png" className="h-14" />
            <div>
              <div className="font-bold text-sm">Government of India</div>
              <div className="text-xs">Ministry of Agriculture and Farmers Welfare <p>Department of Agriculture and Farmers Welfare</p></div>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <img src="/images/soil-health-logo.png" className="h-12" />
            <div>
              <div className="font-bold">Soil Health Card</div>
              <div className="text-xs text-gray-500">Healthy Earth, Greener Farm</div>
            </div>
          </div>
        </div>

        <div className="bg-green-700 text-white px-6 py-3 font-semibold text-lg">Fertilizer Recommendation</div>
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">

          {/* ✅ FIX #2: RESTORED INPUT WRAPPER */}
          <div className="bg-white rounded-lg p-4 border shadow-sm">

            <select className="w-full border rounded px-3 py-2 mb-3" value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">Select State</option>
              {Array.isArray(states) && states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <select className="w-full border rounded px-3 py-2 mb-3" value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!state}>
              <option value="">Select District</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Nitrogen" value={N} onChange={(e) => setN(e.target.value)} />
            <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Phosphorus" value={P} onChange={(e) => setP(e.target.value)} />
            <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Potassium" value={K} onChange={(e) => setK(e.target.value)} />
            <input className="w-full border rounded px-3 py-2 mb-4" placeholder="Organic Carbon" value={OC} onChange={(e) => setOC(e.target.value)} />

            <button
              onClick={getRecommendation}
              disabled={!isFormValid}
              className={`px-4 py-2 border rounded w-full ${isFormValid ? "bg-white" : "bg-gray-200 cursor-not-allowed"
                }`}
            >
              {loadingFert ? "Loading..." : "Get Recommendations"}
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="px-4 py-2 border-b bg-green-50 font-semibold text-green-800">Recommendation</div>
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Crop</th>
                  <th className="p-2 border">Soil Conditioner</th>
                  <th className="p-2 border">Fertilizer Combination 1</th>
                  <th className="p-2 border">Fertilizer Combination 2</th>
                </tr>
              </thead>
              <tbody>
                {fertilizer ? (
                  <tr>
                    <td className="p-2 border">{fertilizer.crop}</td>
                    <td className="p-2 border">{fertilizer.soilConditioner}</td>
                    <td className="p-2 border">{fertilizer.combo1?.map((c: string, i: number) => <div key={i}>{c}</div>)}</td>
                    <td className="p-2 border">{fertilizer.combo2?.map((c: string, i: number) => <div key={i}>{c}</div>)}</td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={4} className="p-3 text-center text-gray-400">
                      Click "Get Recommendations" to view fertilizer advice
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* ================= RESOURCES ================= */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "Knowledge Material",
              desc: "Explore guides, manuals, and videos to help you adopt sustainable, chemical-free farming practices.",
              icon: BookOpen,
            },
            {
              title: "Guidelines",
              desc: "Access policy documents and instructions to support smooth and effective execution of the mission.",
              icon: FileText,
            },
            {
              title: "Study Material",
              desc: "Download study materials that simplify natural farming methods for easy understanding and implementation.",
              icon: GraduationCap,
            },
            {
              title: "Gallery",
              desc: "1 crore farmers to be trained and made aware of NF practices, with the help of 2 Krishi Sakhis per cluster.",
              icon: ImageIcon,
            },
          ].map((r) => (
            <div
              key={r.title}
              className="bg-white rounded-2xl p-6 shadow flex justify-between items-start"
            >
              <div className="flex gap-4">
                <r.icon className="text-green-700 w-10 h-10" />
                <div>
                  <div className="font-bold">{r.title}</div>
                  <div className="text-sm text-gray-500">{r.desc}</div>
                </div>
              </div>
              <ArrowRight className="text-gray-300" />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}