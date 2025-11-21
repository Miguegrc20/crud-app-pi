import React, { useEffect, useState } from 'react';

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  precio: string; // recibido como string/number
  creadoEn: string;
}

interface FormState { nombre: string; descripcion: string; precio: string; }
const emptyForm: FormState = { nombre: '', descripcion: '', precio: '' };

export default function App() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchProductos() {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/productos');
      const data = await res.json();
      setProductos(data);
    } catch (e) {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProductos(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const precioNum = Number(form.precio);
    if (isNaN(precioNum)) { setError('Precio inválido'); return; }
    const payload = { nombre: form.nombre, descripcion: form.descripcion || undefined, precio: precioNum };
    try {
      const url = editingId ? `http://localhost:3000/productos/${editingId}` : 'http://localhost:3000/productos';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Error en la operación');
      await fetchProductos();
      setForm(emptyForm);
      setEditingId(null);
    } catch (e) {
      setError('Error guardando');
    }
  }

  async function handleEdit(p: Producto) {
    setEditingId(p.id);
    setForm({ nombre: p.nombre, descripcion: p.descripcion || '', precio: String(p.precio) });
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar producto?')) return;
    try {
      const res = await fetch(`http://localhost:3000/productos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error eliminando');
      await fetchProductos();
    } catch (e) {
      setError('Error eliminando');
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CRUD Productos</h1>
      <form onSubmit={handleSubmit} className="grid gap-2 md:grid-cols-4 mb-6">
        <input required placeholder="Nombre" className="border p-2 rounded" value={form.nombre} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, nombre: e.target.value }))} />
        <input placeholder="Descripción" className="border p-2 rounded" value={form.descripcion} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, descripcion: e.target.value }))} />
        <input required placeholder="Precio" className="border p-2 rounded" value={form.precio} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, precio: e.target.value }))} />
        <button className="bg-blue-600 text-white rounded p-2" type="submit">{editingId ? 'Actualizar' : 'Crear'}</button>
      </form>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? <div>Cargando...</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2">ID</th>
                <th className="p-2">Nombre</th>
                <th className="p-2">Descripción</th>
                <th className="p-2">Precio</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.id}</td>
                  <td className="p-2">{p.nombre}</td>
                  <td className="p-2">{p.descripcion}</td>
                  <td className="p-2">{p.precio}</td>
                  <td className="p-2 flex gap-2">
                    <button onClick={() => handleEdit(p)} className="px-2 py-1 bg-yellow-500 text-white rounded">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="px-2 py-1 bg-red-600 text-white rounded">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
