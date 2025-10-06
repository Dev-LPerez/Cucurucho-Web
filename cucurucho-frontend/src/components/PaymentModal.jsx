import React, { useState, useEffect } from 'react';
import { salesService } from '../services/salesService';

const PaymentModal = ({ saleId, totalAmount, onClose, onPaymentSuccess }) => {
    const [payments, setPayments] = useState([]);
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('cash');
    const [error, setError] = useState('');

    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const remainingAmount = totalAmount - totalPaid;

    useEffect(() => {
        // Sugerir el monto restante por defecto
        setAmount(remainingAmount.toFixed(2));
    }, [remainingAmount]);

    const handleAddPayment = () => {
        const paymentAmount = parseFloat(amount);
        if (!paymentAmount || paymentAmount <= 0) {
            setError('El monto debe ser un número positivo.');
            return;
        }
        if (paymentAmount > remainingAmount + 0.01) {
            setError('El pago no puede exceder el monto restante.');
            return;
        }
        setError('');
        setPayments([...payments, { amount: paymentAmount, method }]);
    };

    const handleConfirmPayment = async () => {
        if (payments.length === 0) {
            setError('Debe añadir al menos un pago.');
            return;
        }
        try {
            await salesService.addPayment(saleId, payments);
            onPaymentSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al procesar el pago.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Procesar Pago</h2>
                <button onClick={onClose} className="close-button">&times;</button>

                <div className="payment-summary">
                    <div>Total de la Venta: <strong>${totalAmount.toFixed(2)}</strong></div>
                    <div>Total Pagado: <strong>${totalPaid.toFixed(2)}</strong></div>
                    <div className="remaining-amount">Monto Restante: <strong>${remainingAmount.toFixed(2)}</strong></div>
                </div>

                <div className="payment-form">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Monto a pagar"
                    />
                    <select value={method} onChange={(e) => setMethod(e.target.value)}>
                        <option value="cash">Efectivo</option>
                        <option value="card">Tarjeta</option>
                        <option value="other">Otro</option>
                    </select>
                    <button onClick={handleAddPayment} disabled={remainingAmount <= 0}>
                        Añadir Pago
                    </button>
                </div>

                <div className="payment-list">
                    <h3>Pagos a Registrar:</h3>
                    {payments.map((p, index) => (
                        <div key={index} className="payment-item">
                            <span>{p.method.charAt(0).toUpperCase() + p.method.slice(1)}:</span>
                            <span>${p.amount.toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                {error && <p className="error-message">{error}</p>}

                <button
                    className="confirm-payment-button"
                    onClick={handleConfirmPayment}
                    disabled={remainingAmount > 0.01 && payments.length === 0}
                >
                    {remainingAmount > 0.01 ? 'Confirmar Pago Parcial' : 'Confirmar y Cerrar Venta'}
                </button>
            </div>
        </div>
    );
};

export default PaymentModal;