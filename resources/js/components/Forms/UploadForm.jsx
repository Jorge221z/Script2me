import { router, useForm } from "@inertiajs/react";
import { HashLoader } from 'react-spinners';
import { useState, useEffect } from "react";

const UploadForm = () => {
    const { data, setData, post, errors } = useForm({files: []});

    const [loading, setLoading] = useState(false);
    const [localErrors, setLocalErrors] = useState([]);
    const allowedExtensions = ['c', 'cpp', 'h', 'cs', 'java', 'kt', 'kts', 'swift', 'go', 'rs', 'dart', 'py', 'rb', 'pl', 'php', 'ts', 'tsx', 'html', 'htm', 'css', 'scss', 'sass', 'less', 'js', 'jsx', 'vue', 'svelte', 'sql', 'db', 'sqlite', 'sqlite3', 'mdb', 'accdb', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'env', 'sh', 'bat', 'ps1', 'twig', 'ejs', 'pug', 'md', 'ipynb', 'r', 'mat', 'asm', 'f90', 'f95', 'txt'];

    useEffect(() => { //limpiar errores cuando se cambian los archivos //
        setLocalErrors([]);
    }, [data.files]);

    const validateFiles = (files) => {
        const newErrors = [];
        const MAX_SIZE_MB = 2;
                                //validamos en el cliente(es redundante con el back pero mejora la seguridad)//
        files.forEach(file => {
            const ext = file.name.split('.').pop().toLowerCase(); //obtener la extension del archivo independientemente de si la extension esta en mayusculas o minusculas//

            if (!allowedExtensions.includes(ext)) { //validar si la extension del archivo esta en allowedExtensions //
                newErrors.push(`Extensión .${ext} no permitida`);
            }

            if (file.size > MAX_SIZE_MB * 1024 * 1024) { //validar si el tamaño del archivo es mayor a 2MB//
                newErrors.push(`${file.name} excede los ${MAX_SIZE_MB}MB`);
            }
        });
        setLocalErrors(newErrors);
        return newErrors.length === 0;
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
        setData('files', [...data.files, ...newFiles]); //acumulacion de archivos
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!validateFiles(data.files) || data.files.length === 0) {
            setLoading(false);
            return;  //si fallan las validaciones, no se envia la peticion//
        }

        const formData = new FormData();
        data.files.forEach(file => formData.append('files[]', file));

        try {
             post('/upload', formData, {
                onSuccess: () => reset(),
                onError: (err) => {
                    // Manejar errores del backend
                    if (err?.errors?.files) {
                        setLocalErrors([err.errors.files]);
                    }
                }
            });
        } catch (error) {
            console.error('Error de red:', error);
            setLocalErrors(['Error de conexión con el servidor']);
        } finally {
            setTimeout(() => setLoading(false), 1500); // Mínimo 1.5s de feedback visual
        }
    };


    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <div className="w-full mb-4">
                <label htmlFor="file-upload" className="block text-gray-700 text-sm font-bold mb-2">
                    Drag or select your files
                </label>
                <div className="flex items-center justify-center w-full"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}>
                    <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg
                                className="w-8 h-8 mb-3 text-gray-400"
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
                            <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">Supports: .c, .java, .py, etc.</p>
                        </div>
                        <input
                            id="file-upload"
                            type="file"
                            name="files"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                </div>
                <div className="error-container">
                {localErrors.map((error, index) => (
                     <div key={index} className="text-red-500 text-sm mb-2">
                            {error}
                     </div>
                 ))}
                 {errors?.files && (
                     <div className="text-red-500 text-sm">
                           {errors.files}
                     </div>
                    )}
                </div>

            </div>
            <button
                type="submit"
                disabled={data.files.length === 0 || loading || localErrors.length > 0}
                className={`w-full px-4 py-2 text-white font-bold rounded-lg transition duration-300 ${
                    data.files.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                }`}

            >
                {loading ? (
                    <div className="flex items-center justify-center">
                    <HashLoader color="#ffffff" size={35} style={{ transform: "translateX(-95px)" }} />
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
