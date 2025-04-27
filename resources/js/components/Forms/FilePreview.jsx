import { FiAlertCircle, FiFile, FiX } from 'react-icons/fi';

const FilePreview = ({ file, onRemove, isInvalid, errorMessage }) => {
    const getFileIcon = (extension) => {
        // Futuro: personalizar icono en funcion de la extension
        return <FiFile className="mr-2 h-5 w-5 text-gray-600" />;
    };

    return (
        <div
            className={`mb-2 flex flex-col rounded-lg ${isInvalid ? 'border border-red-200 bg-red-50' : 'bg-gray-50'} p-2 transition-colors hover:bg-gray-100`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    {getFileIcon(file.name.split('.').pop())}
                    <span className={`max-w-[325px] truncate text-sm ${isInvalid ? 'font-medium text-red-700' : 'text-gray-700'}`}>
                        {file.name}
                        {isInvalid && <FiAlertCircle className="ml-1 inline h-4 w-4 text-red-500" />}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => onRemove(file)}
                    title="Remove file"
                    className="flex items-center justify-center rounded-full bg-gray-200 p-1.5 text-gray-500 transition-all duration-200 hover:bg-red-100 hover:text-red-600 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                    <FiX className="h-4 w-4" />
                </button>
            </div>
            {isInvalid && errorMessage && <div className="mt-1 pl-7 text-xs text-red-600">{errorMessage}</div>}
        </div>
    );
};

export default FilePreview;