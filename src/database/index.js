import Sequelize from 'sequelize';

import User from '../app/models/User';

import DataBaseConfig from '../config/database';

const models = [User];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(DataBaseConfig);

    models.map(model => model.init(this.connection));
  }
}

export default new Database();
