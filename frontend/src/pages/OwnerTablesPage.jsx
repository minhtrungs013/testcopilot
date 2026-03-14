import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import OwnerShell from '../components/OwnerShell.jsx';
import {
  createTableBySlug,
  deleteTableBySlug,
  fetchTablesBySlug,
} from '../api/tableApi.js';
import useAuthStore from '../store/authStore.js';

function OwnerTablesPage() {
  const { slug } = useParams();
  const token = useAuthStore((state) => state.token);

  const [tables, setTables] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function refreshTables() {
    if (!token) {
      setTables([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await fetchTablesBySlug(slug, token);
      setTables(Array.isArray(data) ? data : []);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to load tables.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshTables();
  }, [slug, token]);

  async function handleCreateTable(event) {
    event.preventDefault();

    const numericTable = Number(tableNumber);
    if (!Number.isInteger(numericTable) || numericTable <= 0) {
      setError('Table number must be a positive integer.');
      return;
    }

    try {
      setError('');
      await createTableBySlug(
        slug,
        {
          table_number: numericTable,
          status: 'available',
        },
        token
      );
      setTableNumber('');
      await refreshTables();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to create table.');
    }
  }

  async function handleDeleteTable(tableId) {
    try {
      await deleteTableBySlug(slug, tableId, token);
      await refreshTables();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Failed to delete table.');
    }
  }

  return (
    <OwnerShell slug={slug} title="Table Management">
      {error ? <p className="mb-4 text-sm font-semibold text-red-600">{error}</p> : null}

      <section className="glass-card rounded-2xl p-4">
        <h2 className="font-display text-xl font-bold">Create Table</h2>
        <form onSubmit={handleCreateTable} className="mt-3 flex flex-wrap gap-2">
          <input
            value={tableNumber}
            onChange={(event) => setTableNumber(event.target.value)}
            placeholder="Table number"
            type="number"
            min="1"
            className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-bold text-white">
            Create Table
          </button>
        </form>
      </section>

      <section className="glass-card mt-5 rounded-2xl p-4">
        <h2 className="font-display text-xl font-bold">Tables</h2>

        {loading ? <p className="mt-3 text-sm text-gray-600">Loading tables...</p> : null}

        {!loading && tables.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">No tables yet.</p>
        ) : null}

        <div className="mt-3 space-y-2">
          {tables.map((table) => (
            <div
              key={table._id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
            >
              <div>
                <p className="text-sm font-semibold">Table {table.table_number}</p>
                <p className="text-xs text-gray-600">QR: {table.qr_code}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteTable(table._id)}
                className="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>
    </OwnerShell>
  );
}

export default OwnerTablesPage;
