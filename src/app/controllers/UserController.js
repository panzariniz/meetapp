import User from '../models/User';

class UserController {
  async store(req, resp) {
    const { email, password_hash } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return resp.status(400).json({
        status: false,
        message: 'User already exists',
      });
    }

    if (password_hash) {
      return resp.status(401).json({
        status: false,
        message: 'Unauthorized body',
      });
    }

    const { name } = await User.create(req.body);

    return resp.json({
      status: true,
      data: {
        email,
        name,
      },
    });
  }

  update(req, resp) {
    return resp.json({
      status: true,
      data: {},
    });
  }
}

export default new UserController();
