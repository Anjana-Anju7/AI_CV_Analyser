import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText } from 'lucide-react';

interface Props {
  onFile: (file: File) => void;
}

export function DropZone({ onFile }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);
      if (rejectedFiles.length > 0) {
        setError('Only PDF or DOCX files under 5MB are accepted.');
        return;
      }
      setAccepted(acceptedFiles[0]);
      onFile(acceptedFiles[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors select-none
        ${isDragActive
          ? 'border-indigo-400 bg-indigo-50'
          : accepted
          ? 'border-emerald-400 bg-emerald-50'
          : 'border-gray-300 hover:border-indigo-300 bg-white'
        }`}
    >
      <input {...getInputProps()} />
      {accepted ? (
        <div className="flex flex-col items-center gap-2">
          <FileText className="w-8 h-8 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">{accepted.name}</p>
          <p className="text-xs text-gray-400">Click or drop to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <UploadCloud className="w-8 h-8 text-gray-400" />
          <p className="text-gray-600">
            Drop your CV here, or{' '}
            <span className="text-indigo-600 underline">browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF or DOCX · Max 5MB</p>
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
    </div>
  );
}
