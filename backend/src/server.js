import express from 'express';
import cors from 'cors';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { z } from 'zod';

const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const productoSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  precio: z.number().nonnegative()
});

// Listar todos
app.get('/productos', async (req, res) => {
  const productos = await prisma.producto.findMany({ orderBy: { id: 'asc' } });
  res.json(productos);
});

// Obtener uno
app.get('/productos/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const producto = await prisma.producto.findUnique({ where: { id } });
  if (!producto) return res.status(404).json({ error: 'No encontrado' });
  res.json(producto);
});

// Crear
app.post('/productos', async (req, res) => {
  try {
    const data = productoSchema.parse(req.body);
    const creado = await prisma.producto.create({ data });
    res.status(201).json(creado);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: e.errors });
    }
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Actualizar
app.put('/productos/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const data = productoSchema.partial().parse(req.body);
    const actualizado = await prisma.producto.update({ where: { id }, data });
    res.json(actualizado);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'No encontrado' });
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.errors });
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Eliminar
app.delete('/productos/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await prisma.producto.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'No encontrado' });
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.use((err, req, res, next) => {
  console.error('Middleware error:', err);
  res.status(500).json({ error: 'Error inesperado' });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`API escuchando en puerto ${PORT}`));
}

export default app;
