import * as Yup from 'yup';

import Queue from '../../lib/Queue';
import OrderReadyMail from '../jobs/OrderReadyMail';

import Order from '../models/Order';
import Partner from '../models/Partner';
import Recipient from '../models/Recipient';
import File from '../models/File';

class OrderController {
  async index(request, response) {
    const orders = await Order.findAll({
      attributes: [
        'id',
        'partner_id',
        'recipient_id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
      ],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return response.json(orders);
  }

  async show(request, response) {
    const { id } = request.params;

    const order = await Order.findOne({
      where: { id },
      attributes: [
        'id',
        'partner_id',
        'recipient_id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
      ],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    if (!order) {
      return response.status(404).json({
        error: `Order with id ${id} not registered.`,
      });
    }

    return response.json(order);
  }

  async store(request, response) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      partner_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({
        error: 'Validation failed, check request fields and try again.',
      });
    }

    const order = await Order.create(request.body);

    const orderDetails = await Order.findByPk(order.id, {
      attributes: ['product', 'start_date', 'end_date'],
      include: [
        {
          model: Partner,
          as: 'partner',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'number',
            'complement',
            'zip',
            'city',
            'state',
          ],
        },
      ],
    });

    Queue.add(OrderReadyMail.key, {
      orderDetails,
    });

    return response.json(orderDetails);
  }

  async update(request, response) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      partner_id: Yup.number(),
      product: Yup.string(),
      start_date: Yup.date(),
      end_date: Yup.date(),
      canceled_at: Yup.date(),
      signature_id: Yup.number(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({
        error: 'Validation failed, check request fields and try again.',
      });
    }

    const { id } = request.params;

    const order = await Order.findOne({
      where: { id },
      attributes: [
        'id',
        'partner_id',
        'recipient_id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
      ],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    if (!order) {
      return response.status(404).json({
        error: `Order with id ${id} not registered.`,
      });
    }

    await order.update();

    return response.json(order);
  }

  async destroy(request, response) {
    const { id } = request.params;

    const order = await Order.findByPk(id);

    if (!order) {
      return response.status(404).json({
        error: `Order with id ${id} not registered.`,
      });
    }

    await order.destroy();

    return response
      .json(204)
      .json({ message: 'Order has been deleted succesfully.' });
  }
}

export default new OrderController();
