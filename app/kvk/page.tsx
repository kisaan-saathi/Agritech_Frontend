// kvk/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement 
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  Calendar, Layers, MapPin, Activity, FileText, LogOut, ChevronRight, AlertTriangle 
} from 'lucide-react';

// Register Charts
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// --- CONSTANTS ---
const SEASONS = ["Oct-Dec (2025-2026)", "Rabi 2025-2026", "Kharif 2025", "Zaid 2025"];
const PARAMETERS = [
  "NDVI Deviation", "NDVI (Vegetation)", "NDRE", "SAVI", 
  "Soil Moisture", "Rainfall Deviation", "Crop Stress Index"
];

// --- HIERARCHICAL DATA ---
const LOCATION_DATA: Record<string, Record<string, string[]>> = {
  "Maharashtra": {
    "Pune": ["Haveli", "Mulshi", "Maval", "Baramati", "Junnar", "Khed", "Ambegaon", "Shirur"],
    "Mumbai City": ["Colaba", "Byculla", "Malabar Hill", "Matunga", "Sion"],
    "Mumbai Suburban": ["Andheri", "Borivali", "Bandra", "Kurla", "Ghatkopar"],
    "Nashik": ["Nashik", "Malegaon", "Niphad", "Sinnar", "Igatpuri"],
    "Nagpur": ["Nagpur Urban", "Nagpur Rural", "Kamptee", "Hingna", "Katol"],
    "Ahmednagar": [], "Akola": [], "Amravati": [], "Aurangabad": [], "Beed": [], "Bhandara": [], "Buldhana": [], "Chandrapur": [], "Dhule": [], "Gadchiroli": [], "Gondia": [], "Hingoli": [], "Jalgaon": [], "Jalna": [], "Kolhapur": [], "Latur": [], "Nanded": [], "Nandurbar": [], "Osmanabad": [], "Palghar": [], "Parbhani": [], "Raigad": [], "Ratnagiri": [], "Sangli": [], "Satara": [], "Sindhudurg": [], "Solapur": [], "Thane": [], "Wardha": [], "Washim": [], "Yavatmal": []
  },
  "Gujarat": {
    "Ahmedabad": ["Ahmedabad City", "Daskroi", "Sanand", "Bavla", "Dholka"],
    "Surat": ["Surat City", "Choryasi", "Olpad", "Kamrej", "Mangrol"],
    "Vadodara": ["Vadodara City", "Padra", "Karjan", "Waghodia", "Savli"],
    "Rajkot": [], "Amreli": [], "Anand": [], "Aravalli": [], "Banaskantha": [], "Bharuch": [], "Bhavnagar": [], "Botad": [], "Chhota Udaipur": [], "Dahod": [], "Dang": [], "Devbhoomi Dwarka": [], "Gandhinagar": [], "Gir Somnath": [], "Jamnagar": [], "Junagadh": [], "Kutch": [], "Kheda": [], "Mahisagar": [], "Mehsana": [], "Morbi": [], "Narmada": [], "Navsari": [], "Panchmahal": [], "Patan": [], "Porbandar": [], "Sabarkantha": [], "Surendranagar": [], "Tapi": [], "Valsad": []
  },
  "Karnataka": {
    "Bengaluru Urban": ["Bangalore North", "Bangalore South", "Bangalore East", "Anekal", "Yelahanka"],
    "Mysuru": ["Mysore", "Hunsur", "Nanjangud", "Heggadadevana Kote"],
    "Belagavi": [], "Ballari": [], "Bengaluru Rural": [], "Bidar": [], "Chamarajanagar": [], "Chikkaballapura": [], "Chikkamagaluru": [], "Chitradurga": [], "Dakshina Kannada": [], "Davanagere": [], "Dharwad": [], "Gadag": [], "Hassan": [], "Haveri": [], "Kalaburagi": [], "Kodagu": [], "Kolar": [], "Koppal": [], "Mandya": [], "Raichur": [], "Ramanagara": [], "Shivamogga": [], "Tumakuru": [], "Udupi": [], "Uttara Kannada": [], "Vijayapura": [], "Yadgir": []
  },
  "Tamil Nadu": {
    "Chennai": ["Tondiarpet", "Purasawalkam", "Egmore", "Mylapore", "Velachery", "Guindy"],
    "Coimbatore": ["Coimbatore North", "Coimbatore South", "Mettupalayam", "Pollachi"],
    "Madurai": [], "Kancheepuram": [], "Tiruvallur": [], "Salem": [], "Tiruchirappalli": [], "Tirunelveli": [], "Erode": [], "Vellore": [], "Thanjavur": [], "Thoothukudi": [], "Dindigul": [], "Virudhunagar": [], "Cuddalore": [], "Tiruppur": [], "Kanyakumari": [], "Ariyalur": [], "Chengalpattu": [], "Dharmapuri": [], "Kallakurichi": [], "Karur": [], "Krishnagiri": [], "Mayiladuthurai": [], "Nagapattinam": [], "Namakkal": [], "Nilgiris": [], "Perambalur": [], "Pudukkottai": [], "Ramanathapuram": [], "Ranipet": [], "Sivaganga": [], "Tenkasi": [], "Theni": [], "Thiruvarur": [], "Tirupathur": [], "Tiruvannamalai": [], "Viluppuram": []
  },
  "Uttar Pradesh": {
    "Lucknow": ["Lucknow", "Malihabad", "Mohanlalganj", "Bakshi Ka Talab"],
    "Kanpur Nagar": ["Kanpur", "Bilhaur", "Ghatampur"],
    "Varanasi": ["Varanasi", "Pindra", "Raja Talab"],
    "Agra": [], "Aligarh": [], "Ayodhya": [], "Azamgarh": [], "Bareilly": [], "Basti": [], "Ghaziabad": [], "Gorakhpur": [], "Jhansi": [], "Mathura": [], "Meerut": [], "Mirzapur": [], "Moradabad": [], "Prayagraj": [], "Saharanpur": [], "Unnao": [], "Gautam Buddha Nagar": [], "Ambedkar Nagar": [], "Amethi": [], "Amroha": [], "Auraiya": [], "Baghpat": [], "Bahraich": [], "Ballia": [], "Balrampur": [], "Banda": [], "Barabanki": [], "Bhadohi": [], "Bijnor": [], "Budaun": [], "Bulandshahr": [], "Chandauli": [], "Chitrakoot": [], "Deoria": [], "Etah": [], "Etawah": [], "Farrukhabad": [], "Fatehpur": [], "Firozabad": [], "Gonda": [], "Hamirpur": [], "Hapur": [], "Hardoi": [], "Hathras": [], "Jalaun": [], "Jaunpur": [], "Kannauj": [], "Kasganj": [], "Kaushambi": [], "Kushinagar": [], "Lakhimpur Kheri": [], "Lalitpur": [], "Maharajganj": [], "Mahoba": [], "Mainpuri": [], "Mau": [], "Muzaffarnagar": [], "Pilibhit": [], "Pratapgarh": [], "Rae Bareli": [], "Rampur": [], "Sambhal": [], "Sant Kabir Nagar": [], "Shahjahanpur": [], "Shamli": [], "Shravasti": [], "Siddharthnagar": [], "Sitapur": [], "Sonbhadra": [], "Sultanpur": []
  },
  "Telangana": {
    "Hyderabad": ["Amberpet", "Asifnagar", "Bahadurpura", "Charminar", "Golconda", "Himayathnagar", "Khairatabad", "Secunderabad"],
    "Ranga Reddy": ["Ibrahimpatnam", "Rajendranagar", "Serilingampally"],
    "Adilabad": [], "Bhadradri Kothagudem": [], "Hanumakonda": [], "Jagtial": [], "Jangaon": [], "Jayashankar Bhupalpally": [], "Jogulamba Gadwal": [], "Kamareddy": [], "Karimnagar": [], "Khammam": [], "Kumuram Bheem": [], "Mahabubabad": [], "Mahabubnagar": [], "Mancherial": [], "Medak": [], "Medchal-Malkajgiri": [], "Mulugu": [], "Nagarkurnool": [], "Nalgonda": [], "Narayanpet": [], "Nirmal": [], "Nizamabad": [], "Peddapalli": [], "Rajanna Sircilla": [], "Sangareddy": [], "Siddipet": [], "Suryapet": [], "Vikarabad": [], "Wanaparthy": [], "Warangal": [], "Yadadri Bhuvanagiri": []
  },
  "Madhya Pradesh": {
    "Bhopal": ["Huzur", "Berasia"],
    "Indore": ["Indore", "Mhow", "Sanwer", "Depalpur"],
    "Jabalpur": [], "Gwalior": [], "Ujjain": [], "Sagar": [], "Dewas": [], "Satna": [], "Ratlam": [], "Rewa": [], "Vidisha": [], "Chhindwara": [], "Morena": [], "Bhind": [], "Guna": [], "Shivpuri": [], "Chhatarpur": [], "Damoh": [], "Mandsaur": [], "Khargone": [], "Sehore": [], "Betul": [], "Seoni": [], "Datia": [], "Nagda": [], "Khandwa": [], "Dhar": [], "Hoshangabad": [], "Singrauli": [], "Shahdol": [], "Balaghat": []
  },
  "Rajasthan": {
    "Jaipur": ["Jaipur", "Amber", "Sanganer", "Bassi", "Chaksu"],
    "Jodhpur": ["Jodhpur", "Luni", "Bilara", "Osian"],
    "Udaipur": [], "Kota": [], "Ajmer": [], "Bikaner": [], "Alwar": [], "Bhilwara": [], "Sikar": [], "Pali": [], "Ganganagar": [], "Bharatpur": [], "Barmer": [], "Jaisalmer": [], "Jhunjhunu": [], "Churu": [], "Nagaur": [], "Tonk": [], "Dausa": [], "Dholpur": [], "Sawai Madhopur": [], "Karauli": [], "Banswara": [], "Dungarpur": [], "Pratapgarh": [], "Rajsamand": [], "Chittorgarh": [], "Bundi": [], "Jhalawar": [], "Baran": [], "Hanumangarh": [], "Jalore": [], "Sirohi": []
  },
  "Punjab": {
    "Ludhiana": ["Ludhiana East", "Ludhiana West", "Jagraon", "Khanna"],
    "Amritsar": ["Amritsar-I", "Amritsar-II", "Ajnala", "Baba Bakala"],
    "Jalandhar": [], "Patiala": [], "Bathinda": [], "Hoshiarpur": [], "Mohali": [], "Gurdaspur": [], "Pathankot": [], "Moga": [], "Ferozepur": [], "Kapurthala": [], "Sangrur": [], "Barnala": [], "Muktsar": [], "Tarn Taran": [], "Mansa": [], "Fatehgarh Sahib": [], "Fazilka": [], "Faridkot": [], "Rupnagar": [], "Nawanshahr": [], "Malerkotla": []
  },
  "West Bengal": {
    "Kolkata": ["Kolkata"],
    "North 24 Parganas": ["Barasat", "Barrackpore", "Bongaon", "Basirhat", "Bidhannagar"],
    "Howrah": ["Howrah", "Uluberia"],
    "South 24 Parganas": [], "Hooghly": [], "Paschim Bardhaman": [], "Purba Bardhaman": [], "Murshidabad": [], "Nadia": [], "Birbhum": [], "Bankura": [], "Purba Medinipur": [], "Paschim Medinipur": [], "Malda": [], "Uttar Dinajpur": [], "Dakshin Dinajpur": [], "Jalpaiguri": [], "Darjeeling": [], "Kalimpong": [], "Cooch Behar": [], "Alipurduar": [], "Purulia": [], "Jhargram": []
  },
  "Kerala": {
    "Thiruvananthapuram": ["Thiruvananthapuram", "Neyyattinkara", "Nedumangad"],
    "Ernakulam": ["Kanayannur", "Kochi", "Aluva", "Paravur"],
    "Kollam": [], "Pathanamthitta": [], "Alappuzha": [], "Kottayam": [], "Idukki": [], "Thrissur": [], "Palakkad": [], "Malappuram": [], "Kozhikode": [], "Wayanad": [], "Kannur": [], "Kasaragod": []
  },
  "Bihar": {
    "Patna": ["Patna Sadar", "Danapur", "Phulwari Sharif"],
    "Gaya": [], "Bhagalpur": [], "Muzaffarpur": [], "Darbhanga": [], "Purnia": [], "Begusarai": [], "Nalanda": [], "Araria": [], "Arwal": [], "Aurangabad": [], "Banka": [], "Bhojpur": [], "Buxar": [], "East Champaran": [], "Gopalganj": [], "Jamui": [], "Jehanabad": [], "Kaimur": [], "Katihar": [], "Khagaria": [], "Kishanganj": [], "Lakhisarai": [], "Madhepura": [], "Madhubani": [], "Munger": [], "Nawada": [], "Rohtas": [], "Saharsa": [], "Samastipur": [], "Saran": [], "Sheikhpura": [], "Sheohar": [], "Sitamarhi": [], "Siwan": [], "Supaul": [], "Vaishali": [], "West Champaran": []
  },
  "Odisha": {
    "Khordha": ["Bhubaneswar", "Jatni", "Khordha"],
    "Cuttack": [], "Ganjam": [], "Puri": [], "Balasore": [], "Bhadrak": [], "Jagatsinghpur": [], "Jajpur": [], "Kendrapara": [], "Nayagarh": [], "Angul": [], "Dhenkanal": [], "Sambalpur": [], "Bargarh": [], "Jharsuguda": [], "Deogarh": [], "Bolangir": [], "Subarnapur": [], "Sundargarh": [], "Keonjhar": [], "Mayurbhanj": [], "Kalahandi": [], "Nuapada": [], "Kandhamal": [], "Boudh": [], "Koraput": [], "Malkangiri": [], "Rayagada": [], "Nabarangpur": [], "Gajapati": []
  },
  "Haryana": {
    "Gurugram": ["Gurgaon", "Sohna", "Pataudi", "Manesar"],
    "Faridabad": [], "Panipat": [], "Ambala": [], "Yamunanagar": [], "Rohtak": [], "Hisar": [], "Karnal": [], "Sonipat": [], "Panchkula": [], "Bhiwani": [], "Charkhi Dadri": [], "Fatehabad": [], "Jhajjar": [], "Jind": [], "Kaithal": [], "Kurukshetra": [], "Mahendragarh": [], "Nuh": [], "Palwal": [], "Rewari": [], "Sirsa": []
  },
  "Andhra Pradesh": {
    "Visakhapatnam": ["Visakhapatnam Rural", "Visakhapatnam Urban", "Gajuwaka"],
    "Guntur": [], "Krishna": [], "East Godavari": [], "West Godavari": [], "Chittoor": [], "Anantapur": [], "Kurnool": [], "YSR Kadapa": [], "Nellore": [], "Prakasam": [], "Srikakulam": [], "Vizianagaram": [], "Nandyal": [], "NTR": [], "Bapatla": [], "Palnadu": [], "Eluru": [], "Kakinada": [], "Konaseema": [], "Anakapalli": [], "Alluri Sitharama Raju": [], "Parvathipuram Manyam": [], "Sri Sathya Sai": [], "Annamayya": [], "Tirupati": []
  },
  "Assam": { "Kamrup Metropolitan": [], "Kamrup": [], "Nagaon": [], "Sonitpur": [], "Cachar": [], "Dibrugarh": [], "Jorhat": [], "Tinsukia": [], "Golaghat": [], "Barpeta": [], "Dhubri": [], "Goalpara": [], "Morigaon": [], "Darrang": [], "Udalguri": [], "Baksa": [], "Chirang": [], "Kokrajhar": [], "Bongaigaon": [], "Nalbari": [], "Karimganj": [], "Hailakandi": [], "Karbi Anglong": [], "West Karbi Anglong": [], "Dima Hasao": [], "Lakhimpur": [], "Dhemaji": [], "Sivasagar": [], "Charaideo": [], "Majuli": [], "Biswanath": [], "Hojai": [], "South Salmara-Mankachar": [], "Bajali": [], "Tamulpur": [] },
  "Chhattisgarh": { "Raipur": [], "Durg": [], "Bilaspur": [], "Korba": [], "Rajnandgaon": [], "Raigarh": [], "Jagdalpur": [], "Ambikapur": [], "Dhamtari": [], "Mahasamund": [], "Janjgir-Champa": [], "Baloda Bazar": [], "Balod": [], "Bemetara": [], "Mungeli": [], "Gariaband": [], "Kanker": [], "Kondagaon": [], "Narayanpur": [], "Bastar": [], "Dantewada": [], "Sukma": [], "Bijapur": [], "Surguja": [], "Surajpur": [], "Balrampur": [], "Jashpur": [], "Koriya": [], "Gaurela-Pendra-Marwahi": [], "Khairagarh-Chhuikhadan-Gandai": [], "Manendragarh-Chirmiri-Bharatpur": [], "Mohla-Manpur-Ambagarh Chowki": [], "Sarangarh-Bilaigarh": [], "Shakti": [] },
  "Jharkhand": { "Ranchi": [], "Jamshedpur": [], "Dhanbad": [], "Bokaro": [], "Hazaribagh": [], "Deoghar": [], "Giridih": [], "Ramgarh": [], "Palamu": [], "Chaibasa": [], "Dumka": [], "Godda": [], "Sahebganj": [], "Pakur": [], "Jamtara": [], "Koderma": [], "Chatra": [], "Latehar": [], "Garhwa": [], "Lohardaga": [], "Gumla": [], "Simdega": [], "Khunti": [], "West Singhbhum": [], "East Singhbhum": [], "Seraikela Kharsawan": [] },
  "Uttarakhand": { "Dehradun": [], "Haridwar": [], "Nainital": [], "Udham Singh Nagar": [], "Pauri Garhwal": [], "Tehri Garhwal": [], "Chamoli": [], "Rudraprayag": [], "Uttarkashi": [], "Almora": [], "Bageshwar": [], "Pithoragarh": [], "Champawat": [] },
  "Himachal Pradesh": { "Shimla": [], "Kangra": [], "Mandi": [], "Solan": [], "Kullu": [], "Hamirpur": [], "Chamba": [], "Sirmaur": [], "Una": [], "Bilaspur": [], "Kinnaur": [], "Lahaul and Spiti": [] },
  "Goa": { "North Goa": ["Tiswadi", "Bardez", "Pernem", "Bicholim", "Sattari", "Ponda"], "South Goa": ["Salcete", "Mormugao", "Quepem", "Sanguem", "Canacona", "Dharbandora"] },
  "Tripura": { "West Tripura": [], "Sepahijala": [], "Khowai": [], "Gomati": [], "South Tripura": [], "Dhalai": [], "Unakoti": [], "North Tripura": [] },
  "Meghalaya": { "East Khasi Hills": [], "West Garo Hills": [], "Ri Bhoi": [], "Jaintia Hills": [], "West Khasi Hills": [], "East Garo Hills": [], "South Garo Hills": [], "South West Garo Hills": [], "North Garo Hills": [], "South West Khasi Hills": [], "East Jaintia Hills": [], "Eastern West Khasi Hills": [] },
  "Manipur": { "Imphal West": [], "Imphal East": [], "Thoubal": [], "Bishnupur": [], "Churachandpur": [], "Senapati": [], "Ukhrul": [], "Chandel": [], "Tamenglong": [], "Kangpokpi": [], "Jiribam": [], "Kakching": [], "Kamjong": [], "Noney": [], "Pherzawl": [], "Tengnoupal": [] },
  "Nagaland": { "Dimapur": [], "Kohima": [], "Mokokchung": [], "Mon": [], "Tuensang": [], "Wokha": [], "Zunheboto": [], "Phek": [], "Kiphire": [], "Longleng": [], "Peren": [], "Noklak": [], "Tseminyu": [], "Chümoukedima": [], "Niuland": [], "Shamator": [] },
  "Arunachal Pradesh": { "Papum Pare": [], "Changlang": [], "Lohit": [], "West Kameng": [], "East Siang": [], "Tirap": [], "West Siang": [], "Lower Subansiri": [], "Upper Subansiri": [], "Tawang": [], "East Kameng": [], "Upper Siang": [], "Kurung Kumey": [], "Lower Dibang Valley": [], "Dibang Valley": [], "Anjaw": [], "Longding": [], "Namsai": [], "Kra Daadi": [], "Siang": [], "Lower Siang": [], "Lepa Rada": [], "Shi Yomi": [], "Pakke Kessang": [], "Kamle": [], "Itanagar": [] },
  "Mizoram": { "Aizawl": [], "Lunglei": [], "Champhai": [], "Kolasib": [], "Mamit": [], "Serchhip": [], "Lawngtlai": [], "Siaha": [], "Hnahthial": [], "Khawzawl": [], "Saitual": [] },
  "Sikkim": { "Gangtok": [], "Pakyong": [], "Soreng": [], "Gyalshing": [], "Mangan": [], "Namchi": [] }
};

