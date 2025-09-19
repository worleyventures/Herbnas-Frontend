import React, { useState } from 'react';
import { HiXMark, HiCloudArrowUp, HiArrowDownTray, HiExclamationTriangle, HiCheckCircle } from 'react-icons/hi2';
import { Modal, Button } from './index';
import api from '../../lib/axiosInstance';

const ImportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/excel'
      ];
      
      if (!validTypes.includes(selectedFile.type) && 
          !selectedFile.name.endsWith('.xlsx') && 
          !selectedFile.name.endsWith('.xls')) {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }

      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/leads/admin/import/template', {
        responseType: 'blob'
      });

      // Create blob link to download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads_import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      setError('Failed to download template');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setUploading(true);
    setError(null);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file:', file.name, file.type, file.size);

      const response = await api.post('/leads/admin/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setImportResult(response.data.data);
      
      // Call success callback to refresh data with import result
      if (onImportSuccess) {
        onImportSuccess(response.data.data);
      }
    } catch (error) {
      console.error('Import error:', error);
      setError(error.response?.data?.message || 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setImportResult(null);
    onClose();
  };

  const resetForm = () => {
    setFile(null);
    setError(null);
    setImportResult(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <HiCloudArrowUp className="h-6 w-6 text-blue-600" />
              </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Import Leads</h3>
              <p className="text-sm text-gray-600">Upload an Excel file to import leads in bulk</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        {!importResult ? (
          <>
            {/* Template Download Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <HiArrowDownTray className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 mb-1">Download Template</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Download our Excel template with only the required fields: Customer Name, Mobile, Branch, and Lead Status.
                  </p>
                  <Button
                    onClick={handleDownloadTemplate}
                    variant="outline"
                    size="xs"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <HiArrowDownTray className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Excel File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <HiCloudArrowUp className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Excel files only (.xlsx, .xls) up to 10MB
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    <strong>Required fields:</strong> Customer Name, Mobile, Branch, Lead Status
                  </p>
                </div>
              </div>
              
              {file && (
                <div className="mt-3 p-3 bg-[#22c55e]-50 border border-[#22c55e]-200 rounded-lg">
                  <div className="flex items-center">
                    <HiCheckCircle className="h-5 w-5 text-[#22c55e]-600 mr-2" />
                    <span className="text-sm text-[#22c55e]-800 font-medium">
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <HiExclamationTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                onClick={handleClose}
                variant="outline"
                disabled={uploading}
                size="xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!file || uploading}
                loading={uploading}
                size="xs"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? 'Importing...' : 'Import Leads'}
              </Button>
            </div>
          </>
        ) : (
          /* Import Results */
          <div className="space-y-4">
            <div className="bg-[#22c55e]-50 border border-[#22c55e]-200 rounded-lg p-4">
              <div className="flex items-center">
                <HiCheckCircle className="h-5 w-5 text-[#22c55e]-600 mr-2" />
                <span className="text-sm text-[#22c55e]-800 font-medium">
                  Import completed successfully!
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{importResult.totalRows}</div>
                <div className="text-sm text-gray-600">Total Rows</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-[#22c55e]-600">{importResult.processed}</div>
                <div className="text-sm text-gray-600">Processed</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{importResult.inserted}</div>
                <div className="text-sm text-gray-600">Inserted</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-600">{importResult.errors.length + importResult.duplicates.length}</div>
                <div className="text-sm text-gray-600">Issues</div>
              </div>
            </div>

            {/* Errors and Duplicates */}
            {(importResult.errors.length > 0 || importResult.duplicates.length > 0) && (
              <div className="space-y-3">
                {importResult.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-900 mb-2">Errors ({importResult.errors.length})</h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-800 mb-1">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importResult.duplicates.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-2">Duplicates ({importResult.duplicates.length})</h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                      {importResult.duplicates.map((duplicate, index) => (
                        <div key={index} className="text-sm text-yellow-800 mb-1">
                          {duplicate}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                onClick={resetForm}
                variant="outline"
                size="xs"
              >
                Import More
              </Button>
              <Button
                onClick={handleClose}
                size="xs"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImportModal;
