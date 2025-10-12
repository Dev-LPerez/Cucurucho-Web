// Ruta: cucurucho-frontend/src/pages/ReportsPage.jsx

import React, { useState, useEffect } from 'react';
import { reportsService } from '../services/reportsService';
import './Admin.css';
import './ReportsPage.css';

const ReportStatCard = ({ title, value, type = 'default' }) => (
    <div className="report-stat-card">
        <p className="stat-title">{title}</p>
        <p className={`stat-value ${type}`}>{value}</p>
    </div>
);

function ReportsPage() {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReportData = async () => {
            try {
                setLoading(true);
                const data = await reportsService.getSummary();
                setReportData(data);
            } catch (error) {
                console.error("Error al cargar reportes:", error);
                alert("No se pudo cargar la información de los reportes.");
            } finally {
                setLoading(false);
            }
        };
        loadReportData();
    }, []);

    const calculateProductMetrics = (product) => {
        const ingresos = product.unidades * product.precioVenta;
        const costos = product.unidades * product.costo;
        const ganancia = ingresos - costos;
        const margen = ingresos > 0 ? (ganancia / ingresos) * 100 : 0;
        return { ingresos, costos, ganancia, margen };
    };

    if (loading) {
        return <div className="admin-page-container"><p>Cargando reportes...</p></div>;
    }

    if (!reportData) {
        return <div className="admin-page-container"><p>No hay datos disponibles para mostrar.</p></div>;
    }

    return (
        <div className="admin-page-container">
            <div className="admin-page-header">
                <h2>Reportes y Análisis</h2>
                <p>Análisis estratégico para la toma de decisiones</p>
            </div>

            {/* Configuración del Reporte */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Configuración del Reporte</h3>
                </div>
                <form className="report-config-grid">
                    <div className="form-group">
                        <label>Tipo de Reporte</label>
                        <select defaultValue="rentabilidad">
                            <option value="rentabilidad">Rentabilidad por Producto</option>
                            <option value="ventas">Ventas General</option>
                            <option value="inventario">Consumo de Inventario</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Periodo</label>
                        <select defaultValue="semana">
                            <option value="hoy">Hoy</option>
                            <option value="semana">Esta Semana</option>
                            <option value="mes">Este Mes</option>
                        </select>
                    </div>
                    <button type="button">Exportar Reporte</button>
                </form>
            </div>

            {/* Métricas del Reporte */}
            <div className="report-metrics-grid">
                <ReportStatCard title="Ingresos Totales" value={`$${reportData.ingresosTotales.toLocaleString('es-CO')}`} />
                <ReportStatCard title="Costos Totales" value={`$${reportData.costosTotales.toLocaleString('es-CO')}`} type="negative" />
                <ReportStatCard title="Ganancia Neta" value={`$${reportData.gananciaNeta.toLocaleString('es-CO')}`} type="positive" />
                <ReportStatCard title="Margen Promedio" value={`${reportData.margenPromedio.toFixed(1)}%`} type="positive" />
            </div>

            {/* Tabla de Análisis */}
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3>Análisis de Rentabilidad por Producto</h3>
                </div>
                 <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Unidades</th>
                            <th>Precio Venta</th>
                            <th>Costo</th>
                            <th>Ingresos Total</th>
                            <th>Costos Total</th>
                            <th>Ganancia</th>
                            <th>Margen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.productos.map(prod => {
                            const metrics = calculateProductMetrics(prod);
                            return (
                                <tr key={prod.id}>
                                    <td>{prod.nombre}</td>
                                    <td>{prod.unidades}</td>
                                    <td>${prod.precioVenta.toFixed(2)}</td>
                                    <td className="text-error">${prod.costo.toFixed(2)}</td>
                                    <td>${metrics.ingresos.toLocaleString('es-CO')}</td>
                                    <td>${metrics.costos.toLocaleString('es-CO')}</td>
                                    <td className="text-success">${metrics.ganancia.toLocaleString('es-CO')}</td>
                                    <td>
                                        <span className="status-badge positive">{metrics.margen.toFixed(1)}%</span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ReportsPage;