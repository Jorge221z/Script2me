import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FiAlertCircle, FiFile, FiX } from 'react-icons/fi';
import { HashLoader } from 'react-spinners';
import '../../../css/app.css';

const FilePreview = ({ file, onRemove, isInvalid, errorMessage }) => {
    const getFileIcon = (extension) => {
        // Futuro: personalizar icono en funcion de la extension //
        return <FiFile className="mr-2 h-5 w-5 text-gray-600" />;
    };

    return (
        <div
            className={`mb-2 flex flex-col rounded-lg ${isInvalid ? 'border border-red-200 bg-red-50' : 'bg-gray-50'} p-2 transition-colors hover:bg-gray-100`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    {getFileIcon(file.name.split('.').pop())}
                    <span className={`max-w-[200px] truncate text-sm ${isInvalid ? 'font-medium text-red-700' : 'text-gray-700'}`}>
                        {file.name}
                        {isInvalid && <FiAlertCircle className="ml-1 inline h-4 w-4 text-red-500" />}
                    </span>
                </div>
                <button type="button" onClick={() => onRemove(file)} className="text-gray-400 transition-colors hover:text-red-500">
                    <FiX className="h-4 w-4" />
                </button>
            </div>
            {isInvalid && errorMessage && <div className="mt-1 pl-7 text-xs text-red-600">{errorMessage}</div>}
        </div>
    );
};

const UploadForm = () => {
    const { data, setData, post, errors, processing } = useForm({ files: [] });

    const [loading, setLoading] = useState(false);
    const [localErrors, setLocalErrors] = useState([]);
    const [invalidFiles, setInvalidFiles] = useState([]);
    const [fileErrors, setFileErrors] = useState({});
    const allowedExtensions = ['c', 'cpp', 'h', 'cs', 'java', 'kt', 'kts', 'swift', 'go', 'rs', 'dart', 'py', 'rb', 'pl', 'php', 'ts', 'tsx', 'html', 'htm', 'css', 'scss', 'sass', 'less', 'js', 'jsx', 'vue', 'svelte', 'sql', 'db', 'sqlite', 'sqlite3', 'mdb', 'accdb', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'env', 'sh', 'bat', 'ps1', 'twig', 'ejs', 'pug', 'md', 'ipynb', 'r', 'mat', 'asm', 'f90', 'f95', 'txt'];

    useEffect(() => {
        // Limpiar errores generales cuando se cambian los archivos
        setLocalErrors([]);
    }, [data.files]);

    const validateFiles = (files) => {
        const errors = [];
        const newInvalidFiles = [];
        const newFileErrors = {};
        const MAX_SIZE_MB = 2;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split('.').pop().toLowerCase();
            let fileIsInvalid = false;
            let fileErrorMessage = '';

            // Validación de extensión
            if (!allowedExtensions.includes(ext)) {
                const errorMsg = `Extensión .${ext} no permitida`;
                errors.push(`❌ Archivo bloqueado: ${file.name} (${errorMsg})`);
                fileIsInvalid = true;
                fileErrorMessage = errorMsg;
            }

            // Validación de tamaño
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                const errorMsg = `Excede ${MAX_SIZE_MB}MB`;
                errors.push(`❌ Archivo demasiado grande: ${file.name} (${errorMsg})`);
                fileIsInvalid = true;
                fileErrorMessage = fileErrorMessage ? `${fileErrorMessage}, ${errorMsg}` : errorMsg;
            }

            if (fileIsInvalid) {
                newInvalidFiles.push(file.name);
                newFileErrors[file.name] = fileErrorMessage;
            }
        }

        return { errors, invalidFiles: newInvalidFiles, fileErrors: newFileErrors };
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const { errors: validationErrors, invalidFiles: newInvalidFiles, fileErrors: newFileErrors } = validateFiles(newFiles);

        if (validationErrors.length > 0) {
            setLocalErrors(validationErrors);
        }

        // Añadir todos los archivos a la lista, válidos o no
        setData('files', [...data.files, ...newFiles]);
        setInvalidFiles([...invalidFiles, ...newInvalidFiles]);
        setFileErrors({ ...fileErrors, ...newFileErrors });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const newFiles = Array.from(e.dataTransfer.files);
        const { errors: validationErrors, invalidFiles: newInvalidFiles, fileErrors: newFileErrors } = validateFiles(newFiles);

        if (validationErrors.length > 0) {
            setLocalErrors(validationErrors);
        }

        // Añadir todos los archivos a la lista, válidos o no
        setData('files', [...data.files, ...newFiles]);
        setInvalidFiles([...invalidFiles, ...newInvalidFiles]);
        setFileErrors({ ...fileErrors, ...newFileErrors });
    };

    const handleRemoveFile = (fileToRemove) => {
        // Eliminar archivo de la lista
        setData(
            'files',
            data.files.filter((file) => file.name !== fileToRemove.name || file.lastModified !== fileToRemove.lastModified),
        );

        // Eliminar de la lista de archivos inválidos si estaba allí
        setInvalidFiles(invalidFiles.filter((name) => name !== fileToRemove.name));

        // Eliminar errores específicos de este archivo
        const newFileErrors = { ...fileErrors };
        delete newFileErrors[fileToRemove.name];
        setFileErrors(newFileErrors);

        // Actualizar errores generales si es necesario
        setLocalErrors(localErrors.filter((error) => !error.includes(fileToRemove.name)));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verificar si hay archivos válidos para enviar
        const validFiles = data.files.filter((file) => !invalidFiles.includes(file.name));

        if (validFiles.length === 0) {
            setLocalErrors([...localErrors.filter((e) => !e.includes('No hay archivos válidos')), '❌ No hay archivos válidos para subir']);
            return;
        }

        // Activar loading con retraso mínimo de 1.5s
        setLoading(true);
        const startTime = Date.now();

        try {
            const formData = new FormData();
            validFiles.forEach((file) => formData.append('files[]', file));

            // Esperar mínimo 1.5 segundos antes de enviar
            await new Promise((resolve) => setTimeout(resolve, 1500));

            post('/upload', formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setData('files', []); // <- Limpiar archivos
                    setInvalidFiles([]); // <- Limpiar archivos inválidos
                    setFileErrors({}); // <- Limpiar errores individuales
                    setLocalErrors([]);
                },
                onError: (errors) => {
                    setLocalErrors(Object.values(errors).flat());
                },
            });
        } finally {
            // Completar tiempo restante si la petición fue más rápida
            const elapsed = Date.now() - startTime;
            if (elapsed < 1500) {
                await new Promise((resolve) => setTimeout(resolve, 1500 - elapsed));
            }
            setLoading(false);
        }
    };

    // Verificar si hay archivos válidos para habilitar el botón
    // Cambiamos la lógica para que el botón esté deshabilitado si hay cualquier archivo inválido
    const hasValidFiles = data.files.length > 0 && invalidFiles.length === 0;

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
                        className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-0 bg-transparent hover:bg-gray-700/50 dark:hover:bg-gray-200/50"
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
                            <h4 className="mb-2 text-sm font-medium text-gray-500">
                                Archivos seleccionados ({data.files.length})
                                {invalidFiles.length > 0 && <span className="ml-2 text-red-500">({invalidFiles.length} con errores)</span>}
                            </h4>
                            <div className="max-h-[200px] overflow-y-auto">
                                {data.files.map((file, index) => (
                                    <FilePreview
                                    key={`${file.name}-${file.size}-${file.lastModified}`}
                                        file={file}
                                        onRemove={handleRemoveFile}
                                        isInvalid={invalidFiles.includes(file.name)}
                                        errorMessage={fileErrors[file.name]}
                                        className="transition-all duration-200 ease-in-out ..."
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-4 space-y-2">
                    {localErrors.length > 0 &&
                        localErrors.map((error, index) => (
                            <div key={index} className="text-sm text-red-400 dark:text-red-600">
                                ⚠️ {error}
                            </div>
                        ))}
                    {errors.files && <div className="text-sm text-red-400 dark:text-red-600">⚠️ {errors.files}</div>}
                </div>
            </div>
            <button
                type="submit"
                onClick={() => setTimeout(() => setData({ ...data, files: [] }), 1700)}
                disabled={data.files.length === 0 || loading || !hasValidFiles || processing}
                className={`w-full rounded-lg px-4 py-2 font-bold text-white text-xl transition duration-300 ${
                    data.files.length === 0 || !hasValidFiles || processing ? 'cursor-not-allowed bg-gray-400' : 'custom-bg-color custom-bg-color-hover'
                }`}
            >
                {loading || processing ? (
                    <div className="flex items-center justify-center">
                        <HashLoader color="white" size={35} style={{ transform: 'translateX(-95px)' }} />
                        <span className="ml-2">Uploading...</span>
                    </div>
                ) : (
                    'Upload files'
                )}
            </button>
        </form>
    );
};

export default UploadForm;
