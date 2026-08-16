import { Router } from 'express';
import jwt from 'jsonwebtoken';

export const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Hardcoded operator credentials for assessment purposes
  if (username === 'operator' && password === 'admin123') {
    const token = jwt.sign({ role: 'operator' }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
