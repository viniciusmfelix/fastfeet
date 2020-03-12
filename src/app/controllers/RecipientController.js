import * as Yup from 'yup';

import Recipient from '../models/Recipient';

class RecipientController {
  async store(request, response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      complement: Yup.string().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip: Yup.string().required(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({
        error: 'Validation failed, check request fields and try again.',
      });
    }

    const recipient = await Recipient.create(request.body);

    return response.json(recipient);
  }

  async update(request, response) {
    const { id } = request.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return response.status(404).json({
        error: `Recipient with id ${id} not registered.`,
      });
    }

    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.number(),
      complement: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      zip: Yup.string(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({
        error: 'Validation failed, check request fields and try again.',
      });
    }

    const updatedRecipient = await recipient.update(request.body);

    return response.json(updatedRecipient);
  }
}

export default new RecipientController();
