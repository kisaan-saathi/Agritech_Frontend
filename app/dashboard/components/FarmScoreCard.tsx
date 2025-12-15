export default function FarmScoreCard() {
  return (
    <section className="mb-5">
      <div className="grid grid-cols-3 lg:grid-cols-3 gap-6 pb-3">
        <div className="lg:col-span-1 rounded-2xl shadow p-3">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-bottom">
            Farm Balance Scorecard
          </h2>
          <div className="farm-score-card rounded-2xl shadow-2xl mx-3 my-2 p-6 flex flex-col items-start md:items-center justify-between text-white relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://placehold.co/800x200/FFFFFF/059669/png?text=AI+Pattern')",
                opacity: 0.1,
                transform: "rotate(10deg) scale(1.5)",
              }}
            ></div>
            <div className="flex items-center space-x-6 relative z-10 md:mb-0">
              <div className="w-28 h-28 flex items-center justify-center border-4 border-white/50 rounded-full bg-transparent shadow-2xl flex-shrink-0">
                <span className="text-3xl font-extrabold">7.8</span>
              </div>
              <div>
                <p className="text-2xl font-bold">Farm Score</p>
                <p className="mt-1 text-sm font-medium opacity-90">
                  Recommendations: Monitor soil moisture in Field 3.
                </p>
              </div>
            </div>
            <div className="relative z-10 w-full p-2 bg-white/20 mt-3 rounded-lg">
              <p className="text-sm font-semibold mb-1">
                Score Trend (Last 7 Days)
              </p>
              <svg viewBox="0 0 100 30" className="w-full h-8">
                <line
                  x1="0"
                  y1="20"
                  x2="100"
                  y2="20"
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth="0.5"
                />
                <polyline
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  points="0,25 16,22 32,24 48,21 64,19 80,23 100,22"
                />
                <circle cx="100" cy="22" r="1.5" fill="white" />
              </svg>
              <span className="text-xs font-medium mt-1 inline-block text-white/90">
                Stable (+0.3 WoW)
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 p-3">
            <div className="col-span-1 bg-teal/20 p-2 place-items-center rounded-lg h- farm-score-card">
              <p className="text-sm text-white font-semibold mb-2">Soil</p>
              <div className="w-20 h-20 flex items-center justify-center border-4 bg-white/20 border-white/50 rounded-full bg-transparent shadow-2xl flex-shrink-0">
                <span className="text-3xl text-white font-extrabold">8.1</span>
              </div>
            </div>
            <div className="col-span-1 bg-teal/20 p-2 place-items-center rounded-lg h- farm-score-card content-center">
              <p className="text-sm text-white font-semibold mb-2">Temp</p>
              <div className="w-20 h-20 flex items-center justify-center border-4 bg-white/20 border-white/50 rounded-full bg-transparent shadow-2xl flex-shrink-0">
                <span className="text-3xl text-white font-extrabold">44</span>
              </div>
            </div>
            <div className="col-span-1 bg-teal/20 p-2 place-items-center rounded-lg h- farm-score-card">
              <p className="text-sm text-white font-semibold mb-2">Fields</p>
              <div className="w-20 h-20 flex items-center justify-center border-4 bg-white/20 border-white/50 rounded-full bg-transparent shadow-2xl flex-shrink-0">
                <span className="text-3xl text-white font-extrabold">7.8</span>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4 shadow rounded-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-0 p-3 border-bottom">
            Interactive Field Map
          </h2>
          <div className="flex flex-wrap gap-2 pt-0 p-3 border-bottom">
            <button className="px-4 py-2 bg-sky-blue text-white font-semibold rounded-full text-sm shadow-md hover:bg-blue-600 transition">
              NDVI (Plant Health)
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-full text-sm shadow-md border border-gray-300 hover:bg-gray-100 transition">
              Soil Moisture Layer
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-full text-sm shadow-md border border-gray-300 hover:bg-gray-100 transition">
              Weather Forecast
            </button>
          </div>
          <div className="relative w-full h-96 mt-3 bg-field-gray rounded-2xl shadow-2xl overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-70"
              style={{
                backgroundImage:
                  "url('https://placehold.co/1200x400/059669/ffffff/png?text=Interactive+Farm+Map+-+NDVI+Layer')",
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-xl-3 p-lg-2 p-1 text-center bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-primary-green/50">
                <p className="text-2xl font-extrabold text-gray-800 m-2">
                  Mapbox Field View Ready
                </p>
                <p className="text-gray-600 m-xl-4 m-lg-3 m-sm-2 text-sm">
                  Satellite imagery layers for Plant Health, Soil Moisture, and
                  Farm Boundary.
                </p>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 hidden sm:block">
              <p className="text-xs font-bold text-gray-700 mb-1">
                NDVI Legend
              </p>
              <div className="space-y-1 text-[10px] font-medium">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                  {"Critical Stress < 0.2"}
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                  Moderate Stress (0.2 - 0.4)
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-primary-green rounded-full mr-2"></span>
                  {"Healthy Vigor > 0.6"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
