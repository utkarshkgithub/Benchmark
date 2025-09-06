/**
 * Utility functions for normalizing branch names
 */

/**
 * Normalizes branch name - converts "Mechatronics" to "MAE"
 * @param {string} branch - The branch name to normalize
 * @returns {string} - The normalized branch name
 */
export const normalizeBranchName = (branch) => {
  if (branch === "Mechatronics" || branch === "MAE") {
    return "MAE";
  }
  return branch;
};

/**
 * Normalizes branch names (string or array)
 * @param {string|string[]} branches - Branch name(s) to normalize
 * @returns {string[]} - Array of normalized branch names
 */
export const normalizeBranchNames = (branches) => {
  if (!branches) return [];

  // If a single branch string is passed, wrap it in an array
  if (!Array.isArray(branches)) {
    return [normalizeBranchName(branches)];
  }

  return branches.map(branch => normalizeBranchName(branch));
};

/**
 * Valid branch names after normalization
 */
export const VALID_BRANCHES = ["CSE", "ECE", "MAE", "MNC", "PG"];

/**
 * Legacy branch name mappings
 */
export const BRANCH_MAPPINGS = {
  "Mechatronics": "MAE",
  "MAE": "MAE"
};
