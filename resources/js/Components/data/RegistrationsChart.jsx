import { Bar } from 'react-chartjs-2';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function RegistrationsChart({ labels, data }) {
    return (
        <div className="h-64 w-full">
            <Bar
                data={{
                    labels,
                    datasets: [
                        {
                            label: 'Pendaftar',
                            data,
                            backgroundColor: '#6D28D9',
                            borderRadius: 6,
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { precision: 0 } },
                    },
                }}
            />
        </div>
    );
}
