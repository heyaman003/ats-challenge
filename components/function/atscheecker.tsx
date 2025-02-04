"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const AtsChecker = (props: { cvContent: string }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [jobDescription, setJobDescription] = useState("");
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!jobDescription) return;
    setLoading(true);

    try {
      const response = await fetch("/api/ats", {
        method: "POST",
        body: JSON.stringify({ jobDescription, cvText: props.cvContent }),
      });
      const { score } = await response.json();
      setAtsScore(score);
    } catch (error) {
      console.error("Error fetching ATS score:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-[2%] left-[2%]">
      <motion.button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        Check ATS Score
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-8 rounded-lg shadow-2xl w-11/12 max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-center">ATS Score Checker</h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Enter the job description to see how well your CV matches the job requirements.
            </p>
            <textarea
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              rows={6}
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <div className="flex justify-end mt-6 space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                disabled={loading}
              >
                {loading ? "Checking..." : "Submit"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {atsScore !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-[2%] left-[2%] bg-white p-6 rounded-lg shadow-lg"
        >
          <h3 className="text-2xl font-bold text-center mb-4">ATS Score</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-gray-200 stroke-current"
                  strokeWidth="2"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                />
                <path
                  className="text-green-600 stroke-current"
                  strokeWidth="2"
                  strokeDasharray={`${atsScore}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-green-600">
                {atsScore}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            Your CV matches {atsScore}% of the job description.
          </p>
          <button
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={() => setAtsScore(null)}
          >
            Close
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default AtsChecker;