import { useAiAdvisory } from "../../../lib/hooks/dashboard";

interface ActionCenterProps {
  onDiseaseClick: () => void;
}

export default function ActionCenter({ onDiseaseClick }: ActionCenterProps) {
  const { aiAdvisoryOutput, loadingAdvisory, handleGenerateAdvisory } =
    useAiAdvisory();

  return (
    <section className="mb-10 shadow rounded-2xl pb-2">
      <h2 className="text-xl font-bold text-gray-800 mb-4 p-3 border-bottom">
        Action Center & Quick Control
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-3 pb-3">
        <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">
            Critical Alerts & Tasks
          </h3>
          <div
            id="ai-advisory-output"
            className="mb-4 min-h-[50px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 p-3 text-sm text-gray-500"
            dangerouslySetInnerHTML={{ __html: aiAdvisoryOutput }}
          ></div>
          <ul className="divide-y divide-gray-100">
            <li className="flex items-center justify-between py-4 hover:bg-red-50/50 rounded-lg px-2 -mx-2 transition duration-150 cursor-pointer">
              <div className="flex items-center space-x-4">
                <span className="text-xl text-red-500">
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
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </span>
                <div>
                  <p className="font-bold text-gray-900">
                    Urgent: Irrigation Required: Field 3
                  </p>
                  <p className="text-sm text-gray-600">
                    Soil moisture dropped to 35%. *Auto-irrigate is disabled*.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 text-xs font-bold text-white bg-red-600 rounded-full shadow-md">
                CRITICAL
              </span>
            </li>
            <li className="flex items-center justify-between py-4 hover:bg-yellow-50/50 rounded-lg px-2 -mx-2 transition duration-150 cursor-pointer">
              <div className="flex items-center space-x-4">
                <span className="text-xl text-yellow-500">
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
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.39 3.1c-.81 1.6-2.12 2.87-3.73 3.51-1.6.64-3.41.76-5.18.36-1.78-.39-3.4-1.28-4.66-2.5-1.26-1.22-2.09-2.73-2.45-4.42-.36-1.68-.2-3.45.45-5.1a8.38 8.38 0 0 1 2.37-3.23" />
                  </svg>
                </span>
                <div>
                  <p className="font-bold text-gray-900">
                    Pest Warning: Soybean Field 1
                  </p>
                  <p className="text-sm text-gray-600">
                    Increased insect count detected. *Predictive model*
                    recommends scouting.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 text-xs font-bold text-yellow-800 bg-yellow-200 rounded-full shadow-md">
                MEDIUM
              </span>
            </li>
          </ul>
        </div>
        {/* <div className="lg:col-span-1 space-y-4">
          <button id="ai-advisory-button" onClick={handleGenerateAdvisory} disabled={loadingAdvisory} className="w-full flex items-center justify-center p-4 bg-llm-purple text-white font-semibold rounded-xl shadow hover:bg-purple-600 transition duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            Generate AI Advisory
          </button>
          <div className="bg-white rounded-2xl h-96 shadow p-4">
            <h3 className="text-xl font-bold text-gray-800 mb-5">Quick Control</h3>
            <div className="grid grid-cols-2 gap-6">
              <button className="flex flex-col items-center justify-center p-4 bg-primary-green/10 rounded-xl text-secondary-green border-2 border-transparent hover:border-secondary-green transition duration-200 transform hover:scale-[1.02]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 11c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z"/>
                  <path d="M12 19v-4"/>
                  <path d="M18 13h-4"/>
                </svg>
                <span className="text-xs mt-1 font-semibold">Irrigate Field 3</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-primary-green/10 rounded-xl text-secondary-green border-2 border-transparent hover:border-secondary-green transition duration-200 transform hover:scale-[1.02]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H7"/>
                </svg>
                <span className="text-xs mt-1 font-semibold">Log Scouting</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-primary-green/10 rounded-xl text-secondary-green border-2 border-transparent hover:border-secondary-green transition duration-200 transform hover:scale-[1.02]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 11c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z"/>
                  <path d="M18 13h-4"/>
                </svg>
                <span className="text-xs mt-1 font-semibold">Check Inventory</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-primary-green/10 rounded-xl text-secondary-green border-2 border-transparent hover:border-secondary-green transition duration-200 transform hover:scale-[1.02]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span className="text-xs mt-1 font-semibold">Predict Yield</span>
              </button>
            </div>
          </div>
        </div> */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">
            Real-time Sensor Readings & Indices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 px-3 py-2">
            <div className="bg-white rounded-2xl shadow border py-2 px-3 border-b-5 border-primary hover:shadow-2xl transition duration-300">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Soil Moisture
              </h3>
              <div className="flex items-center justify-between">
                <div id="soil-moisture-progress" className="radial-progress">
                  <div className="radial-progress-inner">68%</div>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-gray-900">68%</p>
                  <p className="text-xs text-sky-blue mt-1 font-medium">
                    Target: 65%
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t pt-3">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Last 7 Day Trend
                </p>
                <svg viewBox="0 0 100 30" className="w-full h-8">
                  <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="1.5"
                    points="0,20 16,10 32,25 48,15 64,18 80,5 100,10"
                  />
                  <circle cx="100" cy="10" r="1.5" fill="#3B82F6" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow border py-2 px-3 border-bottom-5 border-warning hover:shadow-2xl transition duration-300">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Temperature
              </h3>
              <div className="flex items-center justify-between">
                <div className="text-5xl text-warning">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 4v.17c0 1.05-.18 2.05-.52 3L11.83 11H8.17L6.52 7.17c-.34-.95-.52-1.95-.52-3V4h8z" />
                    <path d="M12 2v20" />
                    <path d="M17 5H7" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-gray-900">
                    25.3°C
                  </p>
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    Slightly High
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t pt-3">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Last 7 Day Trend
                </p>
                <svg viewBox="0 0 100 30" className="w-full h-8">
                  <polyline
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="1.5"
                    points="0,15 16,10 32,5 48,12 64,8 80,18 100,15"
                  />
                  <circle cx="100" cy="15" r="1.5" fill="#F97316" />
                </svg>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xll border py-2 px-3 border-bottom-5 border-success hover:shadow-2xl transition duration-300">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Crop Health Index
              </h3>
              <div className="flex items-center justify-between">
                <div id="crop-health-progress" className="radial-progress">
                  <div className="radial-progress-inner">92%</div>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-gray-900">92%</p>
                  <p className="text-xs text-success mt-1 font-medium">
                    Excellent Vigor
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t pt-3">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Index Score (NDVI)
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  0.78 / 1.00
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xll border py-2 px-3 border-bottom-5 border-danger hover:shadow-2xl transition duration-300">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Critical Tasks
              </h3>
              <div className="flex items-center justify-between">
                <div className="text-5xl text-danger">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-gray-900">3</p>
                  <p className="text-xs text-danger mt-1 font-medium">
                    High Priority
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t pt-3">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Next Scouting Due
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  Tomorrow, 10 AM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
