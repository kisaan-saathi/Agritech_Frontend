import { useDiseaseId } from '../../../lib/hooks/dashboard';

export default function ApplicationFeatures() {
  const { diseaseIdOutput, loadingDisease, handleIdentifyDisease } = useDiseaseId();

  return (
    <section className="mb-2 shadow rounded-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-0 p-3 border-bottom">Application Features</h2>
      <div className="bg-white rounded-2xl shadow-xl p-2">
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-1 text-center py-4">
          <a href="#" className="flex flex-col items-center p-1 rounded-xl hover:bg-sky-50 transition duration-150 text-decoration-none hover:border border-sky-300 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-blue">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span className="text-xl font-bold mt-2 text-gray-900 text-bold">Market Rates</span>
          </a>
          <a href="#" id="advisories-link" onClick={(e) => { e.preventDefault(); handleIdentifyDisease(); }} className="flex flex-col items-center p-1 rounded-xl hover:bg-green-50 transition duration-150 text-decoration-none hover:border border-primary-green">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-green">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <path d="M12 17h.01"/>
            </svg>
            <span className="text-xl font-bold mt-2 text-gray-900 text-bold">Advisories</span>
          </a>
          
          {/* UPDATED: Added redirection to /soil-analysis */}
          <a href="/soil" className="flex flex-col items-center p-1 rounded-xl hover:bg-yellow-50 transition duration-150 text-decoration-none hover:border border-soil-brown">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-soil-brown">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <line x1="12" y1="18" x2="12" y2="10"/>
              <path d="M15 13c-1.66 0-3 1.34-3 3s1.34 3 3 3"/>
            </svg>
            <span className="text-xl font-bold mt-2 text-gray-900 text-bold">Soil Analysis</span>
          </a>

          <a href="#" className="flex flex-col items-center p-1 rounded-xl hover:bg-yellow-50 transition duration-150 text-decoration-none hover:border border-yellow-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
              <path d="M17 19c-1.1-1.46-3-4-5-4s-3.9-2.54-5-4c-1.1-1.46-1-4 0-4s3 2 5 2 3.9-2 5-2 1.1 2.54 0 4-3 4-5 4-3.9 2.54-5 4"/>
              <path d="M12 2v20"/>
            </svg>
            <span className="text-xl font-bold mt-2 text-gray-900 text-bold">Crop Guide</span>
          </a>
          <a href="#" className="flex flex-col items-center p-1 rounded-xl hover:bg-blue-50 transition duration-150 text-decoration-none hover:border border-sky-blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-blue">
              <path d="M12 2v2M18 6l-1 1M20 12h-2M18 18l-1-1M12 20v2M6 18l1-1M4 12h2M6 6l1 1"/>
              <path d="M15 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            </svg>
            <span className="text-xl font-bold mt-2 text-gray-900 text-bold">Weather</span>
          </a>
          <a href="#" className="flex flex-col items-center p-1 rounded-xl hover:bg-orange-50 transition duration-150 text-decoration-none hover:border border-orange-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="10" y2="9"/>
            </svg>
            <span className="text-xl font-bold mt-2 text-gray-900 text-bold">Scouting</span>
          </a>
          <a href="#" className="flex flex-col items-center p-1 rounded-xl hover:bg-purple-50 transition duration-150 text-decoration-none hover:border border-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/>
            </svg>
            <span className="text-xl font-bold mt-2 text-gray-900 text-bold">Reports</span>
          </a>
          <a href="#" className="flex flex-col items-center p-1 rounded-xl hover:bg-red-50 transition duration-150 text-decoration-none hover:border border-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <path d="M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
              <path d="M19 12h2a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-8a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2"/>
              <path d="M5 22h-2a1 1 0 0 1-1-1V13a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2"/>
            </svg>
            <span className="text-xl font-bold mt-2 text-gray-900 text-bold">Services</span>
          </a>
        </div>
      </div>
    </section>
  );
}