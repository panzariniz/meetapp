import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  async store(req, resp) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .min(6)
        .required(),
      confirmPassword: Yup.string()
        .min(6)
        .required()
        .oneOf([Yup.ref('password')]),
    });

    if (!(await schema.isValid(req.body))) {
      return resp.status(400).json({
        status: false,
        message: 'Validation fails',
      });
    }

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

  async update(req, resp) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return resp.status(400).json({
        status: false,
        message: 'Validation fails',
      });
    }

    const { oldPassword, password_hash } = req.body;

    if (password_hash) {
      return resp.status(401).json({
        status: false,
        message: 'Unauthorized body',
      });
    }

    delete req.body.email;

    const user = await User.findByPk(req.userId);

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return resp.status(400).json({
        status: false,
        message: 'Old Password does not match',
      });
    }

    const { email, name } = await user.update(req.body);

    return resp.json({
      status: true,
      data: {
        email,
        name,
      },
    });
  }
}

export default new UserController();
