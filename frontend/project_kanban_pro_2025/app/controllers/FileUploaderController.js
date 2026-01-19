// app/controllers/FileUploaderController.js

const FILES_STORAGE_KEY = 'kanbanPro_uploadedFiles';

/**
 * Controller to manage file uploads and persistence in localStorage.
 */
const FileUploaderController = {
  /**
   * Loads files from localStorage.
   * @returns {Array} The array of file objects or an empty array.
   */
  loadFiles: () => {
    try {
      const storedFiles = localStorage.getItem(FILES_STORAGE_KEY);
      if (storedFiles) {
        // Basic validation to ensure it's an array
        const parsed = JSON.parse(storedFiles);
        console.log('Files loaded from localStorage:', parsed);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error("Failed to load files from localStorage:", error);
      // If parsing fails, return an empty array to prevent app crash
      return [];
    }
    console.log('No files found in localStorage.');
    return [];
  },

  /**
   * Saves an array of file objects to localStorage.
   * @param {Array} files The array of file objects to save.
   * @returns {boolean} True if save was successful, false otherwise.
   */
  saveFiles: (files) => {
    try {
      if (!Array.isArray(files)) {
        throw new Error("Data to be saved must be an array.");
      }
      console.log('Attempting to save files to localStorage:', files);
      const filesToStore = JSON.stringify(files);
      localStorage.setItem(FILES_STORAGE_KEY, filesToStore);
      console.log('Files successfully saved to localStorage.');
      // Verify save
      const verify = localStorage.getItem(FILES_STORAGE_KEY);
      console.log('Verification read from localStorage:', JSON.parse(verify));
      return true;
    } catch (error) {
      console.error("Failed to save files to localStorage:", error);
      return false;
    }
  },
};

export default FileUploaderController;

