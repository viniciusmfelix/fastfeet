import * as Yup from 'yup';
import { isAfter, isBefore, parseISO } from 'date-fns';

import Order from '../models/Order';
import Partner from '../models/Partner';
import File from '../models/File';

class DeliveryController {
  async update(request, response) {
    const schema = Yup.object().shape({
      signature_id: Yup.number(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({
        error: 'Validation failed, check request fields and try again.',
      });
    }

    const { id } = request.params;

    const order = await Order.findByPk(id);

    if (!order) {
      return response.status(404).json({
        error: `Order with id ${id} not registered.`,
      });
    }

    const { partnerId } = request.params;

    const partner = await Partner.findByPk(partnerId);

    if (!partner) {
      return response.status(404).json({
        error: `Partner with id ${id} not registered.`,
      });
    }

    if (partner.id !== order.partner.id) {
      return response.status(401).json({
        error: 'You can only take to withdraw your assigned packages.',
      });
    }

    if (!order.start_date) {
      const schedule = [parseISO('08:00'), parseISO('18:00')];

      const available =
        isAfter(schedule[0], new Date()) && isBefore(schedule[1], new Date());

      if (available) {
        return response.status(401).json({
          error:
            'You cannot withdraw for delivery a order before 08:00AM or after 18:00PM',
        });
      }

      await order.update({ start_date: new Date() });

      return response.json(order);
    }

    const { signature_id } = request.body;

    await order.update({ end_date: new Date(), signature_id });

    const orderUpdated = await Order.findByPk(id, {
      attributes: [
        'product',
        'start_date',
        'end_date',
        'recipient_id',
        'partner_id',
      ],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return response.json(orderUpdated);
  }

  async destroy(request, response) {
    const { id } = request.params;

    const order = await Order.findByPk(id);

    if (!order) {
      return response.status(404).json({
        error: `Order with id ${id} not registered.`,
      });
    }

    if (order.end_date) {
      return response.status(400).json({
        error: 'You cannot cancel a delivered order.',
      });
    }

    await order.update({ canceled_at: new Date() });

    return response.json(order);
  }
}

export default new DeliveryController();
