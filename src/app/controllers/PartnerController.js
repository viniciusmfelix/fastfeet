import * as Yup from 'yup';

import Partner from '../models/Partner';
import File from '../models/File';

class PartnerController {
  async index(request, response) {
    const partners = await Partner.findAll({
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return response.json(partners);
  }

  async show(request, response) {
    const { id } = request.params;

    const partner = await Partner.findOne({
      where: { id },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    if (!partner) {
      return response.status(404).json({
        error: `Partner with id ${id} not registered.`,
      });
    }

    return response.json(partner);
  }

  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({
        error: 'Validation failed, check request fields and try again.',
      });
    }

    const { name, email } = request.body;

    const partner = await Partner.create({
      name,
      email,
    });

    return response.json(partner);
  }

  async update(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({
        error: 'Validation failed, check request fields and try again.',
      });
    }

    const { id } = request.params;

    const partner = await Partner.findOne({
      where: { id },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    if (!partner) {
      return response.status(404).json({
        error: `Partner with id ${id} not registered.`,
      });
    }

    await partner.update(request.body);

    return response.json(partner);
  }

  async destroy(request, response) {
    const { id } = request.params;

    const partner = await Partner.findByPk(id);

    if (!partner) {
      return response.status(404).json({
        error: `Partner with id ${id} not registered.`,
      });
    }

    await partner.destroy();

    return response
      .status(204)
      .json({ message: 'Parner removed from register.' });
  }
}

export default new PartnerController();
