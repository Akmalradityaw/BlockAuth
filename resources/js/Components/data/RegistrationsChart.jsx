import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

export default function RegistrationsChart({ labels, data }) {
    const [isDark, setIsDark] = useState(() => {
        if (typeof document !== 'undefined') {
            return document.documentElement.classList.contains('dark');
        }
        return false;
    });

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const options = {
        chart: {
            type: 'area',
            height: 350,
            fontFamily: 'inherit',
            foreColor: isDark ? '#94A3B8' : '#64748B',
            toolbar: { show: false },
            background: 'transparent',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
            },
        },
        colors: ['#8B5CF6'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.1,
                stops: [0, 90, 100],
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        xaxis: {
            categories: labels,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: { colors: isDark ? '#64748B' : '#94A3B8' },
            },
            tooltip: { enabled: false },
        },
        yaxis: {
            labels: {
                style: { colors: isDark ? '#64748B' : '#94A3B8' },
                formatter: (val) => Math.round(val),
            },
        },
        grid: {
            borderColor: isDark ? 'rgba(51, 65, 85, 0.4)' : '#F1F5F9',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
            y: {
                formatter: (val) => `${val} pendaftar`,
            },
        },
        theme: {
            mode: isDark ? 'dark' : 'light',
        },
    };

    const series = [
        {
            name: 'Pendaftar Baru',
            data: data,
        },
    ];

    return (
        <div className="w-full">
            <Chart options={options} series={series} type="area" height={350} />
        </div>
    );
}
