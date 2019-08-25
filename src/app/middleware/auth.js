import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, resp, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return resp.status(401).json({
      status: false,
      message: 'Token not provided',
    });
  }

  const [, token] = authorization.split(' ');

  if (!token) {
    return resp.status(401).json({
      status: false,
      message: 'Token not provided',
    });
  }

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    req.userId = decoded.id;

    return next();
  } catch (error) {
    return resp.status(401).json({
      status: false,
      message: 'Invalid Token',
    });
  }
};