// Helper to get sub-districts (real or generated)
const getSubDistricts = (state: string, district: string) => {
  if (!LOCATION_DATA[state] || !LOCATION_DATA[state][district]) return [];
  const realSubs = LOCATION_DATA[state][district];
  if (realSubs.length > 0) return realSubs;
  return [`${district} North`, `${district} South`, `${district} East`, `${district} Rural`, `${district} Urban`];
};

// --- TYPES ---
interface DashboardStats {
  extreme: number; severe: number; moderate: number; mild: number; normal: number; total: number;
}

export default function KVKDashboard() {
  const router = useRouter();

  // --- AUTH STATE ---
  const [isAuthorized, setIsAuthorized] = useState(false);

  // --- FILTERS STATE ---
  const [season, setSeason] = useState(SEASONS[0]);
  const [level, setLevel] = useState('District');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Pune');
  const [subDistrict, setSubDistrict] = useState('Haveli');
  const [parameter, setParameter] = useState(PARAMETERS[0]);
  const [date, setDate] = useState('2025-12-01');

  // --- DATA STATE ---
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ extreme: 0, severe: 0, moderate: 0, mild: 0, normal: 0, total: 0 });
  const [chartData, setChartData] = useState<{ pie: number[], hist: number[] }>({ pie: [], hist: [] });

  // --- AUTH CHECK ---
  useEffect(() => {
    const user = localStorage.getItem('kvk_user');
    if (!user) {
      router.push('/kvk/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // --- EFFECT: Handle State/District Change Defaults ---
  useEffect(() => {
    const districts = Object.keys(LOCATION_DATA[state] || {});
    if (!districts.includes(district)) {
      setDistrict(districts[0] || '');
    }
  }, [state, district]);

  useEffect(() => {
    const subs = getSubDistricts(state, district);
    if (!subs.includes(subDistrict)) {
      setSubDistrict(subs[0] || '');
    }
  }, [state, district, subDistrict]);

  // --- DYNAMIC DATA SIMULATOR ---
  useEffect(() => {
    const generateData = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 600));

      let totalBase = 10;
      if (level === 'State') totalBase = Object.keys(LOCATION_DATA[state] || {}).length || 25; 
      else if (level === 'Sub-District') totalBase = 150; 
      else totalBase = getSubDistricts(state, district).length || 15;

      let remaining = totalBase;
      const extreme = Math.floor(Math.random() * (remaining * 0.15));
      remaining -= extreme;
      const severe = Math.floor(Math.random() * (remaining * 0.20));
      remaining -= severe;
      const moderate = Math.floor(Math.random() * (remaining * 0.25));
      remaining -= moderate;
      const mild = Math.floor(Math.random() * (remaining * 0.30));
      remaining -= mild;
      const normal = remaining;

      const hist = Array.from({ length: 7 }, () => Math.floor(Math.random() * (totalBase / 2)));

      setStats({ extreme, severe, moderate, mild, normal, total: totalBase });
      setChartData({ 
        pie: [extreme, severe, moderate, mild, normal],
        hist: hist 
      });
      setLoading(false);
    };

    generateData();
  }, [level, state, district, subDistrict, parameter, season]);

  // --- HANDLERS ---
  const handleCustomReport = () => {
    router.push('/kvk/custom-report');
  };

  const handleTotalClick = () => {
    if (level === 'State') setLevel('District');
    else if (level === 'District') setLevel('Sub-District');
  };

  // --- BLOCK RENDERING UNTIL AUTH IS CHECKED ---
  // MOVED THIS TO THE END to prevent "Rendered fewer hooks than expected" error
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-bold text-green-800 text-sm">Verifying Access...</span>
        </div>
      </div>
    );
  }

  // --- COMPONENTS ---
  const StatCard = ({ label, val, color }: { label: string, val: number, color: string }) => (
    <div className={`flex flex-col items-center justify-center p-2 rounded-lg shadow-sm ${color} text-white flex-1 min-w-[85px] hover:shadow-md transition-all cursor-default`}>
      {loading ? <div className="h-6 w-6 bg-white/30 rounded-full animate-pulse mb-1"/> : <span className="text-2xl font-bold">{val}</span>}
      <div className="w-6 border-b border-white/40 my-1"></div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      
      {/* 1. HEADER */}
      <header className="bg-green-700 border-b-4 border-green-800 px-4 py-2 flex justify-between items-center shadow-md z-30">
        <div className="flex items-center gap-3">
          <div className="bg-white text-green-700 p-2 rounded-lg shadow-sm">
            <span className="font-extrabold text-xl tracking-tighter">KS</span>
          </div>
          <div className="leading-none">
            <h1 className="text-xl font-bold text-white">
              KisaanSaathi <span className="text-green-200 font-normal">- KVK</span>
            </h1>
            <p className="text-[10px] text-green-100 font-bold uppercase mt-1">Analytics Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
             <div className="text-xs font-bold text-green-200 uppercase">Current View</div>
             <div className="text-sm font-bold text-white">
                {level === 'State' ? state : level === 'District' ? `${district}, ${state}` : `${subDistrict}, ${district}`}
             </div>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('kvk_user'); router.push('/kvk/login'); }}
            className="flex items-center gap-2 bg-green-900 hover:bg-black text-white px-3 py-1.5 rounded text-xs font-bold transition shadow border border-green-600"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* 2. FILTERS BAR - TAB/RECTANGLE STYLE */}
      <div className="bg-white px-4 py-3 shadow-md border-b border-gray-200 z-20">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          
          {/* Season */}
          <div className="tab-rectangle flex-1 min-w-[150px] group">
             <label className="tab-label"><Calendar size={10} className="text-gray-400"/> Season</label>
             <div className="relative">
                <select value={season} onChange={e => setSeason(e.target.value)} className="tab-select">
                  {SEASONS.map(s => <option key={s}>{s}</option>)}
                </select>
                
             </div>
          </div>

          {/* Level */}
          <div className="tab-rectangle flex-1 min-w-[110px] group">
             <label className="tab-label"><Layers size={10} className="text-gray-400"/> Level</label>
             <div className="relative">
                <select value={level} onChange={e => setLevel(e.target.value)} className="tab-select">
                  <option value="State">State</option>
                  <option value="District">District</option>
                  <option value="Sub-District">Sub-District</option>
                </select>
                
             </div>
          </div>

          {/* State */}
          <div className="tab-rectangle flex-1 min-w-[140px] group">
             <label className="tab-label"><MapPin size={10} className="text-gray-400"/> State</label>
             <div className="relative">
                <select value={state} onChange={e => setState(e.target.value)} className="tab-select">
                   {Object.keys(LOCATION_DATA).sort().map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                
             </div>
          </div>

          {/* District */}
          <div className={`tab-rectangle flex-1 min-w-[140px] group transition-all ${level === 'State' ? 'opacity-40 pointer-events-none bg-gray-50' : 'opacity-100'}`}>
             <label className="tab-label"><MapPin size={10} className="text-gray-400"/> District</label>
             <div className="relative">
                <select value={district} onChange={e => setDistrict(e.target.value)} className="tab-select">
                  {level === 'State' && <option>All Districts</option>}
                  {Object.keys(LOCATION_DATA[state] || {}).sort().map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                
             </div>
          </div>

          {/* Sub-District */}
          <div className={`tab-rectangle flex-1 min-w-[140px] group transition-all ${level === 'Sub-District' ? 'opacity-100' : 'opacity-40 pointer-events-none bg-gray-50'}`}>
             <label className="tab-label"><MapPin size={10} className="text-gray-400"/> Sub-Dist</label>
             <div className="relative">
                <select value={subDistrict} onChange={e => setSubDistrict(e.target.value)} className="tab-select">
                  {getSubDistricts(state, district).map(sd => <option key={sd} value={sd}>{sd}</option>)}
                </select>
                
             </div>
          </div>

          {/* Parameter */}
          <div className="tab-rectangle flex-[1.5] min-w-[220px] group border-l-4 border-l-green-600 bg-green-50/30">
             <label className="tab-label text-green-700"><Activity size={10}/> Parameter</label>
             <div className="relative">
                <select value={parameter} onChange={e => setParameter(e.target.value)} className="tab-select text-green-900">
                  {PARAMETERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                
             </div>
          </div>

          {/* Date */}
          <div className="tab-rectangle flex-1 min-w-[130px] group">
             <label className="tab-label"><Calendar size={10} className="text-gray-400"/> Date</label>
             <div className="relative">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="tab-select uppercase" />
             </div>
          </div>

          {/* Custom Report Button */}
          <button 
            onClick={handleCustomReport}
            className="ml-auto bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-lg shadow-sm hover:shadow-lg transition-all flex items-center gap-2 font-bold uppercase tracking-wider text-xs whitespace-nowrap transform hover:-translate-y-0.5"
          >
            <FileText size={16} /> Custom Report
          </button>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD */}
      <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
        
        {/* A. Stats Cards */}
        <div className="flex gap-2">
           <StatCard label="Extreme" val={stats.extreme} color="bg-red-900" />
           <StatCard label="Severe" val={stats.severe} color="bg-red-600" />
           <StatCard label="Moderate" val={stats.moderate} color="bg-orange-500" />
           <StatCard label="Mild" val={stats.mild} color="bg-yellow-400 text-black" />
           <StatCard label="Normal" val={stats.normal} color="bg-green-600" />
           
           <div 
             onClick={handleTotalClick}
             className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-green-600 bg-white min-w-[90px] cursor-pointer hover:bg-green-50 transition-colors group"
           >
             <span className="text-2xl font-bold text-gray-800 group-hover:text-green-700 transition-colors">{stats.total}</span>
             <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
               Total {level !== 'Sub-District' && <ChevronRight size={10} />}
             </span>
           </div>
        </div>

        {/* B. Alert Banner */}
        {!loading && stats.extreme > 0 && (
          <div className="bg-red-50 border-l-4 border-red-600 p-2 flex items-center gap-2 rounded shadow-sm animate-pulse">
             <AlertTriangle className="text-red-600" size={16} />
             <p className="text-xs font-bold text-red-800">
               CRITICAL ALERT: {stats.extreme} regions in {level === 'State' ? state : level === 'District' ? district : subDistrict} are showing extreme stress levels.
             </p>
          </div>
        )}

        {/* C. Charts Section */}
        <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0">
          
          {/* MAP */}
          <div className="lg:w-[65%] bg-white border border-gray-300 rounded-lg shadow-sm relative flex flex-col overflow-hidden group">
             {/* Map Controls & Placeholder (Same as before) */}
             <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                <button className="bg-white w-8 h-8 rounded border border-gray-300 shadow hover:bg-gray-100 font-bold text-gray-600 text-lg flex items-center justify-center">+</button>
                <button className="bg-white w-8 h-8 rounded border border-gray-300 shadow hover:bg-gray-100 font-bold text-gray-600 text-lg flex items-center justify-center">-</button>
             </div>
             <div className="flex-1 bg-[#e4e4e4] relative flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]">
                {loading ? (
                   <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-bold text-green-800 text-sm animate-pulse">Loading GIS Layers...</span>
                   </div>
                ) : (
                   <div className="text-center opacity-80 scale-95 transition-transform duration-500 hover:scale-100">
                      <div className="w-40 h-40 border-4 border-dashed border-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-50 shadow-inner">
                        <MapPin size={40} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Map Visualization</h3>
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mt-1">
                        <span className="font-bold">{state}</span> 
                        {(level === 'District' || level === 'Sub-District') && <><ChevronRight size={14}/> <span className="font-bold">{district}</span></>}
                      </div>
                      <p className="text-xs text-green-700 bg-green-100 inline-block px-2 py-1 rounded mt-2 font-semibold border border-green-200">
                        {parameter} Layer Active
                      </p>
                   </div>
                )}
             </div>
          </div>

          {/* CHARTS COLUMN */}
          <div className="lg:w-[35%] flex flex-col gap-3 overflow-y-auto pr-1">
             
             {/* DONUT CHART (FIXED CENTERING) */}
             <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-3 min-h-[220px]">
                <div className="flex justify-between items-center mb-2 border-b pb-1 border-gray-100">
                  <h4 className="font-bold text-gray-700 text-xs uppercase">
                    {level === 'Sub-District' ? 'Farm/Field Status' : 'Region Distribution'}
                  </h4>
                </div>
                
                {/* Custom Layout: Chart Left, Legend Right */}
                <div className="flex flex-row items-center h-[180px]">
                   
                   {/* 1. The Chart Container (Relative for centering text) */}
                   <div className="relative h-full flex-1">
                      <Doughnut 
                        data={{
                          labels: ['Extreme', 'Severe', 'Moderate', 'Mild', 'Normal'],
                          datasets: [{
                             data: chartData.pie,
                             backgroundColor: ['#7f1d1d', '#dc2626', '#f97316', '#facc15', '#16a34a'],
                             borderWidth: 0,
                             hoverOffset: 4
                          }]
                        }}
                        options={{
                          maintainAspectRatio: false,
                          cutout: '70%', // Thinner donut for cleaner look
                          plugins: { legend: { display: false } } // Disable default legend
                        }}
                      />
                      {/* 2. The Text Overlay (Perfectly Centered in flex container) */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                         <span className="text-2xl font-bold text-gray-800 leading-none">{stats.total}</span>
                         <span className="text-[10px] font-bold text-gray-500 uppercase mt-1">Total</span>
                      </div>
                   </div>

                   {/* 3. Custom Legend (Right Side) */}
                   <div className="flex flex-col justify-center gap-2 pl-4 pr-2 text-[10px] font-bold text-gray-600 border-l border-dashed border-gray-200 ml-2 min-w-[90px]">
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#7f1d1d]"></span> Extreme</div>
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#dc2626]"></span> Severe</div>
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#f97316]"></span> Moderate</div>
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#facc15]"></span> Mild</div>
                      <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#16a34a]"></span> Normal</div>
                   </div>
                </div>
             </div>

             {/* HISTOGRAM */}
             <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-3 min-h-[220px]">
                <div className="flex justify-between items-center mb-2 border-b pb-1 border-gray-100">
                  <h4 className="font-bold text-gray-700 text-xs uppercase">{parameter} Histogram</h4>
                </div>
                <div className="h-[180px] w-full">
                   <Bar 
                     data={{
                       labels: ['-30', '-20', '-10', '0', '10', '20', '30'],
                       datasets: [{
                         label: 'Count',
                         data: chartData.hist,
                         backgroundColor: '#16a34a',
                         borderRadius: 3,
                         barThickness: 20
                       }]
                     }}
                     options={{
                       maintainAspectRatio: false,
                       plugins: { legend: { display: false } },
                       scales: { 
                         y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 } } },
                         x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                       }
                     }}
                   />
                </div>
             </div>

          </div>
        </div>
      </div>
      
      {/* Styles for the Tab/Rectangle filters */}
      <style jsx global>{`
        .tab-rectangle {
          @apply bg-white border border-gray-200 rounded-md p-2 shadow-sm relative cursor-pointer hover:border-green-400 hover:shadow-md transition-all flex flex-col justify-center;
        }
        .tab-label {
          @apply flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5;
        }
        .tab-select {
          @apply w-full bg-transparent text-sm font-bold text-gray-800 outline-none appearance-none z-10 relative cursor-pointer;
        }
        .tab-icon {
          @apply absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-green-600 transition-colors;
        }
      `}</style>
    </div>
  );
}