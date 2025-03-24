import { router, useForm } from "@inertiajs/react";

const UploadForm = () => {
    const { data, setData, post, errors } = useForm({files: []});

    const handleFiles = (e) => {
        setData("files", Array.from(e.target.files)); //guardamos los archivos que se esten manejando//
    }

    const handleSubmit = (e) => { //comportamiento que tendra el formulario una vez se envie//
        e.preventDefault();
        if (data.files.length === 0) return;

        post('/upload', data, { forceFormData: true});
    };


    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <div className="w-full mb-4">
                <label htmlFor="file-upload" className="block text-gray-700 text-sm font-bold mb-2">
                    Drag or select your files
                </label>
                <div className="flex items-center justify-center w-full">
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
                            onChange={handleFiles}
                            className="hidden"
                        />
                    </label>
                </div>
                {errors.files && (
                    <span className="text-red-500 text-sm mt-2">{errors.files}</span>
                )}
            </div>
            <button
                type="submit"
                disabled={data.files.length === 0}
                className={`w-full px-4 py-2 text-white font-bold rounded-lg transition duration-300 ${
                    data.files.length === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
                Upload files
            </button>
        </form>
    );
};


export default UploadForm;
