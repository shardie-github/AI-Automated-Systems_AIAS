import { useEffect, useState } from 'react';
import { observabilityService } from '@/lib/observability';

interface PerformanceData {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  fcp: number | null;
  tti: number | null;
}

const PerformanceMonitor = () => {
  const [performance, setPerformance] = useState<PerformanceData>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
    tti: null
  });

  useEffect(() => {
    const updatePerformance = () => {
      const metrics = observabilityService.getPerformanceMetrics();
      const performanceData: PerformanceData = {
        lcp: null,
        fid: null,
        cls: null,
        ttfb: null,
        fcp: null,
        tti: null
      };

      metrics.forEach(metric => {
        switch (metric.name) {
          case 'lcp':
            performanceData.lcp = metric.value;
            break;
          case 'fid':
            performanceData.fid = metric.value;
            break;
          case 'cls':
            performanceData.cls = metric.value;
            break;
          case 'ttfb':
            performanceData.ttfb = metric.value;
            break;
          case 'fcp':
            performanceData.fcp = metric.value;
            break;
          case 'tti':
            performanceData.tti = metric.value;
            break;
        }
      });

      setPerformance(performanceData);
    };

    updatePerformance();
    const interval = setInterval(updatePerformance, 1000);

    return () => clearInterval(interval);
  }, []);

  const getScore = (value: number | null, thresholds: { good: number; poor: number }) => {
    if (value === null) return 'unknown';
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'good': return 'text-green-500';
      case 'needs-improvement': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getScoreBgColor = (score: string) => {
    switch (score) {
      case 'good': return 'bg-green-500';
      case 'needs-improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const lcpScore = getScore(performance.lcp, { good: 2500, poor: 4000 });
  const fidScore = getScore(performance.fid, { good: 100, poor: 300 });
  const clsScore = getScore(performance.cls, { good: 0.1, poor: 0.25 });
  const ttfbScore = getScore(performance.ttfb, { good: 800, poor: 1800 });

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-white">Core Web Vitals</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* LCP */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">LCP</span>
            <div className={`w-3 h-3 rounded-full ${getScoreBgColor(lcpScore)}`}></div>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(lcpScore)}`}>
            {performance.lcp ? `${Math.round(performance.lcp)}ms` : 'N/A'}
          </div>
          <div className="text-gray-400 text-xs">Largest Contentful Paint</div>
        </div>

        {/* FID */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">FID</span>
            <div className={`w-3 h-3 rounded-full ${getScoreBgColor(fidScore)}`}></div>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(fidScore)}`}>
            {performance.fid ? `${Math.round(performance.fid)}ms` : 'N/A'}
          </div>
          <div className="text-gray-400 text-xs">First Input Delay</div>
        </div>

        {/* CLS */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">CLS</span>
            <div className={`w-3 h-3 rounded-full ${getScoreBgColor(clsScore)}`}></div>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(clsScore)}`}>
            {performance.cls ? performance.cls.toFixed(3) : 'N/A'}
          </div>
          <div className="text-gray-400 text-xs">Cumulative Layout Shift</div>
        </div>

        {/* TTFB */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">TTFB</span>
            <div className={`w-3 h-3 rounded-full ${getScoreBgColor(ttfbScore)}`}></div>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(ttfbScore)}`}>
            {performance.ttfb ? `${Math.round(performance.ttfb)}ms` : 'N/A'}
          </div>
          <div className="text-gray-400 text-xs">Time to First Byte</div>
        </div>
      </div>

      {/* Performance Score Summary */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Overall Performance Score:</span>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${
              [lcpScore, fidScore, clsScore, ttfbScore].every(score => score === 'good') 
                ? 'bg-green-500' 
                : [lcpScore, fidScore, clsScore, ttfbScore].some(score => score === 'poor')
                ? 'bg-red-500'
                : 'bg-yellow-500'
            }`}></div>
            <span className={`font-semibold ${
              [lcpScore, fidScore, clsScore, ttfbScore].every(score => score === 'good') 
                ? 'text-green-500' 
                : [lcpScore, fidScore, clsScore, ttfbScore].some(score => score === 'poor')
                ? 'text-red-500'
                : 'text-yellow-500'
            }`}>
              {[lcpScore, fidScore, clsScore, ttfbScore].every(score => score === 'good') 
                ? 'Excellent' 
                : [lcpScore, fidScore, clsScore, ttfbScore].some(score => score === 'poor')
                ? 'Needs Improvement'
                : 'Good'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
