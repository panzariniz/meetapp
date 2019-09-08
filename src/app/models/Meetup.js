import Sequelize, { Model } from 'sequelize';
import { isBefore, format } from 'date-fns';
import { pt } from 'date-fns/locale';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        description: Sequelize.STRING,
        localization: Sequelize.STRING,
        date: Sequelize.DATE,
        isPast: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
          },
        },
        dateFormat: {
          type: Sequelize.VIRTUAL,
          get() {
            return format(this.date, "dd 'de' MMMM' às 'H:mm'h'", {
              locale: pt,
            });
          },
        },
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.File, { foreignKey: 'image_id', as: 'image' });
  }
}

export default Meetup;
