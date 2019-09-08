import Meetup from '../models/Meetup';

class OrganizingController {
  async index(req, resp) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
    });

    return resp.json({
      status: true,
      data: meetups,
    });
  }
}

export default new OrganizingController();
