import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiAlertCircle, FiFile, FiX } from 'react-icons/fi';
import { HashLoader } from 'react-spinners';
import '../../../css/app.css';
import FormTooltip from './FormTooltip';
import { allowedExtensions } from './allowedExtensions';
import RecaptchaContainer from './RecaptchaContainer';
import { CloudUpload } from 'lucide-react';


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
                    <span className={`max-w-[325px] truncate text-sm ${isInvalid ? 'font-medium text-red-700' : 'text-gray-700'}`}>
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

const UploadForm = ({ actionUrl, loadingTime, buttonText, showCaptcha = false }) => {
    const { data, setData, post, errors, processing } = useForm({ files: [] });

    const [loading, setLoading] = useState(false);
    const [localErrors, setLocalErrors] = useState([]);
    const [invalidFiles, setInvalidFiles] = useState([]);
    const [fileErrors, setFileErrors] = useState({});
    const [recentlyExceededLimit, setRecentlyExceededLimit] = useState(false); // variable para controlar el warning del limite de archivos//
    const MAX_FILE_COUNT = 20; // Cantidad maxima de archivos por subida //

    // Con estas variables controlamos el estado del captcha//
    const [shouldShowCaptcha, setShouldShowCaptcha] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);

    //manejo del estado del captcha//
    useEffect(() => {
        // Define a global callback function for reCAPTCHA
        window.onCaptchaCompleted = () => {
            setCaptchaVerified(true);
        };

        const handleRecaptchaLoad = () => {
            if (window.grecaptcha) {
                window.grecaptcha.render('recaptcha-container', {
                    sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
                    callback: 'onCaptchaCompleted', // Use the name of the global function
                });
            }
        };

        if (showCaptcha && shouldShowCaptcha) {
            window.onRecaptchaLoad = handleRecaptchaLoad;

            // Una vez que este cargado, se renderiza el captcha//
            if (window.grecaptcha && window.grecaptcha.render) {
                handleRecaptchaLoad();
            }
        }

        return () => {
            delete window.onRecaptchaLoad; // Limpieza al desmontar
            delete window.onCaptchaCompleted; // Clean up global callback
        };
    }, [showCaptcha, shouldShowCaptcha]); // se ejecuta cada vez que cambia el estado del captcha//

    //una vez se comienza a procesar en la API de Gemini, limpiamos los archivos del formulario//
    useEffect(() => {
        if (processing) {
            const timer = setTimeout(() => {
                setData('files', []);
            }, 1000); // 1 segundo

            return () => clearTimeout(timer); // Limpieza si cambia antes
        }
    }, [processing]);

    useEffect(() => {
        // Limpiar errores generales cuando se cambian los archivos
        setLocalErrors([]);

        // Reset the warning when files change
        if (data.files.length <= MAX_FILE_COUNT) {
            setRecentlyExceededLimit(false);
        }
    }, [data.files]);

    useEffect(() => {
        // Prevenir el comportamiento predeterminado del navegador al arrastrar/soltar archivos
        const preventDefaultDrag = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        // Añadir event listeners al documento
        document.addEventListener('dragover', preventDefaultDrag);
        document.addEventListener('drop', preventDefaultDrag);

        // Limpiar event listeners cuando el componente se desmonte
        return () => {
            document.removeEventListener('dragover', preventDefaultDrag);
            document.removeEventListener('drop', preventDefaultDrag);
        };
    }, []);

    const validateFiles = (files, currentFileCount = 0) => {
        const errors = [];
        const newInvalidFiles = [];
        const newFileErrors = {};
        const MAX_SIZE_MB = 2;

        // Verificar si el número total de archivos excede el límite//
        if (currentFileCount + files.length > MAX_FILE_COUNT) {
            errors.push(`❌ It´s not possible to add more than ${MAX_FILE_COUNT} files (trying to add ${files.length} to the ${currentFileCount} existing ones)`);
            return {
                errors,
                invalidFiles: newInvalidFiles,
                fileErrors: newFileErrors,
                exceedsMaxCount: true,
            };
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split('.').pop().toLowerCase();
            let fileIsInvalid = false;
            let fileErrorMessage = '';

            // Validación de extensión
            if (!allowedExtensions.includes(ext)) {
                const errorMsg = `Extension .${ext} doesn´t match the allowed ones`;
                errors.push(`❌ Blocked file: ${file.name} (${errorMsg})`);
                fileIsInvalid = true;
                fileErrorMessage = errorMsg;
            }

            // Validación de tamaño
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                const errorMsg = `Excede ${MAX_SIZE_MB}MB`;
                errors.push(`❌ Too big filesize: ${file.name} (${errorMsg})`);
                fileIsInvalid = true;
                fileErrorMessage = fileErrorMessage ? `${fileErrorMessage}, ${errorMsg}` : errorMsg;
            }

            if (fileIsInvalid) {
                newInvalidFiles.push(file.name);
                newFileErrors[file.name] = fileErrorMessage;
            }
        }

        return {
            errors,
            invalidFiles: newInvalidFiles,
            fileErrors: newFileErrors,
            exceedsMaxCount: false,
        };
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const { errors: validationErrors, invalidFiles: newInvalidFiles, fileErrors: newFileErrors, exceedsMaxCount } =
            validateFiles(newFiles, data.files.length);

        if (validationErrors.length > 0) {
            setLocalErrors(validationErrors);
        }

        // actualizamos el warning pero no deshabilitamos el botón si ya tenemos archivos válidos
        if (exceedsMaxCount) {
            setRecentlyExceededLimit(true);
        }

        // Solo añadir archivos si no excedemos el límite de 20//
        if (!exceedsMaxCount) {
            // Añadir todos los archivos a la lista, válidos o no
            setData('files', [...data.files, ...newFiles]);
            setInvalidFiles([...invalidFiles, ...newInvalidFiles]);
            setFileErrors({ ...fileErrors, ...newFileErrors });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const newFiles = Array.from(e.dataTransfer.files);
        const { errors: validationErrors, invalidFiles: newInvalidFiles, fileErrors: newFileErrors, exceedsMaxCount } =
            validateFiles(newFiles, data.files.length);

        if (validationErrors.length > 0) {
            setLocalErrors(validationErrors);
        }

        // actualizamos el warning pero no deshabilitamos el botón si ya tenemos archivos válidos
        if (exceedsMaxCount) {
            setRecentlyExceededLimit(true);
        }

        // Solo añadir archivos si no excedemos el límite de 20//
        if (!exceedsMaxCount) {
            // Añadir todos los archivos a la lista, válidos o no
            setData('files', [...data.files, ...newFiles]);
            setInvalidFiles([...invalidFiles, ...newInvalidFiles]);
            setFileErrors({ ...fileErrors, ...newFileErrors });
        }
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

        // Reset the warning if we're back under the limit
        if (data.files.length - 1 <= MAX_FILE_COUNT) {
            setRecentlyExceededLimit(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verificar si hay archivos válidos para enviar
        const validFiles = data.files.filter((file) => !invalidFiles.includes(file.name));

        if (validFiles.length === 0) {
            setLocalErrors([...localErrors.filter((e) => !e.includes('There are no valid files')), '❌ There are no valid files to upload']);
            return;
        }

        // Si el captcha es requerido y no se ha verificado, mostrar el captcha//
        if (showCaptcha && !shouldShowCaptcha) {
            setShouldShowCaptcha(true);
            return;
        }

        //manejamos el captcha solo si es requerido y ya está mostrado
        if (showCaptcha && shouldShowCaptcha) {
            const captchaResponse = window.grecaptcha.getResponse();
            if (!captchaResponse) {
                toast.error('Please complete the captcha to proceed', {
                    duration: 2000,
                    position: 'top-center',
                });
                return;
            }
        }

        // Activar loading con retraso dado por el parametro loadingTime//
        setLoading(true);
        const startTime = Date.now();

        try {
            const formData = new FormData();
            validFiles.forEach((file) => formData.append('files[]', file));

            //añadimos el captcha a la peticion solo si es necesario
            if (showCaptcha && shouldShowCaptcha) {
                formData.append('captcha', window.grecaptcha.getResponse());
            }

            // Esperar mínimo 1.5 segundos antes de enviar
            await new Promise((resolve) => setTimeout(resolve, loadingTime));

            post(actionUrl, formData, { //segun de donde venga el form vamos a un metodo del backend o a otro//
                forceFormData: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    if (page.props.flash && page.props.flash.success) { //mostramos los mensajes flash que nos envia el backend //
                        toast.success(page.props.flash.success, {
                            duration: loadingTime,
                            position: 'top-center',
                        });
                    }
                    // Limpiar archivos y errores después de la subida exitosa y el captcha completado//
                    setData('files', []); // <- Limpiar archivos
                    setInvalidFiles([]); // <- Limpiar archivos inválidos
                    setFileErrors({}); // <- Limpiar errores individuales(internos)
                    setLocalErrors([]);
                    // Resetetamos los states del captcha//
                    setShouldShowCaptcha(false);
                    setCaptchaVerified(false);
                    if (window.grecaptcha) {
                        window.grecaptcha.reset();
                    }
                },
                onError: (errors) => {
                    setLocalErrors(Object.values(errors).flat());
                },
            });
        } finally {
            // Completar tiempo restante si la petición fue más rápida
            const elapsed = Date.now() - startTime;
            if (elapsed < loadingTime) {
                await new Promise((resolve) => setTimeout(resolve, 105 - elapsed));
            }
            setLoading(false);
        }
    };

    // Verificar si hay archivos válidos para habilitar el botón
    const hasValidFiles = data.files.length > 0 &&
        invalidFiles.length === 0 &&
        data.files.length <= MAX_FILE_COUNT;

    // Update button disabled logic to consider CAPTCHA
    const isButtonDisabled = data.files.length === 0 ||
        loading ||
        !hasValidFiles ||
        processing ||
        (showCaptcha && shouldShowCaptcha && !captchaVerified);

    // Función para dividir el array en grupos de 10
    const chunkArray = (array, size) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    };

    const extColumns = chunkArray(allowedExtensions, 10);

    return (
        <div>
            {showCaptcha && shouldShowCaptcha && (<script src="https://www.google.com/recaptcha/api.js?render=explicit&onload=onRecaptchaLoad" async defer></script>)}

            <form
                onSubmit={handleSubmit}
                className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center rounded-lg bg-gray-950 p-6 text-white shadow-md dark:bg-white dark:text-gray-950 dark:shadow-lg"
            >
                <div className="mb-1 w-full">
                    <label htmlFor="file-upload" data-tooltip-id="info-tooltip" className="mb-2 block text-sm font-bold text-gray-400 dark:text-gray-700">
                        Drag or select your files<a className="ml-3 cursor-pointer text-lg">ℹ️</a>
                    </label>
                    <FormTooltip allowedExtensions={allowedExtensions} />

                    <div
                        className={`border-2 border-dashed ${data.files.length > 0
                            ? 'border-emerald-600 bg-emerald-600/20 dark:border-emerald-500 dark:bg-gray-50'
                            : 'border-emerald-400 bg-gray-900/50 dark:border-emerald-500 dark:bg-gray-50'
                            }`}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <label
                            htmlFor="file-upload"
                            className="flex h-38 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-0 bg-transparent hover:bg-gray-900 dark:hover:bg-gray-300/50"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg
                                    className="mb-4 h-8 w-8 text-emerald-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 22 22"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                    />
                                </svg>
                                <p className="mb-5 text-sm text-gray-300 dark:text-gray-800">
                                    <span className="font-semibold">Drag and drop</span> or click to upload
                                </p>
                                <p className="text-xs text-gray-300 dark:text-gray-800 mt-3 ">By uploading a file, you accept our Terms & Conditions</p>
                            </div>
                            <input id="file-upload" type="file" name="files" multiple onChange={handleFileChange} className="hidden" />
                        </label>
                    </div>
                    <div className="mt-4">
                        {data.files.length > 0 && (
                            <div className="border-t pt-4">
                                <h4 className="mb-2 text-sm font-medium text-gray-500">
                                    Selected files ({data.files.length})
                                    {invalidFiles.length > 0 && <span className="ml-2 text-red-500">({invalidFiles.length} with errors)</span>}
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

                        {/* Solo mostrar este mensaje si se ha intentado exceder el límite recientemente */}
                        {recentlyExceededLimit && data.files.length <= MAX_FILE_COUNT && (
                            <div className="text-sm text-amber-400 dark:text-amber-500">
                                ⚠️ Some files weren´t added because they exceed the {MAX_FILE_COUNT} file limit.
                            </div>
                        )}
                    </div>
                </div>
                <RecaptchaContainer
                    showCaptcha={showCaptcha}
                    shouldShowCaptcha={shouldShowCaptcha}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                />
                <button
                    type="submit"
                    disabled={isButtonDisabled}
                    className={`w-full rounded-lg px-4 py-2 text-xl font-bold text-white transition duration-300 ${isButtonDisabled
                        ? 'cursor-not-allowed bg-gray-400'
                        : 'custom-bg-color custom-bg-color-hover'
                        }`}
                >
                    {loading || processing ? (
                        <div className="flex items-center justify-center">
                            <HashLoader color="white" size={35} style={{ transform: 'translateX(-95px)' }} />
                            <span className="ml-2 animate-pulse">
                                {buttonText}
                                <span className="dots">...</span>
                            </span>
                        </div>
                    ) : shouldShowCaptcha && !captchaVerified ? (
                        'Please complete the CAPTCHA'
                    ) : data.files.length > MAX_FILE_COUNT ? (
                        `Demasiados archivos (máx. ${MAX_FILE_COUNT})`
                    ) : (
                        <span className="inline-flex items-center justify-center">
                            Upload files
                            <CloudUpload className="ml-4 h-6 w-6" />
                        </span>
                    )}
                </button>
            </form>
        </div>
    );
};

export default UploadForm;
