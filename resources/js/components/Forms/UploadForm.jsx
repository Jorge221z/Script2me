import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HashLoader } from 'react-spinners';
import '../../../css/app.css';
import FormTooltip from './FormTooltip';
import { allowedExtensions } from './allowedExtensions';
import RecaptchaContainer from './RecaptchaContainer';
import { CloudUpload } from 'lucide-react';
import DragOverAnimation from './DragOverAnimation';
import GlobalDragOver from './GlobalDragOver';
import FilePreview from './FilePreview';
import AnimatedRemoveWrapper from './AnimatedRemoveWrapper';
import FilesSentAnimation from './FilesSentAnimation';
import EmeraldLinearProgress from './EmeraldLinearProgress';
import ProgressBarDisplay from './ProgressBarDisplay';
import { useTranslation } from 'react-i18next';

const UploadForm = ({ actionUrl, loadingTime, buttonText, showCaptcha = false, progressSpeed = 100, progressMaxTime = 1200 }) => {
    const { data, setData, post, errors, processing } = useForm({ files: [] });

    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [localErrors, setLocalErrors] = useState([]);
    const [invalidFiles, setInvalidFiles] = useState([]);
    const [fileErrors, setFileErrors] = useState({});
    const [recentlyExceededLimit, setRecentlyExceededLimit] = useState(false); // variable para controlar el warning del limite de archivos//
    const MAX_FILE_COUNT = 20; // Cantidad maxima de archivos por subida //
    const [isDragging, setIsDragging] = useState(false); //con esta variable manejaremos el estado del dragOver
    const [duplicateWarning, setDuplicateWarning] = useState(false);

    // Con estas variables controlamos el estado del captcha//
    const [shouldShowCaptcha, setShouldShowCaptcha] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);

    // Nuevo estado para controlar la animación
    const [showSentAnimation, setShowSentAnimation] = useState(false);
    // Nuevo estado para animación de fade out
    const [filesFadeOut, setFilesFadeOut] = useState(false);

    const [progress, setProgress] = useState(0);
    const [progressState, setProgressState] = useState('idle'); // 'idle' | 'uploading' | 'processing' | 'completed'

    // Texto dinámico para la barra de progreso
    let progressText = '';
    if (progressState === 'uploading') {
        progressText = t('uploadForm.uploading');
    } else if (progressState === 'processing') {
        progressText = t('uploadForm.processing');
    } else if (progressState === 'completed' && progress === 100) {
        progressText = t('uploadForm.completed');
    }

    //manejo del estado del captcha//
    useEffect(() => {
        // Define a global callback function for reCAPTCHA
        window.onCaptchaCompleted = () => {
            setCaptchaVerified(true);
        };

        const handleRecaptchaLoad = () => {
            if (window.grecaptcha && document.getElementById('recaptcha-container')) {
                // Solo renderizar si no está ya renderizado
                if (!document.getElementById('recaptcha-container').hasChildNodes()) {
                    window.grecaptcha.render('recaptcha-container', {
                        sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
                        callback: 'onCaptchaCompleted', // Use the name of the global function
                    });
                }
            }
        };

        if (showCaptcha && shouldShowCaptcha) {
            window.onRecaptchaLoad = handleRecaptchaLoad;

            // Si grecaptcha ya está cargado, renderiza inmediatamente
            if (window.grecaptcha && window.grecaptcha.render) {
                handleRecaptchaLoad();
            } else {
                // Si no, añade el script si no existe
                if (!document.getElementById('recaptcha-script')) {
                    const script = document.createElement('script');
                    script.id = 'recaptcha-script';
                    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit&onload=onRecaptchaLoad';
                    script.async = true;
                    script.defer = true;
                    document.body.appendChild(script);
                }
            }
        }

        return () => {
            delete window.onRecaptchaLoad;
            delete window.onCaptchaCompleted;
        };
    }, [showCaptcha, shouldShowCaptcha]);

    // Limpiar archivos cuando se inicia la carga normal//
    useEffect(() => {
        if (loading && data.files.length > 0) {
            setFilesFadeOut(true);
            const timer = setTimeout(() => {
                setData('files', []);
                setFilesFadeOut(false);
            }, 400); // Duración del fade out
            return () => clearTimeout(timer);
        }
    }, [loading]);

    //una vez se comienza a procesar en la API de Gemini, limpiamos los archivos del formulario//
    useEffect(() => {
        if (processing && data.files.length > 0) {
            setFilesFadeOut(true);
            const timer = setTimeout(() => {
                setData('files', []);
                setFilesFadeOut(false);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [processing]);

    // Mostrar animación cuando los archivos se vacían tras un envío
    useEffect(() => {
        if (data.files.length === 0 && (loading || processing)) {
            setShowSentAnimation(true);
            const timer = setTimeout(() => setShowSentAnimation(false), 1200);
            return () => clearTimeout(timer);
        }
    }, [data.files, loading, processing]);

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

    // Sincronizar progreso con loading/processing
    useEffect(() => {
        let interval = null;

        if (loading) {
            setProgress(0);
            setProgressState('uploading');
            const start = Date.now();
            interval = setInterval(() => {
                const elapsed = Date.now() - start;
                let percent = Math.min(100, (elapsed / progressMaxTime) * 60); // uploading hasta 60%
                setProgress(percent);
                if (percent >= 60) {
                    setProgress(60);
                    clearInterval(interval);
                }
            }, progressSpeed);
        } else if (processing) {
            setProgressState('processing');
            const start = Date.now();
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev < 30) return 30; // asegúrate de empezar desde 60
                    let percent = Math.min(99, prev + (70 / (progressMaxTime / progressSpeed))); // processing 60-99%
                    return percent;
                });
            }, progressSpeed);
        } else if (!loading && !processing && progressState !== 'idle') {
            setProgress(100);
            setProgressState('completed');
        } else if (!loading && !processing && progressState === 'idle') {
            setProgress(0);
        }

        return () => interval && clearInterval(interval);
    }, [loading, processing, progressMaxTime, progressSpeed]);

    // Resetear barra cuando se reinicia el formulario
    useEffect(() => {
        if (!loading && !processing && progressState === 'completed') {
            const timeout = setTimeout(() => {
                setProgress(0);
                setProgressState('idle');
            }, 800);
            return () => clearTimeout(timeout);
        }
    }, [loading, processing, progressState]);

    const validateFiles = (files, currentFileCount = 0, existingFiles = []) => {
        const errors = [];
        const newInvalidFiles = [];
        const newFileErrors = {};
        const MAX_SIZE_MB = 2;

        // Verificar si el número total de archivos excede el límite//
        if (currentFileCount + files.length > MAX_FILE_COUNT) {
            errors.push(t('uploadForm.maxFilesError', { max: MAX_FILE_COUNT, adding: files.length, existing: currentFileCount }));
            return {
                errors,
                invalidFiles: newInvalidFiles,
                fileErrors: newFileErrors,
                exceedsMaxCount: true,
            };
        }

        // Detectar archivos duplicados por nombre (solo para filtrar, no para error)
        const existingNames = existingFiles.map(f => f.name);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split('.').pop().toLowerCase();
            let fileIsInvalid = false;
            let fileErrorMessage = '';

            // NO añadir error de duplicado aquí, solo filtrar después

            // Validación de extensión
            if (!allowedExtensions.includes(ext)) {
                const errorMsg = t('uploadForm.extensionError', { ext });
                errors.push(t('uploadForm.blockedFile', { name: file.name, error: errorMsg }));
                fileIsInvalid = true;
                fileErrorMessage = errorMsg;
            }

            // Validación de tamaño
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                const errorMsg = t('uploadForm.sizeError', { max: MAX_SIZE_MB });
                errors.push(t('uploadForm.tooBigFile', { name: file.name, error: errorMsg }));
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
        setDuplicateWarning(false);
        const newFiles = Array.from(e.target.files);
        // Detectar duplicados antes de validar
        const duplicate = newFiles.some(f => data.files.some(existing => existing.name === f.name));
        if (duplicate) {
            setDuplicateWarning(true);
        }
        // Filtrar duplicados antes de validar
        const filteredFiles = newFiles.filter(f => !data.files.some(existing => existing.name === f.name));
        const { errors: validationErrors, invalidFiles: newInvalidFiles, fileErrors: newFileErrors, exceedsMaxCount } =
            validateFiles(filteredFiles, data.files.length, data.files);

        if (validationErrors.length > 0) {
            setLocalErrors(validationErrors);
        }

        if (exceedsMaxCount) {
            setRecentlyExceededLimit(true);
        }

        if (!exceedsMaxCount) {
            setData('files', [...data.files, ...filteredFiles]);
            setInvalidFiles([...invalidFiles, ...newInvalidFiles]);
            setFileErrors({ ...fileErrors, ...newFileErrors });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        setDuplicateWarning(false);
        e.preventDefault();

        setIsDragging(false);

        const newFiles = Array.from(e.dataTransfer.files);
        const duplicate = newFiles.some(f => data.files.some(existing => existing.name === f.name));
        if (duplicate) {
            setDuplicateWarning(true);
        }
        const filteredFiles = newFiles.filter(f => !data.files.some(existing => existing.name === f.name));
        const { errors: validationErrors, invalidFiles: newInvalidFiles, fileErrors: newFileErrors, exceedsMaxCount } =
            validateFiles(filteredFiles, data.files.length, data.files);

        if (validationErrors.length > 0) {
            setLocalErrors(validationErrors);
        }

        if (exceedsMaxCount) {
            setRecentlyExceededLimit(true);
        }

        if (!exceedsMaxCount) {
            setData('files', [...data.files, ...filteredFiles]);
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
            setLocalErrors([...localErrors.filter((e) => !e.includes(t('uploadForm.noValidFiles'))), t('uploadForm.noValidFiles')]);
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
                toast.error(t('uploadForm.captchaRequired'), {
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

    const handleFilesDropped = (newFiles) => {
        setDuplicateWarning(false);
        const duplicate = newFiles.some(f => data.files.some(existing => existing.name === f.name));
        if (duplicate) {
            setDuplicateWarning(true);
        }
        const filteredFiles = newFiles.filter(f => !data.files.some(existing => existing.name === f.name));
        const { errors: validationErrors, invalidFiles: newInvalidFiles, fileErrors: newFileErrors, exceedsMaxCount } =
            validateFiles(filteredFiles, data.files.length, data.files);

        if (validationErrors.length > 0) {
            setLocalErrors(validationErrors);
        }

        if (exceedsMaxCount) {
            setRecentlyExceededLimit(true);
        }

        // Only add files if we don't exceed the limit and not duplicates
        if (!exceedsMaxCount) {
            setData('files', [...data.files, ...filteredFiles]);
            setInvalidFiles([...invalidFiles, ...newInvalidFiles]);
            setFileErrors({ ...fileErrors, ...newFileErrors });
        }
    };

    return (
        <div>
            <GlobalDragOver onFilesDropped={handleFilesDropped} />
            <div>
                {/* Animación de archivos enviados */}
                <FilesSentAnimation show={showSentAnimation} />
                <form
                    onSubmit={handleSubmit}
                    className="mx-auto flex w-full max-w-[730px] flex-col items-center justify-center rounded-lg ctform p-6 text-white shadow-md  dark:text-gray-950 dark:shadow-lg"
                >
                    <div className="mb-1 w-full">
                        <label htmlFor="file-upload" data-tooltip-id="info-tooltip" className="mb-2 block text-sm font-bold text-gray-400 dark:text-gray-700">
                            {t('uploadForm.dragOrSelect')}<a className="ml-3 cursor-pointer text-lg">ℹ️</a>
                        </label>
                        <FormTooltip allowedExtensions={allowedExtensions} />

                        <div
                            className={`border-2 border-dashed border-emerald-400 ctbox dark:border-emerald-500 dark:bg-gray-50`}
                            style={{ overflow: 'visible', position: 'static', zIndex: 1 }}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <DragOverAnimation isDragging={isDragging} />
                            <label
                                htmlFor="file-upload"
                                className="flex h-38 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-0 bg-transparent hover:bg-[#303030]/50 dark:hover:bg-gray-300/50"
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
                                        <span className="font-semibold">{t('uploadForm.dragAndDrop')}</span> {t('uploadForm.orClick')}
                                    </p>
                                    <p className="text-xs text-gray-300 dark:text-gray-800 mt-3 ">{t('uploadForm.acceptTerms')}</p>
                                </div>
                                <input id="file-upload" type="file" name="files" multiple onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                        <div className="mt-4">
                            {data.files.length > 0 && (
                                <div className={`border-t pt-4 transition-all duration-400 ${filesFadeOut ? 'fade-out-files' : ''}`}>
                                    <h4 className="mb-2 text-sm font-medium text-gray-500">
                                        {t('uploadForm.selectedFiles', { count: data.files.length })}
                                        {invalidFiles.length > 0 && <span className="ml-2 text-red-500">({invalidFiles.length} {t('uploadForm.withErrors')})</span>}
                                    </h4>
                                    <div className="max-h-[200px] overflow-y-auto">
                                        {data.files.map((file, index) => (
                                            <AnimatedRemoveWrapper
                                                key={`${file.name}-${file.size}-${file.lastModified}`}
                                                file={file}
                                                onRemove={handleRemoveFile}
                                            >
                                                {({ onRemove }) => (
                                                    <FilePreview
                                                        file={file}
                                                        onRemove={onRemove}
                                                        isInvalid={invalidFiles.includes(file.name)}
                                                        errorMessage={fileErrors[file.name]}
                                                        className="transition-all duration-200 ease-in-out ..."
                                                    />
                                                )}
                                            </AnimatedRemoveWrapper>
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
                                    ⚠️ {t('uploadForm.someFilesNotAdded', { max: MAX_FILE_COUNT })}
                                </div>
                            )}
                            {/* Mostrar warning de duplicado */}
                            {duplicateWarning && (
                                <div className="text-sm text-amber-400 dark:text-amber-500">
                                    ⚠️ {t('uploadForm.duplicateFiles')}
                                </div>
                            )}
                        </div>
                    </div>
                    <RecaptchaContainer
                        showCaptcha={showCaptcha}
                        shouldShowCaptcha={shouldShowCaptcha}
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    />
                    {/* Barra de progreso justo encima del botón */}
                    {(progressState !== 'idle') && (
                        <ProgressBarDisplay
                            progress={progress}
                            progressText={progressText}
                            progressState={progressState}
                        />
                    )}
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
                                <HashLoader color="white" size={35} />
                            </div>
                        ) : shouldShowCaptcha && !captchaVerified ? (
                            t('uploadForm.completeCaptcha')
                        ) : data.files.length > MAX_FILE_COUNT ? (
                            t('uploadForm.tooManyFiles', { max: MAX_FILE_COUNT })
                        ) : (
                            <span className="inline-flex items-center justify-center">
                                {t('uploadForm.uploadFiles')}
                                <CloudUpload className="ml-6 h-6 w-6" />
                            </span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadForm;
