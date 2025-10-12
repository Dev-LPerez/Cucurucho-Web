// Ruta: cucurucho-frontend/src/pages/DashboardPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './DashboardPage.css';

// --- DATOS DE EJEMPLO PARA LAS GRÁFICAS ---

// Datos para la gráfica de ventas por hora
const salesByHourData = [
    { hour: '9:00', sales: 700 },
    { hour: '10:00', sales: 900 },
    { hour: '11:00', sales: 1400 },
    { hour: '12:00', sales: 1200 },
    { hour: '13:00', sales: 1800 },
    { hour: '14:00', sales: 1600 },
    { hour: '15:00', sales: 2100 },
    { hour: '16:00', sales: 2400 },
    { hour: '17:00', sales: 2200 },
    { hour: '18:00', sales: 2800 },
    { hour: '19:00', sales: 2500 },
    { hour: '20:00', sales: 1800 },
];

// Datos para la gráfica de distribución por categoría
const categoryDistributionData = [
    { name: 'Helados', value: 58 },
    { name: 'Bebidas', value: 22 },
    { name: 'Postres', value: 15 },
    { name: 'Extras', value: 5 },
];

const COLORS = ['#0A1931', '#1A3D63', '#4A7FA7', '#B3CFE5'];


// --- COMPONENTES ---

const MetricCard = ({ title, value, comparison, icon, iconBgColor }) => {
    const isPositive = comparison && comparison.startsWith('+');

    return (
        <div className="metric-card">
            <div className="metric-card-header">
                <span className="metric-title">{title}</span>
                <div className="metric-icon" style={{ backgroundColor: iconBgColor }}>
                    {icon}
                </div>
            </div>
            <div>
                <div className="metric-value">{value}</div>
                {comparison && (
                    <div className={`metric-comparison ${isPositive ? 'positive' : ''}`}>
                        {comparison}
                    </div>
                )}
            </div>
        </div>
    );
};


function DashboardPage() {
    const navigate = useNavigate();

    // Datos simulados del dashboard
    const dashboardData = {
        ventasDia: 18450,
        ticketPromedio: 145,
        ordenesTotales: 127,
        horaPico: '18:00',
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h2>Panel de Control</h2>
                <p>Vista general del negocio en tiempo real</p>
            </div>

            {/* Tarjetas de Métricas */}
            <div className="metrics-grid">
                <MetricCard
                    title="Ventas del Día"
                    value={`$${dashboardData.ventasDia.toLocaleString('es-CO')}`}
                    comparison="+12.5%"
                    icon={"$"}
                    iconBgColor="var(--success)"
                />
                <MetricCard
                    title="Ticket Promedio"
                    value={`$${dashboardData.ticketPromedio.toLocaleString('es-CO')}`}
                    comparison="+8.2%"
                    icon={"🛒"}
                    iconBgColor="var(--info)"
                />
                <MetricCard
                    title="Órdenes Totales"
                    value={dashboardData.ordenesTotales}
                    comparison="+15.3%"
                    icon={"👥"}
                    iconBgColor="var(--purple)"
                />
                <MetricCard
                    title="Hora Pico"
                    value={dashboardData.horaPico}
                    comparison="Mayor tráfico"
                    icon={"🕒"}
                    iconBgColor="var(--warning)"
                />
            </div>

            {/* Gráficas */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Ventas por Hora</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={salesByHourData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                            <XAxis dataKey="hour" tick={{ fill: 'var(--blue-dark)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'var(--blue-dark)', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--white)',
                                    borderColor: 'var(--blue-light)',
                                    borderRadius: '8px',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="var(--blue-medium)"
                                strokeWidth={3}
                                dot={{ r: 5 }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card">
                    <h3>Distribución por Categoría</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={categoryDistributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {categoryDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;