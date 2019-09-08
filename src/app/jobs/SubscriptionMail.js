import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { user, meetup } = data;

    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: `${user.name} se inscreveu na sua Meetup!`,
      template: 'subscription',
      context: {
        name: meetup.user.name,
        userName: user.name,
        userEmail: user.email,
        meetupName: meetup.name,
        date: meetup.dateFormat,
      },
    });
  }
}

export default new SubscriptionMail();
