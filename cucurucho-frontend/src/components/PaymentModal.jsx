import React, { useState, useEffect, useRef } from 'react';
import { salesService } from '../services/salesService';
import './PaymentModal.css';

const PaymentModal = ({ saleId, totalAmount, onClose, onPaymentSuccess }) => {
    const [payments, setPayments] = useState([]);
    const [amount, setAmount] = useState(''); // string to manage keypad
    const [method, setMethod] = useState('cash');
    const [error, setError] = useState('');
    const modalRef = useRef(null);

    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const remainingAmount = Math.max(0, +(totalAmount - totalPaid).toFixed(2));

    useEffect(() => {
        // sugerir el monto restante por defecto
        setAmount(remainingAmount > 0 ? remainingAmount.toFixed(2) : '0.00');
    }, [remainingAmount]);

    useEffect(() => {
        // bloquear scroll del body mientras el modal esté abierto
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        // enfocar el modal para accesibilidad
        setTimeout(() => {
            modalRef.current?.focus();
        }, 0);

        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [onClose]);

    const normalizeAmountString = (s) => {
        // elimina caracteres no permitidos y limita a 2 decimales
        let cleaned = s.replace(/[^0-9.]/g, '');
        const parts = cleaned.split('.');
        if (parts.length > 2) cleaned = parts[0] + '.' + parts.slice(1).join('');
        if (cleaned.includes('.')) {
            const [intPart, decPart] = cleaned.split('.');
            cleaned = intPart + '.' + decPart.slice(0, 2);
        }
        // evitar cadenas vacías
        if (cleaned === '') return '';
        // evitar múltiples ceros a la izquierda
        if (/^0[0-9]/.test(cleaned)) cleaned = cleaned.replace(/^0+(?=\d)/, '');
        return cleaned;
    };

    const handleKeypad = (key) => {
        setError('');
        if (key === 'C') {
            setAmount('');
            return;
        }
        if (key === '←') {
            // backspace
            setAmount(prev => {
                const next = prev.slice(0, -1);
                return normalizeAmountString(next);
            });
            return;
        }
        if (key === '.') {
            setAmount(prev => {
                if (prev.includes('.')) return prev;
                return prev === '' ? '0.' : prev + '.';
            });
            return;
        }
        // número
        setAmount(prev => {
            // limitar longitud para evitar overflow
            if ((prev.replace('.', '').length) >= 9) return prev;
            const next = prev + key;
            return normalizeAmountString(next);
        });
    };

    const setExactRemaining = () => {
        setAmount(remainingAmount.toFixed(2));
        setError('');
    };

    const handleAddPayment = () => {
        const paymentAmount = parseFloat(amount);
        if (!paymentAmount || paymentAmount <= 0) {
            setError('El monto debe ser un número positivo.');
            return;
        }
        if (paymentAmount > +((remainingAmount + 0.01).toFixed(2))) {
            setError('El pago no puede exceder el monto restante.');
            return;
        }
        setError('');
        setPayments(prev => [...prev, { amount: paymentAmount, method }]);
        // sugerir nuevo restante
        setAmount('');
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
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Modal de pago">
            <div className="modal-content" style={{maxWidth: 840, width: '96%', padding: 16}}>
                <h2>Procesar Pago</h2>
                <button onClick={onClose} className="close-button" aria-label="Cerrar">&times;</button>

                <div className="payment-summary">
                    <div>Total de la Venta: <strong>${totalAmount.toFixed(2)}</strong></div>
                    <div>Total Pagado: <strong>${totalPaid.toFixed(2)}</strong></div>
                    <div className="remaining-amount">Monto Restante: <strong>${remainingAmount.toFixed(2)}</strong></div>
                </div>

                <div style={{display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap'}}>
                    <div style={{flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 12}}>
                        <label htmlFor="amount-display" style={{fontSize: 14, color: '#cfcfe6'}}>Monto a pagar</label>
                        <div id="amount-display" aria-live="polite" className="amount-display">
                            <div style={{color: '#9aa0a6', fontSize: 12}}>Moneda</div>
                            <div>${amount === '' ? '0.00' : amount}</div>
                        </div>

                        <div style={{display: 'flex', gap: 8, marginTop: 8}}>
                            <button type="button" onClick={setExactRemaining} className="preset-btn" aria-label="Usar monto restante">Usar restante</button>
                            <button type="button" onClick={() => { setAmount(''); setError(''); }} className="preset-btn alt" aria-label="Borrar monto">Borrar</button>
                        </div>

                        <div className="keypad-grid" style={{marginTop: 12}}>
                            {['1','2','3','4','5','6','7','8','9','.','0','←'].map(k => (
                                <button
                                    key={k}
                                    onClick={() => handleKeypad(k)}
                                    aria-label={`Teclado ${k === '←' ? 'borrar' : k}`}
                                    className="keypad-btn"
                                >
                                    {k}
                                </button>
                            ))}
                        </div>

                        <div className="preset-row" style={{marginTop: 12}}>
                            <button onClick={() => { setAmount('5.00'); setError(''); }} className="preset-btn preset-short" aria-label="Agregar preset 5">$5</button>
                            <button onClick={() => { setAmount('10.00'); setError(''); }} className="preset-btn preset-short" aria-label="Agregar preset 10">$10</button>
                            <button onClick={() => { setAmount('20.00'); setError(''); }} className="preset-btn preset-short" aria-label="Agregar preset 20">$20</button>
                        </div>

                    </div>

                    <aside className="payment-aside">
                        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                            <label htmlFor="method-select" style={{fontSize: 14, color: '#cfcfe6'}}>Método</label>
                            <select id="method-select" value={method} onChange={(e) => setMethod(e.target.value)} style={{padding: '10px', fontSize: 16, borderRadius: 8, background: '#2a2a2a', color: '#fff', border: '1px solid rgba(255,255,255,0.03)'}}>
                                <option value="cash">Efectivo</option>
                                <option value="card">Tarjeta</option>
                                <option value="other">Otro</option>
                            </select>

                            <button onClick={handleAddPayment} disabled={remainingAmount <= 0} style={{padding: '12px', fontSize: 18, borderRadius: 10, background: '#646cff', color: '#fff', border: 'none'}} aria-label="Añadir pago">Añadir Pago</button>

                            <div>
                                <h4 style={{margin: '8px 0'}}>Pagos a Registrar</h4>
                                <div className="payments-list" style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                                    {payments.length === 0 && <div style={{color: '#9aa0a6'}}>No hay pagos añadidos.</div>}
                                    {payments.map((p, i) => (
                                        <div key={i} className="payment-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px'}}>
                                            <div>{p.method.charAt(0).toUpperCase() + p.method.slice(1)}</div>
                                            <div style={{fontWeight: 700}}>${p.amount.toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {error && <div className="error-message" role="alert">{error}</div>}

                            <button
                                className="confirm-payment-button"
                                onClick={handleConfirmPayment}
                                disabled={remainingAmount > 0.01 && payments.length === 0}
                                style={{padding: '12px', fontSize: 18, borderRadius: 10, background: remainingAmount <= 0.01 ? '#28a745' : '#ffc107', color: '#111', border: 'none'}}
                                aria-label="Confirmar pago"
                            >
                                {remainingAmount > 0.01 ? 'Confirmar Pago Parcial' : 'Confirmar y Cerrar Venta'}
                            </button>

                        </div>
                    </aside>
                </div>

            </div>
        </div>
    );
};

export default PaymentModal;