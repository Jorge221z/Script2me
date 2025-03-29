import { Tooltip } from 'react-tooltip';

const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
};

const FormTooltip = ({ allowedExtensions }) => {
    const extColumns = chunkArray(allowedExtensions, 10);

    return (
        <Tooltip
            id="info-tooltip"
            place="top"
            content={() => (
                <div
                    style={{
                        textAlign: 'left',
                        maxHeight: '700px',
                        overflowY: 'auto',
                        padding: '10px',
                        color: '#fff',
                        borderRadius: '10px',
                    }}
                >
                    <strong>Supported extensions:</strong>
                    <div
                        style={{
                            display: 'flex', // Usamos Flexbox para columnas
                            gap: '20px', // Espacio entre columnas
                            marginTop: '5px',
                        }}
                    >
                        {extColumns.map((column, index) => (
                            <ul key={index} style={{ paddingLeft: '20px', margin: 0, minWidth: '80px' }}>
                                {column.map((ext) => (
                                    <li key={ext}>{ext}</li>
                                ))}
                            </ul>
                        ))}
                    </div>
                </div>
            )}
        />
    );
};

export default FormTooltip;
