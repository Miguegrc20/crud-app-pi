import request from 'supertest';
import app from '../src/server.js';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

beforeAll(async () => {
  // Ensure DB has baseline (seed already run). Optionally could reset.
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('CRUD Productos', () => {
  let createdId;

  test('Lista inicial contiene productos seed', async () => {
    const res = await request(app).get('/productos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
  });

  test('Crear producto', async () => {
    const nuevo = { nombre: 'Webcam HD', descripcion: '720p', precio: 25.5 };
    const res = await request(app).post('/productos').send(nuevo);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    createdId = res.body.id;
  });

  test('Obtener producto creado', async () => {
    const res = await request(app).get(`/productos/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);
    expect(res.body.nombre).toBe('Webcam HD');
  });

  test('Actualizar producto', async () => {
    const res = await request(app).put(`/productos/${createdId}`).send({ precio: 30 });
    expect(res.status).toBe(200);
    expect(res.body.precio).toBe(30);
  });

  test('Eliminar producto', async () => {
    const res = await request(app).delete(`/productos/${createdId}`);
    expect(res.status).toBe(204);
  });

  test('Producto eliminado no existe', async () => {
    const res = await request(app).get(`/productos/${createdId}`);
    expect(res.status).toBe(404);
  });
});
