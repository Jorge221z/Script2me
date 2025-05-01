import EmeraldLinearProgress from './EmeraldLinearProgress';
import { CheckCircle2 } from 'lucide-react';

const ProgressBarDisplay = ({ progress, progressText, progressState }) => {
    // Solo muestra el icono de completado
    let icon = null;
    if (progressState === 'completed' && progress === 100) {
        icon = <CheckCircle2 className="text-emerald-600" size={22} />;
    }

    return (
        <div className="w-full mb-4 flex flex-row items-center gap-3">
            <EmeraldLinearProgress
                variant="determinate"
                value={progress}
                className="flex-1 shadow-lg"
            />
            <div className="flex flex-col items-end min-w-[70px]">
                <span className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                    {icon}
                    <span>{progressText}</span>
                    <span className="text-md text-gray-400 dark:text-gray-600 font-semibold">
                        {Math.round(progress)}%
                    </span>
                </span>
            </div>
        </div>
    );
};

export default ProgressBarDisplay;
