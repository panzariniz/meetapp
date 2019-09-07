import * as Yup from 'yup';
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';

import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, resp) {
    const { date, page = 1, limit = 10 } = req.query;
    const where = {
      user_id: req.userId,
    };

    if (date) {
      const formattedDate = parseISO(date);

      where.date = {
        [Op.between]: [startOfDay(formattedDate), endOfDay(formattedDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      order: ['date'],
      attributes: ['name', 'description', 'localization', 'date', 'isPast'],
      limit,
      offset: (page - 1) * limit,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
        {
          model: File,
          as: 'image',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return resp.json({
      status: true,
      data: meetups,
    });
  }

  async store(req, resp) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      description: Yup.string().required(),
      localization: Yup.string().required(),
      date: Yup.date().required(),
      image_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return resp.status(400).json({
        status: false,
        message: 'Validation fails',
      });
    }

    const { date } = req.body;

    const formattedDate = parseISO(date);
    if (isBefore(formattedDate, new Date())) {
      return resp.status(400).json({
        status: false,
        message: 'Past dates is not permitted',
      });
    }

    const meetup = await Meetup.create({
      ...req.body,
      user_id: req.userId,
      date: formattedDate,
    });

    return resp.json({
      status: true,
      data: meetup,
    });
  }

  async update(req, resp) {
    if (Object.keys(req.body).length === 0) {
      return resp.status(400).json({
        status: false,
        message: 'Request Body is empty',
      });
    }

    const meetup = await Meetup.findByPk(req.params.id, {
      include: {
        model: User,
        as: 'user',
        attributes: ['id'],
      },
    });

    if (meetup.user.id !== req.userId) {
      return resp.status(401).json({
        status: false,
        message: 'User not permitted to edit this meetutp',
      });
    }

    if (meetup.isPast) {
      return resp.status(401).json({
        status: false,
        message: 'Meetup already presented',
      });
    }

    const { date } = req.body;
    if (date) {
      const formattedDate = parseISO(date);

      if (isBefore(formattedDate, new Date())) {
        return resp.status(401).json({
          status: false,
          message: 'Past dates is not permitted',
        });
      }

      req.body.date = formattedDate;
    }

    delete req.body.user_id;

    const { id, name, description, localization } = await meetup.update(
      req.body
    );

    return resp.json({
      status: true,
      data: {
        id,
        name,
        description,
        localization,
        date,
      },
    });
  }

  async delete(req, resp) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== req.userId) {
      return resp.status(401).json({
        status: false,
        message: 'User not permitted to delete this meetutp',
      });
    }

    if (meetup.isPast) {
      return resp.status(401).json({
        status: false,
        message: 'Meetup already presented',
      });
    }

    await meetup.destroy();

    return resp.json({
      status: true,
      data: 'Meetup cancelled',
    });
  }
}

export default new MeetupController();
