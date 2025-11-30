import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";

interface WhitelistDetails {
  ipId: string;
  title: string;
  ownerAddress?: string;
  timestamp?: number;
  matchType?: string;
  similarity?: number;
  parentIpIds?: string[];
  licenseTermsIds?: string[];
  licenseTemplates?: string[];
  royaltyContext?: string;
  maxMintingFee?: string;
  maxRts?: string;
  maxRevenueShare?: number;
  licenseVisibility?: string;
  isDerivative?: boolean;
  parentsCount?: number;
  licenses?: any[];
}

interface WhitelistDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: WhitelistDetails | null;
}

export const WhitelistDetailsModal: React.FC<WhitelistDetailsModalProps> = ({
  isOpen,
  onClose,
  details,
}) => {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [ownerDomain, setOwnerDomain] = useState<{
    domain: string | null;
    loading: boolean;
  } | null>(null);

  // Fetch owner domain when modal opens or details change
  useEffect(() => {
    if (!details?.ownerAddress) {
      console.log("[WhitelistDetailsModal] No owner address to resolve");
      setOwnerDomain(null);
      return;
    }

    console.log(
      "[WhitelistDetailsModal] Fetching domain for:",
      details.ownerAddress,
    );
    setOwnerDomain({ domain: null, loading: true });

    fetch("/api/resolve-owner-domain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerAddress: details.ownerAddress }),
    })
      .then((res) => {
        console.log("[WhitelistDetailsModal] Response status:", res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("[WhitelistDetailsModal] Domain data:", data);
        setOwnerDomain({
          domain: data.ok ? data.domain : null,
          loading: false,
        });
      })
      .catch((err) => {
        console.error("[WhitelistDetailsModal] Error fetching domain:", err);
        setOwnerDomain({ domain: null, loading: false });
      });
  }, [details?.ownerAddress]);

  if (!details) return null;

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatWei = (wei?: string) => {
    if (!wei || wei === "0") return "No limit";
    try {
      const value = BigInt(wei);
      return `${(Number(value) / 1e18).toFixed(4)} ETH`;
    } catch {
      return wei;
    }
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    if (addr.length <= 10) return addr;
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getStoryExplorerUrl = (ipId: string) => {
    return `https://explorer.story.foundation/ipa/${ipId}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-slate-900/95 border border-[#FF4DA6]/30 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-slate-900/95 border-b border-[#FF4DA6]/20 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#FF4DA6]">
                  Whitelist Details
                </h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
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
              </div>

              {/* Content */}
              <div className="px-6 py-4 space-y-4">
                {/* Asset Information */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-[#FF4DA6] mb-3">
                    Asset Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-slate-400 text-sm">Title:</span>
                      <span className="text-slate-100 font-medium break-all">
                        {details.title}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-slate-400 text-sm">IP ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-100 font-mono text-sm break-all">
                          {truncateAddress(details.ipId)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(details.ipId)}
                          title="Copy full address"
                          className="p-1.5 rounded bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-slate-100 transition-colors"
                          aria-label="Copy IP ID"
                        >
                          {copiedAddress ? (
                            <svg
                              className="w-4 h-4 text-green-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>
                        <a
                          href={getStoryExplorerUrl(details.ipId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on Story Explorer"
                          className="p-1.5 rounded bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-[#FF4DA6] transition-colors"
                          aria-label="View on Story Explorer"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                    {details.ownerAddress && (
                      <div className="space-y-3">
                        {/* Domain Display */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-slate-400 text-sm">
                            Domain:
                          </span>
                          {ownerDomain?.loading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-[#FF4DA6]/60 animate-pulse" />
                              <span className="text-sm text-slate-400">
                                Resolving...
                              </span>
                            </div>
                          ) : ownerDomain?.domain ? (
                            <span className="text-slate-100 font-mono text-sm px-3 py-1 bg-gradient-to-r from-[#FF4DA6]/20 to-[#FF4DA6]/10 border border-[#FF4DA6]/30 rounded-lg text-[#FF4DA6]">
                              {ownerDomain.domain}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm italic">
                              No domain registered
                            </span>
                          )}
                        </div>

                        {/* Owner Address Display */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-slate-400 text-sm">
                            Owner Address:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-100 font-mono text-sm break-all">
                              {truncateAddress(details.ownerAddress)}
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(details.ownerAddress!)
                              }
                              title="Copy owner address"
                              className="p-1.5 rounded bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-slate-100 transition-colors"
                              aria-label="Copy owner address"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-slate-400 text-sm">
                        Registered:
                      </span>
                      <span className="text-slate-100 text-sm">
                        {formatDate(details.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Royalty Configuration */}
                {(details.maxMintingFee ||
                  details.maxRts ||
                  details.maxRevenueShare !== undefined) && (
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <h3 className="text-sm font-semibold text-[#FF4DA6] mb-3">
                      Royalty Configuration
                    </h3>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <span className="text-slate-400 text-sm">
                          Max Minting Fee:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-100 font-medium">
                            {formatWei(details.maxMintingFee)}
                          </span>
                          {!details.maxMintingFee ||
                          details.maxMintingFee === "0" ? (
                            <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                              Unlimited
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <span className="text-slate-400 text-sm">Max RTS:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-100 font-medium">
                            {formatWei(details.maxRts)}
                          </span>
                          {!details.maxRts || details.maxRts === "0" ? (
                            <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                              Unlimited
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {details.maxRevenueShare !== undefined && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <span className="text-slate-400 text-sm">
                            Max Revenue Share:
                          </span>
                          <span className="text-slate-100 font-medium">
                            {details.maxRevenueShare}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-slate-900/95 border-t border-[#FF4DA6]/20 px-6 py-3 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-100 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
