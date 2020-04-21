const config = {
  dialect: 'mysql',
  host: '127.0.0.1',
  username: 'root',
  password: 'secret',
  database: 'desafio',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};

module.exports = config;
