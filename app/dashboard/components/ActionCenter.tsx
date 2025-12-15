import { useAiAdvisory } from '../../../lib/hooks/dashboard';

interface ActionCenterProps {
  onDiseaseClick: () => void;
}

export default function ActionCenter({ onDiseaseClick }: ActionCenterProps) {
  const { aiAdvisoryOutput, loadingAdvisory, handleGenerateAdvisory } = useAiAdvisory();

  return (
    <section className="mb-10 shadow rounded-2xl pb-2">
      <h2 className="text-xl font-bold text-gray-800 mb-4 p-3 border-bottom">Action Center & Quick Control</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-3 pb-3">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Critical Alerts & Tasks</h3>
          <div id="ai-advisory-output" className="mb-4 min-h-[50px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 p-3 text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: aiAdvisoryOutput }}></div>
          <ul className="divide-y divide-gray-100">
            <li className="flex items-center justify-between py-4 hover:bg-red-50/50 rounded-lg px-2 -mx-2 transition duration-150 cursor-pointer">
              <div className="flex items-center space-x-4">
                <span className="text-xl text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </span>
                <div>
                  <p className="font-bold text-gray-900">Urgent: Irrigation Required: Field 3</p>
                  <p className="text-sm text-gray-600">Soil moisture dropped to 35%. *Auto-irrigate is disabled*.</p>
                </div>
              </div>
              <span className="px-3 py-1 text-xs font-bold text-white bg-red-600 rounded-full shadow-md">CRITICAL</span>
            </li>
            <li className="flex items-center justify-between py-4 hover:bg-yellow-50/50 rounded-lg px-2 -mx-2 transition duration-150 cursor-pointer">
              <div className="flex items-center space-x-4">
                <span className="text-xl text-yellow-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.39 3.1c-.81 1.6-2.12 2.87-3.73 3.51-1.6.64-3.41.76-5.18.36-1.78-.39-3.4-1.28-4.66-2.5-1.26-1.22-2.09-2.73-2.45-4.42-.36-1.68-.2-3.45.45-5.1a8.38 8.38 0 0 1 2.37-3.23"/>
                  </svg>
                </span>
                <div>
                  <p className="font-bold text-gray-900">Pest Warning: Soybean Field 1</p>
                  <p className="text-sm text-gray-600">Increased insect count detected. *Predictive model* recommends scouting.</p>
                </div>
              </div>
              <span className="px-3 py-1 text-xs font-bold text-yellow-800 bg-yellow-200 rounded-full shadow-md">MEDIUM</span>
            </li>
          </ul>
        </div>
        <div className="lg:col-span-1 space-y-4">
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
        </div>
      </div>
    </section>
  );
}