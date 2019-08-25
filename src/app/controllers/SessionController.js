import jwt from 'jsonwebtoken';

import User from '../models/User';

import authConfig from '../../config/auth';

class SessionController {
  async store(req, resp) {
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
