const request = require('supertest');
const app = require('../src/app');

describe('Role-based route access control', () => {
  describe('Admin routes', () => {
    test('allows admin to access dashboard', async () => {
      const response = await request(app)
        .get('/admin/dashboard')
        .set('x-user-role', 'admin');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ role: 'admin' });
    });

    test('rejects non-admin role', async () => {
      const response = await request(app)
        .get('/admin/dashboard')
        .set('x-user-role', 'teacher');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    test('requires role header', async () => {
      const response = await request(app).get('/admin/dashboard');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Teacher routes', () => {
    test('allows teacher to access classes', async () => {
      const response = await request(app)
        .get('/teacher/classes')
        .set('x-user-role', 'teacher');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ role: 'teacher' });
    });

    test('blocks admin from teacher route', async () => {
      const response = await request(app)
        .get('/teacher/classes')
        .set('x-user-role', 'admin');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Student routes', () => {
    test('allows student to access courses', async () => {
      const response = await request(app)
        .get('/student/courses')
        .set('x-user-role', 'student');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ role: 'student' });
    });

    test('blocks teacher from student route', async () => {
      const response = await request(app)
        .get('/student/courses')
        .set('x-user-role', 'teacher');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });
});
