// lib/atscalculator.ts
import natural from "natural";
import { removeStopwords } from "stopword";

// Type definitions for natural library
declare module "natural" {
  interface PorterStemmer {
    stem: (word: string) => string;
  }
}

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Clean and tokenize text
const cleanText = (text: string): string[] => {
  return removeStopwords(tokenizer.tokenize(text.toLowerCase()));
};

// Calculate keyword score (50% weight)
const calculateKeywordScore = (cvText: string, jobDescription: string): number => {
  const cvKeywords = cleanText(cvText).map((word) => stemmer.stem(word));
  const jobKeywords = cleanText(jobDescription).map((word) => stemmer.stem(word));

  const matchedKeywords = jobKeywords.filter((keyword) =>
    cvKeywords.includes(keyword)
  );

  const keywordMatchRatio = jobKeywords.length > 0
    ? matchedKeywords.length / jobKeywords.length
    : 0;

  return keywordMatchRatio * 50; // 50% weight
};

// Calculate structure score (30% weight)
const calculateStructureScore = (cvText: string): number => {
  const requiredSections = ["experience", "education", "skills"];
  const sectionMatches = requiredSections.filter((section) =>
    cvText.toLowerCase().includes(section)
  );

  return (sectionMatches.length / requiredSections.length) * 30;
};

// Calculate experience score (20% weight)
const calculateExperienceScore = (cvText: string): number => {
  const hasExperience = /\b(\d+\s*years?|experienced)\b/gi.test(cvText);
  const hasDegree = /\b(bachelor|master|phd)\b/gi.test(cvText);

  return hasExperience && hasDegree ? 20 : 10;
};

// Calculate total ATS score
export const calculateATSScore = async (
  cvText: string,
  jobDescription: string
): Promise<number> => {
  const keywordScore = calculateKeywordScore(cvText, jobDescription);
  const structureScore = calculateStructureScore(cvText);
  const experienceScore = calculateExperienceScore(cvText);

  return Math.min(keywordScore + structureScore + experienceScore, 100);
};