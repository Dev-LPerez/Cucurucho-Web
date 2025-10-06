import React from 'react';

export default function QueueDisplay({ items = [] }) {
  const demo = items.length ? items : [
    { id: 101, customer: 'Juan', items: 2, status: 'waiting' },
    { id: 102, customer: 'María', items: 1, status: 'preparing' },
    { id: 103, customer: 'Carlos', items: 3, status: 'ready' },
  ];

  const statusColor = (s) => {
    switch (s) {
      case 'waiting': return '#6c757d';
      case 'preparing': return '#ffc107';
      case 'ready': return '#28a745';
      default: return '#999';
    }
  };

  return (
    <div>
      <h2>Cola</h2>
      <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
        {demo.map(q => (
          <li key={q.id} style={{display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 6, marginBottom: 8}}>
            <div>
              <div style={{fontWeight: 700}}>Pedido #{q.id} — {q.customer}</div>
              <div style={{fontSize: '0.9rem', color: 'var(--muted, #9aa0a6)'}}>{q.items} artículos</div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
              <div style={{background: statusColor(q.status), color: '#fff', padding: '0.25rem 0.6rem', borderRadius: 6, fontWeight: 600}}>{q.status}</div>
              <button style={{marginTop: 8, background: '#2a2a2a', color: '#fff', borderRadius: 6, border: 'none', padding: '0.4rem 0.6rem'}}>Ver</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

