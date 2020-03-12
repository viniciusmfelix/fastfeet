import { Router } from 'express';
import multer from 'multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import PartnerController from './app/controllers/PartnerController';
import OrderController from './app/controllers/OrderController';
import DeliveryController from './app/controllers/DeliveryController';

import authMiddleware from './app/middlewares/auth';
import withdrawMiddleware from './app/middlewares/withdraw';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/partners', PartnerController.index);
routes.get('/partners/:id', PartnerController.show);
routes.post('/partners', PartnerController.store);
routes.put('/partners/:id', PartnerController.update);
routes.delete('/partners/:id', PartnerController.destroy);

routes.get('/orders', OrderController.index);
routes.get('/orders/:id', OrderController.show);
routes.post('/orders', OrderController.store);
routes.put('/orders/:id', OrderController.update);
routes.delete('/orders/:id', OrderController.destroy);

routes.use(withdrawMiddleware);

routes.get('/teste', (request, response) => {
  return response.json({ ok: true });
});
routes.put('/deliveries/:id', DeliveryController.update);
routes.delete('/deliveries/:id', DeliveryController.destroy);

export default routes;
