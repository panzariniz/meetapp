import { isSameDay, isSameHour } from 'date-fns';
import { Op } from 'sequelize';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async index(req, resp) {
    const subscriptions = await Subscription.findAll({
      where: { user_id: req.userId },
      attributes: [],
      order: [[Meetup, 'date']],
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          attributes: [
            'name',
            'description',
            'localization',
            'dateFormat',
            'date',
          ],
          include: [
            {
              model: File,
              as: 'image',
              attributes: ['path', 'url'],
            },
            {
              model: User,
              as: 'user',
              attributes: ['name'],
            },
          ],
        },
      ],
    });

    return resp.json({
      status: true,
      data: subscriptions,
    });
  }

  async store(req, resp) {
    const { id } = req.body;

    if (!id) {
      return resp.status(400).json({
        status: false,
        message: 'Validation fails',
      });
    }

    const meetup = await Meetup.findByPk(id, {
      include: {
        model: User,
        as: 'user',
        attributes: ['name', 'email'],
      },
    });

    if (meetup.user_id === req.userId) {
      return resp.status(401).json({
        status: false,
        message: 'You can not subscribe your own meetup',
      });
    }

    if (meetup.isPast) {
      return resp.status(401).json({
        status: false,
        message: 'You can not subscribe past meetups',
      });
    }

    const subscriptions = await Subscription.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Meetup,
          attributes: ['date'],
        },
      ],
    });

    if (subscriptions) {
      try {
        subscriptions.forEach(subs => {
          if (subs.meetup_id === id) {
            throw Error('You can not subscribe this meetup twice');
          }

          if (isSameDay(meetup.date, subs.Meetup.date)) {
            if (isSameHour(subs.Meetup.date, meetup.date)) {
              throw Error(
                'You can not subscribe this meetup because you already subscribed to another meetup in this hour'
              );
            }
          }
        });
      } catch ({ message }) {
        return resp.status(401).json({
          status: false,
          message,
        });
      }
    }

    const subscription = await Subscription.create({
      meetup_id: id,
      user_id: req.userId,
    });

    const user = await User.findByPk(req.userId);

    await Queue.add(SubscriptionMail.key, {
      user,
      meetup,
    });

    return resp.json({
      status: true,
      data: subscription,
    });
  }
}

export default new SubscriptionController();
