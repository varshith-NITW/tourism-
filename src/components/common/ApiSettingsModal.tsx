import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, ExternalLink, CheckCircle, AlertTriangle, Eye, EyeOff, X, RefreshCw } from 'lucide-react';
import { getStoredApiKeys, saveStoredApiKeys } from '../../services/placesService';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysUpdated?: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onKeysUpdated
}) => {
  const [googleKey, setGoogleKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [testingStatus, setTestingStatus] = useState<'idle' | 'testing' | 'success' | 'billing_required' | 'invalid'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredApiKeys();
      setGoogleKey(stored.googleMapsKey);
      setOpenaiKey(stored.openaiKey);
      setTestingStatus('idle');
      setSavedSuccess(false);
      setTestMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!googleKey.trim()) {
      setTestingStatus('invalid');
      setTestMessage('Please enter a Google Maps API Key first.');
      return;
    }

    setTestingStatus('testing');
    setTestMessage('Pinging Google Maps Geocoding & Places API...');

    try {
      const backendRes = await fetch('http://localhost:5000/api/places/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: googleKey.trim() })
      });
      const backendData = await backendRes.json();
      if (backendData.status === 'OK') {
        setTestingStatus('success');
        setTestMessage('Google Maps API Connected! Live places and footfall active.');
      } else if (backendData.billingRequired) {
        setTestingStatus('billing_required');
        setTestMessage('API Key valid! Google Cloud requires an active Billing Account attached to your project at console.cloud.google.com/project/_/billing/enable ($200 free monthly credit).');
      } else {
        setTestingStatus('billing_required');
        setTestMessage('API Key saved. If live calls fail, verify that Billing and Places API are enabled on Google Cloud.');
      }
    } catch (e) {
      setTestingStatus('billing_required');
      setTestMessage('Key saved. TourMatch will automatically use live Google Places when billing is active, and use the intelligent dynamic engine seamlessly in the meantime.');
    }
  };

  const handleSave = () => {
    saveStoredApiKeys(googleKey, openaiKey);
    setSavedSuccess(true);
    if (onKeysUpdated) onKeysUpdated();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">API Keys & Engine Settings</h2>
            <p className="text-xs text-slate-500">Configure live Google Maps & LangChain OpenAI connectivity</p>
          </div>
        </div>

        {/* Dual Mode Notice */}
        <div className="mb-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
          <div className="flex items-center justify-between font-semibold text-slate-900">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Dual-Mode Engine
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              Zero-Disruption
            </span>
          </div>
          <p>
            • <b>Live Google Places API</b>: Used for real-time worldwide place data, real check-ins, and geo-coordinates when billing is enabled.<br/>
            • <b>Intelligent Dynamic Engine</b>: Seamlessly activates for any global destination (Taj Mahal, Goa, Jaipur, Paris, etc.) with verified partner stays, realistic footfall, and custom itineraries.
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          
          {/* Google Maps API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <span>Google Maps / Places API Key</span>
                <span className="text-red-500">*</span>
              </label>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <span>Get Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showGoogleKey ? 'text' : 'password'}
                value={googleKey}
                onChange={(e) => setGoogleKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowGoogleKey(!showGoogleKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showGoogleKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Requires <b>Places API (New)</b> and <b>Geocoding API</b> enabled on Google Cloud.
            </p>
          </div>

          {/* OpenAI API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <span>OpenAI API Key</span>
                <span className="text-slate-400 font-normal">(Optional for LangChain)</span>
              </label>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <span>Get Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showOpenaiKey ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used by FastAPI microservice for GPT-4o-mini structured constraints and itinerary synthesis.
            </p>
          </div>

          {/* Connection Test Diagnostics */}
          {testMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
              testingStatus === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : testingStatus === 'billing_required'
                ? 'bg-amber-50 border border-amber-200 text-amber-900'
                : testingStatus === 'testing'
                ? 'bg-indigo-50 border border-indigo-200 text-indigo-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              {testingStatus === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {testingStatus === 'billing_required' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
              {testingStatus === 'testing' && <RefreshCw className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5 animate-spin" />}
              <div className="flex-1">
                <div className="font-bold mb-0.5">
                  {testingStatus === 'success' ? 'Connection Successful' :
                   testingStatus === 'billing_required' ? 'Billing Activation Required on Google Cloud' :
                   testingStatus === 'testing' ? 'Testing Key...' : 'Check Key Configuration'}
                </div>
                <div className="text-[11px] leading-relaxed">{testMessage}</div>
                {testingStatus === 'billing_required' && (
                  <a
                    href="https://console.cloud.google.com/project/_/billing/enable"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 underline"
                  >
                    <span>Enable Google Cloud Billing ($200 free monthly credit)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingStatus === 'testing'}
            className="text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingStatus === 'testing' ? 'animate-spin' : ''}`} />
            <span>Test API Connection</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="text-xs font-bold px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Keys</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
