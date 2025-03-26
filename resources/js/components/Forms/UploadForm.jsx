import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FiFile, FiX } from 'react-icons/fi';
import { HashLoader } from 'react-spinners';

const FilePreview = ({ file, onRemove }) => {
    const getFileIcon = (extension) => {
        // Futuro: personalizar icono en funcion de la extension //
        return <FiFile className="mr-2 h-5 w-5 text-gray-600" />;
    };

    return (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-gray-50 p-2 transition-colors hover:bg-gray-100">
            <div className="flex items-center">
                {getFileIcon(file.name.split('.').pop())}
                <span className="max-w-[200px] truncate text-sm text-gray-700">{file.name}</span>
            </div>
            <button type="button" onClick={() => onRemove(file)} className="text-gray-400 transition-colors hover:text-red-500">
                <FiX className="h-4 w-4" />
            </button>
        </div>
    );
};

const UploadForm = () => {
    const { data, setData, post, errors } = useForm({ files: [] });

    const [loading, setLoading] = useState(false);
    const [localErrors, setLocalErrors] = useState([]);
    const allowedExtensions = [
        'c',
        'cpp',
        'h',
        'cs',
        'java',
        'kt',
        'kts',
        'swift',
        'go',
        'rs',
        'dart',
        'py',
        'rb',
        'pl',
        'php',
        'ts',
        'tsx',
        'html',
        'htm',
        'css',
        'scss',
        'sass',
        'less',
        'js',
        'jsx',
        'vue',
        'svelte',
        'sql',
        'db',
        'sqlite',
        'sqlite3',
        'mdb',
        'accdb',
        'json',
        'xml',
        'yaml',
        'yml',
        'toml',
        'ini',
        'env',
        'sh',
        'bat',
        'ps1',
        'twig',
        'ejs',
        'pug',
        'md',
        'ipynb',
        'r',
        'mat',
        'asm',
        'f90',
        'f95',
        'txt',
    ];

    useEffect(() => {
        //limpiar errores cuando se cambian los archivos //
        setLocalErrors([]);
    }, [data.files]);

    const validateFiles = (files) => {
        const errors = [];
        const MAX_SIZE_MB = 2;

        files.forEach(file => {
            const ext = file.name.split('.').pop().toLowerCase();

            // Validación de extensión
            if (!allowedExtensions.includes(ext)) {
                errors.push(`❌ Archivo bloqueado: ${file.name} (Extensión .${ext} no permitida)`);
            }

            // Validación de tamaño
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                errors.push(`❌ Archivo demasiado grande: ${file.name} (Máximo ${MAX_SIZE_MB}MB)`);
            }
        });

        return errors;
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (validateFiles(newFiles)) {
            setData('files', [...data.files, ...newFiles]); // para que inertia sepa que se ha cambiado el estado
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const newFiles = Array.from(e.dataTransfer.files);
        // Filtrar archivos válidos ANTES de actualizar el estado
        const validFiles = newFiles.filter((file) => {
            const ext = file.name.split('.').pop().toLowerCase();
            return allowedExtensions.includes(ext) && file.size <= 2 * 1024 * 1024;
        });
        setData('files', [...data.files, ...newFiles]);
    };

    const handleRemoveFile = (fileToRemove) => {
        setData(
            'files',
            data.files.filter((file) => file.name !== fileToRemove.name || file.lastModified !== fileToRemove.lastModified),
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validación antes de cualquier acción
        const validationErrors = validateFiles(data.files);
        if (validationErrors.length > 0 || data.files.length === 0) {
            setLocalErrors(validationErrors);
            return;
        }

        // 2. Copia de seguridad de archivos válidos
        const validFiles = [...data.files];

        // 3. Limpiar UI y activar spinner
        setData('files', []);
        setLoading(true);

        try {
            // 4. Esperar 1s mínimo para feedback visual
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 5. Enviar solo archivos pre-validados
            const formData = new FormData();
            validFiles.forEach(file => formData.append('files[]', file));

             post('/upload', formData, {
                onError: (err) => {
                    // 6. Recuperar archivos si hay error del servidor
                    setData('files', validFiles);
                    setLocalErrors([err.message]);
                }
            });

        } catch (error) {
            console.error('Error de red:', error);
            setLocalErrors(['Error de conexión']);
            setData('files', validFiles); // Restaurar archivos
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center rounded-lg bg-gray-900 p-6 text-white shadow-md dark:bg-white dark:text-gray-800 dark:shadow-lg"
        >
            <div className="mb-4 w-full">
                <label htmlFor="file-upload" className="mb-2 block text-sm font-bold text-gray-300 dark:text-gray-700">
                    Drag or select your files
                </label>
                <div
                    className={`border-2 border-dashed ${
                        data.files.length > 0
                            ? 'border-blue-400 bg-blue-900/20 dark:border-blue-200 dark:bg-blue-50'
                            : 'border-gray-600 bg-gray-800/50 dark:border-gray-300 dark:bg-gray-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <label
                        htmlFor="file-upload"
                        className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 bg-gray-800 hover:bg-gray-600 dark:border-gray-300 dark:bg-gray-50 dark:hover:bg-gray-100"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg
                                className="mb-3 h-8 w-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                />
                            </svg>
                            <p className="mb-2 text-sm text-gray-300 dark:text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-300 dark:text-gray-500">Supports: .c, .java, .py, etc.</p>
                        </div>
                        <input id="file-upload" type="file" name="files" multiple onChange={handleFileChange} className="hidden" />
                    </label>
                </div>
                <div className="mt-4">
                    {data.files.length > 0 && (
                        <div className="border-t pt-4">
                            <h4 className="mb-2 text-sm font-medium text-gray-500">Archivos seleccionados ({data.files.length})</h4>
                            <div className="max-h-[200px] overflow-y-auto">
                                {data.files.map((file, index) => (
                                    <FilePreview
                                        key={`${file.name}-${file.lastModified}`}
                                        file={file}
                                        onRemove={handleRemoveFile}
                                        className="transition-all duration-200 ease-in-out ..."
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-4 space-y-2">
                    {localErrors.map((error, index) => (
                        <div key={index} className="text-sm text-red-400 dark:text-red-600">
                            ⚠️ {error}
                        </div>
                    ))}
                    {errors?.files && <div className="text-sm text-red-400 dark:text-red-600">⚠️ {errors.files}</div>}
                </div>
            </div>
            <button
                type="submit"
                disabled={data.files.length === 0 || loading || localErrors.length > 0}
                className={`w-full rounded-lg px-4 py-2 font-bold text-white transition duration-300 ${
                    data.files.length === 0 ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                }`}
            >
                {loading ? (
                    <div className="flex items-center justify-center">
                        <HashLoader color="#00ffb9" size={35} style={{ transform: 'translateX(-95px)' }} />
                        <span>Uploading...</span>
                    </div>
                ) : (
                    'Upload files'
                )}
            </button>
        </form>
    );
};

export default UploadForm;
