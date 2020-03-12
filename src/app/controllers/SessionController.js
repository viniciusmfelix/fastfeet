import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import authConfig from '../../config/auth';

import User from '../models/User';

class SessionController {
  async store(request, response) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({
        error: 'Validation failed, check request fields and try again.',
      });
    }

    const { email, password } = request.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return response
        .status(400)
        .json({ error: 'Email not associated with any account' });
    }

    const checkPassword = await user.comparePassword(password);

    if (!checkPassword) {
      return response.status(400).json({ error: 'Passwords does not match.' });
    }

    const { id, name } = user;

    return response.json({
      id,
      name,
      email,
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
