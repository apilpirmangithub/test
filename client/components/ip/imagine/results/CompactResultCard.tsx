import { useState, Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LicensingForm from "./LicensingForm";

interface CompactResultCardProps {
  imageUrl: string;
  type: "image" | "video";
  isLoading: boolean;
  onDownload: () => void;
  onShare: () => void;
  onUpscale?: () => void;
  onCreateAnother: () => void;
  isExpanded?: boolean;
  setIsExpanded?: Dispatch<SetStateAction<boolean>>;
  demoMode?: boolean;
  parentAsset?: any;
}

const CompactResultCard = ({
  imageUrl,
  type,
  isLoading,
  onDownload,
  onShare,
  onUpscale,
  onCreateAnother,
  isExpanded: externalIsExpanded = false,
  setIsExpanded: externalSetIsExpanded,
  demoMode = false,
  parentAsset,
}: CompactResultCardProps) => {
  const [localIsExpanded, setLocalIsExpanded] = useState(false);
  const isExpanded = externalSetIsExpanded
    ? externalIsExpanded
    : localIsExpanded;
  const setIsExpanded = externalSetIsExpanded || setLocalIsExpanded;
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showLicensingForm, setShowLicensingForm] = useState(false);

  if (isExpanded) {
    return (
      <motion.div
        key="expanded"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-screen h-screen fixed inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-6 z-50"
      >
        {/* Large Image Container - Responsive */}
        <motion.div
          className="relative rounded-lg overflow-hidden bg-black border-2 border-[#FF4DA6]/50 shadow-lg flex items-center justify-center w-full max-w-md sm:max-w-2xl h-full max-h-[70vh] sm:max-h-[80vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-full h-full flex items-center justify-center">
            {type === "image" ? (
              <img
                src={imageUrl}
                alt="Generation result"
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                src={imageUrl}
                className="w-full h-full object-contain"
                controls
              />
            )}
          </div>

          {/* Type Badge */}
          <div className="absolute top-3 right-3 text-xs font-medium bg-slate-900/80 text-slate-300 px-2 py-1 rounded">
            {type === "image" ? "🖼" : "🎬"}
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/70 hover:bg-black/90 transition-colors"
            type="button"
            aria-label="Close expanded view"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </motion.div>

        {/* Action Buttons - Mobile Responsive Layout */}
        <motion.div
          className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex flex-wrap gap-1.5 sm:gap-2 justify-center flex-shrink-0 px-4 sm:px-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={onDownload}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-md bg-[#FF4DA6] hover:bg-[#FF4DA6]/80 text-white font-medium transition-colors flex items-center justify-center gap-1 text-xs sm:text-sm whitespace-nowrap"
            title="Download"
          >
            <svg
              className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Download</span>
          </button>

          <button
            onClick={onShare}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium transition-colors flex items-center justify-center gap-1 text-xs sm:text-sm whitespace-nowrap"
            title="Share"
          >
            <svg
              className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C9.589 12.881 10.647 12.5 12 12.5c1.353 0 2.411.381 3.316.842M9 6a3 3 0 110-6 3 3 0 010 6zM9 6h.01M15 20c0 1.105-.895 2-2 2s-2-.895-2-2m0 0c0 1.105-.895 2-2 2s-2-.895-2-2m0 0c0-5.39 4.478-9.75 10-9.75s10 4.36 10 9.75"
              />
            </svg>
            <span>Share</span>
          </button>

          {onUpscale && type === "image" && (
            <button
              onClick={onUpscale}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium transition-colors flex items-center justify-center gap-1 text-xs sm:text-sm whitespace-nowrap"
              title="Upscale"
            >
              <svg
                className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4V20m6-4v4m0-12l4-4m-4 4l-4-4"
                />
              </svg>
              <span>Upscale</span>
            </button>
          )}

          <button
            onClick={() => setShowLicensingForm(true)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-md bg-[#FF4DA6]/20 hover:bg-[#FF4DA6]/30 text-[#FF4DA6] font-medium transition-colors flex items-center justify-center gap-1 text-xs sm:text-sm whitespace-nowrap border border-[#FF4DA6]/30"
            title="Register & License IP"
          >
            <svg
              className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Licensing</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium transition-colors flex items-center justify-center gap-1 text-xs sm:text-sm whitespace-nowrap"
              title="Options"
            >
              <svg
                className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
              <span>Options</span>
            </button>

            {/* Settings Menu Popup */}
            <AnimatePresence>
              {showSettingsMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    className="absolute bottom-full mb-0.5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 bg-slate-950 border border-slate-800 rounded-md shadow-xl z-50 min-w-[160px]"
                  >
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        window.location.hash = "#remix";
                      }}
                      className="w-full px-2 py-1.5 text-left hover:bg-slate-900 first:rounded-t-md transition-colors flex items-center gap-1.5 group text-xs"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-[#FF4DA6] group-hover:text-[#FF4DA6]/80 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4V20m6-4v4m0-12l4-4m-4 4l-4-4"
                        />
                      </svg>
                      <span className="font-medium text-slate-100">Remix</span>
                    </button>

                    <div className="border-t border-slate-800" />

                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        setShowLicensingForm(true);
                      }}
                      className="w-full px-2 py-1.5 text-left hover:bg-slate-900 last:rounded-b-md transition-colors flex items-center gap-1.5 group text-xs"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-[#FF4DA6] group-hover:text-[#FF4DA6]/80 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium text-slate-100">
                        Licensing
                      </span>
                    </button>
                  </motion.div>

                  {/* Close menu when clicking outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSettingsMenu(false)}
                  />
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Licensing Form Modal */}
          <AnimatePresence>
            {showLicensingForm && (
              <>
                {/* Dark Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowLicensingForm(false)}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                />

                {/* Licensing Modal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
                >
                  <div className="pointer-events-auto w-full max-w-2xl rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl max-h-[85vh] overflow-y-auto ring-offset-2 ring-offset-transparent">
                    <LicensingForm
                      imageUrl={imageUrl}
                      type={type}
                      demoMode={demoMode}
                      isLoading={isLoading}
                      parentAsset={parentAsset}
                      onClose={() => setShowLicensingForm(false)}
                      onRegisterStart={(state) => {
                        console.log("Registration started:", state);
                      }}
                      onRegisterComplete={(result) => {
                        console.log("Registration completed:", result);
                      }}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="compact"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={() => setIsExpanded(true)}
      className="relative w-40 h-40 rounded-lg overflow-hidden bg-black border-2 border-[#FF4DA6]/50 shadow-lg group cursor-pointer hover:border-[#FF4DA6] hover:shadow-lg hover:shadow-[#FF4DA6]/20 transition-all"
    >
      {type === "image" ? (
        <img
          src={imageUrl}
          alt="Generation result"
          className="w-full h-full object-cover"
        />
      ) : (
        <video src={imageUrl} className="w-full h-full object-cover" />
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
        <p className="text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Click to expand
        </p>
      </div>

      {/* Type Badge */}
      <div className="absolute top-1 right-1 text-xs font-medium bg-slate-900/80 text-slate-300 px-2 py-1 rounded">
        {type === "image" ? "🖼" : "🎬"}
      </div>
    </motion.div>
  );
};

export default CompactResultCard;
