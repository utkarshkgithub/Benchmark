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
 * Normalizes an array of branch names
 * @param {string[]} branches - Array of branch names to normalize
 * @returns {string[]} - Array of normalized branch names
 */
export const normalizeBranchNames = (branches) => {
  return branches.map(branch => normalizeBranchName(branch));
};

/**
 * Valid branch names after normalization
 */
export const VALID_BRANCHES = ["CSE", "ECE", "MAE", "MNC"];

/**
 * Legacy branch name mappings
 */
export const BRANCH_MAPPINGS = {
  "Mechatronics": "MAE",
  "MAE": "MAE"
};
