import * as React from 'react';

export type Invoice = Readonly<{
  id: string;
  amount: number;           // minor units
  currency: string;         // 'PKR' | 'USD' | etc.
  createdAt: string;        // ISO
  hostedInvoiceUrl?: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
}>;

export type InvoiceTableProps = {
  invoices: Invoice[];
  className?: string;
};

export default function InvoiceTable({ invoices, className = '' }: InvoiceTableProps) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className={`rounded-lg border border-border p-4 text-sm text-muted-foreground ${className}`}>
        No invoices yet.
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Amount</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b border-border/60">
              <td className="py-2 pr-4">
                <time dateTime={inv.createdAt}>
                  {new Date(inv.createdAt).toLocaleDateString()}
                </time>
              </td>
              <td className="py-2 pr-4">
                {(inv.amount / 100).toLocaleString(undefined, {
                  style: 'currency',
                  currency: inv.currency,
                })}
              </td>
              <td className="py-2 pr-4 capitalize">{inv.status}</td>
              <td className="py-2 pr-4">
                {inv.hostedInvoiceUrl ? (
                  <a href={inv.hostedInvoiceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                    View
                  </a>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
