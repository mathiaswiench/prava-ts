"use client"
import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation'

const FileUpload: React.FC = () => {
    const router = useRouter();
  
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [errors, setErrors] = useState({
    file: '',
  });

  const readFileAsText = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result);
      };
      reader.onerror = () => {
        reject(new Error('Error reading the file'));
      };
      reader.readAsText(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;

    if (selectedFile && selectedFile.type !== 'text/csv') {
      setErrors({ file: 'Please upload a valid CSV file' });
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setErrors({ file: '' });
  };

  const handleNext = () => {
    sessionStorage.setItem("data", JSON.stringify(data))
    router.push("/trainingplan")
  }

  const validateFile = (): boolean => {
    if (!file) {
      setErrors({ file: 'No file selected. Please upload a file' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateFile()) return;
  
    try {
      const csvContent = await readFileAsText(file!);
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setData(results.data);
          setErrors({ file: '' });
        },
        error: (err) => {
          setErrors({ file: `Error parsing CSV: ${err.message}` });
        },
      });
    } catch (error) {
      setErrors({ file: error.message });
    }
  };

return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Upload CSV
        </h2>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm">
          <div>
            <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 mb-2">
              CSV File
            </label>
            <input
              type="file"
              id="csvFile"
              accept=".csv"
              onChange={handleFileChange}
              className={`appearance-none relative block w-full px-3 py-2 border ${
                errors.file ? 'border-red-500' : 'border-gray-300'
              } rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
            />
            {errors.file && (
              <p className="mt-1 text-sm text-red-600">{errors.file}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Process File
          </button>
          
          <button
            type="button"
            disabled={data.length === 0}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </form>

      {data.length > 0 && (
        <div className="mt-8">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">Parsed Data</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, i) => (
                      <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default FileUpload;
