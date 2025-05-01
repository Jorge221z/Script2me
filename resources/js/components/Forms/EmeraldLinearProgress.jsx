import LinearProgress from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';

const EmeraldLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 10,
    backgroundColor: '#ecfdf5',
    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
    '& .MuiLinearProgress-bar': {
        background: 'linear-gradient(90deg, #34d399, #10b981)',
        borderRadius: 10,
    },
}));

export default EmeraldLinearProgress;
