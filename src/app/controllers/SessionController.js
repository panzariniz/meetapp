import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';

import authConfig from '../../config/auth';

class SessionController {
  async store(req, resp) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .min(6)
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return resp.status(400).json({
        status: false,
        message: 'Validations fails',
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return resp.status(401).json({
        status: false,
        message: 'User not found',
      });
    }

    if (!(await user.checkPassword(password))) {
      return resp.status(401).json({
        status: false,
        message: 'Password does not match',
      });
    }

    const { id, name } = user;

    const token = await jwt.sign({ id }, authConfig.secret, authConfig.config);

    return resp.json({
      status: true,
      data: {
        user: {
          id,
          name,
          email,
        },
        token,
      },
    });
  }
}

export default new SessionController();
