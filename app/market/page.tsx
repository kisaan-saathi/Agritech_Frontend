// app/market/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  MapPin,
  Sprout,
  Filter,
  Loader2,
  RefreshCw,
  IndianRupee,
  Navigation,
  Globe,
  Wifi,
  ServerOff
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart, // Added for the new chart
  Bar,      // Added for the new chart
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import PageHeader from "@/components/layout/PageHeader";

/* ================= 1. CONSTANTS & DATA LISTS ================= */

const ALL_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

// Mapping of Districts for major states
const DISTRICTS: Record<string, string[]> = {
  "Andhra Pradesh": ["Alluri Sitharama Raju", "Anakapalli", "Anantapur", "Annamayya", "Bapatla", "Chittoor", "Dr. B.R. Ambedkar Konaseema", "East Godavari", "Eluru", "Guntur", "Kakinada", "Krishna", "Kurnool", "Nandyal", "NTR", "Palnadu", "Parvathipuram Manyam", "Prakasam", "Sri Potti Sriramulu Nellore", "Sri Sathya Sai", "Srikakulam", "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Arunachal Pradesh": ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang", "Itanagar Capital Complex"],
  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Manendragarh-Chirmiri-Bharatpur", "Mohla-Manpur-Ambagarh Chowki", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sarangarh-Bilaigarh", "Shakti", "Sukma", "Surajpur", "Surguja"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
  "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Saraikela Kharsawan", "Simdega", "West Singhbhum"],
  "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapura", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara", "Vijayapura", "Yadgir"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Ladakh": ["Kargil", "Leh"],
  "Lakshadweep": ["Lakshadweep"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Niwari", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "Eastern West Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"],
  "Nagaland": ["Chümoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Niuland", "Noklak", "Peren", "Phek", "Shamator", "Tseminyü", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Malerkotla", "Mansa", "Moga", "Mohali", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "Shaheed Bhagat Singh Nagar", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Anupgarh", "Balotra", "Banswara", "Baran", "Barmer", "Beawar", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Deeg", "Dholpur", "Didwana-Kuchaman", "Dudu", "Dungarpur", "Gangapur City", "Hanumangarh", "Jaipur", "Jaipur Rural", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Jodhpur Rural", "Karauli", "Kekri", "Khairthal-Tijara", "Kota", "Kotputli-Behror", "Nagaur", "Neem Ka Thana", "Pali", "Phalodi", "Pratapgarh", "Rajsamand", "Salumbar", "Sanchore", "Sawai Madhopur", "Shahpura", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  "Sikkim": ["Gangtok", "Gyalshing", "Mangan", "Namchi", "Pakyong", "Soreng"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hanamkonda", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
  "Default": ["Central District", "North District", "South District", "East District"]
};

const ALL_CROPS = [
  "Wheat", "Rice", "Maize", "Bajra", "Jowar", "Soybean", "Mustard", "Groundnut",
  "Cotton", "Sugarcane", "Onion", "Potato", "Tomato", "Turmeric", "Chilli", "Jeera",
  "Gram (Chana)", "Tur (Arhar)", "Moong", "Urad", "Masur", "Barley", "Ragi",
  "Castor Seed", "Sunflower", "Sesame", "Linseed", "Safflower", "Niger Seed",
  "Jute", "Mesta", "Coconut", "Arecanut", "Tobacco", "Tea", "Coffee", "Rubber",
  "Cardamom", "Pepper", "Ginger", "Garlic", "Coriander", "Cumin", "Fennel", "Fenugreek"
];

const API_BASE = `${process.env.NEXT_PUBLIC_BACKEND_URL}`; 

/* ================= 2. TYPES ================= */

type MarketTick = {
  date: string; // ISO Date YYYY-MM-DD
  price: number;
};

type MarketItem = {
  id: string;
  state: string;
  district: string;
  market: string;
  commodity: string;
  arrival: string;
  min: number;
  max: number;
  modal: number;
  trendHistory: MarketTick[];
  lastUpdated: string;
};

/* ================= 3. MOCK GENERATOR (FALLBACK) ================= */

const generateMockData = (state: string, district: string, commodity: string): MarketItem[] => {
  const markets = [
    `${district} APMC`, 
    `${district} Mandi Yard`, 
    `Regional Hub (${district})`, 
    `Rural Depot - ${district.substring(0,3)}`
  ];
  
  let base = 2200;
  if (["Soybean", "Mustard", "Groundnut"].includes(commodity)) base = 5200;
  if (["Onion", "Tomato", "Potato"].includes(commodity)) base = 1800;
  if (["Jeera", "Cardamom", "Pepper"].includes(commodity)) base = 12000;
  if (["Cotton", "Turmeric"].includes(commodity)) base = 7500;

  return markets.map((m, i) => {
    const variance = (Math.random() - 0.5) * (base * 0.15);
    const currentPrice = Math.floor(base + variance);
    
    const history = Array.from({ length: 10 }).map((_, d) => {
      const date = new Date();
      date.setDate(date.getDate() - (9 - d));
      return {
        date: date.toISOString().split('T')[0],
        price: Math.floor(currentPrice - (Math.random() - 0.5) * (base * 0.05) + (d * 5))
      };
    });
    history[history.length - 1].price = currentPrice;

    return {
      id: `m-${i}`,
      state,
      district,
      market: m,
      commodity,
      arrival: `${Math.floor(Math.random() * 800) + 50} Qtl`,
      min: Math.floor(currentPrice * 0.95),
      max: Math.floor(currentPrice * 1.05),
      modal: currentPrice,
      trendHistory: history,
      lastUpdated: new Date().toISOString(),
    };
  });
};

/* ================= 4. HELPERS ================= */

function getTrend(history: MarketTick[]) {
  if (history.length < 2) return "flat";
  const latest = history[history.length - 1].price;
  const prev = history[history.length - 2].price;
  const diff = latest - prev;
  
  const threshold = latest * 0.01; 
  if (diff > threshold) return "up";
  if (diff < -threshold) return "down";
  return "flat";
}

function formatDateTick(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getAdvisory(trend: string) {
  if (trend === "up")
    return {
      label: "HOLD STOCK",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: TrendingUp,
      reason: "Prices are rising. Wait for peak.",
    };
  if (trend === "down")
    return {
      label: "SELL NOW",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: TrendingDown,
      reason: "Prices falling. Sell immediately.",
    };
  return {
    label: "WATCH",
    color: "bg-blue-50 text-blue-800 border-blue-200",
    icon: Minus,
    reason: "Market stable. Monitor closely.",
  };
}

/* ================= 5. COMPONENT ================= */

export default function MarketPage() {
  const [state, setState] = useState("Maharashtra");
  const [district, setDistrict] = useState("Pune");
  const [commodity, setCommodity] = useState("Onion");
  
  const [stateOptions, setStateOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [cropOptions, setCropOptions] = useState<string[]>([]);

  const [markets, setMarkets] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  // --- 1. Initialize Filters ---
  useEffect(() => {
    async function initFilters() {
      // States
      try {
        const res = await fetch(`${API_BASE}/filters/states`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setStateOptions(data);
      } catch (e) {
        setStateOptions(ALL_STATES);
      }
      // Crops
      try {
        const res = await fetch(`${API_BASE}/filters/crops`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCropOptions(data);
      } catch (e) {
        setCropOptions(ALL_CROPS);
      }
    }
    initFilters();
  }, []);

  // --- 2. Update Districts ---
  useEffect(() => {
    async function fetchDistricts() {
      try {
        const res = await fetch(`${API_BASE}/filters/districts?state=${state}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setDistrictOptions(data);
        if (!data.includes(district)) setDistrict(data[0]);
      } catch (e) {
        const fallback = DISTRICTS[state] || DISTRICTS["Default"];
        setDistrictOptions(fallback);
        if (!fallback.includes(district)) setDistrict(fallback[0]);
      }
    }
    fetchDistricts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // --- 3. Fetch Market Data ---
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/markets?state=${state}&district=${district}&commodity=${commodity}`);
        if (!res.ok) throw new Error("API Failed");
        const data = await res.json();
        if (isMounted) {
          setMarkets(data.items || []);
          setUsingMock(false);
        }
      } catch (err) {
        if (isMounted) {
          setMarkets(generateMockData(state, district, commodity));
          setUsingMock(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    const timer = setTimeout(() => fetchData(), 400);
    return () => { isMounted = false; clearTimeout(timer); };
  }, [state, district, commodity]);

  const bestMarket = useMemo(() => {
    return markets.reduce(
      (best, m) => (m.modal > (best?.modal ?? 0) ? m : best),
      null as MarketItem | null
    );
  }, [markets]);

  return (
    <div className="h-screen overflow-y-auto bg-slate-50 pb-20 font-sans">
      
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="px-6 py-4 flex flex-col gap-4 max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <PageHeader/>
              <img src="/images/mithu.jpg" alt="MarketSaathi Logo" className="h-8 w-8" />
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Market<span className="text-green-600">Saathi</span></h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex items-center gap-1 ${usingMock ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                    {usingMock ? "" : "Live Feed"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DROPDOWNS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative group">
              <label className="text-[10px] font-bold text-slate-500 uppercase absolute -top-2 left-2 bg-white px-1">State</label>
              <select className="w-full appearance-none border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 bg-white hover:border-green-400 focus:border-green-600 focus:ring-0 outline-none transition-all" value={state} onChange={(e) => setState(e.target.value)}>
                {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <MapPin className="absolute right-3 top-3.5 text-slate-400" size={16} />
            </div>
            <div className="relative group">
              <label className="text-[10px] font-bold text-slate-500 uppercase absolute -top-2 left-2 bg-white px-1">District</label>
              <select className="w-full appearance-none border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 bg-white hover:border-blue-400 focus:border-blue-600 focus:ring-0 outline-none transition-all" value={district} onChange={(e) => setDistrict(e.target.value)}>
                {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <Navigation className="absolute right-3 top-3.5 text-slate-400" size={16} />
            </div>
            <div className="relative group">
              <label className="text-[10px] font-bold text-slate-500 uppercase absolute -top-2 left-2 bg-white px-1">Commodity</label>
              <select className="w-full appearance-none border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 bg-white hover:border-amber-400 focus:border-amber-600 focus:ring-0 outline-none transition-all" value={commodity} onChange={(e) => setCommodity(e.target.value)}>
                {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <Filter className="absolute right-3 top-3.5 text-slate-400" size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mb-2 text-green-600" size={32} />
            <p className="font-semibold text-sm">Fetching rates for {district}...</p>
          </div>
        ) : (
          <>
            {/* KPI CARDS */}
            {bestMarket && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center group hover:border-green-200 transition-all">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Rate in {district}</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">₹{bestMarket.modal}<span className="text-xs text-slate-500 font-bold ml-1">/Qtl</span></h3>
                    <p className="text-xs font-bold text-green-600 mt-1 flex items-center gap-1"><TrendingUp size={12} /> {bestMarket.market}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><IndianRupee size={24} /></div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center group hover:border-blue-200 transition-all">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trading Range</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">₹{bestMarket.min} - ₹{bestMarket.max}</h3>
                    <p className="text-xs font-bold text-blue-600 mt-1 flex items-center gap-1"><RefreshCw size={12} /> {markets.length} Markets Live</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Filter size={24} /></div>
                </div>
                {(() => {
                  const trend = getTrend(bestMarket.trendHistory);
                  const adv = getAdvisory(trend);
                  return (
                    <div className={`p-5 rounded-xl border-2 flex flex-col justify-center ${adv.color} relative overflow-hidden`}>
                      <div className="flex items-center gap-2 mb-1 relative z-10"><adv.icon size={20} /><span className="font-black text-xs uppercase tracking-widest">ADVISORY</span></div>
                      <h3 className="text-xl font-black relative z-10">{adv.label}</h3>
                      <p className="text-xs font-semibold opacity-90 mt-1 relative z-10">{adv.reason}</p>
                      <adv.icon className="absolute -right-4 -bottom-4 opacity-10" size={80} />
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AREA CHART */}
              {bestMarket && (
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Price Trend Analysis</h3>
                      <p className="text-xs text-slate-500 font-semibold">10-Day Trend • {bestMarket.market}</p>
                    </div>
                  </div>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={bestMarket.trendHistory}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" tickFormatter={formatDateTick} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                        <Tooltip formatter={(value) => [`₹${value}`, "Price"]} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontWeight: 'bold'}} />
                        <Area type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={3} fill="url(#colorPrice)" activeDot={{ r: 6, strokeWidth: 0, fill: '#15803d' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* MARKET COMPARISON BAR CHART (New Feature) */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                <div className="mb-6">
                  <h3 className="font-bold text-slate-900 text-lg">Mandi Rates</h3>
                  <p className="text-xs text-slate-500 font-semibold">Live Comparison</p>
                </div>
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={markets} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="market" 
                        tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                        axisLine={false} 
                        tickLine={false} 
                        interval={0}
                        tickFormatter={(val) => val.length > 8 ? `${val.slice(0, 6)}..` : val}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(val) => `₹${val}`}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        formatter={(value) => [`₹${value}`, "Price"]}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                      />
                      <Bar 
                        dataKey="modal" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]} 
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Detailed Market Report</h3>
                <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-1 rounded font-bold uppercase">{markets.length} Mandis</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Market Name</th>
                      <th className="px-6 py-3">Arrivals</th>
                      <th className="px-6 py-3">Min/Max Price</th>
                      <th className="px-6 py-3">Modal Price</th>
                      <th className="px-6 py-3 text-center">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {markets.map((m) => {
                      const trend = getTrend(m.trendHistory);
                      return (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 font-bold text-slate-700 group-hover:text-green-700">{m.market}</td>
                          <td className="px-6 py-4 text-slate-500 font-medium">{m.arrival}</td>
                          <td className="px-6 py-4 text-slate-500 font-medium">₹{m.min} - ₹{m.max}</td>
                          <td className="px-6 py-4 font-black text-slate-800 text-base">₹{m.modal}</td>
                          <td className="px-6 py-4 text-center">
                            {trend === "up" && <span className="inline-flex items-center text-green-700 bg-green-100 px-2.5 py-1 rounded-md text-xs font-bold"><TrendingUp size={14} className="mr-1"/> UP</span>}
                            {trend === "down" && <span className="inline-flex items-center text-red-700 bg-red-100 px-2.5 py-1 rounded-md text-xs font-bold"><TrendingDown size={14} className="mr-1"/> DOWN</span>}
                            {trend === "flat" && <span className="inline-flex items-center text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-bold"><Minus size={14} className="mr-1"/> STABLE</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}